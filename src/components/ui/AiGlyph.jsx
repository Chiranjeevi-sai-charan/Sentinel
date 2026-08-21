/* Sentinel — AI sparkle glyph (the gold gradient badge that marks
   AI/ML surfaces throughout the product). */

import { Sparkles } from "lucide-react";
import clsx from "clsx";
import styles from "./AiGlyph.module.css";

export default function AiGlyph({ size = 28, className }) {
  return (
    <span className={clsx(styles.glyph, className)} style={{ width: size, height: size }}>
      <Sparkles size={size * 0.55} strokeWidth={2.2} />
    </span>
  );
}
