/* Sentinel — Button.
   Variants: primary (solid navy), secondary (outline), ghost,
   danger, and ai (yellow-gradient, the Candescent AI motif). */

import clsx from "clsx";
import styles from "./Button.module.css";

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  children,
  className,
  ...props
}) {
  return (
    <button
      className={clsx(styles.btn, styles[variant], styles[size], className)}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}
