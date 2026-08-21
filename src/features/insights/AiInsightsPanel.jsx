/* Sentinel — AI insights (Senior + Compliance). Model performance,
   trending fraud patterns, and confidence calibration. */

import { TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw } from "lucide-react";
import Card, { CardHeader } from "../../components/ui/Card";
import CalloutBox from "../../components/ui/CalloutBox";
import AiGlyph from "../../components/ui/AiGlyph";
import { Pill } from "../../components/ui/Badge";
import AiConfidenceScatter from "../../components/charts/AiConfidenceScatter";
import { useSession } from "../../context/SessionContext";
import { MODEL_METRICS, TRENDING_PATTERNS } from "../../data/aiInsights";
import { percent } from "../../lib/format";
import styles from "./insights.module.css";

const DIR_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };
const SEV_TONE = { high: "high", med: "med", low: "low" };

export default function AiInsightsPanel() {
  const { health } = useSession();

  if (health.aiModelDown) {
    return (
      <Card accent="amber">
        <CalloutBox variant="warning" title="AI model unavailable">
          Sentinel has fallen back to rules-only scoring. Model performance metrics, trending-pattern
          detection, and confidence calibration are paused until the model reconnects.
        </CalloutBox>
      </Card>
    );
  }

  const metrics = [
    { label: "Precision", value: percent(MODEL_METRICS.precision) },
    { label: "Recall", value: percent(MODEL_METRICS.recall) },
    { label: "False-positive rate", value: percent(MODEL_METRICS.falsePositiveRate) },
    { label: "Accuracy", value: percent(MODEL_METRICS.accuracy) },
  ];

  return (
    <div className={styles.page}>
      {/* Model status banner */}
      <Card accent="ai" className={styles.statusCard}>
        <div className={styles.status}>
          <AiGlyph size={40} />
          <div className={styles.statusText}>
            <div className={styles.statusTitle}>Sentinel risk model {MODEL_METRICS.version}</div>
            <div className={styles.statusSub}>
              <span className={styles.healthy}>● Healthy</span> · Last trained {MODEL_METRICS.lastTrained} · {percent(MODEL_METRICS.accuracy)} accuracy
            </div>
          </div>
          <div className={styles.retrain}><RefreshCw size={14} /> Retrain scheduled nightly</div>
        </div>
      </Card>

      <div className={styles.metricRow}>
        {metrics.map((m) => (
          <Card key={m.label} accent="blue" className={styles.metricCard}>
            <div className={styles.metricLabel}>{m.label}</div>
            <div className={styles.metricValue}>{m.value}</div>
          </Card>
        ))}
      </div>

      <div className={styles.grid}>
        <Card accent="ai">
          <CardHeader title="Trending fraud patterns" icon={Sparkles} meta="this week" />
          <div className={styles.patterns}>
            {TRENDING_PATTERNS.map((p) => {
              const Icon = DIR_ICON[p.direction];
              return (
                <div key={p.id} className={styles.pattern}>
                  <span className={`${styles.dir} ${styles[p.direction]}`}><Icon size={16} /></span>
                  <div className={styles.patternText}>
                    <div className={styles.patternLabel}>{p.label}</div>
                    <div className={styles.patternDetail}>{p.detail}</div>
                  </div>
                  <Pill tone={SEV_TONE[p.severity]}>{p.severity}</Pill>
                </div>
              );
            })}
          </div>
        </Card>

        <Card accent="blue">
          <CardHeader title="Confidence calibration" icon={Sparkles} meta="confidence vs. actual" />
          <AiConfidenceScatter />
          <p className={styles.caption}>
            Points on the diagonal mean the model's confidence matches confirmed-fraud rates. Sentinel is
            currently well-calibrated in the high-confidence range.
          </p>
        </Card>
      </div>
    </div>
  );
}
