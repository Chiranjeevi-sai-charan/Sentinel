/* Sentinel — Dashboard: summary metrics + data visualizations. */

import { PieChart, TrendingUp, BarChart3, Sparkles, Users } from "lucide-react";
import Card, { CardHeader } from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import StaleDataBanner from "../components/ui/StaleDataBanner";
import CalloutBox from "../components/ui/CalloutBox";
import SummaryMetrics from "../features/summary/SummaryMetrics";
import RiskDonut from "../components/charts/RiskDonut";
import TrendLine from "../components/charts/TrendLine";
import TopReasonsBar from "../components/charts/TopReasonsBar";
import AiConfidenceScatter from "../components/charts/AiConfidenceScatter";
import ReviewerPerfBar from "../components/charts/ReviewerPerfBar";
import { useData } from "../context/DataContext";
import { useSession } from "../context/SessionContext";
import styles from "./Dashboard.module.css";

function ChartCard({ title, icon, meta, loading, children, accent = "blue" }) {
  return (
    <Card accent={accent}>
      <CardHeader title={title} icon={icon} meta={meta} />
      {loading ? <Skeleton width="100%" height={220} radius={12} /> : children}
    </Card>
  );
}

export default function Dashboard() {
  const { loading, transactions } = useData();
  const { can, health } = useSession();

  return (
    <div className={styles.page}>
      {health.scoringDown && <StaleDataBanner variant="stale" />}
      {health.aiModelDown && <StaleDataBanner variant="aiDown" />}

      <SummaryMetrics />

      <div className={styles.charts}>
        <ChartCard title="Risk distribution" icon={PieChart} meta="today" loading={loading}>
          <RiskDonut transactions={transactions} />
        </ChartCard>

        <ChartCard title="Flagged transactions" icon={TrendingUp} meta="last 7 days" loading={loading}>
          <TrendLine transactions={transactions} />
        </ChartCard>

        <ChartCard title="Top risk reasons" icon={BarChart3} meta="by fraud type" loading={loading}>
          <TopReasonsBar transactions={transactions} />
        </ChartCard>

        <ChartCard title="AI confidence vs. actual" icon={Sparkles} meta="model calibration" accent="ai" loading={loading}>
          {health.aiModelDown ? (
            <CalloutBox variant="warning" title="Calibration paused">
              The AI model is offline. Confidence calibration resumes when the model reconnects.
            </CalloutBox>
          ) : (
            <AiConfidenceScatter />
          )}
        </ChartCard>

        {can("viewReviewerPerf") && (
          <ChartCard title="Reviewer performance" icon={Users} meta="approve / hold / escalate" loading={loading} accent="green">
            <ReviewerPerfBar />
          </ChartCard>
        )}
      </div>
    </div>
  );
}
