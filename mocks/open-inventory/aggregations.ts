import type { AuthRecord } from './generator'
import {
  ANCHOR_DATE, DUE_BUCKETS, dueBucketFromDays, agingBucketFromDays,
  AGING_BUCKETS, STATE_BY_CODE, TOP10_STATE_CODES,
  type DueBucket, type AgingBucket, type Persona, type LineOfBusiness,
} from './taxonomy'

export type Clock = 'tat' | 'sla'

// ── Filters — compose with AND across dimensions ─────────────────────────────

export interface FilterState {
  personas: Persona[]
  lobs: LineOfBusiness[]
  states: string[]
  typesOfWork: ('PH' | 'BH')[]
  urgencies: ('Standard' | 'Expedited')[]
}

export const EMPTY_FILTERS: FilterState = {
  personas: [],
  lobs: [],
  states: [],
  typesOfWork: [],
  urgencies: [],
}

export function filterRecords(records: AuthRecord[], filters: FilterState): AuthRecord[] {
  return records.filter(r =>
    (filters.personas.length === 0 || filters.personas.includes(r.persona)) &&
    (filters.lobs.length === 0 || filters.lobs.includes(r.lob)) &&
    (filters.states.length === 0 || filters.states.includes(r.stateCode)) &&
    (filters.typesOfWork.length === 0 || filters.typesOfWork.includes(r.typeOfWork)) &&
    (filters.urgencies.length === 0 || filters.urgencies.includes(r.urgency)),
  )
}

// ── Per-record clock resolution ───────────────────────────────────────────────

export function dueDateFor(record: AuthRecord, clock: Clock): Date {
  return clock === 'tat' ? record.tatDueDate : record.slaDueDate
}

export function daysToDue(record: AuthRecord, clock: Clock, asOf: Date = ANCHOR_DATE): number {
  const due = dueDateFor(record, clock)
  return Math.round((due.getTime() - asOf.getTime()) / 86_400_000)
}

export function dueBucketFor(record: AuthRecord, clock: Clock): DueBucket {
  return dueBucketFromDays(daysToDue(record, clock))
}

export function agingBucketFor(record: AuthRecord, clock: Clock): AgingBucket {
  return agingBucketFromDays(daysToDue(record, clock))
}

// ── Due-bucket rollup — the KPI bands, donuts, and footer legend all read this ─

export interface BucketCount {
  key: DueBucket
  label: string
  surfaceType: 'error' | 'warning' | 'info' | 'success'
  count: number
  pct: number
}

export function bucketCounts(records: AuthRecord[], clock: Clock): BucketCount[] {
  const total = records.length
  const counts = new Map<DueBucket, number>(DUE_BUCKETS.map(b => [b.key, 0]))
  for (const r of records) {
    const key = dueBucketFor(r, clock)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return DUE_BUCKETS.map(b => ({
    key: b.key,
    label: b.label,
    surfaceType: b.surfaceType,
    count: counts.get(b.key) ?? 0,
    pct: total === 0 ? 0 : ((counts.get(b.key) ?? 0) / total) * 100,
  }))
}

export function atRiskPct(records: AuthRecord[], clock: Clock): number {
  if (records.length === 0) return 0
  const atRisk = records.filter(r => {
    const b = dueBucketFor(r, clock)
    return b === 'past-due' || b === 'due-today'
  }).length
  return (atRisk / records.length) * 100
}

// ── Aging table ────────────────────────────────────────────────────────────

export interface AgingRow {
  bucket: AgingBucket
  count: number
  pct: number
}

export function agingRows(records: AuthRecord[], clock: Clock): AgingRow[] {
  const total = records.length
  const counts = new Map<AgingBucket, number>(AGING_BUCKETS.map(b => [b, 0]))
  for (const r of records) {
    const b = agingBucketFor(r, clock)
    counts.set(b, (counts.get(b) ?? 0) + 1)
  }
  return AGING_BUCKETS.map(bucket => ({
    bucket,
    count: counts.get(bucket) ?? 0,
    pct: total === 0 ? 0 : ((counts.get(bucket) ?? 0) / total) * 100,
  }))
}

// ── By Line of Business table ─────────────────────────────────────────────────

export interface LobRow {
  lob: LineOfBusiness
  total: number
  pctOfTotal: number
  pastDuePct: number
}

export function byLobRows(records: AuthRecord[], clock: Clock): LobRow[] {
  const grandTotal = records.length
  const byLob = new Map<LineOfBusiness, AuthRecord[]>()
  for (const r of records) {
    const list = byLob.get(r.lob) ?? []
    list.push(r)
    byLob.set(r.lob, list)
  }
  return Array.from(byLob.entries()).map(([lob, recs]) => {
    const pastDue = recs.filter(r => dueBucketFor(r, clock) === 'past-due').length
    return {
      lob,
      total: recs.length,
      pctOfTotal: grandTotal === 0 ? 0 : (recs.length / grandTotal) * 100,
      pastDuePct: recs.length === 0 ? 0 : (pastDue / recs.length) * 100,
    }
  }).sort((a, b) => b.total - a.total)
}

// ── By State table (top 10) ───────────────────────────────────────────────────

export interface StateRow {
  code: string
  name: string
  total: number
  pastDuePct: number
}

export function byStateRows(records: AuthRecord[], clock: Clock, codes: string[] = TOP10_STATE_CODES): StateRow[] {
  return codes.map(code => {
    const recs = records.filter(r => r.stateCode === code)
    const pastDue = recs.filter(r => dueBucketFor(r, clock) === 'past-due').length
    return {
      code,
      name: STATE_BY_CODE[code]?.name ?? code,
      total: recs.length,
      pastDuePct: recs.length === 0 ? 0 : (pastDue / recs.length) * 100,
    }
  })
}

// ── By Persona — stacked bucket composition per persona ───────────────────────

export interface PersonaRow {
  persona: Persona
  total: number
  buckets: BucketCount[]
}

export function personaRows(records: AuthRecord[], clock: Clock, personas: Persona[]): PersonaRow[] {
  return personas.map(persona => {
    const recs = records.filter(r => r.persona === persona)
    return { persona, total: recs.length, buckets: bucketCounts(recs, clock) }
  })
}

// ── PH / BH split ──────────────────────────────────────────────────────────

export function phBhSplit(records: AuthRecord[]): { name: string; value: number }[] {
  const ph = records.filter(r => r.typeOfWork === 'PH').length
  const bh = records.length - ph
  return [
    { name: 'Physical Health', value: ph },
    { name: 'Behavioral Health', value: bh },
  ]
}

// ── Row-level drillthrough table ──────────────────────────────────────────────

export interface DetailRow {
  id: string
  lob: LineOfBusiness
  stateCode: string
  planType: string
  typeOfWork: string
  urgency: string
  persona: Persona
  currentQueue: string
  dueDate: Date
  daysToDue: number
  agingBucket: AgingBucket
  atRisk: boolean
  authType: string
  condition: string
  createdAt: Date
}

export function detailRows(records: AuthRecord[], clock: Clock): DetailRow[] {
  return records.map(r => {
    const days = daysToDue(r, clock)
    const bucket = dueBucketFromDays(days)
    return {
      id: r.id,
      lob: r.lob,
      stateCode: r.stateCode,
      planType: r.planType,
      typeOfWork: r.typeOfWork,
      urgency: r.urgency,
      persona: r.persona,
      currentQueue: r.currentQueue,
      dueDate: dueDateFor(r, clock),
      daysToDue: days,
      agingBucket: agingBucketFromDays(days),
      atRisk: bucket === 'past-due' || bucket === 'due-today',
      authType: r.authType,
      condition: r.condition,
      createdAt: r.createdAt,
    }
  })
}
