/* Sentinel — global detail-panel state. Holds the currently
   open transaction id so any view can open the slide-in panel. */

import { createContext, useContext, useState, useCallback, useMemo } from "react";

const PanelContext = createContext(null);

export function PanelProvider({ children }) {
  const [openId, setOpenId] = useState(null);

  const openPanel = useCallback((id) => setOpenId(id), []);
  const closePanel = useCallback(() => setOpenId(null), []);

  const value = useMemo(() => ({ openId, openPanel, closePanel }), [openId, openPanel, closePanel]);
  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

export function usePanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanel must be used within PanelProvider");
  return ctx;
}
