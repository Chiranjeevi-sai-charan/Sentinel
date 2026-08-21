/* Sentinel — demo Role Switcher (segmented control).
   Reuses the Candescent Personal/Business segmented-toggle style.
   Lets a recruiter view all three role experiences without login. */

import { useSession } from "../../context/SessionContext";
import { ROLE_LIST } from "../../lib/permissions";
import styles from "./RoleSwitcher.module.css";

export default function RoleSwitcher() {
  const { roleId, setRoleId } = useSession();
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>View as</span>
      <div className={styles.segment} role="tablist" aria-label="Demo role">
        {ROLE_LIST.map((r) => (
          <button
            key={r.id}
            role="tab"
            aria-selected={roleId === r.id}
            className={`${styles.seg} ${roleId === r.id ? styles.on : ""}`}
            onClick={() => setRoleId(r.id)}
            title={r.description}
          >
            {r.short}
          </button>
        ))}
      </div>
    </div>
  );
}
