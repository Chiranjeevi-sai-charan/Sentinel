/* ============================================================
   Sentinel — Data context
   Owns the transaction queue, review actions, activity feed,
   and derived summary metrics. Reads from the mock API so the
   loading states are real.
   ============================================================ */

import {
  createContext, useContext, useEffect, useMemo, useReducer, useCallback, useState,
} from "react";
import { fetchTransactions, fetchActivity, submitAction } from "../lib/mockApi";
import { relativeTime } from "../lib/format";

const DataContext = createContext(null);

const ACTION_VERB = {
  approved: "approved",
  held: "placed on hold",
  denied: "denied",
  escalated: "escalated",
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADED":
      return { ...state, loading: false, transactions: action.transactions, activity: action.activity };
    case "APPLY": {
      const { id, status, actor, note, reply } = action;
      const transactions = state.transactions.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, status };
        if (status === "escalated") {
          next.escalatedBy = actor;
          next.escalationNote = note || t.escalationNote;
        } else {
          next.reviewedBy = actor;
        }
        if (reply !== undefined) next.seniorReply = reply;
        return next;
      });
      return { ...state, transactions };
    }
    case "REPLY": {
      const transactions = state.transactions.map((t) =>
        t.id === action.id ? { ...t, seniorReply: action.reply } : t
      );
      return { ...state, transactions };
    }
    case "PREPEND_ACTIVITY":
      return { ...state, activity: [action.entry, ...state.activity].slice(0, 12) };
    case "EXTERNAL_CONFLICT": {
      const transactions = state.transactions.map((t) =>
        t.id === action.id ? { ...t, status: action.status, reviewedBy: action.actor } : t
      );
      return { ...state, transactions };
    }
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    transactions: [],
    activity: [],
  });

  useEffect(() => {
    let alive = true;
    Promise.all([fetchTransactions(), fetchActivity()]).then(([transactions, activity]) => {
      if (alive) dispatch({ type: "LOADED", transactions, activity });
    });
    return () => { alive = false; };
  }, []);

  /* Apply a review decision (async, with activity feed update). */
  const act = useCallback(async ({ id, status, actor, note }) => {
    await submitAction({ transactionId: id, action: status, actor, note });
    dispatch({ type: "APPLY", id, status, actor, note });
    const txn = state.transactions.find((t) => t.id === id);
    dispatch({
      type: "PREPEND_ACTIVITY",
      entry: {
        id: `AV-${Date.now()}`,
        actor,
        type: status,
        text: `${ACTION_VERB[status]} ${txn ? `a ${txn.channel.toLowerCase()} case` : "a case"}`,
        meta: id,
        timestamp: new Date().toISOString(),
      },
    });
  }, [state.transactions]);

  const bulkAct = useCallback(async ({ ids, status, actor }) => {
    await Promise.all(ids.map((id) => submitAction({ transactionId: id, action: status, actor })));
    ids.forEach((id) => dispatch({ type: "APPLY", id, status, actor }));
    dispatch({
      type: "PREPEND_ACTIVITY",
      entry: {
        id: `AV-${Date.now()}`,
        actor,
        type: status,
        text: `${ACTION_VERB[status]} ${ids.length} transactions (bulk)`,
        meta: `${ids.length} cases`,
        timestamp: new Date().toISOString(),
      },
    });
  }, []);

  const addReply = useCallback((id, reply) => {
    dispatch({ type: "REPLY", id, reply });
  }, []);

  /* Simulate a teammate actioning a transaction you're viewing. */
  const simulateConflict = useCallback((id, actor = "Marcus Reed") => {
    dispatch({ type: "EXTERNAL_CONFLICT", id, status: "approved", actor });
    return { actor, status: "approved" };
  }, []);

  const value = useMemo(
    () => ({
      loading: state.loading,
      transactions: state.transactions,
      activity: state.activity.map((a) => ({ ...a, when: relativeTime(a.timestamp) })),
      act,
      bulkAct,
      addReply,
      simulateConflict,
    }),
    [state.loading, state.transactions, state.activity, act, bulkAct, addReply, simulateConflict]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

/* ---- Derived summary metrics (pure, memoizable) ------------ */
export function computeMetrics(transactions) {
  const today = transactions;
  const total = today.length;
  const high = today.filter((t) => t.scored.band === "high").length;
  const pendingEscalations = today.filter((t) => t.status === "escalated").length;
  const actioned = today.filter((t) => ["approved", "held", "denied"].includes(t.status));
  const approved = today.filter((t) => t.status === "approved").length;
  const approvalRate = actioned.length ? approved / actioned.length : 0;
  const avgReviewMin = 4.2; // mock aggregate
  return { total, high, pendingEscalations, approvalRate, avgReviewMin, actioned: actioned.length };
}

export function useMetrics() {
  const { transactions } = useData();
  return useMemo(() => computeMetrics(transactions), [transactions]);
}
