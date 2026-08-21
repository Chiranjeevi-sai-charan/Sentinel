/* Sentinel — bulk-action toolbar. Appears when rows are selected
   (or offers "approve all < $500"). Gated by role. */

import { CheckCheck, PauseCircle, Flag } from "lucide-react";
import Button from "../../components/ui/Button";
import { useSession } from "../../context/SessionContext";
import { useToast } from "../../components/ui/Toast";
import { denialMessage } from "../../lib/permissions";
import styles from "./queue.module.css";

export default function QueueToolbar({ selectedIds, rows, onBulk, onClear }) {
  const { can, user } = useSession();
  const toast = useToast();
  const count = selectedIds.length;

  const guarded = (cap, fn) => () => {
    if (!can(cap)) {
      toast({ type: "error", title: "Action not permitted", message: denialMessage(cap) });
      return;
    }
    fn();
  };

  const smallCount = rows.filter((r) => r.amount < 500 && r.status === "pending").length;

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        {count > 0 ? (
          <>
            <strong>{count}</strong> selected
            <button className={styles.linkBtn} onClick={onClear}>Clear</button>
          </>
        ) : (
          <span className={styles.toolbarHint}>Select rows for bulk actions, or use a shortcut:</span>
        )}
      </div>

      <div className={styles.toolbarActions}>
        {count > 0 ? (
          <>
            <Button size="sm" variant="success" icon={CheckCheck} onClick={guarded("approve", () => onBulk("approved", selectedIds))}>
              Approve
            </Button>
            <Button size="sm" variant="secondary" icon={PauseCircle} onClick={guarded("hold", () => onBulk("held", selectedIds))}>
              Hold
            </Button>
            <Button size="sm" variant="secondary" icon={Flag} onClick={guarded("escalate", () => onBulk("escalated", selectedIds))}>
              Escalate
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            icon={CheckCheck}
            disabled={smallCount === 0}
            onClick={guarded("approve", () => onBulk("approved", rows.filter((r) => r.amount < 500 && r.status === "pending").map((r) => r.id)))}
          >
            Approve all &lt; $500 ({smallCount})
          </Button>
        )}
      </div>
    </div>
  );
}
