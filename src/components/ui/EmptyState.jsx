/* Sentinel — Empty state. */

import { Inbox } from "lucide-react";
import styles from "./EmptyState.module.css";

export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className={styles.empty}>
      <span className={styles.iconWrap}>
        <Icon size={26} />
      </span>
      <div className={styles.title}>{title}</div>
      {message && <div className={styles.message}>{message}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
