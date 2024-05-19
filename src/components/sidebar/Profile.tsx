import {auth, IRoles, provider, useAuth} from "../../firebase";
import React, {useState} from "react";
import {AccessRequestModal} from "./AccessRequestModal";
import {signInWithPopup} from "firebase/auth";
import "./styles/Profile.scss";

const defaultProfilePhoto = "/assets/images/default-profile.png";

export function Profile() {
    const {user, loading, loggedIn, accessRequested, admin, roles} = useAuth();

    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="menu__profile">
            {loggedIn && <div className="menu__profile-data">
                <img src={user?.photoURL ?? defaultProfilePhoto} alt="Profile" referrerPolicy={"no-referrer"}
                     onError={(e) => (e.target as HTMLImageElement).src = defaultProfilePhoto}
                     className="menu__profile-photo"/>
                <div>
                    <h2 className="menu__profile-name">{user?.displayName}</h2>
                    <h4 className="menu__profile-email">{user?.email}</h4>
                    <Roles roles={roles}/>
                </div>
            </div>}

            {loggedIn && !loading && !admin
                && (accessRequested
                    ? <p>Access requested.</p>
                    : <button
                        onClick={() => setModalOpen(true)}
                        className="menu__btn-request">Request access
                    </button>)}

            <button onClick={() => changeAuthState()}
                    className="menu__btn-sign-in-out">Sign {loggedIn ? "out" : "in"}</button>

            <AccessRequestModal modalOpen={modalOpen} setModalOpen={setModalOpen} user={user}/>
        </div>
    );
}

function changeAuthState() {
    if (auth.currentUser) auth.signOut().catch(console.error);
    else signInWithPopup(auth, provider).catch(console.error);
}

function Roles({roles}: { roles: IRoles }) {
    return (
        <ul className="menu__profile-roles">
            {roles.contentManager && <li title="Content Manager">CM</li>}
            {roles.guestManager && <li title="Event Guest Manager">GM</li>}
            {roles.accessManager && <li title="Access Manager">AM</li>}
        </ul>
    );
}
