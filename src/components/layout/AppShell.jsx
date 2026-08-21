/* Sentinel — app shell: sidebar + header + scrollable main +
   live-activity rail. The detail panel mounts globally at the app
   level so it can slide over any view. */

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RecentActivitySidebar from "./RecentActivitySidebar";
import DetailPanel from "../../features/detail/DetailPanel";
import styles from "./AppShell.module.css";

export default function AppShell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.body}>
        <Header />
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
