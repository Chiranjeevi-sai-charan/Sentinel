/* Sentinel — review queue table: filter, sort, select, and act.
   Row click opens the drill-down detail panel. */

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ArrowUpDown, Check, Pause, ArrowUp } from "lucide-react";
import { RiskBadge, StatusPill } from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import QueueFilters from "./QueueFilters";
import QueueToolbar from "./QueueToolbar";
import { useData } from "../../context/DataContext";
import { useSession } from "../../context/SessionContext";
import { usePanel } from "../../context/PanelContext";
import { useToast } from "../../components/ui/Toast";
import { denialMessage } from "../../lib/permissions";
import { FRAUD_TYPES } from "../../lib/scoring";
import { currency, timestamp } from "../../lib/format";
import styles from "./queue.module.css";

const COLUMNS = [
  { key: "score", label: "Risk", sortable: true, align: "left" },
  { key: "accountName", label: "Account holder", sortable: true },
  { key: "amount", label: "Amount", sortable: true, align: "right" },
  { key: "timestamp", label: "Time", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "reason", label: "Top reason", sortable: false },
  { key: "actions", label: "", sortable: false },
];

const RISK_ABBR = {
  ATO: "ATO", NEW_ACCOUNT: "New acct", WIRE: "Wire", LOAN: "Loan",
  CHECK: "Check", CARD: "Card", LAUNDERING: "Structuring",
};

export default function QueueView() {
  const { loading, transactions, act, bulkAct } = useData();
  const { can, user } = useSession();
  const { openId, openPanel } = usePanel();
  const toast = useToast();

  const [filters, setFilters] = useState({ risk: "all", type: "all", status: "all", fraud: "all", search: "" });
  const [sort, setSort] = useState({ key: "score", dir: "desc" });
  const [selected, setSelected] = useState(new Set());

  const rows = useMemo(() => {
    let list = transactions.filter((t) => {
      if (filters.risk !== "all" && t.scored.band !== filters.risk) return false;
      if (filters.type !== "all" && t.channel !== filters.type) return false;
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.fraud !== "all" && t.scored.topFraudType !== filters.fraud) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!t.accountName.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      let av, bv;
      switch (sort.key) {
        case "score": av = a.scored.score; bv = b.scored.score; break;
        case "amount": av = a.amount; bv = b.amount; break;
        case "timestamp": av = new Date(a.timestamp); bv = new Date(b.timestamp); break;
        default: av = a[sort.key]; bv = b[sort.key];
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }, [transactions, filters, sort]);

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  const toggleSelect = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  };

  const guardedRowAction = (cap, status, id) => (e) => {
    e.stopPropagation();
    if (!can(cap)) {
      toast({ type: "error", title: "Action not permitted", message: denialMessage(cap) });
      return;
    }
    act({ id, status, actor: user.name, note: null });
    toast({ type: "success", title: `Transaction ${status}`, message: `${id} · ${status} by you.` });
  };

  const handleBulk = async (status, ids) => {
    await bulkAct({ ids, status, actor: user.name });
    toast({ type: "success", title: "Bulk action applied", message: `${ids.length} transactions ${status}.` });
    setSelected(new Set());
  };

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    if (sort.key !== col.key) return <ArrowUpDown size={13} className={styles.sortIdle} />;
    return sort.dir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  };

  return (
    <div className={styles.wrap}>
      <QueueFilters filters={filters} setFilters={setFilters} />
      {can("approve") || can("escalate") ? (
        <QueueToolbar selectedIds={[...selected]} rows={rows} onBulk={handleBulk} onClear={() => setSelected(new Set())} />
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkCol}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className={`${c.sortable ? styles.sortable : ""} ${c.align === "right" ? styles.right : ""}`}
                  onClick={() => c.sortable && toggleSort(c.key)}
                >
                  <span className={styles.thInner}>{c.label} <SortIcon col={c} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8}><Skeleton width="100%" height={20} /></td>
                  </tr>
                ))
              : rows.map((t) => {
                  const actionable = t.status === "pending" || t.status === "escalated";
                  return (
                    <tr
                      key={t.id}
                      className={`${styles.row} ${openId === t.id ? styles.rowActive : ""} ${selected.has(t.id) ? styles.rowSelected : ""}`}
                      onClick={() => openPanel(t.id)}
                    >
                      <td className={styles.checkCol} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} aria-label={`Select ${t.id}`} />
                      </td>
                      <td><RiskBadge score={t.scored.score} band={t.scored.band} showLabel /></td>
                      <td>
                        <div className={styles.acct}>{t.accountName}</div>
                        <div className={styles.acctSub}>{t.id} · {t.channel}</div>
                      </td>
                      <td className={styles.right}>
                        <span className={styles.amount}>{currency(t.amount)}</span>
                      </td>
                      <td className={styles.muted}>{timestamp(t.timestamp)}</td>
                      <td><StatusPill status={t.status} /></td>
                      <td>
                        <span className={styles.reason} title={t.scored.topReason}>
                          {t.scored.topFraudType ? RISK_ABBR[t.scored.topFraudType] : "–"}
                        </span>
                      </td>
                      <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                        {actionable && (
                          <div className={styles.rowActions}>
                            <button className={`${styles.iconAction} ${styles.approve}`} title={can("approve") ? "Approve" : "No permission"} disabled={!can("approve")} onClick={guardedRowAction("approve", "approved", t.id)}>
                              <Check size={15} />
                            </button>
                            <button className={`${styles.iconAction} ${styles.hold}`} title={can("hold") ? "Hold" : "No permission"} disabled={!can("hold")} onClick={guardedRowAction("hold", "held", t.id)}>
                              <Pause size={15} />
                            </button>
                            <button className={`${styles.iconAction} ${styles.escalate}`} title={can("escalate") ? "Escalate" : "No permission"} disabled={!can("escalate")} onClick={guardedRowAction("escalate", "escalated", t.id)}>
                              <ArrowUp size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>

        {!loading && rows.length === 0 && (
          <EmptyState
            title="No transactions match these filters"
            message="Try widening the risk level or clearing filters to see the full queue."
          />
        )}
      </div>
    </div>
  );
}
