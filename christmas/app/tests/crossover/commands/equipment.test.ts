import { searchPossibleCommands } from "$lib/crossover/ir";
import { abilities } from "$lib/crossover/world/settings/abilities";
import { actions } from "$lib/crossover/world/settings/actions";
import { SkillLinesEnum } from "$lib/crossover/world/skills";
import { describe, expect, test } from "vitest";
import {
    createGandalfSarumanSauron,
    createGoblinSpiderDragon,
    createTestItems,
} from "../utils";

let { geohash, playerOne } = await createGandalfSarumanSauron();
let { dragon, goblin } = await createGoblinSpiderDragon(geohash);
let { woodenClubTwo, woodenClubThree, woodenClub } = await createTestItems({});

describe("Equipment & Inventory Tests", () => {
    test("Drop action only for inventory items", async () => {
        woodenClubTwo.locT = "inv";
        woodenClubTwo.loc = [playerOne.player];

        const commands = searchPossibleCommands({
            query: `drop ${woodenClubTwo.item}`,
            player: playerOne,
            actions: [actions.drop],
            playerAbilities: [abilities.bruise, abilities.bandage],
            playerItems: [woodenClubTwo],
            monsters: [dragon, goblin],
            players: [],
            items: [woodenClubThree, woodenClub],
            skills: [...SkillLinesEnum],
        }).commands;

        expect(commands).toHaveLength(1);
        expect(commands).toMatchObject([
            [
                {
                    action: "drop",
                },
                {
                    self: {
                        player: playerOne.player,
                    },
                    target: {
                        item: woodenClubTwo.item,
                    },
                },
                {
                    query: `drop ${woodenClubTwo.item}`,
                    queryIrrelevant: "",
                },
            ],
        ]);
    });
});
