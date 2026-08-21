/* Sentinel — audit trail (Compliance view).
   Immutable record of who did what, when, and why. Seeded from
   already-actioned transactions plus a few standalone entries. */

import { TRANSACTIONS, DEMO_NOW } from "./transactions";

const MIN = 60000;
const at = (minsAgo) => new Date(DEMO_NOW - minsAgo * MIN).toISOString();

const ACTION_LABEL = {
  approved: "Approved",
  held: "Held",
  denied: "Denied",
  escalated: "Escalated",
};

const RATIONALE = {
  approved: "Within member's normal pattern; recipient verified.",
  held: "Amount and recipient inconsistent with account history; awaiting member callback.",
  denied: "Confirmed fraud indicators; recipient on internal watchlist.",
  escalated: "Exceeds junior authority; routed to senior for decision.",
};

/* Build audit entries from transactions that have been actioned. */
const fromTransactions = TRANSACTIONS.filter((t) =>
  ["approved", "held", "denied", "escalated"].includes(t.status)
).map((t, i) => ({
  id: `AL-${100 + i}`,
  timestamp: at(5 + i * 7),
  actor: t.reviewedBy || t.escalatedBy || "System",
  action: t.status,
  actionLabel: ACTION_LABEL[t.status],
  transactionId: t.id,
  account: t.accountName,
  amount: t.amount,
  riskScore: t.scored.score,
  rationale: RATIONALE[t.status],
}));

/* A couple of hand-authored system/compliance entries. */
const extra = [
  {
    id: "AL-200",
    timestamp: at(4),
    actor: "System",
    action: "flagged",
    actionLabel: "Flagged",
    transactionId: "TX-4231",
    account: "The Fold Coffee LLC",
    amount: 18400,
    riskScore: 82,
    rationale: "Rule engine: large withdrawal + first-time recipient.",
  },
  {
    id: "AL-201",
    timestamp: at(240),
    actor: "Dana Cole",
    action: "exported",
    actionLabel: "Exported",
    transactionId: "–",
    account: "–",
    amount: null,
    riskScore: null,
    rationale: "Weekly SAR review; exported audit trail to CSV.",
  },
];

export const AUDIT_LOG = [...extra, ...fromTransactions].sort(
  (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
);

export const AUDIT_ACTIONS = ["flagged", "escalated", "approved", "held", "denied", "exported"];
