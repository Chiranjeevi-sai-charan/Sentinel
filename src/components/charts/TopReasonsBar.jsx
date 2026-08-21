/* Top risk reasons — horizontal bar of which fraud types are
   firing most across flagged transactions. */

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { C, tooltipStyle, tooltipItemStyle, tooltipLabelStyle, axisProps } from "./chartTheme";
import { FRAUD_TYPES } from "../../lib/scoring";

export default function TopReasonsBar({ transactions }) {
  const tally = {};
  transactions.forEach((t) => {
    const ft = t.scored.topFraudType;
    if (!ft) return;
    tally[ft] = (tally[ft] || 0) + 1;
  });
  const data = Object.entries(tally)
    .map(([ft, count]) => ({ name: FRAUD_TYPES[ft], count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <XAxis type="number" {...axisProps} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={130} tick={{ fill: C.muted, fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "rgba(37,99,235,0.06)" }} />
        <Bar dataKey="count" name="Cases" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? C.blueStrong : C.blue} fillOpacity={1 - i * 0.09} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
