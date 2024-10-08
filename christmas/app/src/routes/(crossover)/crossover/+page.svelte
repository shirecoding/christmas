<script lang="ts">
    import GameWindow from "$lib/components/crossover/GameWindow";
    import Onboard from "$lib/components/crossover/Onboard.svelte";
    import { stream } from "$lib/crossover/client";
    import type { Player } from "$lib/crossover/types";
    import { onDestroy, onMount } from "svelte";
    import {
        actionEvent,
        ctaEvent,
        entitiesEvent,
        feedEvent,
        loginEvent,
        player,
    } from "../../../store";
    import type {
        ActionEvent,
        CTAEvent,
        FeedEvent,
        UpdateEntitiesEvent,
    } from "../../api/crossover/stream/+server";

    let eventStream: EventTarget | null = null;
    let closeStream: (() => void) | null = null;

    function processEntitiesEvent(event: Event) {
        entitiesEvent.set((event as MessageEvent).data as UpdateEntitiesEvent);
    }

    function processFeedEvent(event: Event) {
        feedEvent.set((event as MessageEvent).data as FeedEvent);
    }

    function processActionEvent(event: Event) {
        actionEvent.set((event as MessageEvent).data as ActionEvent);
    }

    function processCTAEvent(event: Event) {
        ctaEvent.set((event as MessageEvent).data as CTAEvent);
    }

    async function startStream() {
        [eventStream, closeStream] = await stream();

        eventStream.removeEventListener("feed", processFeedEvent);
        eventStream.removeEventListener("entities", processEntitiesEvent);
        eventStream.removeEventListener("action", processActionEvent);
        eventStream.removeEventListener("cta", processCTAEvent);

        eventStream.addEventListener("feed", processFeedEvent);
        eventStream.addEventListener("entities", processEntitiesEvent);
        eventStream.addEventListener("action", processActionEvent);
        eventStream.addEventListener("cta", processCTAEvent);
    }

    function stopStream() {
        if (eventStream != null) {
            eventStream.removeEventListener("feed", processFeedEvent);
            eventStream.removeEventListener("entities", processEntitiesEvent);
            eventStream.removeEventListener("action", processActionEvent);
            eventStream.removeEventListener("cta", processCTAEvent);
        }
        if (closeStream != null) {
            closeStream();
        }
    }

    async function onLogin(player: Player) {
        // Start streaming on login
        stopStream();
        await startStream();

        // Trigger login event
        loginEvent.set(player);
    }

    onMount(() => {
        // HMR
        if ($player) {
            onLogin($player);
        }
    });

    onDestroy(() => {
        stopStream();
    });
</script>

{#if !$player}
    <div class="container py-16">
        <Onboard {onLogin} />
    </div>
{:else}
    <GameWindow class="pt-0" />
{/if}
