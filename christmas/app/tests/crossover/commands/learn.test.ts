import { searchPossibleCommands } from "$lib/crossover/ir";
import { abilities } from "$lib/crossover/world/settings/abilities";
import { SkillLinesEnum } from "$lib/crossover/world/skills";
import { describe, expect, test } from "vitest";
import {
    allActions,
    createGandalfSarumanSauron,
    createGoblinSpiderDragon,
    createTestItems,
} from "../utils";

describe("Learn Tests", async () => {
    let { geohash, playerOne, playerTwo } = await createGandalfSarumanSauron();
    let { dragon, goblin } = await createGoblinSpiderDragon(geohash);
    let { woodenClub, tavern } = await createTestItems({});

    test("Learn skill from player", async () => {
        // Test command search
        const { commands, queryTokens, tokenPositions } =
            searchPossibleCommands({
                query: `learn exploration from ${playerTwo.name}`,
                player: playerOne,
                playerAbilities: [abilities.bruise, abilities.bandage],
                playerItems: [woodenClub],
                actions: allActions,
                monsters: [goblin, dragon],
                players: [playerOne, playerTwo],
                items: [woodenClub, tavern],
                skills: [...SkillLinesEnum],
            });
        expect(commands).toMatchObject([
            [
                {
                    action: "learn",
                },
                {
                    self: {
                        player: playerOne.player,
                    },
                    target: {
                        player: playerTwo.player,
                    },
                    skill: "exploration",
                },
                {
                    query: "learn exploration from saruman",
                    queryIrrelevant: "from",
                },
            ],
        ]);
    });
});
