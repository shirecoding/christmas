import { messageFeed } from "../../../../store";
import Root from "./GameWindow.svelte";

export default Root;

export { addMessageFeed, type MessageFeed, type MessageFeedType };

type MessageFeedType = "error" | "message" | "system";

interface MessageFeed {
    id: number;
    name: string;
    timestamp: Date;
    message: string;
    messageFeedType: MessageFeedType;
}

function addMessageFeed({
    message,
    name,
    messageFeedType,
}: {
    message: string;
    name: string;
    messageFeedType: MessageFeedType;
}) {
    messageFeed.update((ms) => {
        return [
            ...ms,
            {
                id: ms.length,
                timestamp: new Date(),
                message,
                name,
                messageFeedType,
            },
        ];
    });
}
