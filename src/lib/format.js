/* ============================================================
   Sentinel — Formatting helpers
   ============================================================ */

export function currency(n, { compact = false } = {}) {
  if (n == null) return "–";
  if (compact && Math.abs(n) >= 1000) {
    const units = [
      { v: 1e9, s: "B" },
      { v: 1e6, s: "M" },
      { v: 1e3, s: "K" },
    ];
    for (const u of units) {
      if (Math.abs(n) >= u.v) {
        const val = n / u.v;
        return `$${val % 1 === 0 ? val : val.toFixed(1)}${u.s}`;
      }
    }
  }
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function number(n) {
  return n == null ? "–" : n.toLocaleString("en-US");
}

export function percent(fraction, digits = 0) {
  if (fraction == null) return "–";
  return `${(fraction * 100).toFixed(digits)}%`;
}

/* Relative time like "3m ago", "2h ago", "yesterday" */
export function relativeTime(iso, now = Date.now()) {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function timestamp(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dateOnly(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* Initials for avatar chips */
export function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
