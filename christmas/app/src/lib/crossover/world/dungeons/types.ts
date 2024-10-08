import type { GeohashLocation } from "../types";

export type { DungeonGraph, Room };

interface Room {
    room: string; // the room id (geohash at the center of the room)
    plots: Set<string>;
    plotPrecision: number;
    connections: string[]; // to other rooms
}

interface DungeonGraph {
    dungeon: string; // the dungeon id (geohash of the entire dungeon)
    rooms: Room[];
    locationType: GeohashLocation;
    corridors: Set<string>; // set of all corridor geohashes
    corridorPrecision: number; // precision of corridor geohashes
}
