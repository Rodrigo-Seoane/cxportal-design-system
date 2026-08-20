// ── Authoritative dimensions (spec §3) ──────────────────────────────────────

export type Persona = 'Intake' | 'L1' | 'L2' | 'Correspondence'
export const PERSONAS: Persona[] = ['Intake', 'L1', 'L2', 'Correspondence']

export type LineOfBusiness = 'Medicare' | 'Medicaid' | 'Marketplace' | 'Duals' | 'ICHRA'
export const LINES_OF_BUSINESS: LineOfBusiness[] = ['Medicare', 'Medicaid', 'Marketplace', 'Duals', 'ICHRA']

export type TypeOfWork = 'PH' | 'BH'
export const TYPES_OF_WORK: TypeOfWork[] = ['PH', 'BH']
export const TYPE_OF_WORK_LABEL: Record<TypeOfWork, string> = {
  PH: 'Physical Health',
  BH: 'Behavioral Health',
}

export type Urgency = 'Standard' | 'Expedited'
export const URGENCIES: Urgency[] = ['Standard', 'Expedited']

export type AuthType = 'New' | 'Reauth'
export const AUTH_TYPES: AuthType[] = ['New', 'Reauth']

export type MemberPlanType = 'MA' | 'MCO' | 'QHP' | 'PPO' | 'D-SNP'
export const MEMBER_PLAN_TYPES: MemberPlanType[] = ['MA', 'MCO', 'QHP', 'PPO', 'D-SNP']

export type Condition = 'Cardiology' | 'Behavioral Health' | 'Orthopedics' | 'Radiology'
export const CONDITIONS: Condition[] = ['Cardiology', 'Behavioral Health', 'Orthopedics', 'Radiology']

// ── States — full 50 + DC, with weighting for realistic volume skew ─────────

export interface StateDef {
  code: string
  name: string
  /** Relative population weight — bigger states carry proportionally more inventory. */
  weight: number
}

export const ALL_STATES: StateDef[] = [
  { code: 'AL', name: 'Alabama', weight: 3 },
  { code: 'AK', name: 'Alaska', weight: 1 },
  { code: 'AZ', name: 'Arizona', weight: 5 },
  { code: 'AR', name: 'Arkansas', weight: 2 },
  { code: 'CA', name: 'California', weight: 9 },
  { code: 'CO', name: 'Colorado', weight: 4 },
  { code: 'CT', name: 'Connecticut', weight: 2 },
  { code: 'DE', name: 'Delaware', weight: 1 },
  { code: 'DC', name: 'District of Columbia', weight: 1 },
  { code: 'FL', name: 'Florida', weight: 8 },
  { code: 'GA', name: 'Georgia', weight: 6 },
  { code: 'HI', name: 'Hawaii', weight: 1 },
  { code: 'ID', name: 'Idaho', weight: 1 },
  { code: 'IL', name: 'Illinois', weight: 6 },
  { code: 'IN', name: 'Indiana', weight: 3 },
  { code: 'IA', name: 'Iowa', weight: 2 },
  { code: 'KS', name: 'Kansas', weight: 2 },
  { code: 'KY', name: 'Kentucky', weight: 3 },
  { code: 'LA', name: 'Louisiana', weight: 3 },
  { code: 'ME', name: 'Maine', weight: 1 },
  { code: 'MD', name: 'Maryland', weight: 3 },
  { code: 'MA', name: 'Massachusetts', weight: 3 },
  { code: 'MI', name: 'Michigan', weight: 6 },
  { code: 'MN', name: 'Minnesota', weight: 3 },
  { code: 'MS', name: 'Mississippi', weight: 2 },
  { code: 'MO', name: 'Missouri', weight: 3 },
  { code: 'MT', name: 'Montana', weight: 1 },
  { code: 'NE', name: 'Nebraska', weight: 1 },
  { code: 'NV', name: 'Nevada', weight: 2 },
  { code: 'NH', name: 'New Hampshire', weight: 1 },
  { code: 'NJ', name: 'New Jersey', weight: 4 },
  { code: 'NM', name: 'New Mexico', weight: 2 },
  { code: 'NY', name: 'New York', weight: 6 },
  { code: 'NC', name: 'North Carolina', weight: 6 },
  { code: 'ND', name: 'North Dakota', weight: 1 },
  { code: 'OH', name: 'Ohio', weight: 6 },
  { code: 'OK', name: 'Oklahoma', weight: 3 },
  { code: 'OR', name: 'Oregon', weight: 2 },
  { code: 'PA', name: 'Pennsylvania', weight: 6 },
  { code: 'RI', name: 'Rhode Island', weight: 1 },
  { code: 'SC', name: 'South Carolina', weight: 3 },
  { code: 'SD', name: 'South Dakota', weight: 1 },
  { code: 'TN', name: 'Tennessee', weight: 3 },
  { code: 'TX', name: 'Texas', weight: 9 },
  { code: 'UT', name: 'Utah', weight: 2 },
  { code: 'VT', name: 'Vermont', weight: 1 },
  { code: 'VA', name: 'Virginia', weight: 4 },
  { code: 'WA', name: 'Washington', weight: 3 },
  { code: 'WV', name: 'West Virginia', weight: 1 },
  { code: 'WI', name: 'Wisconsin', weight: 3 },
  { code: 'WY', name: 'Wyoming', weight: 1 },
]

export const STATE_BY_CODE: Record<string, StateDef> = Object.fromEntries(
  ALL_STATES.map(s => [s.code, s]),
)

/** The deck's own matrix columns — used for the Persona × State detail-page matrix. */
export const MATRIX_STATE_CODES = ['AL', 'AZ', 'CA', 'CO', 'FL', 'GA', 'IL', 'MI', 'NC', 'OH', 'TX']

/** The deck's own top-10-by-volume table order — used for the dashboard state table. */
export const TOP10_STATE_CODES = ['TX', 'FL', 'GA', 'NC', 'OH', 'IL', 'PA', 'MI', 'NY', 'AZ']

// ── Due-date buckets (spec §4) — the four live buckets + the Total rollup ───

export type DueBucket = 'past-due' | 'due-today' | 'due-tomorrow' | 'due-2-plus'

export interface DueBucketDef {
  key: DueBucket
  label: string
  /** Maps 1:1 onto DataCard `surfaceType`. */
  surfaceType: 'error' | 'warning' | 'info' | 'success'
}

export const DUE_BUCKETS: DueBucketDef[] = [
  { key: 'past-due', label: 'Past Due', surfaceType: 'error' },
  { key: 'due-today', label: 'Due Today', surfaceType: 'warning' },
  { key: 'due-tomorrow', label: 'Due Tomorrow', surfaceType: 'info' },
  { key: 'due-2-plus', label: 'Due 2+ Days', surfaceType: 'success' },
]

export const DUE_BUCKET_BY_KEY: Record<DueBucket, DueBucketDef> = Object.fromEntries(
  DUE_BUCKETS.map(b => [b.key, b]),
) as Record<DueBucket, DueBucketDef>

/** Derives the 4-bucket due status from days-to-due (negative = past due). */
export function dueBucketFromDays(daysToDue: number): DueBucket {
  if (daysToDue < 0) return 'past-due'
  if (daysToDue === 0) return 'due-today'
  if (daysToDue === 1) return 'due-tomorrow'
  return 'due-2-plus'
}

// ── Aging buckets (spec §4) — finer breakdown used only by the Aging table ──

export type AgingBucket = 'Past Due' | 'Due Today' | 'Due Tomorrow' | '2–7 Days' | '8–14 Days' | '15–30 Days' | '31+ Days'

export const AGING_BUCKETS: AgingBucket[] = [
  'Past Due', 'Due Today', 'Due Tomorrow', '2–7 Days', '8–14 Days', '15–30 Days', '31+ Days',
]

export function agingBucketFromDays(daysToDue: number): AgingBucket {
  if (daysToDue < 0) return 'Past Due'
  if (daysToDue === 0) return 'Due Today'
  if (daysToDue === 1) return 'Due Tomorrow'
  if (daysToDue <= 7) return '2–7 Days'
  if (daysToDue <= 14) return '8–14 Days'
  if (daysToDue <= 30) return '15–30 Days'
  return '31+ Days'
}

// ── Fixed "today" anchor ─────────────────────────────────────────────────────
// Keeps every bucket assignment deterministic across reloads/screenshots —
// the dataset's notion of "today" never drifts with the wall clock.

export const ANCHOR_DATE = new Date('2026-08-19T00:00:00Z')

export function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

// ── Deterministic PRNG — shared by the generator, trend, and matrix modules ─
// No Math.random(): the same seed always yields the same numbers, so every
// reload and every screenshot shows an identical dataset.

export function seededRandFrom(seed: string) {
  let s = seed.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 1)
  return () => {
    s = (s * 1664525 + 1013904223) | 0
    return ((s >>> 0) + 0.5) / 0x100000000
  }
}
