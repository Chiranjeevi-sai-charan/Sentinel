/* Sentinel — top header: page title, demo role switcher, demo
   service-health controls, and the signed-in user chip. */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { SlidersHorizontal, Bell, Menu } from "lucide-react";
import { useSession } from "../../context/SessionContext";
import RoleSwitcher from "./RoleSwitcher";
import styles from "./Header.module.css";

const TITLES = {
  "/": { title: "Risk overview", sub: "Today's flagged activity across the credit union" },
  "/queue": { title: "Review queue", sub: "Prioritize and action flagged transactions" },
  "/escalations": { title: "Escalation inbox", sub: "Cases raised by junior reviewers" },
  "/audit": { title: "Audit trail", sub: "Immutable record of every review decision" },
  "/insights": { title: "AI insights", sub: "Model performance and trending fraud patterns" },
};

export default function Header({ onMenuToggle }) {
  const { pathname } = useLocation();
  const { user, roleId, health, toggleScoring, toggleAiModel } = useSession();
  const [demoOpen, setDemoOpen] = useState(false);
  const meta = TITLES[pathname] || { title: "Sentinel", sub: "" };

  return (
    <header className={styles.header}>
      <div className={styles.titleWrap}>
        <button
          className={styles.menuBtn}
          onClick={onMenuToggle}
          title="Menu"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className={styles.titleBlock}>
          <h1>{meta.title}</h1>
          {meta.sub && <p className={styles.sub}>{meta.sub}</p>}
        </div>
      </div>

      <div className={styles.right}>
        <RoleSwitcher />

        <div className={styles.demoWrap}>
          <button
            className={styles.iconBtn}
            onClick={() => setDemoOpen((o) => !o)}
            title="Demo controls"
            aria-expanded={demoOpen}
          >
            <SlidersHorizontal size={18} />
            {(health.scoringDown || health.aiModelDown) && <span className={styles.dot} />}
          </button>
          {demoOpen && (
            <>
              <div className={styles.backdrop} onClick={() => setDemoOpen(false)} />
              <div className={styles.demoMenu}>
                <div className={styles.demoTitle}>Demo controls</div>
                <p className={styles.demoHint}>Simulate service outages to see Sentinel's fallback states.</p>
                <label className={styles.toggleRow}>
                  <span>Risk-scoring service down</span>
                  <input type="checkbox" checked={health.scoringDown} onChange={toggleScoring} />
                </label>
                <label className={styles.toggleRow}>
                  <span>AI model unavailable</span>
                  <input type="checkbox" checked={health.aiModelDown} onChange={toggleAiModel} />
                </label>
              </div>
            </>
          )}
        </div>

        <button className={`${styles.iconBtn} ${styles.bell}`} title="Notifications"><Bell size={18} /></button>

        <div className={styles.user}>
          <span className={styles.avatar}>{user.initials}</span>
          <div className={styles.userMeta}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>{roleId === "junior" ? "Junior Reviewer" : roleId === "senior" ? "Senior Analyst" : "Compliance Lead"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
