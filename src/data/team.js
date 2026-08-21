/* Sentinel — operations team (reviewers whose actions populate
   activity, audit trail, and reviewer-performance views). */

export const TEAM = [
  { id: "U-01", name: "Sarah Whitman", role: "senior", initials: "SW" },
  { id: "U-02", name: "John Alvarez", role: "junior", initials: "JA" },
  { id: "U-03", name: "Mei Lin", role: "junior", initials: "ML" },
  { id: "U-04", name: "Marcus Reed", role: "senior", initials: "MR" },
  { id: "U-05", name: "Priya Shah", role: "junior", initials: "PS" },
  { id: "U-06", name: "Dana Cole", role: "compliance", initials: "DC" },
];

export const TEAM_BY_ID = Object.fromEntries(TEAM.map((t) => [t.id, t]));

/* The signed-in demo user for each role. */
export const CURRENT_USER = {
  junior: { id: "U-02", name: "John Alvarez", initials: "JA" },
  senior: { id: "U-01", name: "Sarah Whitman", initials: "SW" },
  compliance: { id: "U-06", name: "Dana Cole", initials: "DC" },
};
