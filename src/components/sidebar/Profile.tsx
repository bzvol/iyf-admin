import {auth, IRoles, provider, useAuth} from "../../firebase";
import React, {useState} from "react";
import {AccessRequestModal} from "./AccessRequestModal";
import {signInWithPopup} from "firebase/auth";
import "./styles/Profile.scss";
import UserPhoto from "../UserPhoto";
import Bugsnag from "@bugsnag/js";

export function Profile() {
    const {user, loading, loggedIn, accessRequested, admin, roles} = useAuth();

    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="menu__profile">
            {loggedIn && <div className="menu__profile-data">
                <UserPhoto user={user} className="menu__profile-photo"/>
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
    if (auth.currentUser) auth.signOut().catch(err => {if (err instanceof Error) Bugsnag.notify(err)});
    else signInWithPopup(auth, provider).catch(err => {if (err instanceof Error) Bugsnag.notify(err)});
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
