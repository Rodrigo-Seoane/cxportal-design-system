import type { AuthRecord } from './generator'
import { ANCHOR_DATE, addDays, seededRandFrom } from './taxonomy'
import { bucketCounts, type Clock } from './aggregations'

// ── Per-state 14-point sparkline ────────────────────────────────────────────
// Same backward-jitter technique as trend14Day, scoped to one state's total
// inventory count — used by the by-state table's inline sparkline column.

export function stateSparkline(records: AuthRecord[], stateCode: string): { t: number; v: number }[] {
  const total = records.filter(r => r.stateCode === stateCode).length
  const rand = seededRandFrom(`oi-state-spark-${stateCode}-${total}`)
  const start = Math.max(0, Math.round(total * (0.7 + rand() * 0.55)))
  const points: { t: number; v: number }[] = []
  for (let i = 0; i < DAYS; i++) {
    const t = i / (DAYS - 1)
    const base = start + (total - start) * t
    const v = i === DAYS - 1 ? total : Math.max(0, Math.round(base * (1 + (rand() - 0.5) * 0.1)))
    points.push({ t: i, v })
  }
  return points
}

// ── 14-day trend reconstruction ─────────────────────────────────────────────
// The dataset has no modeled resolve/close events, so a literal per-day
// replay of "what was due-status on day N" isn't available. Instead this
// walks backward from TODAY's real bucket composition (bucketCounts) with a
// small seeded jitter, so the chart's last point always exactly matches the
// live KPI band totals — the only thing that must reconcile — while the
// earlier days read as a plausible trend rather than a flat line.

export interface TrendPoint {
  date: string
  pastDue: number
  dueToday: number
  dueTomorrow: number
  due2Plus: number
}

const DAYS = 14

export function trend14Day(records: AuthRecord[], clock: Clock): TrendPoint[] {
  const today = bucketCounts(records, clock)
  const byKey = (key: string) => today.find(b => b.key === key)?.count ?? 0
  const end = {
    pastDue: byKey('past-due'),
    dueToday: byKey('due-today'),
    dueTomorrow: byKey('due-tomorrow'),
    due2Plus: byKey('due-2-plus'),
  }

  const rand = seededRandFrom(`oi-trend-${clock}-${records.length}`)
  const jitter = (v: number) => Math.max(0, Math.round(v * (0.7 + rand() * 0.55)))
  const start = {
    pastDue: jitter(end.pastDue),
    dueToday: jitter(end.dueToday),
    dueTomorrow: jitter(end.dueTomorrow),
    due2Plus: jitter(end.due2Plus),
  }

  const points: TrendPoint[] = []
  for (let i = 0; i < DAYS; i++) {
    const t = i / (DAYS - 1)
    const date = addDays(ANCHOR_DATE, -(DAYS - 1 - i)).toISOString().slice(0, 10)
    if (i === DAYS - 1) {
      points.push({ date, ...end })
      continue
    }
    const interp = (a: number, b: number) => {
      const base = a + (b - a) * t
      const noisy = base * (1 + (rand() - 0.5) * 0.08)
      return Math.max(0, Math.round(noisy))
    }
    points.push({
      date,
      pastDue: interp(start.pastDue, end.pastDue),
      dueToday: interp(start.dueToday, end.dueToday),
      dueTomorrow: interp(start.dueTomorrow, end.dueTomorrow),
      due2Plus: interp(start.due2Plus, end.due2Plus),
    })
  }
  return points
}
