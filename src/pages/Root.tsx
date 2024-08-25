import './styles/Root.scss';
import Sidebar from "../components/sidebar/Sidebar";
import {Outlet, useLocation} from "react-router-dom";
import {useMediaQuery} from "@mui/material";
import {auth, provider, useAuth} from "../firebase";
import {Home} from "./Home";
import {useState} from "react";
import {Notification, NotificationsContext, NotificationToasts} from "../components/sidebar/Notifications";
import {signInWithPopup} from "firebase/auth";
import {useNotifications} from "../utils";
import Bugsnag from "@bugsnag/js";

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
    const addNotification = useNotifications();

    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            addNotification({
                type: "error",
                message: "Failed to sign in",
            });
            if (error instanceof Error) Bugsnag.notify(error);
        }
    }

    return (
        <div className="UnauthorizedScreen">
            <div>
                <h1>Unauthorized</h1>
                <p>Please sign in to view IYF Admin. <i>Registering with a verified @iyf.hu account gives automatic
                    access.</i></p>
                <button onClick={handleSignIn}>Sign in</button>
            </div>
        </div>
    );
}
