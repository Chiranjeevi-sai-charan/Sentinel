/* Sentinel — Skeleton shimmer placeholder. */

import styles from "./Skeleton.module.css";

export default function Skeleton({ width = "100%", height = 16, radius = 8, style }) {
  return (
    <span
      className={styles.sk}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className={styles.stack}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "60%" : "100%"} height={12} />
      ))}
    </div>
  );
}
