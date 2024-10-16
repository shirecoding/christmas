import {
    entityInRange,
    getEntityId,
    minifiedEntity,
} from "$lib/crossover/utils";
import {
    hasResourcesForAbility,
    patchEffectWithVariables,
    type Abilities,
    type ProcedureEffect,
} from "$lib/crossover/world/abilities";
import { MS_PER_TICK } from "$lib/crossover/world/settings";
import { abilities } from "$lib/crossover/world/settings/abilities";
import type {
    ActorEntity,
    CreatureEntity,
    PlayerEntity,
} from "$lib/server/crossover/types";
import { sleep } from "$lib/utils";
import { consumeResources, setEntityBusy } from ".";
import { resolveCombat } from "./combat";
import { publishAffectedEntitiesToPlayers, publishFeedEvent } from "./events";
import { fetchEntity } from "./redis/utils";

export { performAbility };

async function performAbility({
    self,
    target, // target can be undefined if the ability performs an action on self
    ability,
    ignoreCost,
    now,
}: {
    self: CreatureEntity;
    target?: string;
    ability: Abilities;
    ignoreCost?: boolean;
    now?: number;
}) {
    const [selfEntityId, selfEntityType] = getEntityId(self);

    const { procedures, range, predicate, cost } = abilities[ability];

    // Check if target is not provided and target self is not allowed
    if (!target && !predicate.targetSelfAllowed) {
        if (self.player) {
            await publishFeedEvent(selfEntityId, {
                type: "error",
                message: `${ability} requires a target`,
            });
        }
        return;
    }

    // Get target (self if not specified)
    let targetEntity = !target ? self : await fetchEntity(target);
    if (!targetEntity) {
        if (self.player) {
            await publishFeedEvent(selfEntityId, {
                type: "error",
                message: `Target ${target} not found`,
            });
        }
        return; // do not proceed
    }

    // Check if self has enough resources to perform ability
    if (!ignoreCost) {
        const { hasResources, message } = hasResourcesForAbility(self, ability);
        if (!hasResources && self.player) {
            await publishFeedEvent(selfEntityId, {
                type: "error",
                message,
            });
            return;
        }
    }

    // Check predicate
    if (
        !predicate.targetSelfAllowed &&
        selfEntityId === target &&
        self.player
    ) {
        await publishFeedEvent(selfEntityId, {
            type: "error",
            message: `You can't ${ability} yourself`,
        });
        return;
    }

    // Check if target is in range
    if (!entityInRange(self, targetEntity, range)[0] && self.player) {
        await publishFeedEvent(selfEntityId, {
            type: "error",
            message: `${targetEntity.name} is out of range`,
        });
        return;
    }

    // Set player busy
    self = await setEntityBusy({
        entity: self as PlayerEntity,
        ability,
        now,
    });

    // Expend ability costs (also caps stats to player level)
    if (!ignoreCost) {
        self = await consumeResources(self, cost);
    }
    targetEntity = targetEntity.player === self.player ? self : targetEntity; // target might be self, in which case update it after save

    // Publish ability costs changes to player
    if (self.player && !ignoreCost) {
        await publishAffectedEntitiesToPlayers([
            minifiedEntity(self, { stats: true, timers: true }),
        ]);
    }

    // Perform procedures
    for (const [type, effect] of procedures) {
        // Get affected entity (self or target)
        let entity = effect.target === "self" ? self : targetEntity;

        // Action
        if (type === "action") {
            // Patch effect with variables
            const procedureEffect = patchEffectWithVariables({
                effect,
                self,
                target: targetEntity,
            });

            // Sleep for the duration of the effect
            await sleep(MS_PER_TICK * procedureEffect.ticks);

            // Resolve combat
            await resolveCombat(self, entity, {
                ability: {
                    ability,
                    procedureEffect,
                },
            });
        }
        // Check
        else if (type === "check") {
            if (!performEffectCheck({ entity, effect })) break;
        }
    }
}

function performEffectCheck({
    entity,
    effect,
}: {
    entity: ActorEntity;
    effect: ProcedureEffect;
}): boolean {
    const { debuffs, buffs } = effect;

    if (debuffs) {
        const { debuff, op } = debuffs;
        if (op === "contains") {
            return entity.dbuf.includes(debuff);
        } else if (op === "doesNotContain") {
            return !entity.dbuf.includes(debuff);
        }
    }

    if (buffs) {
        const { buff, op } = buffs;
        if (op === "contains") {
            return entity.buf.includes(buff);
        } else if (op === "doesNotContain") {
            return !entity.buf.includes(buff);
        }
    }

    return false;
}
