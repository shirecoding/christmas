import { PUBLIC_ENVIRONMENT } from "$env/static/public";
import type { Tile } from "../types";

export {
    abyssTile,
    MS_PER_TICK,
    SERVER_LATENCY,
    TICKS_PER_TURN,
    TILE_HEIGHT,
    TILE_WIDTH,
};

const abyssTile: Tile = {
    name: "The Abyss",
    geohash: "59ke577h",
    description: "You are nowhere to be found.",
};

// Note: this is different from CELL_WIDTH / CELL_HEIGHT
const TILE_WIDTH = 256;
const TILE_HEIGHT = 128;

const SERVER_LATENCY = 100; // ms
const TICKS_PER_TURN = 4;
const MS_PER_TICK = PUBLIC_ENVIRONMENT === "development" ? 100 : 500;
// const MS_PER_TICK = 500;