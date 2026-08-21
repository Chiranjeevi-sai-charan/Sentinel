/* Sentinel — chart palette (JS mirror of the CSS tokens, since
   Recharts needs concrete color values). */

export const C = {
  blue: "#2563EB",
  blueStrong: "#1D4ED8",
  navy: "#12294A",
  low: "#10B981",
  med: "#F59E0B",
  high: "#EF4444",
  gold: "#F5C24B",
  grid: "#E5EAF2",
  axis: "#8A97AB",
  muted: "#5B6B84",
};

export const RISK_COLORS = { low: C.low, med: C.med, high: C.high };

/* Shared tooltip style for a light theme. */
export const tooltipStyle = {
  background: "#fff",
  border: "1px solid #E5EAF2",
  borderRadius: 12,
  boxShadow: "0 8px 28px rgba(18,41,74,0.12)",
  fontSize: 12,
  color: "#23324A",
  padding: "8px 12px",
};

/* Force tooltip row + label text to dark ink. Without this,
   Recharts colors each item with its series color — e.g. bright
   gold (#F5C24B) on white, which fails WCAG contrast. */
export const tooltipItemStyle = { color: "#23324A" };
export const tooltipLabelStyle = { color: "#0B2545", fontWeight: 600 };

export const axisProps = {
  tick: { fill: C.axis, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: C.grid },
};
