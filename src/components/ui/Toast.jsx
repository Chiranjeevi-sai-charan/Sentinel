/* Sentinel — Toast system (provider + host).
   Used for permission-denied errors, action confirmations, and
   conflict notices. */

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import styles from "./Toast.module.css";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = "info", title, message, duration = 4200 }) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, type, title, message }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className={styles.host} role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} className={`${styles.toast} ${styles[t.type]}`} role="status">
              <Icon size={18} className={styles.icon} />
              <div className={styles.body}>
                {t.title && <div className={styles.title}>{t.title}</div>}
                {t.message && <div className={styles.message}>{t.message}</div>}
              </div>
              <button className={styles.close} onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}
