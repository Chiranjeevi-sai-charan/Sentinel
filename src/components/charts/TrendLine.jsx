/* Flagged-transactions trend over the last 7 days. Mirrors the
   Candescent line-chart style (soft grid, dashed projection). */

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { C, tooltipStyle, tooltipItemStyle, tooltipLabelStyle, axisProps } from "./chartTheme";
import { DEMO_NOW } from "../../data/transactions";

const DAY = 86400000;

export default function TrendLine({ transactions }) {
  // Bucket the last 7 days by count of flagged transactions.
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const start = DEMO_NOW - i * DAY;
    const label = new Date(start).toLocaleDateString("en-US", { weekday: "short" });
    days.push({ label, start, flagged: 0, high: 0 });
  }
  transactions.forEach((t) => {
    const ts = new Date(t.timestamp).getTime();
    const idx = 6 - Math.floor((DEMO_NOW - ts) / DAY);
    if (idx >= 0 && idx < 7) {
      days[idx].flagged++;
      if (t.scored.band === "high") days[idx].high++;
    }
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={days} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
        <Line type="monotone" dataKey="flagged" name="Flagged" stroke={C.blue} strokeWidth={2.5} dot={{ r: 3, fill: C.blue }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="high" name="High-risk" stroke={C.high} strokeWidth={2} strokeDasharray="5 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
