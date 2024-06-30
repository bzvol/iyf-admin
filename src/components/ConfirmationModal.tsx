import './styles/ConfirmationModal.scss';
import Modal from "./Modal";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
    return (
        <Modal isOpen={props.isOpen} onClose={props.onClose}>
            <div className="ConfirmationModal">
                <h2>{props.title}</h2>
                <div>{props.children}</div>

                <div className="ConfirmationModal__buttons">
                    <button className="ConfirmationModal__btn-cancel" onClick={props.onClose}>Cancel</button>
                    <button onClick={props.onConfirm}>Confirm</button>
                </div>
            </div>
        </Modal>
    );
}
