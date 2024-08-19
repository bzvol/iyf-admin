import {Notification, NotificationsContext} from "./components/sidebar/Notifications";
import {createContext, useCallback, useContext, useState} from "react";
import {HeadingNode} from "@lexical/rich-text";
import {LinkNode} from "@lexical/link";
import {ListItemNode, ListNode} from "@lexical/list";
import {ImageNode} from "./components/content-editor/ImagePlugin";
import {$getRoot, createEditor} from "lexical";

export function useNotifications() {
    const {setNotifications} = useContext(NotificationsContext);
    return useCallback((notification: Notification) => setNotifications(prev => [{
        ...notification,
        timestamp: Date.now()
    }, ...prev]), [setNotifications]);
}

type Trigger = () => void;

export function createTriggerContext() {
    return createContext<Trigger | null>(null);
}

export function useCreateTrigger() {
    const [value, setValue] = useState(false);
    const trigger = useCallback(() => setValue(prev => !prev), []);
    return {trigger, triggerVal: value};
}

export function useTrigger(triggerContext: React.Context<Trigger | null>) {
    const trigger = useContext(triggerContext);
    if (!trigger) throw new Error("No trigger is provided for this context");
    return trigger;
}

// Convert Lexical JSON editor state to plain text
export function convertLexToPlain(json: string) {
    console.info("Converting " + json);

    const editor = createEditor({
        nodes: [HeadingNode, LinkNode, ListItemNode, ListNode, ImageNode],
        onError: () => {
            throw new Error("An error occurred while converting Lexical to plain text");
        }
    });

    const editorState = editor.parseEditorState(json);

    return editorState.read(() => $getRoot().getTextContent());
}
