/* Sentinel — Modal / confirm dialog. */

import { X } from "lucide-react";
import Button from "./Button";
import styles from "./Modal.module.css";

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", tone = "primary" }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={tone} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className={styles.message}>{message}</p>
    </Modal>
  );
}
