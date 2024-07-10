import {Notification, NotificationsContext} from "./components/sidebar/Notifications";
import {useContext} from "react";

export function useNotifications() {
    const {setNotifications} = useContext(NotificationsContext);
    return (notification: Notification) => setNotifications(prev => [{
        ...notification,
        timestamp: Date.now()
    }, ...prev]);
}

class Trigger {
    value = false;

    trigger() {
        this.value = !this.value;
    }

    awaiter(action: () => Promise<void>): () => Promise<void> {
        return async () => {
            await action();
            this.trigger();
        }
    }
}

export function createTrigger(): Trigger {
    return new Trigger();
}

export function useTrigger(trigger: Trigger): [
    () => void,
    (action: () => Promise<void>) => () => Promise<void>
] {
    return [trigger.trigger, trigger.awaiter];
}

export function useTriggerListener(trigger: Trigger) {
    return trigger.value;
}
