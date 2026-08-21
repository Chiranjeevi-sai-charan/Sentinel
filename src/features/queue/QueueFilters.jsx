/* Sentinel — queue filter bar. Filter chips + selects for risk,
   transaction type, status, and fraud type. */

import { Search, X } from "lucide-react";
import { CHANNEL_TYPES } from "../../data/transactions";
import { FRAUD_TYPES } from "../../lib/scoring";
import styles from "./queue.module.css";

const RISK = [
  { id: "all", label: "All risk" },
  { id: "high", label: "High" },
  { id: "med", label: "Medium" },
  { id: "low", label: "Low" },
];
const STATUS = ["all", "pending", "escalated", "approved", "held", "denied"];

export default function QueueFilters({ filters, setFilters }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const hasFilters = filters.risk !== "all" || filters.type !== "all" || filters.status !== "all" || filters.fraud !== "all" || filters.search;

  return (
    <div className={styles.filters}>
      <div className={styles.search}>
        <Search size={15} />
        <input
          placeholder="Search account or transaction ID"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>

      <div className={styles.chips}>
        {RISK.map((r) => (
          <button
            key={r.id}
            className={`${styles.chip} ${filters.risk === r.id ? styles.chipOn : ""}`}
            onClick={() => set({ risk: r.id })}
          >
            {r.label}
          </button>
        ))}
      </div>

      <select className={styles.select} value={filters.type} onChange={(e) => set({ type: e.target.value })}>
        <option value="all">All types</option>
        {CHANNEL_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select className={styles.select} value={filters.fraud} onChange={(e) => set({ fraud: e.target.value })}>
        <option value="all">All fraud types</option>
        {Object.entries(FRAUD_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>

      <select className={styles.select} value={filters.status} onChange={(e) => set({ status: e.target.value })}>
        {STATUS.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}</option>)}
      </select>

      {hasFilters && (
        <button className={styles.clear} onClick={() => set({ risk: "all", type: "all", status: "all", fraud: "all", search: "" })}>
          <X size={13} /> Clear
        </button>
      )}
    </div>
  );
}
