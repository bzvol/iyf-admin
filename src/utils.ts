import {Notification, NotificationsContext} from "./components/sidebar/Notifications";
import {createContext, useCallback, useContext, useState} from "react";

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
