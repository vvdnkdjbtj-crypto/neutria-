// lib/format.js
// Shared, pure formatting/number helpers used across pages.
// Kept dependency-free so they can be unit-tested in isolation.

// Currency with thousands separators, e.g. fmt(3420) -> "£3,420".
export function fmt(n) {
  return `£${Number(n || 0).toLocaleString()}`;
}

// Percentage discount of `a` (now) vs `b` (was). Guards divide-by-zero.
export function pct(a, b) {
  return b > 0 ? Math.round(((b - a) / b) * 100) : 0;
}

// Currency with fixed 2 decimals, e.g. money(12.5) -> "£12.50".
export function money(n) {
  return `£${Number(n || 0).toFixed(2)}`;
}
