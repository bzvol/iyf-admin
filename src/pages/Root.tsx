import Sidebar from "../components/sidebar/Sidebar";
import {Outlet, useLocation} from "react-router-dom";
import {useMediaQuery} from "@mui/material";
import {useAuth} from "../firebase";
import {Home} from "./Home";
import {useState} from "react";
import {Notification, NotificationsContext, NotificationToasts} from "../components/sidebar/Notifications";

export default function Root() {
    const {loggedIn, admin} = useAuth();
    const location = useLocation();

    const isSmallScreen = useMediaQuery("(max-width: 992px)");

    const [notifications, setNotifications] = useState<Notification[]>([]);

    return (
        <div className="body">
            <NotificationsContext.Provider value={{notifications, setNotifications}}>
                <Sidebar/>
                <div className="main-wrapper">
                    {isSmallScreen && <header className="small-screen-header"><h1>IYF Admin</h1></header>}
                    <main className="main">
                        {isSmallScreen && <NotificationToasts/>}
                        {(loggedIn && admin)
                            ? (location.pathname === "/" ? <Home/> : <Outlet/>)
                            : <UnauthorizedScreen/>}
                    </main>
                </div>
            </NotificationsContext.Provider>
        </div>
    );
}

function UnauthorizedScreen() {
    return (
        <>
            <h1>Unauthorized</h1>
            <p>You are not authorized to view this page.</p>
        </>
    );
}
