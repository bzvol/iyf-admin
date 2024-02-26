import React, {useState} from "react";
import {useAuth} from "../../firebase";
import "./styles/Sidebar.scss";
import {Close, Menu} from "@mui/icons-material";
import {useMediaQuery} from "@mui/material";
import {Profile} from "./Profile";

const lastUpdated = "2024-02-26";

export default function Sidebar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const {loggedIn} = useAuth();

    return (
        <>
            <aside className={`menu ${menuOpen && "menu--active"}`}>
                <div className="menu__header" role="banner">
                    <h1 className="menu__title">IYF Admin</h1>
                    <p>Last updated: {lastUpdated}</p>
                    {!loggedIn && <p><b>Not logged in</b></p>}

                    <button className={`menu__btn-close ${!menuOpen && "menu__btn-hidden"}`}
                            onClick={() => setMenuOpen(false)}>
                        <Close fontSize="inherit"/>
                    </button>
                </div>

                <Profile/>

                <nav className="menu__nav">
                    <ul>
                    </ul>
                </nav>
            </aside>

            <button className={`menu__btn-open ${menuOpen && "menu__btn-hidden"}`} onClick={() => setMenuOpen(true)}>
                <Menu fontSize="inherit"/>
            </button>
        </>
    );
}
