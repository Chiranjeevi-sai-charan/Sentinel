/* Sentinel — Escalation inbox (Senior only). Cases raised by
   junior reviewers, with their notes, AI confidence, and quick
   actions. Marks reviewed when the Senior acts. */

import { Check, Pause, X as XIcon, ArrowUpRight } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { RiskBadge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import AiGlyph from "../../components/ui/AiGlyph";
import { useData } from "../../context/DataContext";
import { useSession } from "../../context/SessionContext";
import { usePanel } from "../../context/PanelContext";
import { useToast } from "../../components/ui/Toast";
import { currency, relativeTime, percent } from "../../lib/format";
import styles from "./escalation.module.css";

export default function EscalationInbox() {
  const { transactions, act } = useData();
  const { user } = useSession();
  const { openPanel } = usePanel();
  const toast = useToast();

  const cases = transactions.filter((t) => t.status === "escalated");

  const decide = (id, status) => (e) => {
    e.stopPropagation();
    act({ id, status, actor: user.name });
    toast({ type: "success", title: `Case ${status}`, message: `${id} cleared from the inbox.` });
  };

  if (cases.length === 0) {
    return (
      <Card accent="green">
        <EmptyState
          icon={Check}
          title="Inbox zero · nothing waiting"
          message="No cases are currently escalated for senior review. New escalations from the team will appear here."
        />
      </Card>
    );
  }

  return (
    <div className={styles.list}>
      {cases.map((t) => (
        <Card key={t.id} accent={t.scored.band === "high" ? "red" : "amber"} className={styles.case} onClick={() => openPanel(t.id)}>
          <div className={styles.caseTop}>
            <div className={styles.caseWho}>
              <RiskBadge score={t.scored.score} band={t.scored.band} showLabel />
              <div>
                <div className={styles.caseName}>{t.accountName}</div>
                <div className={styles.caseSub}>{t.id} · {currency(t.amount)} · {t.channel}</div>
              </div>
            </div>
            <div className={styles.caseConfidence}>
              <AiGlyph size={20} />
              <span>{percent(t.scored.confidence)} confidence</span>
            </div>
          </div>

          {t.escalationNote && (
            <div className={styles.note}>
              <span className={styles.noteFrom}>{t.escalatedBy} · {relativeTime(t.timestamp)}</span>
              “{t.escalationNote}”
            </div>
          )}

          <div className={styles.caseActions} onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="success" icon={Check} onClick={decide(t.id, "approved")}>Approve</Button>
            <Button size="sm" variant="secondary" icon={Pause} onClick={decide(t.id, "held")}>Hold</Button>
            <Button size="sm" variant="danger" icon={XIcon} onClick={decide(t.id, "denied")}>Deny</Button>
            <button className={styles.viewLink} onClick={() => openPanel(t.id)}>
              View full case <ArrowUpRight size={14} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
