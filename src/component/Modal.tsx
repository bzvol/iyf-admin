import '../styles/Modal.css';
import React, {ReactNode} from "react";

export default function Modal({children, isOpen, onClose}: ModalProps) {
    const handleBackgroundClick: React.MouseEventHandler<HTMLDivElement> = event => {
        if (event.target === event.currentTarget) onClose?.();
    }

    return (
        <div className={`modal-wrapper ${isOpen && "modal-open"}`} onClick={handleBackgroundClick}>
            <div className="modal-content">
                {children}
            </div>
        </div>
    );
}

interface ModalProps {
    children: ReactNode;
    isOpen: boolean;
    onClose?: () => void;
}
