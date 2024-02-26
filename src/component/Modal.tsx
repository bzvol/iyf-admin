import './styles/Modal.scss';
import React, {ReactNode} from "react";

export default function Modal({children, isOpen, onClose, dismissible = true}: ModalProps) {
    const handleBackgroundClick: React.MouseEventHandler<HTMLDivElement> = event => {
        if (event.target === event.currentTarget && dismissible) onClose?.();
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
    dismissible?: boolean;
}
