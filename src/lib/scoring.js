/* ============================================================
   Sentinel — Mock AI Risk-Scoring Engine
   ------------------------------------------------------------
   NOTE: No real ML/AI is called. This is a deterministic,
   fully explainable mock that mirrors how an AI-powered risk
   engine would behave, so the UI can showcase the workflow.

   The engine is intentionally transparent: every point in a
   transaction's score traces back to a named rule, which is
   what powers the "Risk signal breakdown" UI.
   ============================================================ */

/* Fraud-type taxonomy (matches the product brief) */
export const FRAUD_TYPES = {
  ATO: "Account takeover",
  NEW_ACCOUNT: "New account fraud",
  WIRE: "Wire / payment fraud",
  LOAN: "Loan fraud",
  CHECK: "Check fraud",
  CARD: "Card fraud",
  LAUNDERING: "Money laundering / structuring",
};

/* Risk bands ------------------------------------------------ */
export const BANDS = {
  low: { id: "low", label: "Low", min: 1, max: 30 },
  med: { id: "med", label: "Medium", min: 31, max: 70 },
  high: { id: "high", label: "High", min: 71, max: 100 },
};

export function bandForScore(score) {
  if (score >= BANDS.high.min) return BANDS.high;
  if (score >= BANDS.med.min) return BANDS.med;
  return BANDS.low;
}

/* ------------------------------------------------------------
   Rule catalog
   Each rule contributes `points` when `test(txn, account)` is
   true. Points are additive; the sum is clamped to 1..100.
   ------------------------------------------------------------ */
export const RULES = [
  {
    id: "new_account",
    label: "New account (opened < 14 days ago)",
    fraudType: "NEW_ACCOUNT",
    points: 25,
    test: (t, a) => a.accountAgeDays < 14,
  },
  {
    id: "large_withdrawal",
    label: "Large withdrawal",
    fraudType: "ATO",
    points: 30,
    test: (t) => t.direction === "out" && t.amount >= 10000,
  },
  {
    id: "unusual_time",
    label: "Unusual time (overnight 12am–5am)",
    fraudType: "ATO",
    points: 23,
    test: (t) => t.hour >= 0 && t.hour <= 5,
  },
  {
    id: "impossible_travel",
    label: "Impossible travel (location mismatch)",
    fraudType: "ATO",
    points: 28,
    test: (t, a) => t.geo && a.homeGeo && t.geo !== a.homeGeo,
  },
  {
    id: "structuring",
    label: "Amount just under $10k reporting threshold",
    fraudType: "LAUNDERING",
    points: 22,
    test: (t) => t.amount >= 9000 && t.amount < 10000,
  },
  {
    id: "velocity",
    label: "Rapid transfer velocity (5+ in 24h)",
    fraudType: "LAUNDERING",
    points: 20,
    test: (t) => t.velocity24h >= 5,
  },
  {
    id: "new_recipient",
    label: "First-time recipient",
    fraudType: "WIRE",
    points: 15,
    test: (t) => t.recipientIsNew === true,
  },
  {
    id: "round_amount",
    label: "Suspicious round-number amount",
    fraudType: "LAUNDERING",
    points: 10,
    test: (t) => t.amount >= 1000 && t.amount % 1000 === 0,
  },
  {
    id: "check_kiting",
    label: "Large check deposit + immediate withdrawal",
    fraudType: "CHECK",
    points: 26,
    test: (t) => t.channel === "Check" && t.rapidWithdrawal === true,
  },
  {
    id: "loan_id_mismatch",
    label: "Loan application with identity mismatch",
    fraudType: "LOAN",
    points: 27,
    test: (t) => t.channel === "Loan" && t.idMismatch === true,
  },
  {
    id: "card_geo_spread",
    label: "Card used across distant geographies",
    fraudType: "CARD",
    points: 24,
    test: (t) => t.channel === "Card" && t.geoSpread === true,
  },
];

/* ------------------------------------------------------------
   scoreTransaction(txn, account)
   Returns the full explainable result object.
   ------------------------------------------------------------ */
export function scoreTransaction(txn, account) {
  const signals = [];
  for (const rule of RULES) {
    let fired = false;
    try {
      fired = rule.test(txn, account);
    } catch {
      fired = false;
    }
    if (fired) {
      signals.push({
        id: rule.id,
        label: rule.label,
        fraudType: rule.fraudType,
        points: rule.points,
      });
    }
  }

  const rawTotal = signals.reduce((sum, s) => sum + s.points, 0);
  const score = Math.max(1, Math.min(100, rawTotal || 5));
  const band = bandForScore(score);

  // The dominant signal (highest points) defines the "top reason".
  // When the transaction's own fraud scenario is among the fired
  // signals, prefer it as the headline — a high-value withdrawal on
  // a loan reads as "loan fraud", not the generic ATO large-amount
  // rule that also happens to fire.
  const sorted = [...signals].sort((a, b) => b.points - a.points);
  const scenarioSignal = txn.intendedFraudType
    ? sorted.find((s) => s.fraudType === txn.intendedFraudType)
    : null;
  const topSignal = scenarioSignal || sorted[0] || null;

  return {
    score,
    band: band.id,
    signals: sorted,
    topReason: topSignal ? topSignal.label : "No rules triggered",
    topFraudType: topSignal ? topSignal.fraudType : null,
    anomaly: detectAnomaly(txn, account),
    confidence: modelConfidence(score, signals.length),
  };
}

/* ------------------------------------------------------------
   Anomaly detection — compares this transaction against the
   account's typical spend. Produces the conversational string
   the UI shows ("typically sends $500, now sending $50K").
   ------------------------------------------------------------ */
export function detectAnomaly(txn, account) {
  if (!account || !account.avgAmount) return null;
  const ratio = txn.amount / account.avgAmount;
  if (ratio < 8) return null;
  return {
    ratio: Math.round(ratio),
    message: `This account typically moves ${formatShort(
      account.avgAmount
    )}, now ${formatShort(txn.amount)}, ${Math.round(ratio)}× its norm.`,
  };
}

/* ------------------------------------------------------------
   Model confidence — a pseudo probability the case is fraud.
   Higher scores + more corroborating signals => more confident.
   Drives the AI-confidence scatter and escalation ranking.
   ------------------------------------------------------------ */
export function modelConfidence(score, signalCount) {
  const base = score / 100;
  const corroboration = Math.min(signalCount, 4) * 0.04;
  return Math.round(Math.min(0.99, base * 0.85 + corroboration) * 100) / 100;
}

/* ------------------------------------------------------------
   Smart escalation — AI suggests auto-escalating high-confidence
   high-risk cases to a Senior.
   ------------------------------------------------------------ */
export function shouldAutoEscalate(scored) {
  return scored.band === "high" && scored.confidence >= 0.8;
}

/* ------------------------------------------------------------
   Pattern matching — counts similar historical fraud (same
   fraud type + high band) to surface "3 similar cases last month".
   ------------------------------------------------------------ */
export function matchPatterns(scored, allTransactions) {
  if (!scored.topFraudType) return null;
  const similar = allTransactions.filter(
    (t) =>
      t.scored &&
      t.scored.topFraudType === scored.topFraudType &&
      t.scored.band === "high"
  );
  if (similar.length < 2) return null;
  return {
    count: similar.length,
    fraudType: scored.topFraudType,
    message: `${similar.length} similar ${FRAUD_TYPES[
      scored.topFraudType
    ].toLowerCase()} cases flagged recently, all high-risk.`,
  };
}

/* Small local formatter (kept here so scoring.js is standalone) */
function formatShort(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}
