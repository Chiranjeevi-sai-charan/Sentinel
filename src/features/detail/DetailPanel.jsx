/* Sentinel — transaction drill-down panel (slides in from right).
   Account history, explainable risk-signal breakdown, metadata,
   AI insights, a notes thread, and role-gated actions. */

import { useEffect, useMemo, useState } from "react";
import { X, Check, Pause, ArrowUp, Clock, Send } from "lucide-react";
import { RiskBadge, StatusPill, Pill } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import CalloutBox from "../../components/ui/CalloutBox";
import AiGlyph from "../../components/ui/AiGlyph";
import { useData } from "../../context/DataContext";
import { useSession } from "../../context/SessionContext";
import { usePanel } from "../../context/PanelContext";
import { useToast } from "../../components/ui/Toast";
import { denialMessage } from "../../lib/permissions";
import { matchPatterns, shouldAutoEscalate, FRAUD_TYPES } from "../../lib/scoring";
import { ACCOUNT_BY_ID } from "../../data/accounts";
import { currency, timestamp, relativeTime, percent } from "../../lib/format";
import styles from "./detail.module.css";

export default function DetailPanel() {
  const { openId, closePanel } = usePanel();
  const { transactions, act, addReply, simulateConflict } = useData();
  const { can, user, health } = useSession();
  const toast = useToast();

  const txn = useMemo(() => transactions.find((t) => t.id === openId), [transactions, openId]);
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");
  const [conflict, setConflict] = useState(null);

  // Reset transient state when switching transactions.
  useEffect(() => { setNote(""); setReply(""); setConflict(null); }, [openId]);

  // Close on Escape.
  useEffect(() => {
    if (!openId) return;
    const onKey = (e) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, closePanel]);

  if (!openId || !txn) return null;

  const account = ACCOUNT_BY_ID[txn.accountId];
  const { scored } = txn;
  const patterns = health.aiModelDown ? null : matchPatterns(scored, transactions);
  const autoEscalate = !health.aiModelDown && shouldAutoEscalate(scored);
  const actionable = txn.status === "pending" || txn.status === "escalated";

  const doAction = (cap, status) => () => {
    if (!can(cap)) {
      toast({ type: "error", title: "Action not permitted", message: denialMessage(cap) });
      return;
    }
    act({ id: txn.id, status, actor: user.name, note: status === "escalated" ? note : null });
    toast({ type: "success", title: `Transaction ${status}`, message: `${txn.id} · ${status} by you.` });
    if (status !== "escalated") closePanel();
    else setNote("");
  };

  const postReply = () => {
    if (!reply.trim()) return;
    addReply(txn.id, reply.trim());
    setReply("");
    toast({ type: "success", title: "Reply added", message: "Your note is now on the case." });
  };

  const runConflictDemo = () => {
    const res = simulateConflict(txn.id);
    setConflict(res);
  };

  return (
    <>
      <div className={styles.scrim} onClick={closePanel} />
      <aside className={styles.panel} role="dialog" aria-label={`Transaction ${txn.id}`}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.txnId}>{txn.id}</div>
            <h2 className={styles.acctName}>{txn.accountName}</h2>
            <div className={styles.acctType}>{txn.accountType} · {account?.homeGeo}</div>
          </div>
          <button className={styles.close} onClick={closePanel} aria-label="Close"><X size={20} /></button>
        </div>

        <div className={styles.scroll}>
          {/* Conflict notice */}
          {conflict && (
            <CalloutBox variant="warning" title={`Already actioned by ${conflict.actor}`}>
              This transaction was {conflict.status} by {conflict.actor} while you were viewing it.
              The status above reflects the updated decision.
            </CalloutBox>
          )}

          {/* Hero: amount + score */}
          <div className={styles.hero}>
            <div>
              <div className={styles.heroLabel}>{txn.direction === "out" ? "Outgoing" : "Incoming"} · {txn.channel}</div>
              <div className={styles.heroAmount}>{currency(txn.amount)}</div>
              <div className={styles.heroMeta}>{timestamp(txn.timestamp)}</div>
            </div>
            <div className={styles.heroScore}>
              <RiskBadge score={scored.score} band={scored.band} showLabel size="md" />
              <StatusPill status={txn.status} />
            </div>
          </div>

          {/* Smart escalation nudge */}
          {autoEscalate && txn.status === "pending" && (
            <CalloutBox variant="ai" title="AI recommends escalating this case">
              High risk ({scored.score}/100) with {percent(scored.confidence)} model confidence. This matches the
              profile Sentinel auto-routes to a Senior.
            </CalloutBox>
          )}

          {/* Risk signal breakdown */}
          <Section title="Risk signal breakdown" note={health.aiModelDown ? "Rules-only" : `${scored.signals.length} signals`}>
            {scored.signals.length === 0 ? (
              <p className={styles.emptyNote}>No rules triggered; scored at the baseline.</p>
            ) : (
              <div className={styles.signals}>
                {scored.signals.map((s) => (
                  <div key={s.id} className={styles.signal}>
                    <div className={styles.signalMain}>
                      <span className={styles.signalLabel}>{s.label}</span>
                      <Pill tone="neutral">{FRAUD_TYPES[s.fraudType]}</Pill>
                    </div>
                    <span className={styles.signalPoints}>+{s.points}</span>
                  </div>
                ))}
                <div className={styles.signalTotal}>
                  <span>Total risk score</span>
                  <span className={styles.totalScore}>{scored.score}<span className={styles.totalMax}>/100</span></span>
                </div>
              </div>
            )}
          </Section>

          {/* AI insights */}
          <Section title="AI insights" ai>
            {health.aiModelDown ? (
              <CalloutBox variant="warning" title="AI insights unavailable">
                The model is offline. Anomaly detection and pattern matching resume when it reconnects.
              </CalloutBox>
            ) : (
              <div className={styles.insights}>
                {scored.anomaly && (
                  <CalloutBox variant="ai" title="Anomaly detected">{scored.anomaly.message}</CalloutBox>
                )}
                {patterns && (
                  <CalloutBox variant="ai" title="Similar cases">{patterns.message}</CalloutBox>
                )}
                {!scored.anomaly && !patterns && (
                  <p className={styles.emptyNote}>No anomalies or matching fraud patterns for this case.</p>
                )}
              </div>
            )}
          </Section>

          {/* Transaction metadata */}
          <Section title="Transaction details">
            <dl className={styles.meta}>
              <Meta label="Recipient" value={txn.recipient} tag={txn.recipientIsNew ? "First-time" : null} />
              <Meta label="Channel" value={txn.channel} />
              <Meta label="Merchant category" value={txn.merchantCategory} />
              <Meta label="Location" value={txn.geo} tag={txn.geo !== account?.homeGeo ? "Mismatch" : null} />
              <Meta label="24h velocity" value={`${txn.velocity24h} transfers`} />
              <Meta label="Timestamp" value={timestamp(txn.timestamp)} />
            </dl>
          </Section>

          {/* Account history */}
          <Section title="Account history" note="last 10">
            <div className={styles.history}>
              {account?.history.map((h) => (
                <div key={h.id} className={styles.histRow}>
                  <RiskBadge score={h.score} band={h.band} size="sm" />
                  <span className={styles.histAmount}>{currency(h.amount)}</span>
                  <span className={styles.histChannel}>{h.channel}</span>
                  <span className={styles.histTime}>{relativeTime(h.timestamp)}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Notes thread */}
          <Section title="Notes & escalation">
            {txn.escalationNote && (
              <div className={styles.noteBubble}>
                <div className={styles.noteAuthor}>{txn.escalatedBy || "Junior reviewer"}</div>
                <div className={styles.noteText}>{txn.escalationNote}</div>
              </div>
            )}
            {txn.seniorReply && (
              <div className={`${styles.noteBubble} ${styles.noteReply}`}>
                <div className={styles.noteAuthor}>Senior reply</div>
                <div className={styles.noteText}>{txn.seniorReply}</div>
              </div>
            )}
            {!txn.escalationNote && !txn.seniorReply && (
              <p className={styles.emptyNote}>No notes yet.</p>
            )}

            {/* Junior composes an escalation note; Senior replies. */}
            {can("escalate") && !can("approve") && (
              <div className={styles.composer}>
                <textarea placeholder="Add a note before escalating…" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            )}
            {can("overrideJunior") && txn.escalationNote && (
              <div className={styles.composer}>
                <input placeholder="Reply to the reviewer…" value={reply} onChange={(e) => setReply(e.target.value)} />
                <Button size="sm" variant="secondary" icon={Send} onClick={postReply}>Reply</Button>
              </div>
            )}
          </Section>

          {/* Recently reviewed by */}
          {txn.reviewedBy && (
            <div className={styles.reviewedBy}>
              <Clock size={13} /> Recently reviewed by <strong>{txn.reviewedBy}</strong>
            </div>
          )}
        </div>

        {/* Sticky action bar */}
        <div className={styles.actions}>
          {can("approve") ? (
            <>
              <Button variant="success" icon={Check} onClick={doAction("approve", "approved")} disabled={!actionable}>Approve</Button>
              <Button variant="secondary" icon={Pause} onClick={doAction("hold", "held")} disabled={!actionable}>Hold</Button>
              <Button variant="danger" onClick={doAction("deny", "denied")} disabled={!actionable}>Deny</Button>
            </>
          ) : can("escalate") ? (
            <Button variant="primary" icon={ArrowUp} onClick={doAction("escalate", "escalated")} disabled={!actionable}>Escalate to Senior</Button>
          ) : (
            <div className={styles.readonly}>Read-only · Compliance takes no action on transactions.</div>
          )}
          {can("approve") && actionable && (
            <button className={styles.conflictDemo} onClick={runConflictDemo} title="Demo: simulate a teammate actioning this">
              Simulate conflict
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function Section({ title, note, ai, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        {ai && <AiGlyph size={22} />}
        <h3>{title}</h3>
        {note && <span className={styles.sectionNote}>{note}</span>}
      </div>
      {children}
    </section>
  );
}

function Meta({ label, value, tag }) {
  return (
    <div className={styles.metaRow}>
      <dt>{label}</dt>
      <dd>
        {value}
        {tag && <Pill tone="med">{tag}</Pill>}
      </dd>
    </div>
  );
}
