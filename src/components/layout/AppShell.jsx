/* Sentinel — app shell: sidebar + header + scrollable main +
   live-activity rail. The detail panel mounts globally at the app
   level so it can slide over any view. */

import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RecentActivitySidebar from "./RecentActivitySidebar";
import DetailPanel from "../../features/detail/DetailPanel";
import styles from "./AppShell.module.css";

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <div className={styles.shell}>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={styles.body}>
        <Header onMenuToggle={() => setMenuOpen((o) => !o)} />
        <div className={styles.row}>
          <main className={styles.main}>
            <Outlet />
          </main>
          <RecentActivitySidebar />
        </div>
      </div>
      <DetailPanel />
    </div>
  );
}
