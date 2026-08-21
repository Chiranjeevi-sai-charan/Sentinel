/* Sentinel — Stale-data / service-status banner.
   Shown across the top of content when the scoring service is
   down (stale data) or the AI model is unavailable (rules-only). */

import { AlertTriangle, WifiOff } from "lucide-react";
import styles from "./StaleDataBanner.module.css";

export default function StaleDataBanner({ variant = "stale", onDismiss }) {
  const config = {
    stale: {
      icon: WifiOff,
      text: "Risk-scoring service is unreachable. Showing the last known scores. Metrics may be out of date.",
    },
    aiDown: {
      icon: AlertTriangle,
      text: "AI model unavailable. Sentinel has fallen back to rules-only scoring; smart-escalation and pattern matching are paused.",
    },
  }[variant];
  const Icon = config.icon;
  return (
    <div className={`${styles.banner} ${styles[variant]}`} role="alert">
      <Icon size={17} />
      <span className={styles.text}>{config.text}</span>
      {onDismiss && (
        <button className={styles.dismiss} onClick={onDismiss}>Dismiss</button>
      )}
    </div>
  );
}
