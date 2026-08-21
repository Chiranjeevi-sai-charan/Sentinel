/* Sentinel — recent team activity feed (live-workflow sidebar).
   Times are relative to the pinned DEMO_NOW. */

import { DEMO_NOW } from "./transactions";

const MIN = 60000;
const at = (minsAgo) => new Date(DEMO_NOW - minsAgo * MIN).toISOString();

export const ACTIVITY = [
  { id: "AV-1", actor: "System", type: "flag", text: "flagged 3 new high-risk cases", meta: "Wire fraud pattern", timestamp: at(2) },
  { id: "AV-2", actor: "Sarah Whitman", type: "approve", text: "approved a $1,200 wire", meta: "TX-4231", timestamp: at(8) },
  { id: "AV-3", actor: "John Alvarez", type: "escalate", text: "escalated a high-risk account", meta: "TX-4204 · new-account fraud", timestamp: at(14) },
  { id: "AV-4", actor: "Marcus Reed", type: "hold", text: "placed a $48K transfer on hold", meta: "TX-4200", timestamp: at(23) },
  { id: "AV-5", actor: "Mei Lin", type: "escalate", text: "escalated a structuring case", meta: "TX-4247", timestamp: at(37) },
  { id: "AV-6", actor: "Sarah Whitman", type: "deny", text: "denied a first-time wire", meta: "TX-4218", timestamp: at(51) },
  { id: "AV-7", actor: "System", type: "flag", text: "detected an ATO variant", meta: "Overnight logins", timestamp: at(64) },
  { id: "AV-8", actor: "Priya Shah", type: "escalate", text: "escalated a loan application", meta: "TX-4222 · ID mismatch", timestamp: at(88) },
  { id: "AV-9", actor: "Marcus Reed", type: "approve", text: "approved a $640 card charge", meta: "TX-4239", timestamp: at(103) },
  { id: "AV-10", actor: "System", type: "flag", text: "flagged 5 card transactions", meta: "Geo-spread pattern", timestamp: at(126) },
];
