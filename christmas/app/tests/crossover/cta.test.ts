import {
    crossoverCmdAccept,
    crossoverCmdBrowse,
    crossoverCmdFulfill,
    crossoverCmdLearn,
    crossoverCmdTake,
    crossoverCmdTrade,
    crossoverCmdWrit,
} from "$lib/crossover/client";
import { actions } from "$lib/crossover/world/actions";
import { LOCATION_INSTANCE, MS_PER_TICK } from "$lib/crossover/world/settings";
import { compendium } from "$lib/crossover/world/settings/compendium";
import { skillLevelProgression } from "$lib/crossover/world/skills";
import { spawnItemAtGeohash } from "$lib/server/crossover/dungeonMaster";
import {
    fetchEntity,
    initializeClients,
    saveEntity,
} from "$lib/server/crossover/redis";
import type {
    Item,
    ItemEntity,
    Player,
    PlayerEntity,
} from "$lib/server/crossover/redis/entities";
import { sleep } from "$lib/utils";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import type {
    CTAEvent,
    FeedEvent,
} from "../../src/routes/api/crossover/stream/+server";
import { createGandalfSarumanSauron, waitForEventData } from "./utils";

let region: string;
let geohash: string;

let playerOne: Player;
let playerOneCookies: string;
let playerOneStream: EventTarget;
let playerTwo: Player;
let playerTwoCookies: string;
let playerTwoStream: EventTarget;

let woodenclub: Item;

beforeAll(async () => {
    await initializeClients(); // create redis repositories

    // Create players
    ({
        region,
        geohash,
        playerOne,
        playerOneCookies,
        playerOneStream,
        playerTwo,
        playerTwoCookies,
        playerTwoStream,
    } = await createGandalfSarumanSauron());

    // Spawn items
    woodenclub = (await spawnItemAtGeohash({
        geohash,
        locationType: "geohash",
        locationInstance: LOCATION_INSTANCE,
        prop: compendium.woodenclub.prop,
    })) as ItemEntity;

    // `playerTwo` take `woodenClub`
    await crossoverCmdTake(
        { item: woodenclub.item },
        { Cookie: playerTwoCookies },
    );
    await sleep(MS_PER_TICK * actions.take.ticks);
    woodenclub = (await fetchEntity(woodenclub.item)) as ItemEntity;
    expect(woodenclub.loc[0]).toBe(playerTwo.player);
});

beforeEach(async () => {
    playerOne.lum = 0;
    playerOne = (await saveEntity(playerOne as PlayerEntity)) as PlayerEntity;

    // Put woodenclub in `playerTwo` inventory
    woodenclub.loc[0] = playerTwo.player;
    woodenclub.locI = playerTwo.locI;
    woodenclub.locT = "inv";
});

describe("CTA Tests", () => {
    test("Creating and fulfilling trade writs", async () => {
        /**
         * Create a sell writ
         */

        // `playerTwo` create a sell writ to sell `woodenclub` for 100 lum
        crossoverCmdWrit(
            {
                buyer: "",
                seller: playerTwo.player,
                offer: {
                    currency: {
                        lum: 100,
                    },
                },
                receive: {
                    items: [woodenclub.item],
                },
            },
            { Cookie: playerTwoCookies },
        );
        var feed = (await waitForEventData(
            playerTwoStream,
            "feed",
        )) as FeedEvent;

        // Check received writ
        expect(feed).toMatchObject({
            type: "message",
            message: "You received a trade writ in your inventory.",
            event: "feed",
        });

        // Browse trade writs on `playerTwo`
        crossoverCmdBrowse(
            { player: playerTwo.player },
            { Cookie: playerOneCookies },
        );
        var feed = (await waitForEventData(
            playerOneStream,
            "feed",
        )) as FeedEvent;
        expect(feed).toMatchObject({
            type: "message",
            event: "feed",
        });
        expect(
            feed.message.startsWith(
                `${playerTwo.name} is offering to sell:\n\nWooden Club for 100 lum [item_tradewrit`,
            ),
        );

        // `playerOne` fulfill trade writ on `playerTwo`
        const match = feed.message.match(/\[(item_tradewrit\d+)\]/); // extract the writ from the browse message
        expect(match).toBeTruthy();
        const writId = match![1];

        // Check conditions not met
        crossoverCmdFulfill({ item: writId }, { Cookie: playerOneCookies });
        var feed = (await waitForEventData(
            playerOneStream,
            "feed",
        )) as FeedEvent;
        expect(feed).toMatchObject({
            type: "message",
            message: "${message}",
            variables: {
                cmd: "say",
                name: "Gandalf",
                message: "Gandalf does not have 100 lum.",
            },
            event: "feed",
        });

        await sleep(MS_PER_TICK * actions.trade.ticks * 2);

        // Give `playerOne` 100 lum
        playerOne.lum += 100;
        playerOne = (await saveEntity(
            playerOne as PlayerEntity,
        )) as PlayerEntity;
        crossoverCmdFulfill({ item: writId }, { Cookie: playerOneCookies });
        var feed = (await waitForEventData(
            playerOneStream,
            "feed",
        )) as FeedEvent;
        expect(feed).toMatchObject({
            type: "message",
            message: "${message}",
            variables: {
                cmd: "say",
                name: "Saruman",
                message:
                    "Saruman hands you Wooden Club, 'Pleasure doing business with you, Gandalf'",
            },
            event: "feed",
        });

        // Check that the writ is destroyed
        await expect(fetchEntity(writId)).resolves.toBeNull();
    });

    test("Trade with player", async () => {
        /**
         * Buy CTA
         */

        // `playerOne` wants to buy `playerTwo`s `woodenClub` for 100 lum
        crossoverCmdTrade(
            {
                seller: playerTwo.player,
                buyer: playerOne.player,
                offer: {
                    currency: {
                        lum: 100,
                    },
                },
                receive: {
                    items: [woodenclub.item],
                },
            },
            { Cookie: playerOneCookies },
        );

        // Check CTA event (on seller which is `playerTwo`)
        var cta = (await waitForEventData(playerTwoStream, "cta")) as CTAEvent;
        expect(cta).toMatchObject({
            cta: {
                name: "Trade Writ",
            },
            event: "cta",
        });
        expect(
            cta.cta.description.startsWith(
                `${playerOne.name} is offering to buy Wooden Club for 100 lum. You have 60s to`,
            ),
        ).toBeTruthy();
        expect(cta.cta.token).toBeTruthy();
        expect(cta.cta.pin).toBeTruthy();

        await sleep(MS_PER_TICK * actions.trade.ticks * 2);

        // Trader `accept` the CTA
        crossoverCmdAccept(
            { token: cta.cta.token },
            { Cookie: playerTwoCookies },
        );

        // Check `playerTwo` got message that `playerOne` does not have enough currencies
        var feed = await waitForEventData(playerTwoStream, "feed");
        expect(feed).toMatchObject({
            type: "message",
            message: "${message}",
            variables: {
                cmd: "say",
                player: playerOne.player,
                name: playerOne.name,
                message: `${playerOne.name} does not have 100 lum.`,
            },
            event: "feed",
        });

        await sleep(MS_PER_TICK * actions.trade.ticks * 2);

        // Give `playerOne` enough currency to complete the trade
        playerOne.lum = 1000;
        playerOne = (await saveEntity(
            playerOne as PlayerEntity,
        )) as PlayerEntity;

        // Trader `accept` the CTA
        crossoverCmdAccept(
            { token: cta.cta.token },
            { Cookie: playerTwoCookies },
        );

        // Check `playerOne` and `playerTwo` got successful trade dialogues
        var playerOneFeed = null;
        var playerTwoFeed = null;
        waitForEventData(playerOneStream, "feed").then(
            (e) => (playerOneFeed = e),
        );
        waitForEventData(playerTwoStream, "feed").then(
            (e) => (playerTwoFeed = e),
        );

        await sleep(MS_PER_TICK * actions.trade.ticks * 2);

        expect(playerOneFeed).toMatchObject({
            type: "message",
            message: "${message}",
            variables: {
                cmd: "say",
                player: playerTwo.player,
                name: `${playerTwo.name}`,
                message: `${playerTwo.name} hands you Wooden Club, 'Pleasure doing business with you, ${playerOne.name}'`,
            },
            event: "feed",
        });
        expect(playerTwoFeed).toMatchObject({
            type: "message",
            message: "${message}",
            variables: {
                cmd: "say",
                player: playerOne.player,
                name: `${playerOne.name}`,
                message: `${playerOne.name} hands you 100 lum, 'Pleasure doing business with you, ${playerTwo.name}'`,
            },
            event: "feed",
        });

        // Check players have the traded items
        woodenclub = (await fetchEntity(woodenclub.item)) as ItemEntity;
        expect(woodenclub.loc[0]).toBe(playerOne.player);
        const playerOneAfter = (await fetchEntity(
            playerOne.player,
        )) as PlayerEntity;
        expect(playerOneAfter.lum).toBe(playerOne.lum - 100);
        const playerTwoAfter = (await fetchEntity(
            playerTwo.player,
        )) as PlayerEntity;
        expect(playerTwoAfter.lum).toBe(playerTwo.lum + 100);

        /**
         * Sell CTA
         */

        // `playerOne` wants to sell `playerTwo` a `woodenClub` for 100 lum
        crossoverCmdTrade(
            {
                seller: playerOne.player,
                buyer: playerTwo.player,
                receive: {
                    items: [woodenclub.item],
                },
                offer: {
                    currency: {
                        lum: 100,
                    },
                },
            },
            { Cookie: playerOneCookies },
        );

        // Check CTA event (on buyer which is `playerTwo`)
        var cta = (await waitForEventData(playerTwoStream, "cta")) as CTAEvent;
        expect(cta).toMatchObject({
            cta: {
                name: "Trade Writ",
            },
            event: "cta",
        });
        expect(
            cta.cta.description.startsWith(
                `${playerOne.name} is offering to sell Wooden Club for 100 lum`,
            ),
        ).toBeTruthy();
        expect(cta.cta.token).toBeTruthy();
        expect(cta.cta.pin).toBeTruthy();

        await sleep(MS_PER_TICK * actions.trade.ticks * 2);

        // Trader `accept` the CTA
        crossoverCmdAccept(
            { token: cta.cta.token },
            { Cookie: playerTwoCookies },
        );

        // Check `playerOne` and `playerTwo` got successful trade dialogues
        var playerOneFeed = null;
        var playerTwoFeed = null;
        waitForEventData(playerOneStream, "feed").then(
            (e) => (playerOneFeed = e),
        );
        waitForEventData(playerTwoStream, "feed").then(
            (e) => (playerTwoFeed = e),
        );
        await sleep(MS_PER_TICK * actions.trade.ticks * 2);

        expect(playerOneFeed).toMatchObject({
            type: "message",
            message: "${message}",
            variables: {
                cmd: "say",
                player: playerTwo.player,
                name: `${playerTwo.name}`,
                message: `${playerTwo.name} hands you 100 lum, 'Pleasure doing business with you, ${playerOne.name}'`,
            },
            event: "feed",
        });

        expect(playerTwoFeed).toMatchObject({
            type: "message",
            message: "${message}",
            variables: {
                cmd: "say",
                player: playerOne.player,
                name: `${playerOne.name}`,
                message: `${playerOne.name} hands you Wooden Club, 'Pleasure doing business with you, ${playerTwo.name}'`,
            },
            event: "feed",
        });

        await sleep(MS_PER_TICK * actions.trade.ticks * 2);
    });

    test("Learn skill from human player", async () => {
        // Increase `playerTwo` skills and `playerOne` resources
        playerTwo.skills["exploration"] = 10;
        playerTwo = (await saveEntity(
            playerTwo as PlayerEntity,
        )) as PlayerEntity;
        playerOne.lum = 1000;
        playerOne = (await saveEntity(
            playerOne as PlayerEntity,
        )) as PlayerEntity;

        // `playerOne` learn `exploration` from playerTwo
        crossoverCmdLearn(
            {
                skill: "exploration",
                teacher: playerTwo.player,
            },
            { Cookie: playerOneCookies },
        );

        // Check CTA event (on teacher which is `playerTwo`)
        var cta = (await waitForEventData(playerTwoStream, "cta")) as CTAEvent;
        expect(cta).toMatchObject({
            cta: {
                name: "Writ of Learning",
            },
            event: "cta",
        });
        expect(
            cta.cta.description.startsWith(
                "Gandalf requests to learn exploration from you.",
            ),
        );
        expect(cta.cta.token).toBeTruthy();
        expect(cta.cta.pin).toBeTruthy();

        await sleep(MS_PER_TICK * actions.learn.ticks);

        // Teacher `accept` the CTA
        crossoverCmdAccept(
            { token: cta.cta.token },
            { Cookie: playerTwoCookies },
        );

        // Check `playerOne` starts learning
        var feed = await waitForEventData(playerOneStream, "feed");
        expect(feed).toMatchObject({
            type: "message",
            message: "${message}",
            variables: {
                cmd: "say",
                player: playerTwo.player,
                name: playerTwo.name,
                message: `${playerTwo.name} hands you a worn map and a compass.`,
            },
            event: "feed",
        });
        await sleep(MS_PER_TICK * actions.learn.ticks);

        // Check `playerOne` has learnt skill
        const curSkillLevel = playerOne.skills?.exploration ?? 0;
        const playerOneAfter = (await fetchEntity(
            playerOne.player,
        )) as PlayerEntity;
        expect(playerOneAfter).toMatchObject({
            skills: {
                exploration: curSkillLevel + 1,
            },
            lum: playerOne.lum - skillLevelProgression(curSkillLevel),
        });
    });
});