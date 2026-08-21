/* Sentinel — Audit trail (Compliance only). Read-only, filterable
   log of every action, with CSV export. No action controls. */

import { useMemo, useState } from "react";
import { Download, ScrollText } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Pill } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";
import { AUDIT_LOG, AUDIT_ACTIONS } from "../../data/auditLog";
import { currency, timestamp } from "../../lib/format";
import styles from "./audit.module.css";

const ACTION_TONE = {
  approved: "low", held: "med", denied: "high",
  escalated: "info", flagged: "neutral", exported: "neutral",
};

export default function AuditTrail() {
  const toast = useToast();
  const [actor, setActor] = useState("all");
  const [action, setAction] = useState("all");

  const actors = useMemo(() => ["all", ...new Set(AUDIT_LOG.map((e) => e.actor))], []);

  const rows = useMemo(
    () => AUDIT_LOG.filter((e) => (actor === "all" || e.actor === actor) && (action === "all" || e.action === action)),
    [actor, action]
  );

  const exportCsv = () => {
    const header = ["Timestamp", "Actor", "Action", "Transaction", "Account", "Amount", "Risk", "Rationale"];
    const lines = rows.map((e) => [
      timestamp(e.timestamp), e.actor, e.actionLabel, e.transactionId, e.account,
      e.amount != null ? e.amount : "", e.riskScore != null ? e.riskScore : "",
      `"${(e.rationale || "").replace(/"/g, '""')}"`,
    ].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ type: "success", title: "Audit trail exported", message: `${rows.length} rows written to CSV.` });
  };

  return (
    <Card accent="none">
      <div className={styles.head}>
        <div className={styles.filters}>
          <select value={actor} onChange={(e) => setActor(e.target.value)} className={styles.select}>
            {actors.map((a) => <option key={a} value={a}>{a === "all" ? "All reviewers" : a}</option>)}
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)} className={styles.select}>
            <option value="all">All actions</option>
            {AUDIT_ACTIONS.map((a) => <option key={a} value={a}>{a[0].toUpperCase() + a.slice(1)}</option>)}
          </select>
          <span className={styles.count}>{rows.length} entries</span>
        </div>
        <Button variant="secondary" size="sm" icon={Download} onClick={exportCsv}>Export CSV</Button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th><th>Actor</th><th>Action</th><th>Transaction</th>
              <th>Account</th><th className={styles.right}>Amount</th><th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td className={styles.muted}>{timestamp(e.timestamp)}</td>
                <td className={styles.actor}>{e.actor}</td>
                <td><Pill tone={ACTION_TONE[e.action] || "neutral"}>{e.actionLabel}</Pill></td>
                <td className={styles.mono}>{e.transactionId}</td>
                <td>{e.account}</td>
                <td className={styles.right}>{e.amount != null ? currency(e.amount) : "–"}</td>
                <td className={styles.rationale}>{e.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState icon={ScrollText} title="No matching audit entries" message="Adjust the reviewer or action filter." />}
      </div>
    </Card>
  );
}
