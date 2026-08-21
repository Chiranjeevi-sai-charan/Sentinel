/* Sentinel — AI/model insights (Senior + Compliance panel).
   Mock model-performance metrics and trending fraud patterns. */

export const MODEL_METRICS = {
  precision: 0.91,
  recall: 0.87,
  falsePositiveRate: 0.06,
  accuracy: 0.94,
  lastTrained: "2 days ago",
  version: "v3.4.1",
  status: "healthy", // healthy | degraded | unavailable
};

export const TRENDING_PATTERNS = [
  { id: "TP-1", label: "Wire fraud up 15% this week", direction: "up", detail: "First-time recipients driving the spike.", severity: "high" },
  { id: "TP-2", label: "New ATO variant detected", direction: "up", detail: "Overnight logins from mismatched geographies.", severity: "high" },
  { id: "TP-3", label: "Structuring attempts steady", direction: "flat", detail: "Consistent cluster just under the $10K threshold.", severity: "med" },
  { id: "TP-4", label: "Card fraud down 8%", direction: "down", detail: "Geo-spread rule tuning reduced false positives.", severity: "low" },
];

/* AI confidence vs. actual-fraud calibration points for the
   scatter chart (x = model confidence %, y = confirmed-fraud %). */
export const CONFIDENCE_CALIBRATION = [
  { confidence: 15, actual: 8, cases: 22 },
  { confidence: 28, actual: 24, cases: 18 },
  { confidence: 41, actual: 38, cases: 15 },
  { confidence: 55, actual: 52, cases: 12 },
  { confidence: 63, actual: 66, cases: 14 },
  { confidence: 72, actual: 70, cases: 11 },
  { confidence: 81, actual: 85, cases: 9 },
  { confidence: 88, actual: 90, cases: 7 },
  { confidence: 94, actual: 96, cases: 6 },
];
