/* Sentinel — routes. Each protected route checks a role
   capability and redirects to the dashboard if not permitted. */

import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { useSession } from "./context/SessionContext";
import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import Escalations from "./pages/Escalations";
import Audit from "./pages/Audit";
import Insights from "./pages/Insights";

function Protected({ cap, children }) {
  const { can } = useSession();
  return can(cap) ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="queue" element={<Queue />} />
        <Route
          path="escalations"
          element={<Protected cap="viewEscalationInbox"><Escalations /></Protected>}
        />
        <Route
          path="audit"
          element={<Protected cap="viewAudit"><Audit /></Protected>}
        />
        <Route
          path="insights"
          element={<Protected cap="viewAiInsights"><Insights /></Protected>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
