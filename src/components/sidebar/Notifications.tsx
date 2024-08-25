import Alert, {AlertType} from "../Alert";
import React, {createContext, useContext, useEffect, useState} from "react";
import "./styles/Notifications.scss";
import {Delete} from "@mui/icons-material";

export interface Notification {
    id?: number;
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
    status?: "loading" | "success" | "error";
}

interface NotificationsContextProps {
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const NotificationsContext = createContext<NotificationsContextProps>({
    notifications: [],
    setNotifications: () => {
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
                {notifications.map(noti => <NotificationItem key={noti.id!} notification={noti}/>)}
                {!notifications.length && <i>No notifications</i>}
            </div>
        </div>
    );
}

export function NotificationToasts() {
    const {notifications} = useContext(NotificationsContext);

    return (
        <div className="NotificationToasts">
            {notifications.slice(0, 3).map(noti =>
                <NotificationToast key={`toast-${noti.id!}`} notification={noti}/>)}
        </div>
    );
}

function NotificationItem({notification: noti}: { notification: Notification; }) {
    return (
        <Alert type={noti.type === "loading" ? noti.status! : noti.type}>
            {noti.type !== "loading" ? noti.message! : <>
                {noti.status === "loading" && noti.messages!.loading}
                {noti.status === "success" && noti.messages!.success}
                {noti.status === "error" && noti.messages!.error}
            </>}
        </Alert>
    );
}

function NotificationToast({notification: noti}: { notification: Notification; }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        setTimeout(() => setShow(true), 0);
        if (noti.status !== "loading")
            setTimeout(() => setShow(false), 3000);
    }, [noti.status]);

    return (
        <div className={`NotificationToast-wrapper${show ? " NotificationToast-show" : ""}`}>
            <NotificationItem notification={noti}/>
        </div>
    )
}
