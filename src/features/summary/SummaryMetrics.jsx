/* Sentinel — top-row summary metrics. All roles see the shared
   five; Senior additionally sees a reviewer-performance card. */

import { AlertTriangle, ArrowUpCircle, CheckCircle2, Clock, ListChecks, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import { RiskBadge } from "../../components/ui/Badge";
import { useData, useMetrics } from "../../context/DataContext";
import { useSession } from "../../context/SessionContext";
import { percent } from "../../lib/format";
import { TEAM } from "../../data/team";
import styles from "./SummaryMetrics.module.css";

function Metric({ icon: Icon, label, value, accent = "blue", sub, dim, children }) {
  return (
    <Card accent={accent} className={`${styles.metric} ${dim ? styles.dim : ""}`}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <Icon size={16} className={styles.icon} />
      </div>
      <div className={styles.value}>{value}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
      {children}
    </Card>
  );
}

export default function SummaryMetrics() {
  const { loading } = useData();
  const { can, health } = useSession();
  const m = useMetrics();

  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} accent="none" className={styles.metric}>
            <Skeleton width="50%" height={12} />
            <div style={{ height: 14 }} />
            <Skeleton width="70%" height={30} />
          </Card>
        ))}
      </div>
    );
  }

  const dim = health.scoringDown;

  return (
    <div className={styles.grid}>
      <Metric icon={ListChecks} label="Flagged today" value={m.total} accent="blue" sub="across all channels" dim={dim} />
      <Metric icon={AlertTriangle} label="High-risk" value={m.high} accent="red" dim={dim}
        sub={<span className={styles.badgeSub}><RiskBadge score={71} band="high" size="sm" /> 71+ score</span>} />
      <Metric icon={ArrowUpCircle} label="Pending escalations" value={m.pendingEscalations} accent="amber" sub="awaiting senior review" dim={dim} />
      <Metric icon={CheckCircle2} label="Approval rate" value={percent(m.approvalRate)} accent="green" sub={`${m.actioned} cases actioned`} dim={dim} />
      <Metric icon={Clock} label="Avg. review time" value={`${m.avgReviewMin}m`} accent="blue" sub="per case" dim={dim} />

      {can("viewReviewerPerf") && <ReviewerPerfCard />}
    </div>
  );
}

/* Senior-only reviewer performance snapshot. */
function ReviewerPerfCard() {
  // All reviewers, sorted by actions (descending)
  const allPerf = [
    { id: "U-01", actions: 42, avg: "3.1m" },
    { id: "U-04", actions: 38, avg: "3.8m" },
    { id: "U-02", actions: 29, avg: "5.2m" },
    { id: "U-03", actions: 26, avg: "4.1m" },
    { id: "U-05", actions: 19, avg: "6.3m" },
  ];
  const topThree = allPerf.slice(0, 3);
  const byId = Object.fromEntries(TEAM.map((t) => [t.id, t]));
  return (
    <Card accent="ai" className={`${styles.metric} ${styles.perf}`}>
      <div className={styles.top}>
        <span className={styles.label}>Reviewer performance · top 3</span>
        <Users size={16} className={styles.icon} />
      </div>
      <div className={styles.perfTable}>
        <div className={styles.perfHeader}>
          <span>Reviewer</span>
          <span>Cases · Avg. time</span>
        </div>
        <div className={styles.perfList}>
          {topThree.map((p) => (
            <div key={p.id} className={styles.perfRow}>
              <span className={styles.perfName}>{byId[p.id]?.name}</span>
              <span className={styles.perfStat}>{p.actions} · {p.avg}</span>
            </div>
          ))}
        </div>
      </div>
      <button className={styles.viewAll} onClick={() => alert("Full team performance view")}>
        View all reviewers
      </button>
    </Card>
  );
}
