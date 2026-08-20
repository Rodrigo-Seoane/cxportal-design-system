// ── Locale-pinned date formatters ───────────────────────────────────────────
// `toLocaleDateString()` / `toLocaleTimeString()` without an explicit locale
// use the runtime's default locale — which can differ between the Node.js
// SSR process and the browser, producing a hydration mismatch (server
// renders "7/20/2026", client renders "20/07/2026"). Pinning to 'en-US'
// makes these deterministic across both environments.
// Plain number formatting (`n.toLocaleString('en-US')`) is pinned inline at
// each call site instead — a single static argument doesn't need a wrapper.

// `formatDate` / `formatDateTime` also pin `timeZone: 'UTC'` — every dataset
// date is generated in UTC (taxonomy.ts's `addDays` uses `setUTCDate`), so
// this keeps the displayed date consistent with the data's own frame of
// reference regardless of the server or viewer's local timezone.
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { timeZone: 'UTC' })
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString('en-US', { timeZone: 'UTC' })
}

// `formatTime` is used only for the live "last updated" wall-clock display —
// no `timeZone` pin, since showing the viewer's own local time there is the
// correct behavior, not a bug. Locale is still pinned to avoid the same
// hydration-mismatch risk on the ':00'-vs-'.00' minute separator.
export function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
