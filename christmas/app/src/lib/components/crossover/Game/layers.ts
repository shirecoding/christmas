import { WORLD_COL_MAX, WORLD_ROW_MAX } from "./settings";
import { cartToIso, CELL_WIDTH } from "./utils";

export { Layers, layers };

const WORLD_ISOY_MAX = cartToIso(
    WORLD_COL_MAX * CELL_WIDTH,
    WORLD_ROW_MAX * CELL_WIDTH,
)[1]; // 33093136

class Layers {
    public layers: string[] = [];
    // worldHeight is used as the conversion factor to convert isoY to depth
    public worldHeight: number = 0;

    constructor({
        layers,
        worldHeight,
    }: {
        layers: string[];
        worldHeight: number;
    }) {
        this.layers = layers;
        this.worldHeight = worldHeight;
    }

    public depthLayer(layer: string): number {
        // Partition the depth space into different layers so that each layer will not have any overlapping objects
        return this.layers.indexOf(layer);
    }

    public depthPartition(layer: string): {
        depthStart: number;
        depthScale: number;
        depthLayer: number;
    } {
        let depthLayer = this.depthLayer(layer);
        if (depthLayer < 0) {
            depthLayer = 0;
            console.warn(`Missing layer ${layer}, default to 0`);
        }
        // Depth size is the depth range allocated to the layer ([1, 0] usable range, [0, -1] reserved for sprites)
        const depthSize = 1 / this.layers.length; // [1 (furthest), 0]
        const depthStart = 0.5 - depthLayer * depthSize;

        /*  
            Note: 
            - `isoY` can be negative after `worldOffset`
            - `isoY` ranges from [-worldHeight/2, +worldHeight/2]
            - this the 0.5 to calibrate it back to [0, 1]
        */

        return {
            depthLayer,
            depthStart,
            // Depth scale is used to convert the isoY coordinate to a depth within (depthStart to depthStart + depthSize)
            depthScale: depthSize / this.worldHeight,
        };
    }
}

const layers = new Layers({
    layers: ["biome", "floor", "entity"],
    worldHeight: WORLD_ISOY_MAX / 1000, // ~33k cells (this means we need to recalculate the `worldOffset` every time the player moves past 33k cells)
});