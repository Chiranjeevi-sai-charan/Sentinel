/* ============================================================
   Sentinel — Session context
   Holds the active role (driven by the demo RoleSwitcher),
   the signed-in user for that role, and simulated service
   health flags used by the edge-case states.
   ============================================================ */

import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { can as canDo } from "../lib/permissions";
import { CURRENT_USER } from "../data/team";
import { serviceHealth } from "../lib/mockApi";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [roleId, setRoleId] = useState("senior");
  const [health, setHealth] = useState({
    scoringDown: serviceHealth.scoringDown,
    aiModelDown: serviceHealth.aiModelDown,
  });

  const user = CURRENT_USER[roleId];

  const can = useCallback((capability) => canDo(roleId, capability), [roleId]);

  const toggleScoring = useCallback(() => {
    setHealth((h) => {
      const next = { ...h, scoringDown: !h.scoringDown };
      serviceHealth.scoringDown = next.scoringDown;
      return next;
    });
  }, []);

  const toggleAiModel = useCallback(() => {
    setHealth((h) => {
      const next = { ...h, aiModelDown: !h.aiModelDown };
      serviceHealth.aiModelDown = next.aiModelDown;
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ roleId, setRoleId, user, can, health, toggleScoring, toggleAiModel }),
    [roleId, user, can, health, toggleScoring, toggleAiModel]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
