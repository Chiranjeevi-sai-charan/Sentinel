/* Risk distribution donut — High / Medium / Low breakdown. */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { RISK_COLORS, tooltipStyle, tooltipItemStyle, tooltipLabelStyle } from "./chartTheme";

export default function RiskDonut({ transactions }) {
  const counts = { low: 0, med: 0, high: 0 };
  transactions.forEach((t) => { counts[t.scored.band]++; });
  const data = [
    { name: "High", key: "high", value: counts.high },
    { name: "Medium", key: "med", value: counts.med },
    { name: "Low", key: "low", value: counts.low },
  ];
  const total = transactions.length || 1;

  return (
    <div style={{ position: "relative", height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={90}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={RISK_COLORS[d.key]} stroke="none" />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: "absolute", top: "42%", left: 0, right: 0,
        textAlign: "center", transform: "translateY(-50%)", pointerEvents: "none",
      }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#0B2545", lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 11, color: "#5B6B84" }}>flagged</div>
      </div>
    </div>
  );
}
