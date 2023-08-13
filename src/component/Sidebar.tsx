import React, {useState} from "react";
import {auth, provider, useAuth} from "../firebase";
import {signInWithPopup, User} from "firebase/auth";
import "../styles/Sidebar.css";
import unknownProfilePic from "../assets/unknownProfilePic.png"
import {Close, Menu} from "@mui/icons-material";
import {useMediaQuery} from "@mui/material";
import Modal from "./Modal";
import axios from "axios";
import {Link} from "react-router-dom";

export default function Sidebar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const {loggedIn} = useAuth();

    const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

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

                <nav className="menu__nav"><ul>
                    {/*<li><Link to="analytics">Analytics</Link></li>*/}
                    <li><Link to="iam">IAM</Link></li>
                    {/*<li><Link to="main-page-content">Main page</Link></li>*/}
                    {/*<li><Link to="file-content">Books & other files</Link></li>*/}
                </ul></nav>
            </aside>

            <button className={`menu__btn-open ${menuOpen && "menu__btn-hidden"}`} onClick={() => setMenuOpen(true)}>
                <Menu fontSize="inherit" htmlColor={isDarkMode ? "white" : "black"}/>
            </button>
        </>
    );
}

function Profile() {
    const {user, loading, loggedIn, role} = useAuth();

    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="menu__profile">
            {loggedIn && <div className="menu__profile-data">
                <img src={user?.photoURL ?? unknownProfilePic} alt="Profile"
                     className="menu__profile-photo"/>
                <div>
                    <h2 className="menu__profile-name">{user?.displayName}</h2>
                    {loading ? <p>Loading...</p> : <p>Role: {role}</p>}
                </div>
            </div>}

            {loggedIn && !loading && role === "guest"
                && <button onClick={() => setModalOpen(true)}
                           className="menu__btn-request">Request access</button>}

            <button onClick={() => changeAuthState()}
                    className="menu__btn-sign-in-out">Sign {loggedIn ? "out" : "in"}</button>

            <AccessRequestModal modalOpen={modalOpen} setModalOpen={setModalOpen} user={user}/>
        </div>
    )
}

function AccessRequestModal({modalOpen, setModalOpen, user}: {
    modalOpen: boolean,
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    user: User | null,
}) {

    const defaultModalOptions: AccessRequestModalOptions = {
        btnText: "Send request",
        btnDisabled: false,
        btnBackgroundColor: "var(--btn-primary)",
        resultText: "",
        resultTextHidden: true,
        errorMessage: "",
    }
    const [modalOptions, setModalOptions] = useState(defaultModalOptions);

    const handleClose = () => {
        setModalOpen(false);
        setModalOptions(defaultModalOptions);
    }

    return (
        <Modal isOpen={modalOpen} onClose={handleClose}>
            <div className="rqa-modal-content">
                <h2>Request access</h2>
                <p>We will manually review your request and get back to you as soon as possible.</p>

                <button
                    onClick={() => handleSubmit(setModalOptions, user)}
                    className="modal__btn-submit"
                    disabled={modalOptions.btnDisabled}
                    style={{
                        backgroundColor: modalOptions.btnBackgroundColor,
                    }}>
                    {modalOptions.btnText}
                </button>

                {!modalOptions.resultTextHidden && <p className="modal__successful-text">
                    {modalOptions.resultText}
                    {modalOptions.errorMessage && <><br/><code>{modalOptions.errorMessage}</code></>}
                </p>}
            </div>
        </Modal>
    )
}

interface AccessRequestModalOptions {
    btnText: string,
    btnDisabled: boolean,
    btnBackgroundColor: string,
    resultText: string,
    resultTextHidden: boolean,
    errorMessage: string | undefined,
}

function handleSubmit(setModalOptions: React.Dispatch<React.SetStateAction<AccessRequestModalOptions>>, user: User | null) {
    setModalOptions(prev => ({...prev, btnText: "Sending...", btnDisabled: true}));

    axios.post("https://johirmisszio-api-yef42vd2mq-ez.a.run.app/api/v1/request-access", {uid: user?.uid})
        .then(res => {
            setModalOptions(prev => ({
                ...prev,
                btnText: "Sent!",
                btnBackgroundColor: "#4caf50",
                resultText: "Your request has been sent successfully. " +
                    "You will be notified via email when your request has been reviewed. " +
                    "You can now close this window.",
                resultTextHidden: false,
            }));
        }).catch(err => {
        const data = err.response?.data;
        const errorMessage = data?.message ?? data?.error;

        setModalOptions(prev => ({
            ...prev,
            btnText: "Error",
            btnBackgroundColor: "#f44336",
            resultText: "An error occurred while sending your request.",
            resultTextHidden: false,
            errorMessage: errorMessage,
        }));

        console.error("Error while sending access request: ", err.response ?? err);
    });
}

function changeAuthState() {
    if (auth.currentUser) auth.signOut().catch(console.error);
    else signInWithPopup(auth, provider).catch(console.error);
}