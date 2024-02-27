import React, {useState} from "react";
import {User} from "firebase/auth";
import Modal from "../Modal";
import axios from "axios";
import apiUrls from "../../api";
import "./styles/AccessRequestModal.scss";

interface AccessRequestModalOptions {
    btnText: string,
    btnDisabled: boolean,
    btnBackgroundColor: string,
    resultText: string,
    resultTextHidden: boolean,
    errorMessage: string | undefined,
}

export function AccessRequestModal({modalOpen, setModalOpen, user}: {
    modalOpen: boolean,
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    user: User | null,
}) {

    const defaultModalOptions: AccessRequestModalOptions = {
        btnText: "Send request",
        btnDisabled: false,
        btnBackgroundColor: "",
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

function handleSubmit(setModalOptions: React.Dispatch<React.SetStateAction<AccessRequestModalOptions>>, user: User | null) {
    setModalOptions(prev => ({...prev, btnText: "Sending...", btnDisabled: true}));

    axios.post(apiUrls.users.requestAccess(user!.uid))
        .then(res => {
            setModalOptions(prev => ({
                ...prev,
                btnText: "Sent!",
                btnBackgroundColor: "#4caf50",
                resultText: "Your request has been sent successfully. " +
                    "You will be notified via email when your request gets reviewed. " +
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
