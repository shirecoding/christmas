<script lang="ts">
    import { cn } from "$lib/shadcn";
    import { onMount } from "svelte";
    import type { MessageFeedUI } from "./types";

    let chatWindow: HTMLElement;

    export let messageFeed: MessageFeedUI[] = [];

    function scrollChatBottom(behavior?: ScrollBehavior): void {
        chatWindow?.scrollTo({ top: chatWindow.scrollHeight, behavior });
    }

    onMount(() => {
        scrollChatBottom();
    });

    function onNewMessages(messages: MessageFeedUI[]): void {
        setTimeout(() => {
            scrollChatBottom("smooth");
        }, 0);
    }

    $: onNewMessages(messageFeed);
</script>

<section
    bind:this={chatWindow}
    class={cn(
        "h-full w-full p-4 overflow-y-auto space-y-2 scroll-container",
        $$restProps.class,
    )}
>
    {#each messageFeed as message}
        <div class="flex flex-row text-left">
            <div class="flex flex-col w-16 shrink-0">
                <p class="italic text-sm">{message.name}</p>
                <small class="opacity-50 text-xs">{message.timestamp}</small>
            </div>
            <p class="text-sm font-extralight px-2 text-left">
                {message.message}
            </p>
        </div>
    {/each}
</section>

<!-- Styles -->
<style>
    /* Hide Scrollbar */
    .scroll-container {
        overflow-x: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* Internet Explorer 10+ */
    }
    .scroll-container::-webkit-scrollbar {
        display: none; /* WebKit */
    }
</style>
