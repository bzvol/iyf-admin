import Alert, {AlertType} from "../Alert";
import React, {createContext, useContext, useEffect, useState} from "react";
import "./styles/Notifications.scss";
import {Delete} from "@mui/icons-material";

export interface Notification {
    type: AlertType;
    message?: string;
    messages?: {
        loading: string;
        success: string;
        error: string;
    };
    action?: () => Promise<void>;
    onSuccess?: () => void;
    onError?: () => void;
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
                {notifications.map(noti => noti.type === "loading" ? (
                    <LoadingNotification key={`notification-${noti.timestamp}`}
                                         messages={noti.messages!}
                                         action={noti.action!} onSuccess={noti.onSuccess} onError={noti.onError}
                    />
                ) : (
                    <Alert key={`notification-${noti.timestamp}`} type={noti.type}>
                        {noti.message!}
                    </Alert>
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
            {notifications.slice(0, 3).map(noti => noti.type === "loading" ? (
                <LoadingNotificationToast key={`sb-notification-${noti.timestamp}`}
                                          action={noti.action!}
                                          messages={noti.messages!}
                />
            ) : (
                <Alert key={`sb-notification-${noti.timestamp}`} type={noti.type}>
                    {noti.message!}
                </Alert>
            ))}
        </div>
    );
}

interface LoadingNotificationProps {
    messages: {
        loading: string;
        success: string;
        error: string
    };
    action: () => Promise<void>;
    onSuccess?: () => void;
    onError?: () => void;
}

function LoadingNotification(props: LoadingNotificationProps) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        (async () => {
            try {
                await props.action();
                setStatus("success");
                props.onSuccess?.();
            } catch (e) {
                setStatus("error");
                props.onError?.();
            }
        })();
    }, [props.action]);

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
                props.onSuccess?.();
            } catch (e) {
                setStatus("error");
                props.onError?.();
            } finally {
                setTimeout(() => setShow(false), 3000);
            }
        })();
    }, [props.action]);

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
