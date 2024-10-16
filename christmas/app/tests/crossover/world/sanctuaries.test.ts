import { generateDungeonGraphsForTerritory } from "$lib/crossover/world/dungeons";
import { findClosestSanctuary } from "$lib/crossover/world/world";
import { describe, expect, test } from "vitest";

describe("Sanctuaries Tests", async () => {
    test("Test `findClosestSanctuary`", async () => {
        var s = await findClosestSanctuary("SGP", "w21z9k6m");
        expect(s).toMatchObject({
            name: "Singapore",
            region: "SGP",
            geohash: "w21z9vkk",
            population: 5183700,
            timezone: "Asia/Singapore",
            description: "",
        });
    });

    test("Test every sanctuary has a dungron", async () => {
        var dg = await generateDungeonGraphsForTerritory("w2", "d1");
        expect(dg).toMatchObject({
            w282d: {
                dungeon: "w282d", // putrajaya
            },
            w2864: {
                dungeon: "w2864", // kuala lumpur
            },
            w21z9: {
                dungeon: "w21z9", // singapore
            },
        });
    });
});
