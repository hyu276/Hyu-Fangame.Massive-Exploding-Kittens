import {ReactNode} from 'react';
import './Modal.css';

interface ModalProps {
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeDisabled?: boolean;
  footer?: ReactNode;
}

export function Modal({onClose, title, children, closeDisabled = false, footer}: ModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" className="modal-close-btn" onClick={onClose} disabled={closeDisabled} aria-label="Đóng">
          ✕
        </button>
        <h2 className="modal-title">{title}</h2>
        <div className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

