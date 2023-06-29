import {useState} from "react";
import {auth, provider, useAuth} from "../firebase";
import {signInWithPopup} from "firebase/auth";
import "./Sidebar.css";
import {Close, Menu} from "@mui/icons-material";

export default function Sidebar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const {loggedIn} = useAuth();

    return (
        <>
            <aside className={`menu ${menuOpen && "menu--active"}`}>
                <div className="menu__header">
                    <h1 className="menu__title">JHM Admin</h1>
                    <p>Last updated: 2023-06-29</p>
                    {!loggedIn && <p><b>Not logged in</b></p>}

                    <button className={`menu__btn-close ${!menuOpen && "menu__btn-hidden"}`}
                            onClick={() => setMenuOpen(false)}>
                        <Close fontSize="inherit"/>
                    </button>
                </div>

                <Profile/>
            </aside>

            <button className={`menu__btn-open ${menuOpen && "menu__btn-hidden"}`} onClick={() => setMenuOpen(true)}>
                <Menu fontSize="inherit"/>
            </button>
        </>
    );
}

function Profile() {
    const {user, loading, loggedIn, role} = useAuth();

    return (
        <div className="menu__profile">
            {loggedIn && <div className="menu__profile-data">
                <img src={user?.photoURL || "./unknown.png"} alt="Profile"
                     className="menu__profile-photo"/>
                <div>
                    <h2 className="menu__profile-name">{user?.displayName}</h2>
                    {loading ? <p>Loading...</p> : <p>Role: {role}</p>}
                </div>
            </div>}

            {loggedIn && !loading && role === "guest"
                && <button onClick={() => console.log("Request access") /* TODO: Implement request access */}
                           className="menu__btn-request">Request access</button>}

            <button onClick={() => changeAuthState()}
                    className="menu__btn-sign-in-out">Sign {loggedIn ? "out" : "in"}</button>
        </div>
    )
}

function changeAuthState() {
    if (auth.currentUser) auth.signOut().catch(console.error);
    else signInWithPopup(auth, provider).catch(console.error);
}