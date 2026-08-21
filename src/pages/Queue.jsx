/* Sentinel — Queue page. */

import StaleDataBanner from "../components/ui/StaleDataBanner";
import QueueView from "../features/queue/QueueView";
import { useSession } from "../context/SessionContext";

export default function Queue() {
  const { health } = useSession();
  return (
    <div>
      {health.scoringDown && <StaleDataBanner variant="stale" />}
      <QueueView />
    </div>
  );
}
