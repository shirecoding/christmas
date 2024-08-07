import type {
    EntityType,
    Item,
    Monster,
    Player,
} from "$lib/server/crossover/redis/entities";
import { substituteVariables } from "$lib/utils";
import { cloneDeep } from "lodash-es";
import { getEntityId } from "../utils";
import { abilities } from "./abilities";
import { type AssetMetadata } from "./types";

export {
    compendium,
    EquipmentSlots,
    isItemEquipped,
    itemAttibutes,
    itemName,
    tints,
    type EquipmentAsset,
    type EquipmentSlot,
    type ItemVariables,
    type Prop,
    type Utility,
};

type EquipmentSlot =
    // armor
    | "ch" // chest
    | "lg" // legs
    | "ft" // feet
    | "sh" // shoulders
    | "gl" // gloves
    // weapons
    | "rh" // right hand
    | "lh" // left hand
    // non visible
    | "hd" // head
    | "nk" // neck
    | "r1" // ring 1
    | "r2"; // ring 2

const EquipmentSlots: EquipmentSlot[] = [
    // armor
    "ch",
    "lg",
    "ft",
    "sh",
    "gl",
    // weapons
    "rh",
    "lh",
    // non visible
    "hd",
    "nk",
    "r1",
    "r2",
];

const tints = {
    none: new Float32Array([0, 0, 0, 0]),
    black: new Float32Array([0.1, 0.1, 0.1, 0.85]),
};

/**
 * `Prop` is a template used to create an `item` instance
 */
interface Prop {
    prop: string;
    defaultName: string;
    defaultState: string;
    asset: AssetMetadata;
    durability: number;
    charges: number;
    states: Record<string, PropAttributes>; // map item.state to prop attributes
    utilities: Record<string, Utility>;
    variables: PropVariables; // configurable variables to alter prop behavior & descriptions
    weight: number; // -1 means it cannot be taken
    collider: boolean; // cannot have more than 1 collidable item in the same location, cannot walk through collidable items
    equipmentSlot?: EquipmentSlot[]; // can be used to tell if item is an equipment
    equipmentAssets?: Record<string, EquipmentAsset>; // maps bone to EquipmentAsset
}

interface EquipmentAsset {
    asset?: AssetMetadata;
    tint?: Float32Array; // tints the texture (eg. under armour)
    replace?: boolean; // replace the texture (defaults to overlay)
}

interface PropAttributes {
    description: string;
    destructible: boolean;
    variant: string;
}

interface Utility {
    utility: string;
    description: string;
    cost: {
        charges: number;
        durability: number;
    };
    state: {
        start: string;
        end: string;
    };
    // abilities[ability] `self` and `target` will be provided when `useItem` is called but can be overwritten via `variables`
    ability?: string;
    requireEquipped?: boolean; // defaults to false
}

interface PropVariables {
    [key: string]: {
        variable: string;
        type: "string" | "number" | "boolean" | EntityType;
        value: string | number | boolean;
    };
}

type ItemVariables = Record<string, string | number | boolean>;

/**
 * `compendium` is a collection of `Prop` templates used  to create `item` instances.
 */
let compendium: Record<string, Prop> = {
    /**
     * Equipment - armour
     */
    steelplate: {
        prop: "steelplate",
        defaultName: "Steel plate armor",
        asset: {
            path: "http://localhost:5173/avatar/images/female_steel_plate/torso.png",
        },
        equipmentAssets: {
            torsoBone: {
                asset: {
                    path: "http://localhost:5173/avatar/images/female_steel_plate/torso.png",
                },
                tint: tints.black,
            },
        },
        durability: 100,
        charges: 0,
        weight: 20,
        collider: false,
        equipmentSlot: ["ch"],
        defaultState: "default",
        states: {
            default: {
                variant: "default",
                destructible: true,
                description: "A simple steel plate of armor.",
            },
        },
        utilities: {},
        variables: {},
    },
    steelleg: {
        prop: "steelleg",
        defaultName: "Steel leg armor",
        asset: {
            path: "http://localhost:5173/avatar/images/female_steel_plate/front_upper_leg.png",
        },
        equipmentAssets: {
            frontUpperLegBone: {
                asset: {
                    path: "http://localhost:5173/avatar/images/female_steel_plate/front_upper_leg.png",
                },
                tint: tints.black,
            },
            backUpperLegBone: {
                asset: {
                    path: "http://localhost:5173/avatar/images/female_steel_plate/back_upper_leg.png",
                },
                tint: tints.black,
            },
            frontLowerLegBone: {
                tint: tints.black,
            },
            backLowerLegBone: {
                tint: tints.black,
            },
        },
        durability: 100,
        charges: 0,
        weight: 20,
        collider: false,
        equipmentSlot: ["lg"],
        defaultState: "default",
        states: {
            default: {
                destructible: true,
                description: "A simple steel armor worn on the legs",
                variant: "default",
            },
        },
        utilities: {},
        variables: {},
    },
    steelboot: {
        prop: "steelboot",
        defaultName: "Steel boots",
        asset: {
            path: "http://localhost:5173/avatar/images/female_steel_plate/front_lower_leg.png",
        },
        equipmentAssets: {
            frontLowerLegBone: {
                asset: {
                    path: "http://localhost:5173/avatar/images/female_steel_plate/front_lower_leg.png",
                },
                replace: true,
                tint: tints.none, // replace and remove tints added from other armor
            },
            backLowerLegBone: {
                asset: {
                    path: "http://localhost:5173/avatar/images/female_steel_plate/back_lower_leg.png",
                },
                replace: true,
                tint: tints.none,
            },
        },
        durability: 100,
        charges: 0,
        weight: 20,
        collider: false,
        equipmentSlot: ["ft"],
        defaultState: "default",
        states: {
            default: {
                destructible: true,
                description: "A simple set of steel boots",
                variant: "default",
            },
        },
        utilities: {},
        variables: {},
    },
    steelpauldron: {
        prop: "steelpauldron",
        defaultName: "Steel Pauldrons",
        asset: {
            path: "http://localhost:5173/avatar/images/female_steel_plate/front_upper_arm.png",
        },
        equipmentAssets: {
            frontLowerArmBone: {
                tint: tints.black,
            },
            backLowerArmBone: {
                tint: tints.black,
            },
            frontUpperArmBone: {
                asset: {
                    path: "http://localhost:5173/avatar/images/female_steel_plate/front_upper_arm.png",
                },
                tint: tints.black,
            },
            backUpperArmBone: {
                asset: {
                    path: "http://localhost:5173/avatar/images/female_steel_plate/back_upper_arm.png",
                },
                tint: tints.black,
            },
        },
        durability: 100,
        charges: 0,
        weight: 20,
        collider: false,
        equipmentSlot: ["sh"],
        defaultState: "default",
        states: {
            default: {
                destructible: true,
                description: "A simple set of steel pauldrons",
                variant: "default",
            },
        },
        utilities: {},
        variables: {},
    },
    steelgauntlet: {
        prop: "steelgauntlet",
        defaultName: "Steel Gauntlets",
        asset: {
            path: "http://localhost:5173/avatar/images/female_steel_plate/front_lower_arm.png",
        },
        equipmentAssets: {
            frontLowerArmBone: {
                asset: {
                    path: "http://localhost:5173/avatar/images/female_steel_plate/front_lower_arm.png",
                },
                tint: tints.black,
            },
            backLowerArmBone: {
                asset: {
                    path: "http://localhost:5173/avatar/images/female_steel_plate/back_lower_arm.png",
                },
                tint: tints.black,
            },
        },
        durability: 100,
        charges: 0,
        weight: 20,
        collider: false,
        equipmentSlot: ["gl"],
        defaultState: "default",
        states: {
            default: {
                destructible: true,
                description: "A simple set of steel gauntlets",
                variant: "default",
            },
        },
        utilities: {},
        variables: {},
    },
    /**
     * Equipment - weapons
     */
    woodenclub: {
        prop: "woodenclub",
        defaultName: "Wooden Club",
        asset: {
            path: "bestiary/goblin",
            variants: {
                default: "wooden-club",
            },
        },
        durability: 100,
        charges: 0,
        weight: 3,
        collider: false,
        equipmentSlot: ["rh", "lh"],
        defaultState: "default",
        states: {
            default: {
                destructible: true,
                description: "A simple wooden club. ${etching}", // ${} for string substitution
                variant: "default",
            },
        },
        utilities: {
            swing: {
                utility: "swing",
                description: "Swing the club at a target.",
                cost: {
                    charges: 0,
                    durability: 1,
                },
                state: {
                    start: "default",
                    end: "default",
                },
                ability: abilities.swing.ability,
                requireEquipped: true,
            },
        },
        variables: {
            etching: {
                variable: "etching",
                type: "string",
                value: "There is nothing etched on the club.",
            },
        },
    },
    /**
     * Consumables
     */
    potionofhealth: {
        prop: "potionofhealth",
        defaultName: "Potion of Health",
        // TODO: Add potion asset
        asset: {
            path: "props/potions",
            variants: {
                default: "red-potion",
            },
        },
        durability: 100,
        charges: 5,
        weight: 1,
        collider: false,
        defaultState: "default",
        states: {
            default: {
                destructible: true,
                description:
                    "A bottle of clear crystal glass. You see a faint glowing red liquid inside.",
                variant: "default",
            },
        },
        utilities: {
            sip: {
                utility: "sip",
                description: "Sip the potion to restore health.",
                cost: {
                    charges: 1,
                    durability: 0,
                },
                state: {
                    start: "default",
                    end: "default",
                },
                ability: abilities.bandage.ability,
            },
        },
        variables: {},
    },
    /**
     * Architecture
     */
    woodendoor: {
        prop: "woodendoor",
        defaultName: "Wooden Door",
        asset: {
            path: "props/gothic",
            variants: {
                default: "wood-door-2", // open
                closed: "wood-door-1",
            },
        },
        defaultState: "closed",
        durability: 100,
        charges: 0,
        weight: -1,
        collider: true,
        states: {
            open: {
                destructible: false,
                description: "${doorsign}. The door is open.",
                variant: "default",
            },
            closed: {
                destructible: false,
                description: "${doorsign}. The door is closed.",
                variant: "closed",
            },
        },
        utilities: {
            open: {
                utility: "open",
                description: "Open the door.",
                cost: {
                    charges: 0,
                    durability: 0,
                },
                state: {
                    start: "closed",
                    end: "open",
                },
            },
            close: {
                utility: "close",
                description: "Close the door.",
                cost: {
                    charges: 0,
                    durability: 0,
                },
                state: {
                    start: "open",
                    end: "closed",
                },
            },
        },
        variables: {
            doorsign: {
                variable: "doorsign",
                type: "string",
                value: "Just a plain wooden door",
            },
        },
    },
    tavern: {
        prop: "tavern",
        defaultName: "Tavern",
        // TODO: Add tavern asset
        asset: {
            path: "props/gothic",
            variants: {
                default: "tavern",
            },
            width: 2,
            height: 2,
        },
        defaultState: "default",
        durability: 100,
        charges: 0,
        weight: -1, // cannot be taken
        collider: true,
        states: {
            default: {
                destructible: false,
                description: "A humble tavern. ${description}",
                variant: "default",
            },
        },
        utilities: {},
        variables: {
            description: {
                variable: "description",
                type: "string",
                value: "A plain wooden door greets you.",
            },
        },
    },
    debris: {
        prop: "debris",
        defaultName: "Debris",
        asset: {
            path: "props/gothic",
            variants: {
                default: "debris-9",
            },
            width: 2,
            height: 2,
        },
        defaultState: "default",
        durability: 100,
        charges: 0,
        weight: -1, // cannot be taken
        collider: true,
        states: {
            default: {
                destructible: false,
                description: "Impassable debris",
                variant: "default",
            },
        },
        utilities: {},
        variables: {},
    },
    portal: {
        prop: "portal",
        defaultName: "Portal",
        asset: {
            path: "props/gothic",
            variants: {
                default: "ritual-circle",
            },
            width: 2,
            height: 2,
        },
        durability: 100,
        charges: 100,
        weight: -1,
        collider: false,
        defaultState: "default",
        states: {
            default: {
                destructible: false,
                description:
                    "${description}. It is tuned to teleport to ${target}.",
                variant: "default",
            },
        },
        variables: {
            // Can be used to overwrite `target` or `self` provided by `useItem`
            target: {
                variable: "target",
                type: "item", // portal's target is bound to an item to teleport to (another portal)
                value: "",
            },
            description: {
                variable: "description",
                type: "string",
                value: "A portal pulsing with magical energy",
            },
        },
        utilities: {
            teleport: {
                utility: "teleport",
                description: "Step through the portal.",
                cost: {
                    charges: 1,
                    durability: 0,
                },
                state: {
                    start: "default",
                    end: "default",
                },
                ability: abilities.teleport.ability,
            },
        },
    },
};

/**
 * Retrieves the attributes of an item in its current state from its prop and performs variable substitution.
 *
 * @param item - The item entity for which to retrieve the attributes.
 * @returns The attributes of the item after variable substitution.
 */
function itemAttibutes(item: Item): PropAttributes {
    const state = cloneDeep(compendium[item.prop].states[item.state]);
    // Replace variables in description
    state.description = substituteVariables(
        state.description,
        itemVariables(item),
    ) as string;
    return state;
}

/**
 * Helper to get the name of an item.
 * @param item - The item to get the name for.
 * @returns The name of the item.
 */
function itemName(item: Item): string {
    return item?.name || compendium[item.prop]?.defaultName;
}

/**
 * Helper to get the variables of an item.
 *
 * @param item - The item to get the variables for.
 * @returns The variables of the item.
 */
function itemVariables(item: Item): ItemVariables {
    const vars: ItemVariables = {};
    for (const { variable, value } of Object.values(
        compendium[item.prop].variables,
    )) {
        // If not exists, use the default from prop
        if (item.vars[variable] == null) {
            vars[variable] = value;
        }
        // Use var from item
        else {
            vars[variable] = item.vars[variable];
        }
    }
    return vars;
}

function isItemEquipped(item: Item, entity: Player | Monster | Item): boolean {
    return (
        EquipmentSlots.includes(item.locT as EquipmentSlot) &&
        item.loc[0] === getEntityId(entity)[0]
    );
}
