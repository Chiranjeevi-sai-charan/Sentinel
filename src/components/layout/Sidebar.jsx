/* Sentinel — left navigation. Grouped like the Candescent
   sidebar (sections), with items gated by role capability. */

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ListChecks, Inbox, ScrollText, Sparkles, ShieldCheck,
} from "lucide-react";
import { useSession } from "../../context/SessionContext";
import { useData } from "../../context/DataContext";
import styles from "./Sidebar.module.css";

const NAV = [
  {
    group: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, cap: "viewSummary", end: true },
      { to: "/queue", label: "Review queue", icon: ListChecks, cap: "viewQueue" },
    ],
  },
  {
    group: "Review",
    items: [
      { to: "/escalations", label: "Escalation inbox", icon: Inbox, cap: "viewEscalationInbox", badge: "escalations" },
      { to: "/insights", label: "AI insights", icon: Sparkles, cap: "viewAiInsights" },
    ],
  },
  {
    group: "Compliance",
    items: [
      { to: "/audit", label: "Audit trail", icon: ScrollText, cap: "viewAudit" },
    ],
  },
];

export default function Sidebar({ open = false, onClose }) {
  const { can } = useSession();
  const { transactions } = useData();
  const escalationCount = transactions.filter((t) => t.status === "escalated").length;

  return (
    <>
      {/* Backdrop only used on mobile when the drawer is open */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOn : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.brand}>
          <span className={styles.logo}><ShieldCheck size={20} /></span>
          <div>
            <div className={styles.brandName}>Sentinel</div>
            <div className={styles.brandSub}>Fraud & Risk Review</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV.map((section) => {
            const visible = section.items.filter((it) => can(it.cap));
            if (!visible.length) return null;
            return (
              <div key={section.group} className={styles.group}>
                <div className={styles.groupLabel}>{section.group}</div>
                {visible.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `${styles.item} ${isActive ? styles.active : ""}`
                    }
                  >
                    <it.icon size={18} />
                    <span>{it.label}</span>
                    {it.badge === "escalations" && escalationCount > 0 && (
                      <span className={styles.count}>{escalationCount}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.modelChip}>
            <Sparkles size={13} />
            Model v3.4.1 · 94% acc.
          </div>
        </div>
      </aside>
    </>
  );
}
