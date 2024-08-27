import React, {useState} from "react";
import {useAuth} from "../../firebase";
import "./styles/Sidebar.scss";
import {BugReport, Close, Menu} from "@mui/icons-material";
import {Profile} from "./Profile";
import NavMenu from "./NavMenu";
import Notifications from "./Notifications";
import {Link} from "react-router-dom";

const lastUpdated = "2024-08-25";
const version = "1.0.0";

export default function Sidebar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const {loggedIn, admin} = useAuth();

    return (
        <>
            <aside className={`menu ${menuOpen && "menu--active"}`}>
                <div className="menu__header" role="banner">
                    <h1 className="menu__title">IYF Admin</h1>
                    <p>Version: {version}</p>
                    <p>Last updated: {lastUpdated}</p>
                    {!loggedIn && <p><b>Not logged in</b></p>}

                    <button className={`menu__btn-close ${!menuOpen && "menu__btn-hidden"}`}
                            onClick={() => setMenuOpen(false)}>
                        <Close fontSize="inherit"/>
                    </button>
                </div>

                <Profile/>

                {loggedIn && admin && <NavMenu/>}

                <Notifications/>

                <div className="menu__footer">
                    <Link to="/report-bug">
                        <button className="icon-n-text"><BugReport/> Report a bug</button>
                    </Link>
                </div>
            </aside>

            <button className={`menu__btn-open ${menuOpen && "menu__btn-hidden"}`} onClick={() => setMenuOpen(true)}>
                <Menu fontSize="inherit"/>
            </button>
        </>
    );
}
