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
                {notifications.map((noti, index) => (
                    <LoadingNotification key={`notification-${notifications.length - index - 1}`}
                                         action={noti.action}
                                         messages={noti.messages}
                    />
                ))}
                {!notifications.length && <i>No notifications</i>}
            </div>
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
        props.action().then(() => setStatus("success")).catch(() => setStatus("error"));
    }, [props]);

    return (
        <Alert type={status}>
            {status === "loading" && props.messages.loading}
            {status === "success" && props.messages.success}
            {status === "error" && props.messages.error}
        </Alert>
    );
}
