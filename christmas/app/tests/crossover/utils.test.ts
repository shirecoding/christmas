import {
    calculateLocation,
    expandGeohashes,
    filterSortEntitiesInRange,
    geohashNeighbour,
} from "$lib/crossover/utils";
import { spawnMonster } from "$lib/server/crossover/dungeonMaster";
import { initializeClients } from "$lib/server/crossover/redis";
import { expect, test } from "vitest";
import { generateRandomGeohash } from "./utils";

test("Test Utils", async () => {
    await initializeClients(); // create redis repositories

    /**
     * Test `calculateLocation`
     */
    let locations = calculateLocation("w21z3wcm", 2, 2);
    expect(locations).toMatchObject([
        "w21z3wcm",
        "w21z3wct",
        "w21z3wck",
        "w21z3wcs",
    ]);

    locations = calculateLocation("w21z3wcm", 1, 1);
    expect(locations).toMatchObject(["w21z3wcm"]);

    locations = calculateLocation("w21z3wcm", 2, 3);
    expect(locations).toMatchObject([
        "w21z3wcm",
        "w21z3wct",
        "w21z3wck",
        "w21z3wcs",
        "w21z3wc7",
        "w21z3wce",
    ]);

    /**
     * Test `expandGeohashes`
     */

    expect(expandGeohashes(["w21z3wcm"], 5)).toEqual([
        "w21z3wcm",
        "w21z3wc",
        "w21z3w",
        "w21z3",
    ]);
    expect(expandGeohashes(["w21z3wcm"], 7)).toEqual(["w21z3wcm", "w21z3wc"]);
    expect(expandGeohashes(["w21z3wcm"], 8)).toEqual(["w21z3wcm"]);
    expect(expandGeohashes(["w21z3wc"], 8)).toEqual(["w21z3wc"]);

    /**
     * Test `filterSortEntitiesInRange`
     */

    var geohash = generateRandomGeohash(8, "h9");
    var east2 = geohashNeighbour(geohash, "e", 2);
    var east3 = geohashNeighbour(east2, "e");
    var southeast2 = geohashNeighbour(east2, "s", 2);

    let dragon = await spawnMonster({
        geohash: geohash,
        beast: "dragon",
        level: 1,
    });
    let dragon2 = await spawnMonster({
        geohash: east3,
        beast: "dragon",
        level: 1,
    });
    let giantSpider = await spawnMonster({
        geohash: east2,
        beast: "giantSpider",
        level: 1,
    });
    let goblin = await spawnMonster({
        geohash: southeast2,
        beast: "goblin",
        level: 1,
    });
    expect(
        filterSortEntitiesInRange(dragon, [giantSpider, goblin, dragon2], 2),
    ).toMatchObject([
        {
            monster: giantSpider.monster,
        },
        {
            monster: goblin.monster,
        },
    ]);
    expect(
        filterSortEntitiesInRange(dragon, [giantSpider, goblin, dragon2], 1),
    ).toMatchObject([]);
});
