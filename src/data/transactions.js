/* ============================================================
   Sentinel — Mock flagged transactions (55)
   ------------------------------------------------------------
   Raw transactions are generated from fraud-type "scenarios"
   with deterministic jitter (seeded RNG), then enriched through
   the scoring engine so every row carries an explainable score.
   Deterministic => stable across reloads (good for demos).
   ============================================================ */

import { ACCOUNTS, ACCOUNT_BY_ID } from "./accounts";
import { TEAM } from "./team";
import { scoreTransaction } from "../lib/scoring";

/* ---- Seeded RNG (mulberry32) ------------------------------ */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260820);
const rand = (min, max) => min + rng() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(rng() * arr.length)];

/* "Now" is pinned so timestamps stay relative to a fixed demo
   moment rather than drifting with the wall clock. */
export const DEMO_NOW = new Date("2026-08-20T15:30:00").getTime();
const DAY = 86400000;

const CHANNELS = ["Wire", "Card", "Loan", "Check", "ACH", "Deposit"];
const MERCHANTS = ["Retail", "Crypto exchange", "Money transfer", "Electronics", "Gift cards", "Peer transfer", "Auto", "Travel"];
const RECIPIENTS = ["Quickpay LLC", "M. Turner", "Sunrise Holdings", "K. Osei", "BrightWire Inc", "R. Delacroix", "Apex Traders", "L. Ferraro"];

/* Scenario templates keyed to a target fraud type. Each returns
   the raw fields a transaction needs for the rules to fire. */
const SCENARIOS = {
  ATO: () => ({
    channel: pick(["Wire", "ACH", "Card"]),
    direction: "out",
    amount: randInt(11000, 48000),
    hour: randInt(0, 5),
    geoMismatch: true,
    recipientIsNew: rng() > 0.4,
    velocity24h: randInt(1, 3),
  }),
  NEW_ACCOUNT: (acct) => ({
    channel: pick(["Wire", "ACH"]),
    direction: "out",
    amount: randInt(4000, 12000),
    hour: randInt(8, 20),
    recipientIsNew: true,
    velocity24h: randInt(2, 4),
    _forceNewAccount: true,
  }),
  WIRE: () => ({
    channel: "Wire",
    direction: "out",
    amount: randInt(6000, 25000),
    hour: randInt(9, 18),
    recipientIsNew: true,
    velocity24h: randInt(1, 2),
  }),
  LOAN: () => ({
    channel: "Loan",
    direction: "out",
    amount: randInt(15000, 60000),
    hour: randInt(9, 17),
    idMismatch: true,
    recipientIsNew: true,
    velocity24h: 1,
  }),
  CHECK: () => ({
    channel: "Check",
    direction: "out",
    amount: randInt(5000, 18000),
    hour: randInt(9, 18),
    rapidWithdrawal: true,
    velocity24h: randInt(1, 3),
  }),
  CARD: () => ({
    channel: "Card",
    direction: "out",
    amount: randInt(800, 6000),
    hour: randInt(0, 23),
    geoSpread: true,
    velocity24h: randInt(4, 8),
  }),
  LAUNDERING: () => ({
    channel: pick(["Wire", "ACH"]),
    direction: "out",
    amount: pick([9200, 9500, 9800, 9900, 9950]),
    hour: randInt(6, 22),
    recipientIsNew: rng() > 0.5,
    velocity24h: randInt(5, 9),
  }),
  NORMAL: (acct) => ({
    channel: pick(CHANNELS),
    direction: rng() > 0.3 ? "out" : "in",
    amount: randInt(80, 1200),
    hour: randInt(8, 21),
    recipientIsNew: rng() > 0.85,
    velocity24h: randInt(1, 3),
  }),
};

/* Distribution: enough of each fraud type to populate charts,
   plus a band of normal/low-risk noise. 55 total. */
const PLAN = [
  ...Array(6).fill("ATO"),
  ...Array(5).fill("NEW_ACCOUNT"),
  ...Array(7).fill("WIRE"),
  ...Array(4).fill("LOAN"),
  ...Array(4).fill("CHECK"),
  ...Array(6).fill("CARD"),
  ...Array(6).fill("LAUNDERING"),
  ...Array(17).fill("NORMAL"),
];

const STATUS_POOL = ["pending", "pending", "pending", "escalated", "approved", "held", "denied"];

function buildRaw() {
  const rows = [];
  PLAN.forEach((fraudType, i) => {
    // New-account scenarios must land on genuinely young accounts.
    let account;
    if (fraudType === "NEW_ACCOUNT") {
      account = pick(ACCOUNTS.filter((a) => a.accountAgeDays < 14));
    } else {
      account = pick(ACCOUNTS);
    }
    const s = SCENARIOS[fraudType](account);
    const daysAgo = rand(0, 7);
    const ts = DEMO_NOW - daysAgo * DAY;
    const geo = s.geoMismatch ? pick(["Lagos, NG", "Kyiv, UA", "Manila, PH", "Bucharest, RO"]) : account.homeGeo;

    rows.push({
      id: `TX-${4200 + i}`,
      accountId: account.id,
      accountName: account.name,
      accountType: account.type,
      amount: Math.round(s.amount),
      direction: s.direction,
      channel: s.channel,
      hour: s.hour,
      geo,
      recipient: s.direction === "out" ? pick(RECIPIENTS) : account.name,
      recipientIsNew: !!s.recipientIsNew,
      merchantCategory: pick(MERCHANTS),
      velocity24h: s.velocity24h || 1,
      rapidWithdrawal: !!s.rapidWithdrawal,
      idMismatch: !!s.idMismatch,
      geoSpread: !!s.geoSpread,
      intendedFraudType: fraudType === "NORMAL" ? null : fraudType,
      timestamp: new Date(ts).toISOString(),
      status: fraudType === "NORMAL" ? pick(["approved", "pending", "approved"]) : pick(STATUS_POOL),
      reviewedBy: null,
      escalatedBy: null,
      escalationNote: null,
      seniorReply: null,
    });
  });
  return rows;
}

/* Enrich each raw row with a full scoring result. */
function enrich(rows) {
  return rows.map((t) => {
    const account = ACCOUNT_BY_ID[t.accountId];
    const scored = scoreTransaction(t, account);

    // Attach escalation context to rows that are escalated.
    let escalatedBy = t.escalatedBy;
    let escalationNote = t.escalationNote;
    if (t.status === "escalated") {
      const jr = pick(TEAM.filter((m) => m.role === "junior"));
      escalatedBy = jr.name;
      escalationNote = pick([
        "Recipient is brand new and amount is way above this member's norm; want a second set of eyes before releasing.",
        "Overnight wire to a first-time payee. Doesn't match the account pattern. Flagging for you.",
        "Structuring signal fired (just under $10K) plus high velocity. Not comfortable clearing this alone.",
        "New account, large withdrawal within days of opening. Looks like classic new-account fraud.",
      ]);
    }

    // Attach reviewer to already-actioned rows.
    let reviewedBy = t.reviewedBy;
    if (["approved", "held", "denied"].includes(t.status)) {
      reviewedBy = pick(TEAM.filter((m) => m.role === "senior")).name;
    }

    return { ...t, scored, escalatedBy, escalationNote, reviewedBy };
  });
}

export const TRANSACTIONS = enrich(buildRaw());

/* Back-fill each account's recent history (last up to 10 of its
   own transactions, newest first) — powers the detail panel. */
(function backfillHistory() {
  for (const acct of ACCOUNTS) {
    acct.history = TRANSACTIONS.filter((t) => t.accountId === acct.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
      .map((t) => ({
        id: t.id,
        amount: t.amount,
        direction: t.direction,
        channel: t.channel,
        timestamp: t.timestamp,
        score: t.scored.score,
        band: t.scored.band,
      }));
  }
})();

export const CHANNEL_TYPES = CHANNELS;
