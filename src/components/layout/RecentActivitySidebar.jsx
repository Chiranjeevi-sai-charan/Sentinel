/* Sentinel — right rail: live team activity feed. Visible to all
   roles; builds a sense of a live operations floor. */

import { CheckCircle2, PauseCircle, XCircle, ArrowUpCircle, Flag } from "lucide-react";
import { useData } from "../../context/DataContext";
import Skeleton from "../ui/Skeleton";
import styles from "./RecentActivitySidebar.module.css";

const ICON = {
  approved: { icon: CheckCircle2, cls: "approve" },
  approve: { icon: CheckCircle2, cls: "approve" },
  held: { icon: PauseCircle, cls: "hold" },
  hold: { icon: PauseCircle, cls: "hold" },
  denied: { icon: XCircle, cls: "deny" },
  deny: { icon: XCircle, cls: "deny" },
  escalated: { icon: ArrowUpCircle, cls: "escalate" },
  escalate: { icon: ArrowUpCircle, cls: "escalate" },
  flag: { icon: Flag, cls: "flag" },
};

export default function RecentActivitySidebar() {
  const { activity, loading } = useData();

  return (
    <aside className={styles.rail}>
      <div className={styles.head}>
        <span className={styles.pulse} />
        <h3>Live activity</h3>
      </div>

      <div className={styles.feed}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div className={styles.item} key={i}>
                <Skeleton width={26} height={26} radius={999} />
                <div style={{ flex: 1 }}><Skeleton width="90%" height={12} /><div style={{ height: 6 }} /><Skeleton width="40%" height={10} /></div>
              </div>
            ))
          : activity.map((a) => {
              const meta = ICON[a.type] || ICON.flag;
              const Icon = meta.icon;
              return (
                <div className={styles.item} key={a.id}>
                  <span className={`${styles.icon} ${styles[meta.cls]}`}><Icon size={15} /></span>
                  <div className={styles.text}>
                    <div className={styles.line}>
                      <strong>{a.actor}</strong> {a.text}
                    </div>
                    <div className={styles.sub}>{a.meta} · {a.when}</div>
                  </div>
                </div>
              );
            })}
      </div>
    </aside>
  );
}
