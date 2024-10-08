import type { Prop } from "../../compendium";
import { abilities } from "../abilities";

export let architecture: Record<string, Prop> = {
    woodendoor: {
        prop: "woodendoor",
        asset: {
            path: "props/gothic",
            variants: {
                open: "wood-door-2",
                closed: "wood-door-1",
            },
        },
        durability: 100,
        charges: 0,
        weight: -1,
        collider: true,
        states: {
            default: {
                name: "Wooden Door",
                destructible: false,
                description: "${doorsign}. The door is closed.",
                variant: "closed",
            },
            open: {
                name: "Wooden Door",
                destructible: false,
                description: "${doorsign}. The door is open.",
                variant: "open",
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
                range: 1,
                state: {
                    start: "default",
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
                range: 1,
                state: {
                    start: "open",
                    end: "default",
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
        // TODO: Add tavern asset
        asset: {
            path: "props/gothic",
            variants: {
                default: "wood-door-1",
            },
            width: 2,
            height: 2,
        },
        durability: 100,
        charges: 0,
        weight: -1, // cannot be taken
        collider: true,
        states: {
            default: {
                name: "Tavern",
                destructible: false,
                description: "A humble tavern. ${description}",
                variant: "default",
            },
        },
        world: {
            locationInstance: "{{self.item}}",
            locationType: "in",
            geohash: "{{self.loc[0]}}",
            world: "{{self.item}}",
            url: "${url}",
        },
        utilities: {},
        variables: {
            description: {
                variable: "description",
                type: "string",
                value: "A plain wooden door of the tavern greets you.",
            },
            url: {
                variable: "url",
                type: "string",
                value: "",
            },
        },
    },
    debris: {
        prop: "debris",
        asset: {
            path: "props/gothic",
            variants: {
                default: "debris-9",
            },
            width: 2,
            height: 2,
        },
        durability: 100,
        charges: 0,
        weight: -1, // cannot be taken
        collider: true,
        states: {
            default: {
                name: "Debris",
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
        states: {
            default: {
                name: "Portal",
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
