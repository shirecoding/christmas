import { geohashesNearby, getEntityId } from "$lib/crossover/utils";
import { actions } from "$lib/crossover/world/actions";
import { avatarMorphologies, bestiary } from "$lib/crossover/world/bestiary";
import { compendium } from "$lib/crossover/world/compendium";
import { MS_PER_TICK } from "$lib/crossover/world/settings";
import type {
    EntityType,
    Item,
    Monster,
    Player,
} from "$lib/server/crossover/redis/entities";
import { Assets, Container } from "pixi.js";
import { get } from "svelte/store";
import { player, target } from "../../../../../store";
import {
    calculatePosition,
    isCellInView,
    ISO_CELL_HEIGHT,
    ISO_CELL_WIDTH,
    RENDER_ORDER,
    scaleToFitAndMaintainAspectRatio,
    Z_OFF,
    Z_SCALE,
    type Position,
} from "../utils";
import { AvatarEntityContainer } from "./AvatarEntityContainer";
import { SimpleEntityContainer } from "./SimpleEntityContainer";

export {
    cullEntityContainers,
    entityContainers,
    updateEntities,
    upsertEntityContainer,
    type AvatarEntityContainer,
    type EntityContainer,
};

type EntityContainer = SimpleEntityContainer | AvatarEntityContainer;

let entityContainers: Record<string, EntityContainer> = {};

async function updateEntities(
    er: Record<string, Monster | Player | Item>,
    playerPosition: Position, // ignores outside player's view
    entityType: EntityType,
    stage: Container,
) {
    // Upsert entities (only locT = geohash)
    let upserted = new Set<string>();
    for (const entity of Object.values(er)) {
        if (entity.locT === "geohash") {
            await upsertEntityContainer(entity, playerPosition, stage);
            upserted.add(getEntityId(entity)[0]);
        }
    }

    // Destroy entities not in record
    const self = get(player);
    for (const [id, ec] of Object.entries(entityContainers)) {
        if (
            ec.entity == null ||
            self == null ||
            id === self.player ||
            upserted.has(id) ||
            ec.entityType !== entityType
        ) {
            continue;
        }
        ec.destroy();
        delete entityContainers[id];
    }
}

function onMouseOverEntity(entityId: string) {
    const ec = entityContainers[entityId];
    const t = get(target);

    // Highlight if entity is not target (already highlighted)
    if ((t == null || getEntityId(t)[0] != entityId) && ec != null) {
        ec.highlight(1);
    }
}

function onMouseLeaveEntity(entityId: string) {
    // Clear highlight if entity is not target
    const ec = entityContainers[entityId];
    const t = get(target);
    if ((t == null || getEntityId(t)[0] != entityId) && ec != null) {
        ec.clearHighlight();
    }
}

function onClickEntity(entity: Player | Item | Monster) {
    // Set target
    target.set(entity);
}

async function upsertAvatarContainer(
    entity: Player | Monster | Item,
    position: Position,
    stage: Container,
) {
    const [entityId, entityType] = getEntityId(entity);
    let avatarContainer = entityContainers[entityId];

    // Create
    if (avatarContainer == null) {
        const morphology = avatarMorphologies["humanoid"]; // TODO: get from bestiary

        avatarContainer = new AvatarEntityContainer({
            entity,
            zOffset: Z_OFF.entity,
            zScale: Z_SCALE,
            renderLayer: RENDER_ORDER[entityType],
        });
        await avatarContainer.loadFromMetadata(
            await Assets.load(morphology.avatar),
        );
        avatarContainer.animationManager.load(
            await Assets.load(morphology.animation),
        );
        entityContainers[entityId] = avatarContainer;

        // Set size
        const { width, height, scale } = scaleToFitAndMaintainAspectRatio(
            avatarContainer.width,
            avatarContainer.height,
            ISO_CELL_WIDTH * 1, // max width is 1 cell
            ISO_CELL_HEIGHT * 3, // max height is 3 cells
        );
        avatarContainer.pivot = {
            x: avatarContainer.width / 2,
            y: avatarContainer.height,
        };
        avatarContainer.scale.x = scale;
        avatarContainer.scale.y = scale;

        // Set initial pose
        await avatarContainer.pose(
            avatarContainer.animationManager.getPose("default"),
        );

        // Add to stage (might have been culled)
        if (!stage.children.includes(avatarContainer)) {
            stage.addChild(avatarContainer);
        }

        // Set initial position
        avatarContainer.updateIsoPosition(position);
    }
    // Update
    else {
        // Add to stage (might have been culled)
        if (!stage.children.includes(avatarContainer)) {
            stage.addChild(avatarContainer);
        }

        // Move avatar
        avatarContainer.updateIsoPosition(
            position,
            (actions.move.ticks * MS_PER_TICK) / 1000,
        );
    }
}

async function upsertSimpleContainer(
    entity: Monster | Item,
    position: Position,
    stage: Container,
) {
    const [entityId, entityType] = getEntityId(entity);
    let ec = entityContainers[entityId];

    // Create
    if (ec == null) {
        // Create entity container
        ec = new SimpleEntityContainer({
            entity,
            zOffset: Z_OFF.entity,
            zScale: Z_SCALE,
            renderLayer: RENDER_ORDER[entityType],
        });
        entityContainers[entityId] = ec;

        // Load monster asset
        if (entityType === "monster") {
            const monster = entity as Monster;
            const asset = bestiary[monster.beast].asset;
            await ec.loadAsset(asset, { anchor: { x: 0.5, y: 1 } });
        }
        // Load item asset
        else if (entityType === "item") {
            const item = entity as Item;
            const prop = compendium[item.prop];
            const asset = prop.asset;
            const variant = prop.states[item.state].variant;
            await ec.loadAsset(asset, { variant });
        }

        // Set initial position
        ec.updateIsoPosition(position);

        // Set event listeners
        ec.eventMode = "static";
        ec.interactiveChildren = false; // Prevents mouse events from bubbling to children
        ec.hitArea = ec.getBounds(true).rectangle;
        ec.onmouseover = () => onMouseOverEntity(ec.entityId);
        ec.onmouseleave = () => onMouseLeaveEntity(ec.entityId);
        ec.onclick = () => onClickEntity(ec.entity);
    }
    // Update
    else {
        // Swap variant when state changes
        if (entityType === "item") {
            const item = entity as Item;
            const prop = compendium[item.prop];
            const variant = prop.states[item.state].variant;
            ec.swapVariant(variant);
        }

        // Tween position
        ec.updateIsoPosition(
            position,
            (actions.move.ticks * MS_PER_TICK) / 1000,
        );
    }

    // Add to stage (might have been culled)
    if (!stage.children.includes(ec)) {
        stage.addChild(ec);
    }
}

async function upsertEntityContainer(
    entity: Player | Item | Monster,
    playerPosition: Position,
    stage: Container,
) {
    if (entity.locT !== "geohash") {
        return;
    }

    const [entityId, entityType] = getEntityId(entity);

    // Get position
    const position = await calculatePosition(entity.loc[0]);
    const { row, col } = position;

    // Ignore entities outside player's view
    if (!isCellInView({ row, col }, playerPosition)) {
        return;
    }

    // Upsert
    if (entityType === "player") {
        await upsertAvatarContainer(entity as Player, position, stage);
    } else {
        await upsertSimpleContainer(entity as Monster | Item, position, stage);
    }
}

/**
 * Only manually cull (destroy) entities if they are very far away
 *
 * @param playerPosition - The player's position, if undefined, cull all entities
 */
function cullEntityContainers(playerPosition?: Position) {
    if (playerPosition == null) {
        for (const [id, ec] of Object.entries(entityContainers)) {
            ec.destroy();
            delete entityContainers[id];
        }
    } else {
        const p5s = geohashesNearby(playerPosition.geohash.slice(0, -2));
        for (const [id, ec] of Object.entries(entityContainers)) {
            const geohash = ec.isoPosition?.geohash;
            if (geohash != null && !p5s.some((gh) => geohash.startsWith(gh))) {
                ec.destroy();
                delete entityContainers[id];
            }
        }
    }
}