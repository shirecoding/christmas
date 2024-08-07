import { crossoverCmdMove } from "$lib/crossover/client";
import { getPositionsForPath, snapToGrid } from "$lib/crossover/utils";
import type { Direction } from "$lib/crossover/world/types";
import type { Container, FederatedPointerEvent } from "pixi.js";
import { highlightShaderInstances } from "../shaders";
import {
    calculateRowColFromIso,
    getDirectionsToPosition,
    getPathHighlights,
    getPlayerPosition,
    HALF_ISO_CELL_HEIGHT,
    HALF_ISO_CELL_WIDTH,
} from "./utils";

export { createHIDHandlers };

interface HIDState {
    path: Direction[] | null;
    lastCursorX: number;
    lastCursorY: number;
    isMouseDown: boolean;
}

function createHIDHandlers(stage: Container) {
    const state: HIDState = {
        path: null,
        lastCursorX: 0,
        lastCursorY: 0,
        isMouseDown: false,
    };

    function getMousePosition(
        e: FederatedPointerEvent,
    ): [number, number] | null {
        const playerPosition = getPlayerPosition();
        if (!playerPosition) return null;

        return snapToGrid(
            e.global.x + stage.pivot.x,
            e.global.y + stage.pivot.y + playerPosition.elevation,
            HALF_ISO_CELL_WIDTH,
            HALF_ISO_CELL_HEIGHT,
        );
    }

    function updateMouseState(
        e: FederatedPointerEvent,
    ): [number, number] | null {
        const snapXY = getMousePosition(e);
        if (!snapXY) return null;

        const [x, y] = snapXY;
        state.lastCursorX = x;
        state.lastCursorY = y;
        return snapXY;
    }

    function handleMouseMove(e: FederatedPointerEvent) {
        const snapXY = updateMouseState(e);
        if (!snapXY) return;

        const [x, y] = snapXY;
        const playerPosition = getPlayerPosition();
        if (!playerPosition || !state.isMouseDown) return;

        const [rowEnd, colEnd] = calculateRowColFromIso(x, y);
        state.path = getDirectionsToPosition(playerPosition, {
            row: rowEnd,
            col: colEnd,
        });
        const pathPositions = getPositionsForPath(playerPosition, state.path);
        highlightShaderInstances("biome", getPathHighlights(pathPositions, 1));
    }

    async function handleMouseUp(e: FederatedPointerEvent) {
        const snapXY = updateMouseState(e);
        if (!snapXY) return;

        state.isMouseDown = false;
        highlightShaderInstances("biome", {});

        if (state.path && state.path.length > 0) {
            await crossoverCmdMove({ path: state.path });
        }
    }

    function handleMouseDown(e: FederatedPointerEvent) {
        const snapXY = updateMouseState(e);
        if (!snapXY) return;

        state.isMouseDown = true;
        state.path = null;
    }

    return {
        mouseMove: handleMouseMove,
        mouseUp: handleMouseUp,
        mouseDown: handleMouseDown,
    };
}
