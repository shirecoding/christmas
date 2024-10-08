from typing import Dict, List, Literal, TypedDict, Union
from .settings import TICKS_PER_TURN

AbilityType = Literal["offensive", "defensive", "healing", "neutral"]
DamageType = Literal[
    "slashing",
    "blunt",
    "piercing",
    "fire",
    "ice",
    "lightning",
    "poison",
    "necrotic",
    "radiant",
    "healing",
]
Debuff = Literal[
    "paralyzed",
    "blinded",
    "wet",
    "burning",
    "poisoned",
    "frozen",
    "bleeding",
    "stunned",
    "confused",
    "charmed",
    "frightened",
    "exhausted",
    "silenced",
    "diseased",
]
EntityType = Literal["player", "monster", "item"]


class ProcedureEffect(TypedDict, total=False):
    target: Literal["self", "target"]
    ticks: int
    damage: Dict[Literal["amount", "damageType"], Union[int, DamageType]]
    debuffs: Dict[
        Literal["debuff", "op"],
        Union[Debuff, Literal["push", "pop", "contains", "doesNotContain"]],
    ]
    states: Dict[
        Literal["state", "op", "value"], Union[Literal["loc"], Literal["change"], str]
    ]


Procedure = List[Union[Literal["action", "check"], ProcedureEffect]]


class Ability(TypedDict):
    ability: str
    type: AbilityType
    description: str
    procedures: List[Procedure]
    ap: int
    st: int
    hp: int
    mp: int
    range: int
    aoe: int
    predicate: Dict[str, Union[List[EntityType], bool]]


abilities: Dict[str, Ability] = {
    "bandage": {
        "ability": "bandage",
        "type": "healing",
        "description": "Bandages the player's wounds.",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "damage": {"amount": -5, "damageType": "healing"},
                    "ticks": TICKS_PER_TURN,
                },
            ],
        ],
        "ap": 2,
        "st": 1,
        "hp": 0,
        "mp": 0,
        "range": 1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster"],
            "targetSelfAllowed": True,
        },
    },
    "disintegrate": {
        "ability": "disintegrate",
        "type": "offensive",
        "description": "Disintegrates the target. [FOR TESTING ONLY]",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "damage": {"amount": 100, "damageType": "necrotic"},
                    "ticks": TICKS_PER_TURN // 2,
                },
            ],
        ],
        "ap": 1,
        "st": 0,
        "hp": 0,
        "mp": 1,
        "range": 1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster"],
            "targetSelfAllowed": False,
        },
    },
    "scratch": {
        "ability": "scratch",
        "type": "offensive",
        "description": "Scratches the target.",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "damage": {"amount": 1, "damageType": "slashing"},
                    "ticks": TICKS_PER_TURN // 2,
                },
            ],
        ],
        "ap": 1,
        "st": 1,
        "hp": 0,
        "mp": 0,
        "range": 1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster"],
            "targetSelfAllowed": False,
        },
    },
    "swing": {
        "ability": "swing",
        "type": "offensive",
        "description": "Swing at the player.",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "damage": {"amount": 1, "damageType": "blunt"},
                    "ticks": TICKS_PER_TURN // 2,
                },
            ],
        ],
        "ap": 1,
        "st": 1,
        "hp": 0,
        "mp": 0,
        "range": 1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster"],
            "targetSelfAllowed": False,
        },
    },
    "doubleSlash": {
        "ability": "doubleSlash",
        "type": "offensive",
        "description": "Slashes the player twice.",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "damage": {"amount": 1, "damageType": "slashing"},
                    "ticks": TICKS_PER_TURN // 3,
                },
            ],
            [
                "action",
                {
                    "target": "target",
                    "damage": {"amount": 1, "damageType": "slashing"},
                    "ticks": TICKS_PER_TURN // 3,
                },
            ],
        ],
        "ap": 2,
        "st": 1,
        "hp": 0,
        "mp": 0,
        "range": 1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster"],
            "targetSelfAllowed": False,
        },
    },
    "eyePoke": {
        "ability": "eyePoke",
        "type": "offensive",
        "description": "Pokes the player's eyes, blinding them.",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "debuffs": {"debuff": "blinded", "op": "push"},
                    "ticks": TICKS_PER_TURN // 2,
                },
            ],
            [
                "check",
                {
                    "target": "target",
                    "debuffs": {"debuff": "blinded", "op": "contains"},
                    "ticks": 0,
                },
            ],
            [
                "action",
                {
                    "target": "target",
                    "damage": {"amount": 1, "damageType": "piercing"},
                    "ticks": TICKS_PER_TURN // 2,
                },
            ],
        ],
        "ap": 2,
        "st": 2,
        "hp": 0,
        "mp": 0,
        "range": 1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster"],
            "targetSelfAllowed": True,
        },
    },
    "bite": {
        "ability": "bite",
        "type": "offensive",
        "description": "Bites the player.",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "damage": {"amount": 1, "damageType": "piercing"},
                    "ticks": TICKS_PER_TURN // 2,
                },
            ],
        ],
        "ap": 1,
        "st": 1,
        "hp": 0,
        "mp": 0,
        "range": 1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster"],
            "targetSelfAllowed": True,
        },
    },
    "breathFire": {
        "ability": "breathFire",
        "type": "offensive",
        "description": "Breathes fire possibly burning the player.",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "damage": {"amount": 3, "damageType": "fire"},
                    "ticks": TICKS_PER_TURN // 2,
                },
            ],
            [
                "check",
                {
                    "target": "target",
                    "debuffs": {"debuff": "wet", "op": "doesNotContain"},
                    "ticks": 0,
                },
            ],
            [
                "action",
                {
                    "target": "target",
                    "debuffs": {"debuff": "burning", "op": "push"},
                    "ticks": 0,
                },
            ],
        ],
        "ap": 2,
        "st": 1,
        "hp": 0,
        "mp": 2,
        "range": 1,
        "aoe": 1,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster", "item"],
            "targetSelfAllowed": False,
        },
    },
    "paralyze": {
        "ability": "paralyze",
        "type": "offensive",
        "description": "Paralyzes the player.",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "debuffs": {"debuff": "paralyzed", "op": "push"},
                    "ticks": TICKS_PER_TURN // 2,
                },
            ],
        ],
        "ap": 2,
        "st": 1,
        "hp": 0,
        "mp": 2,
        "range": 1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster"],
            "targetSelfAllowed": True,
        },
    },
    "blind": {
        "ability": "blind",
        "type": "offensive",
        "description": "Blinds the player.",
        "procedures": [
            [
                "action",
                {
                    "target": "target",
                    "debuffs": {"debuff": "blinded", "op": "push"},
                    "ticks": TICKS_PER_TURN // 2,
                },
            ],
        ],
        "ap": 2,
        "st": 1,
        "hp": 0,
        "mp": 2,
        "range": 1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster"],
            "targetSelfAllowed": True,
        },
    },
    "teleport": {
        "ability": "teleport",
        "type": "neutral",
        "description": "Teleport to the target location.",
        "procedures": [
            [
                "action",
                {
                    "target": "self",
                    "states": {
                        "state": "loc",
                        "value": "{{target.loc}}",  # {{}} for variable access
                        "op": "change",
                    },
                    "ticks": TICKS_PER_TURN,
                },
            ],
        ],
        "ap": 4,
        "st": 0,
        "hp": 0,
        "mp": 20,
        "range": -1,
        "aoe": 0,
        "predicate": {
            "self": ["player", "monster"],
            "target": ["player", "monster", "item"],
            "targetSelfAllowed": True,
        },
    },
}
