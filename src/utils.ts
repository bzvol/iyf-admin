import {Notification, NotificationsContext} from "./components/sidebar/Notifications";
import {createContext, useCallback, useContext, useState} from "react";
import {HeadingNode} from "@lexical/rich-text";
import {LinkNode} from "@lexical/link";
import {ListItemNode, ListNode} from "@lexical/list";
import {ImageNode} from "./components/content-editor/ImagePlugin";
import {$getRoot, createEditor} from "lexical";
import Bugsnag from "@bugsnag/js";

export function useNotifications(): (notification: Notification) => void {
    const {setNotifications} = useContext(NotificationsContext);

    const asyncFunc = useCallback(async (noti: Notification) => {
        const notiId = Date.now();
        setNotifications(prev => [{
            ...noti, id: notiId,
            status: noti.type === "loading" ? "loading" : undefined
        }, ...prev]);

        if (noti.type !== "loading") return;

        try {
            await noti.action?.();
            noti.onSuccess?.();
            setNotifications(prev => prev.map(noti => noti.id === notiId
                ? {...noti, status: "success"} : noti));
        }
        catch (e) {
            noti.onError?.();
            if (e instanceof Error) Bugsnag.notify(e);
            setNotifications(prev => prev.map(noti => noti.id === notiId
                ? {...noti, status: "error"} : noti));
        }
    }, [setNotifications]);

    return (notification: Notification) => asyncFunc(notification);
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
    const editor = createEditor({
        nodes: [HeadingNode, LinkNode, ListItemNode, ListNode, ImageNode],
        onError: () => {
            throw new Error("An error occurred while converting Lexical to plain text");
        }
    });

    const editorState = editor.parseEditorState(json);

    return editorState.read(() => $getRoot().getTextContent());
}

const localeOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
};

export function parseISO(date: string) {
    const [datePart, timePart] = date.split("T");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
    const parsed = new Date(+year, +month - 1, +day, +hour, +minute);
    return parsed.toLocaleString('en-GB', localeOptions);
}
