/* AI confidence vs. actual fraud — calibration scatter. Points on
   the diagonal mean the model's confidence matches reality. */

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis,
} from "recharts";
import { C, tooltipStyle, tooltipItemStyle, tooltipLabelStyle, axisProps } from "./chartTheme";
import { CONFIDENCE_CALIBRATION } from "../../data/aiInsights";

export default function AiConfidenceScatter({ data = CONFIDENCE_CALIBRATION }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ScatterChart margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
        <CartesianGrid strokeDasharray="4 4" stroke={C.grid} />
        <XAxis type="number" dataKey="confidence" name="Model confidence" unit="%" domain={[0, 100]} {...axisProps} />
        <YAxis type="number" dataKey="actual" name="Confirmed fraud" unit="%" domain={[0, 100]} {...axisProps} />
        <ZAxis type="number" dataKey="cases" range={[60, 340]} name="Cases" />
        <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke={C.axis} strokeDasharray="6 5" />
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} fill={C.gold} fillOpacity={0.85} stroke={C.med} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
