/* ============================================================
   Sentinel — Role-Based Access Control
   ------------------------------------------------------------
   Permissions are a first-class feature, not decoration. Every
   action button, route, and view consults this capability map.
   ============================================================ */

export const ROLES = {
  junior: {
    id: "junior",
    name: "Junior Reviewer",
    short: "Junior",
    description: "Reviews the queue and escalates to a Senior. Cannot approve or deny.",
  },
  senior: {
    id: "senior",
    name: "Senior Analyst",
    short: "Senior",
    description: "Full authority: approve, hold, deny, override, and clear the escalation inbox.",
  },
  compliance: {
    id: "compliance",
    name: "Compliance Lead",
    short: "Compliance",
    description: "Read-only oversight: audit trail and exports. Takes no action on transactions.",
  },
};

export const ROLE_LIST = [ROLES.junior, ROLES.senior, ROLES.compliance];

/* Capability matrix — the single source of truth for gating. */
const CAPABILITIES = {
  junior: {
    viewSummary: true,
    viewQueue: true,
    viewActivity: true,
    approve: false,
    hold: false,
    deny: false,
    escalate: true,
    overrideJunior: false,
    viewEscalationInbox: false,
    viewReviewerPerf: false,
    viewAudit: false,
    exportAudit: false,
    viewAiInsights: false,
    // Junior sees only escalations they themselves raised.
    ownEscalationsOnly: true,
  },
  senior: {
    viewSummary: true,
    viewQueue: true,
    viewActivity: true,
    approve: true,
    hold: true,
    deny: true,
    escalate: true,
    overrideJunior: true,
    viewEscalationInbox: true,
    viewReviewerPerf: true,
    viewAudit: false,
    exportAudit: false,
    viewAiInsights: true,
    ownEscalationsOnly: false,
  },
  compliance: {
    viewSummary: true,
    viewQueue: true,
    viewActivity: true,
    approve: false,
    hold: false,
    deny: false,
    escalate: false,
    overrideJunior: false,
    viewEscalationInbox: false,
    viewReviewerPerf: false,
    viewAudit: true,
    exportAudit: true,
    viewAiInsights: true,
    ownEscalationsOnly: false,
  },
};

export function can(roleId, capability) {
  const caps = CAPABILITIES[roleId];
  return caps ? !!caps[capability] : false;
}

/* Human-readable reason for a blocked action — used in toasts. */
export function denialMessage(capability) {
  const map = {
    approve: "You don't have permission to approve transactions.",
    hold: "You don't have permission to hold transactions.",
    deny: "You don't have permission to deny transactions.",
    escalate: "Compliance is read-only and can't escalate cases.",
    exportAudit: "You don't have permission to export the audit trail.",
  };
  return map[capability] || "You don't have permission to do that.";
}
