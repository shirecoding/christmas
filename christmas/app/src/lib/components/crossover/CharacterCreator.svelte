<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input";
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Textarea } from "$lib/components/ui/textarea";
    import { crossoverAvailableAvatars } from "$lib/crossover/client";
    import {
        PlayerAppearanceSchema,
        PlayerDemographicSchema,
        PlayerMetadataSchema,
        ageTypes,
        archetypeTypes,
        bodyTypes,
        eyeColors,
        eyeTypes,
        faceTypes,
        genderTypes,
        hairColors,
        hairTypes,
        personalityTypes,
        playerStats,
        raceTypes,
        skinTypes,
        type PlayerAppearance,
        type PlayerDemographic,
        type PlayerMetadata,
    } from "$lib/crossover/world/player";
    import { cn } from "$lib/shadcn";
    import { parseZodErrors } from "$lib/utils";
    import { onMount } from "svelte";
    import { player } from "../../../store";
    import LabelField from "../common/LabelField.svelte";
    import SeparatorWithText from "../common/SeparatorWithText.svelte";
    import { Label } from "../ui/label";
    import AvatarViewer from "./AvatarViewer.svelte";
    import { getAvatarMetadata } from "./Game/utils";
    import type { AnimationMetadata, AvatarMetadata } from "./avatar/types";

    export let playerPublicKey: string;
    export let onCreateCharacter: (playerMetadata: PlayerMetadata) => void;

    type AvatarSelection = Record<
        string,
        {
            avatar: AvatarMetadata;
            animation: AnimationMetadata;
        }
    >;

    let name: string = "";
    let description: string = "";
    let avatar: string = "";

    let selectedHairType = hairTypes[0];
    let selectedHairColor = hairColors[0];
    let selectedEyeColor = eyeColors[0];
    let selectedEyeType = eyeTypes[0];
    let selectedFaceType = faceTypes[0];
    let selectedBodyType = bodyTypes[0];
    let selectedSkinType = skinTypes[0];
    let selectedAgeType = ageTypes[0];
    let selectedPersonalityType = personalityTypes[0];
    let selectedRaceType = raceTypes[0];
    let selectedGenderType = genderTypes[0];
    let selectedArchetypeType = archetypeTypes[0];
    let archetypes = archetypeTypes.reduce(
        (acc: Record<string, typeof cur>, cur) => {
            acc[cur.value] = cur;
            return acc;
        },
        {},
    );
    let avatarSelection: AvatarSelection = {};
    let errors: Record<string, string> = {};

    $: attributes = archetypes[selectedArchetypeType.value].attributes;
    $: stats = playerStats({
        level: 1,
        attributes: attributes,
    });
    $: selectedHairType &&
        selectedHairColor &&
        selectedEyeColor &&
        selectedEyeType &&
        selectedFaceType &&
        selectedBodyType &&
        selectedSkinType &&
        selectedAgeType &&
        selectedPersonalityType &&
        selectedRaceType &&
        selectedGenderType &&
        selectedArchetypeType &&
        getAvailableAvatars();

    function validatePlayerMetadata(): PlayerMetadata | null {
        try {
            return PlayerMetadataSchema.parse({
                player: playerPublicKey,
                name,
                description,
                avatar,
                demographic: {
                    gender: selectedGenderType.value,
                    race: selectedRaceType.value,
                    archetype: selectedArchetypeType.value,
                },
                attributes,
                appearance: {
                    hair: {
                        type: selectedHairType.value,
                        color: selectedHairColor.value,
                    },
                    eye: {
                        type: selectedEyeType.value,
                        color: selectedEyeColor.value,
                    },
                    face: selectedFaceType.value,
                    body: selectedBodyType.value,
                    skin: selectedSkinType.value,
                    personality: selectedPersonalityType.value,
                    age: selectedAgeType.value,
                },
            });
        } catch (err) {
            errors = parseZodErrors(err);
            return null;
        }
    }

    function validateAvatarMetadata(): {
        demographic: PlayerDemographic;
        appearance: PlayerAppearance;
    } | null {
        try {
            return {
                appearance: PlayerAppearanceSchema.parse({
                    hair: {
                        type: selectedHairType.value,
                        color: selectedHairColor.value,
                    },
                    eye: {
                        type: selectedEyeType.value,
                        color: selectedEyeColor.value,
                    },
                    face: selectedFaceType.value,
                    body: selectedBodyType.value,
                    skin: selectedSkinType.value,
                    personality: selectedPersonalityType.value,
                    age: selectedAgeType.value,
                }),
                demographic: PlayerDemographicSchema.parse({
                    gender: selectedGenderType.value,
                    race: selectedRaceType.value,
                    archetype: selectedArchetypeType.value,
                }),
            };
        } catch (err) {
            errors = parseZodErrors(err);
            return null;
        }
    }

    async function getAvailableAvatars() {
        const meta = validateAvatarMetadata();
        if (meta) {
            const m: AvatarSelection = {};
            for (const url of await crossoverAvailableAvatars(meta)) {
                m[url] = await getAvatarMetadata(url);
            }
            avatarSelection = m;
        }
    }

    function onCreate() {
        const playerMetadata = validatePlayerMetadata();
        if (playerMetadata) {
            onCreateCharacter(playerMetadata);
            errors = {};
        }
    }

    onMount(() => {
        // Get default on load
        getAvailableAvatars();
    });
</script>

<div class={cn("flex flex-col w-full h-full gap-2 px-2", $$restProps)}>
    <!-- Character -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Character</Card.Title>
        </Card.Header>
        <Card.Content>
            <div class="grid grid-cols-2 gap-4">
                <!-- Name -->
                <LabelField label="Name" class="text-left">
                    <Input
                        id="player-name"
                        type="text"
                        bind:value={name}
                        maxlength={100}
                        placeholder="Your character's name"
                    />
                    {#if errors.name}
                        <p class="text-xs text-destructive">
                            {errors.name}
                        </p>
                    {/if}
                </LabelField>
                <!-- Race -->
                <LabelField label="Race" class="text-left">
                    <Select.Root bind:selected={selectedRaceType}>
                        <Select.Trigger>
                            <Select.Value placeholder="" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Group>
                                {#each raceTypes as raceType}
                                    <Select.Item
                                        value={raceType.value}
                                        label={raceType.label}
                                        >{raceType.label}</Select.Item
                                    >
                                {/each}
                            </Select.Group>
                        </Select.Content>
                        <Select.Input name="raceType" />
                    </Select.Root>
                    {#if errors.race}
                        <p class="text-xs text-destructive">
                            {errors.race}
                        </p>
                    {/if}
                </LabelField>
                <!-- Gender -->
                <LabelField label="Gender" class="text-left">
                    <Select.Root bind:selected={selectedGenderType}>
                        <Select.Trigger>
                            <Select.Value placeholder="" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Group>
                                {#each genderTypes as genderType}
                                    <Select.Item
                                        value={genderType.value}
                                        label={genderType.label}
                                        >{genderType.label}</Select.Item
                                    >
                                {/each}
                            </Select.Group>
                        </Select.Content>
                        <Select.Input name="genderType" />
                    </Select.Root>
                    {#if errors.gender}
                        <p class="text-xs text-destructive">
                            {errors.gender}
                        </p>
                    {/if}
                </LabelField>
                <!-- Archetype -->
                <LabelField label="Archetype" class="text-left">
                    <Select.Root bind:selected={selectedArchetypeType}>
                        <Select.Trigger>
                            <Select.Value placeholder="" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Group>
                                {#each archetypeTypes as archetypeType}
                                    <Select.Item
                                        value={archetypeType.value}
                                        label={archetypeType.label}
                                        >{archetypeType.label}</Select.Item
                                    >
                                {/each}
                            </Select.Group>
                        </Select.Content>
                        <Select.Input name="archetypeType" />
                    </Select.Root>
                    {#if errors.archetype}
                        <p class="text-xs text-destructive">
                            {errors.archetype}
                        </p>
                    {/if}
                </LabelField>
                <!-- Description -->
                <LabelField label="Description" class="text-left">
                    <Textarea
                        placeholder="Describe your character's backstory and origin."
                        id="player-desc"
                        rows={4}
                        maxlength={400}
                        bind:value={description}
                    />
                    {#if errors.description}
                        <p class="text-xs text-destructive">
                            {errors.description}
                        </p>
                    {/if}
                </LabelField>
            </div>
        </Card.Content>
    </Card.Root>

    <!-- Abilities -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Abilities</Card.Title>
        </Card.Header>
        <Card.Content>
            <div class="grid grid-cols-2 gap-4">
                <div class="grid gap-2">
                    <SeparatorWithText>Attributes</SeparatorWithText>
                    <div class="p-2">
                        <p class="text-xs">
                            <span class="font-bold">Strength:</span>
                            {attributes.str}
                        </p>
                        <p class="text-xs">
                            <span class="font-bold">Dexterity:</span>
                            {attributes.dex}
                        </p>
                        <p class="text-xs">
                            <span class="font-bold">Constitution:</span>
                            {attributes.con}
                        </p>
                        <p class="text-xs">
                            <span class="font-bold">Intelligence:</span>
                            {attributes.int}
                        </p>
                        <p class="text-xs">
                            <span class="font-bold">Wisdom:</span>
                            {attributes.wis}
                        </p>
                        <p class="text-xs">
                            <span class="font-bold">Charisma:</span>
                            {attributes.cha}
                        </p>
                    </div>
                </div>
                <div>
                    <SeparatorWithText>Stats</SeparatorWithText>
                    <div class="p-2">
                        <p class="text-xs">
                            <span class="font-bold">Level:</span>
                            {$player?.lvl ?? 1}
                        </p>
                        <p class="text-xs">
                            <span class="font-bold">Health:</span>
                            {stats.hp}
                        </p>
                        <p class="text-xs">
                            <span class="font-bold">Mana:</span>
                            {stats.mp}
                        </p>
                        <p class="text-xs">
                            <span class="font-bold">Stamina:</span>
                            {stats.st}
                        </p>
                    </div>
                </div>
            </div>
        </Card.Content>
    </Card.Root>

    <!-- Appearance -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Appearance</Card.Title>
        </Card.Header>
        <Card.Content>
            <div class="grid grid-cols-2 gap-4">
                <!-- Face -->
                <div>
                    <SeparatorWithText>Face</SeparatorWithText>
                    <!-- Face Type -->
                    <LabelField label="Face Type" class="p-2 text-left">
                        <Select.Root bind:selected={selectedFaceType}>
                            <Select.Trigger>
                                <Select.Value placeholder="" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each faceTypes as faceType}
                                        <Select.Item
                                            value={faceType.value}
                                            label={faceType.label}
                                            >{faceType.label}</Select.Item
                                        >
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                            <Select.Input name="faceType" />
                        </Select.Root>
                    </LabelField>
                    <!-- Eye Type -->
                    <LabelField label="Eye Type" class="p-2 text-left">
                        <Select.Root bind:selected={selectedEyeType}>
                            <Select.Trigger>
                                <Select.Value placeholder="" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each eyeTypes as eyeType}
                                        <Select.Item
                                            value={eyeType.value}
                                            label={eyeType.label}
                                            >{eyeType.label}</Select.Item
                                        >
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                            <Select.Input name="eyeType" />
                        </Select.Root>
                    </LabelField>
                    <!-- Eye Color -->
                    <LabelField label="Eye Color" class="p-2 text-left">
                        <Select.Root bind:selected={selectedEyeColor}>
                            <Select.Trigger>
                                <Select.Value placeholder="" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each eyeColors as eyeColor}
                                        <Select.Item
                                            value={eyeColor.value}
                                            label={eyeColor.label}
                                            >{eyeColor.label}</Select.Item
                                        >
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                            <Select.Input name="eyeColor" />
                        </Select.Root>
                    </LabelField>
                </div>
                <!-- Hair -->
                <div>
                    <SeparatorWithText>Hair</SeparatorWithText>
                    <!-- Hair Type -->
                    <LabelField label="Hair Style" class="p-2 text-left">
                        <Select.Root bind:selected={selectedHairType}>
                            <Select.Trigger>
                                <Select.Value placeholder="" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each hairTypes as hairType}
                                        <Select.Item
                                            value={hairType.value}
                                            label={hairType.label}
                                            >{hairType.label}</Select.Item
                                        >
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                            <Select.Input name="hairType" />
                        </Select.Root>
                    </LabelField>
                    <!-- Hair Color -->
                    <LabelField label="Hair Color" class="p-2 text-left">
                        <Select.Root bind:selected={selectedHairColor}>
                            <Select.Trigger>
                                <Select.Value placeholder="" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each hairColors as hairColor}
                                        <Select.Item
                                            value={hairColor.value}
                                            label={hairColor.label}
                                            >{hairColor.label}</Select.Item
                                        >
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                            <Select.Input name="hairColor" />
                        </Select.Root>
                    </LabelField>
                </div>
                <!-- Body -->
                <div>
                    <SeparatorWithText>Body</SeparatorWithText>
                    <!-- Body Type -->
                    <LabelField label="Body Type" class="p-2 text-left">
                        <Select.Root bind:selected={selectedBodyType}>
                            <Select.Trigger>
                                <Select.Value placeholder="" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each bodyTypes as bodyType}
                                        <Select.Item
                                            value={bodyType.value}
                                            label={bodyType.label}
                                            >{bodyType.label}</Select.Item
                                        >
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                            <Select.Input name="bodyType" />
                        </Select.Root>
                    </LabelField>
                    <!-- Skin Type -->
                    <LabelField label="Skin Type" class="p-2 text-left">
                        <Select.Root bind:selected={selectedSkinType}>
                            <Select.Trigger>
                                <Select.Value placeholder="" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each skinTypes as skinType}
                                        <Select.Item
                                            value={skinType.value}
                                            label={skinType.label}
                                            >{skinType.label}</Select.Item
                                        >
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                            <Select.Input name="skinType" />
                        </Select.Root>
                    </LabelField>
                </div>
                <!-- Personality -->
                <div>
                    <SeparatorWithText>Personality</SeparatorWithText>
                    <!-- Age Type -->
                    <LabelField label="Age" class="p-2 text-left">
                        <Select.Root bind:selected={selectedAgeType}>
                            <Select.Trigger>
                                <Select.Value placeholder="" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each ageTypes as ageType}
                                        <Select.Item
                                            value={ageType.value}
                                            label={ageType.label}
                                            >{ageType.label}</Select.Item
                                        >
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                            <Select.Input name="ageType" />
                        </Select.Root>
                    </LabelField>
                    <!-- Personality Type -->
                    <LabelField label="Personality" class="p-2 text-left">
                        <Select.Root bind:selected={selectedPersonalityType}>
                            <Select.Trigger>
                                <Select.Value placeholder="" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each personalityTypes as personalityType}
                                        <Select.Item
                                            value={personalityType.value}
                                            label={personalityType.label}
                                            >{personalityType.label}</Select.Item
                                        >
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                            <Select.Input name="personalityType" />
                        </Select.Root>
                    </LabelField>
                </div>
            </div>
        </Card.Content>
        <Card.Footer>
            {#if errors.appearance}
                <p class="text-xs text-destructive">
                    {errors.appearance}
                </p>
            {/if}
        </Card.Footer>
    </Card.Root>

    <!-- Avatar -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Who are you?</Card.Title>
        </Card.Header>
        <Card.Content class="py-0">
            {#if Object.keys(avatarSelection).length}
                <RadioGroup.Root
                    class="grid grid-cols-3 gap-4"
                    bind:value={avatar}
                >
                    {#each Object.entries(avatarSelection) as [url, metadata]}
                        <Label
                            for={url}
                            class="w-48 h-48 flex flex-col items-center justify-between rounded-full 
                            overflow-hidden border-2 border-muted bg-popover p-0 hover:bg-accent 
                            hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                        >
                            <RadioGroup.Item
                                class="sr-only"
                                value={url}
                                id={url}
                            />
                            <AvatarViewer
                                class="aspect-square"
                                metadata={{
                                    animationMetadata: metadata.animation,
                                    avatarMetadata: metadata.avatar,
                                }}
                            ></AvatarViewer>
                        </Label>
                    {/each}
                </RadioGroup.Root>
            {:else}
                <p class="text-xs p-4">
                    There are no available avatars, please generate one.
                </p>
            {/if}
        </Card.Content>
        <Card.Footer>
            {#if errors.avatar}
                <p class="text-xs text-destructive">
                    You must select an avatar
                </p>
            {/if}
        </Card.Footer>
    </Card.Root>
    <!-- Create Character -->
    <Button on:click={onCreate}>Create Character</Button>
</div>
