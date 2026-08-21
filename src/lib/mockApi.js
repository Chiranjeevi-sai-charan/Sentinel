/* ============================================================
   Sentinel — Mock API layer
   ------------------------------------------------------------
   Wraps the static mock data in async calls with artificial
   latency so loading/skeleton states are real, and exposes
   togglable failure flags so the edge-case states (scoring
   service down, AI model unavailable) can be demoed live.
   ============================================================ */

import { TRANSACTIONS } from "../data/transactions";
import { ACCOUNTS } from "../data/accounts";
import { ACTIVITY } from "../data/activity";
import { AUDIT_LOG } from "../data/auditLog";
import { MODEL_METRICS, TRENDING_PATTERNS, CONFIDENCE_CALIBRATION } from "../data/aiInsights";

/* Simulated service health — flipped by the demo controls. */
export const serviceHealth = {
  scoringDown: false, // stale-data banner + dimmed metrics
  aiModelDown: false, // fall back to rules-only scoring
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const jitter = (base = 500) => base + Math.random() * 400;

export async function fetchTransactions() {
  await delay(jitter(600));
  return TRANSACTIONS.map((t) => ({ ...t }));
}

export async function fetchAccounts() {
  await delay(jitter(300));
  return ACCOUNTS;
}

export async function fetchActivity() {
  await delay(jitter(400));
  return ACTIVITY;
}

export async function fetchAuditLog() {
  await delay(jitter(500));
  return AUDIT_LOG;
}

export async function fetchAiInsights() {
  await delay(jitter(500));
  return {
    metrics: {
      ...MODEL_METRICS,
      status: serviceHealth.aiModelDown ? "unavailable" : MODEL_METRICS.status,
    },
    patterns: TRENDING_PATTERNS,
    calibration: CONFIDENCE_CALIBRATION,
  };
}

/* Action call — resolves after latency; the reducer applies the
   optimistic state. Returns the recorded action for the log. */
export async function submitAction({ transactionId, action, actor, note }) {
  await delay(jitter(350));
  return {
    transactionId,
    action,
    actor,
    note: note || null,
    timestamp: new Date().toISOString(),
  };
}
