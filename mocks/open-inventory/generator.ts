import {
  PERSONAS, LINES_OF_BUSINESS, TYPES_OF_WORK, URGENCIES, AUTH_TYPES,
  MEMBER_PLAN_TYPES, CONDITIONS, ALL_STATES, ANCHOR_DATE, addDays, seededRandFrom,
  type Persona, type LineOfBusiness, type TypeOfWork, type Urgency,
  type AuthType, type MemberPlanType, type Condition,
} from './taxonomy'

type Rand = () => number

function weightedPick<T>(rand: Rand, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rand() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function randInt(rand: Rand, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

// ── Due-offset distributions ─────────────────────────────────────────────────
// Category weights sum to 100. SLA is intentionally tighter than TAT — the
// same population runs closer to breach against the internal clock than the
// regulatory one, which is the whole point of tracking both.

interface OffsetBand { min: number; max: number; weight: number }

const TAT_BANDS: OffsetBand[] = [
  { min: -30, max: -1, weight: 8 },
  { min: 0, max: 0, weight: 4 },
  { min: 1, max: 1, weight: 4 },
  { min: 2, max: 7, weight: 20 },
  { min: 8, max: 14, weight: 20 },
  { min: 15, max: 30, weight: 24 },
  { min: 31, max: 75, weight: 20 },
]

const SLA_BANDS: OffsetBand[] = [
  { min: -20, max: -1, weight: 14 },
  { min: 0, max: 0, weight: 6 },
  { min: 1, max: 1, weight: 6 },
  { min: 2, max: 7, weight: 24 },
  { min: 8, max: 14, weight: 20 },
  { min: 15, max: 30, weight: 18 },
  { min: 31, max: 60, weight: 12 },
]

function pickOffset(rand: Rand, bands: OffsetBand[]): number {
  const band = weightedPick(rand, bands, bands.map(b => b.weight))
  return randInt(rand, band.min, band.max)
}

// ── Record shape ──────────────────────────────────────────────────────────────

export interface AuthRecord {
  id: string
  persona: Persona
  lob: LineOfBusiness
  stateCode: string
  typeOfWork: TypeOfWork
  urgency: Urgency
  authType: AuthType
  planType: MemberPlanType
  condition: Condition
  currentQueue: string
  createdAt: Date
  tatDueDate: Date
  slaDueDate: Date
}

const RECORD_COUNT = 12000

function generateAuthRecords(): AuthRecord[] {
  const rand = seededRandFrom('open-inventory-v1')
  const records: AuthRecord[] = []

  const stateWeights = ALL_STATES.map(s => s.weight)

  for (let i = 0; i < RECORD_COUNT; i++) {
    const persona = weightedPick(rand, PERSONAS, [35, 30, 20, 15])
    const lob = weightedPick(rand, LINES_OF_BUSINESS, [35, 30, 20, 10, 5])
    const state = weightedPick(rand, ALL_STATES, stateWeights)
    const typeOfWork = weightedPick(rand, TYPES_OF_WORK, [70, 30])
    const urgency = weightedPick(rand, URGENCIES, [85, 15])
    const authType = weightedPick(rand, AUTH_TYPES, [55, 45])
    const planType = MEMBER_PLAN_TYPES[randInt(rand, 0, MEMBER_PLAN_TYPES.length - 1)]
    const condition = CONDITIONS[randInt(rand, 0, CONDITIONS.length - 1)]

    const createdDaysAgo = randInt(rand, 1, 60)
    const createdAt = addDays(ANCHOR_DATE, -createdDaysAgo)

    const tatDueDate = addDays(ANCHOR_DATE, pickOffset(rand, TAT_BANDS))
    const slaDueDate = addDays(ANCHOR_DATE, pickOffset(rand, SLA_BANDS))

    records.push({
      id: `AUTH-${(100000 + i).toString()}`,
      persona,
      lob,
      stateCode: state.code,
      typeOfWork,
      urgency,
      authType,
      planType,
      condition,
      currentQueue: `${persona} — ${lob}`,
      createdAt,
      tatDueDate,
      slaDueDate,
    })
  }

  return records
}

/** One canonical dataset — every tile, chart, and table derives from this by aggregation. */
export const AUTH_RECORDS: AuthRecord[] = generateAuthRecords()
