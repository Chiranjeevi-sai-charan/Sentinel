/* Sentinel — Badge / pill.
   Two flavors: risk badges (score + band color) and status pills
   (uppercase, tinted — the Candescent "GROWING / NEEDS REVIEW"
   motif). */

import clsx from "clsx";
import styles from "./Badge.module.css";

/* Risk badge: colored dot + numeric score, band-tinted. */
export function RiskBadge({ score, band, showLabel = false, size = "md" }) {
  const labels = { low: "Low", med: "Medium", high: "High" };
  return (
    <span className={clsx(styles.risk, styles[band], styles[size])} title={`Risk ${score}/100 · ${labels[band]}`}>
      <span className={styles.score}>{score}</span>
      {showLabel && <span className={styles.riskLabel}>{labels[band]}</span>}
    </span>
  );
}

/* Status pill: uppercase tinted pill for statuses/tags. */
const STATUS_TONE = {
  pending: "neutral",
  escalated: "info",
  approved: "low",
  held: "med",
  denied: "high",
  reviewed: "low",
};

export function StatusPill({ status, children, tone }) {
  const resolved = tone || STATUS_TONE[status] || "neutral";
  return <span className={clsx(styles.pill, styles[`tone-${resolved}`])}>{children || status}</span>;
}

export function Pill({ tone = "neutral", children }) {
  return <span className={clsx(styles.pill, styles[`tone-${tone}`])}>{children}</span>;
}
