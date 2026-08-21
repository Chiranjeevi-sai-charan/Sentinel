/* Reviewer performance over time — stacked approve/hold/escalate
   ratio per reviewer (Senior only). */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { C, tooltipStyle, tooltipItemStyle, tooltipLabelStyle, axisProps } from "./chartTheme";

const DATA = [
  { name: "S. Whitman", approve: 24, hold: 10, escalate: 8 },
  { name: "M. Reed", approve: 20, hold: 12, escalate: 6 },
  { name: "J. Alvarez", approve: 0, hold: 0, escalate: 29 },
  { name: "M. Lin", approve: 0, hold: 0, escalate: 22 },
];

export default function ReviewerPerfBar() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DATA} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "rgba(37,99,235,0.06)" }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="approve" name="Approved" stackId="a" fill={C.low} radius={[0, 0, 0, 0]} barSize={30} />
          <Bar dataKey="hold" name="Held" stackId="a" fill={C.med} barSize={30} />
          <Bar dataKey="escalate" name="Escalated" stackId="a" fill={C.blue} radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
      <button style={{
        border: "none",
        background: "none",
        color: "#1D4ED8",
        fontSize: "14px",
        fontWeight: 600,
        padding: "8px 0",
        textAlign: "center",
        cursor: "pointer",
        marginTop: "8px"
      }} onClick={() => alert("Full reviewer performance view")}>
        View all reviewers
      </button>
    </div>
  );
}
