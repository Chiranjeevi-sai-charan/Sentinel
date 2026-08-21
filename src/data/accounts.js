/* ============================================================
   Sentinel — Mock member accounts
   Credit-union members whose transactions get flagged.
   `accountAgeDays`, `homeGeo`, and `avgAmount` feed the
   scoring rules; `history` is back-filled in transactions.js.
   ============================================================ */

export const ACCOUNTS = [
  { id: "AC-1042", name: "Marcus Bell", type: "Personal Checking", accountAgeDays: 1830, homeGeo: "Columbus, OH", avgAmount: 480, history: [] },
  { id: "AC-1043", name: "Priya Nair", type: "Personal Savings", accountAgeDays: 6, homeGeo: "Austin, TX", avgAmount: 320, history: [] },
  { id: "AC-1044", name: "The Fold Coffee LLC", type: "Business Checking", accountAgeDays: 940, homeGeo: "Portland, OR", avgAmount: 5200, history: [] },
  { id: "AC-1045", name: "Denise Okafor", type: "Personal Checking", accountAgeDays: 2450, homeGeo: "Atlanta, GA", avgAmount: 610, history: [] },
  { id: "AC-1046", name: "Grant Whitfield", type: "Personal Checking", accountAgeDays: 9, homeGeo: "Miami, FL", avgAmount: 240, history: [] },
  { id: "AC-1047", name: "Sofia Reyes", type: "Personal Savings", accountAgeDays: 3120, homeGeo: "San Diego, CA", avgAmount: 900, history: [] },
  { id: "AC-1048", name: "Northgate Auto Repair", type: "Business Checking", accountAgeDays: 1580, homeGeo: "Denver, CO", avgAmount: 4100, history: [] },
  { id: "AC-1049", name: "Ellis Tanaka", type: "Personal Checking", accountAgeDays: 4200, homeGeo: "Seattle, WA", avgAmount: 720, history: [] },
  { id: "AC-1050", name: "Yusuf Rahman", type: "Personal Checking", accountAgeDays: 11, homeGeo: "Newark, NJ", avgAmount: 300, history: [] },
  { id: "AC-1051", name: "Bright Path Daycare", type: "Business Checking", accountAgeDays: 2100, homeGeo: "Nashville, TN", avgAmount: 3300, history: [] },
  { id: "AC-1052", name: "Hannah Cole", type: "Personal Savings", accountAgeDays: 5400, homeGeo: "Boise, ID", avgAmount: 550, history: [] },
  { id: "AC-1053", name: "Diego Marín", type: "Personal Checking", accountAgeDays: 8, homeGeo: "Phoenix, AZ", avgAmount: 260, history: [] },
];

export const ACCOUNT_BY_ID = Object.fromEntries(ACCOUNTS.map((a) => [a.id, a]));
