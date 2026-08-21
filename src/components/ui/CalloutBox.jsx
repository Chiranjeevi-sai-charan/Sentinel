/* Sentinel — Callout box (left-accent bordered message).
   `variant="ai"` renders the yellow-gradient AI insight treatment
   with the sparkle glyph — the key Candescent motif. */

import clsx from "clsx";
import { Info, AlertTriangle } from "lucide-react";
import AiGlyph from "./AiGlyph";
import styles from "./CalloutBox.module.css";

export default function CalloutBox({ variant = "info", title, children, icon }) {
  const Icon = icon || (variant === "warning" ? AlertTriangle : Info);
  return (
    <div className={clsx(styles.box, styles[variant])}>
      {variant === "ai" ? (
        <AiGlyph size={26} className={styles.glyph} />
      ) : (
        <Icon size={18} className={styles.icon} />
      )}
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
    </div>
  );
}
