/* Sentinel — Card with the signature Candescent top-accent bar.
   `accent` colors the top edge: blue (default), red (high-risk),
   ai (yellow gradient), green, none. */

import clsx from "clsx";
import styles from "./Card.module.css";

export default function Card({ accent = "blue", className, children, as: Tag = "div", ...props }) {
  return (
    <Tag className={clsx(styles.card, styles[`accent-${accent}`], className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, meta, action, icon: Icon }) {
  return (
    <div className={styles.header}>
      <div className={styles.headTitle}>
        {Icon && <Icon size={16} className={styles.headIcon} />}
        <h3>{title}</h3>
      </div>
      {meta && <span className={styles.meta}>{meta}</span>}
      {action}
    </div>
  );
}
