import Alert from "../Alert";
import React, {createContext, useContext, useEffect, useState} from "react";
import "./styles/Notifications.scss";
import {Delete} from "@mui/icons-material";

export interface Notification {
    messages: {
        loading: string;
        success: string;
        error: string;
    };
    action: () => Promise<void>;
    timestamp?: number;
}

interface NotificationsContextProps {
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    addNotification: (notification: Notification) => void;
}

export const NotificationsContext = createContext<NotificationsContextProps>({
    notifications: [],
    setNotifications: () => {
    },
    addNotification: () => {
    }
});

export default function Notifications() {
    const {notifications, setNotifications} = useContext(NotificationsContext);

    const handleClear = () => setNotifications([]);

    return (
        <div className="Notifications">
            <div className="Notifications-header">
                <h3>Notifications</h3>
                <Delete onClick={handleClear}/>
            </div>
            <div className="Notifications-items">
                {notifications.map(noti => (
                    <LoadingNotification key={`notification-${noti.timestamp}`}
                                         action={noti.action}
                                         messages={noti.messages}
                    />
                ))}
                {!notifications.length && <i>No notifications</i>}
            </div>
        </div>
    );
}

export function NotificationToasts() {
    const {notifications} = useContext(NotificationsContext);

    return (
        <div className="NotificationToasts">
            {notifications.slice(0, 3).map(noti => (
                <LoadingNotificationToast key={`sb-notification-${noti.timestamp}`}
                                          action={noti.action}
                                          messages={noti.messages}
                />
            ))}
        </div>
    );
}

interface LoadingNotificationProps {
    action: () => Promise<void>;
    messages: {
        loading: string;
        success: string;
        error: string
    };
}

function LoadingNotification(props: LoadingNotificationProps) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        (async () => {
            try {
                await props.action();
                setStatus("success");
            } catch (e) {
                setStatus("error");
            }
        })(); // eslint-disable-next-line
    }, []);

    return (
        <Alert type={status}>
            {status === "loading" && props.messages.loading}
            {status === "success" && props.messages.success}
            {status === "error" && props.messages.error}
        </Alert>
    );
}

function LoadingNotificationToast(props: LoadingNotificationProps) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [show, setShow] = useState(false);

    useEffect(() => {
        setTimeout(() => setShow(true), 0);
        (async () => {
            try {
                await props.action();
                setStatus("success");
            } catch (e) {
                setStatus("error");
            } finally {
                setTimeout(() => setShow(false), 3000);
            }
        })(); // eslint-disable-next-line
    }, []);

    return (
        <div className={`NotificationToast-wrapper${show ? " NotificationToast-show" : ""}`}>
            <Alert type={status}>
                {status === "loading" && props.messages.loading}
                {status === "success" && props.messages.success}
                {status === "error" && props.messages.error}
            </Alert>
        </div>
    )
}
