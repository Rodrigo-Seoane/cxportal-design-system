import type { AuthRecord } from './generator'
import { MATRIX_STATE_CODES, type Persona, type LineOfBusiness, type DueBucket } from './taxonomy'
import { dueBucketFor, type Clock } from './aggregations'

// ── Persona × State matrix (spec §6.2) ──────────────────────────────────────
// "Persona w/ Sub of LOB": each persona row expands into one sub-row per LOB.
// Cell shade = the highest-risk due bucket PRESENT in the cell (any Past Due
// beats a majority of Due 2+ Days) — a worst-case read, not a majority vote,
// which is what an ops matrix needs to surface.

// Ranked most-severe first so the first present bucket wins.
const SEVERITY_ORDER: DueBucket[] = ['past-due', 'due-today', 'due-tomorrow', 'due-2-plus']

export interface MatrixCell {
  total: number
  dominantBucket: DueBucket | null
}

export interface MatrixSubRow {
  lob: LineOfBusiness
  cells: MatrixCell[]
  rowTotal: MatrixCell
}

export interface MatrixRow {
  persona: Persona
  cells: MatrixCell[]
  rowTotal: MatrixCell
  subRows: MatrixSubRow[]
}

export interface MatrixResult {
  stateCodes: string[]
  rows: MatrixRow[]
  totalRow: { cells: MatrixCell[]; grandTotal: MatrixCell }
}

function cellFor(records: AuthRecord[], clock: Clock): MatrixCell {
  if (records.length === 0) return { total: 0, dominantBucket: null }
  const present = new Set(records.map(r => dueBucketFor(r, clock)))
  const dominant = SEVERITY_ORDER.find(b => present.has(b)) ?? null
  return { total: records.length, dominantBucket: dominant }
}

export function personaStateMatrix(
  records: AuthRecord[],
  clock: Clock,
  personas: Persona[],
  lobs: LineOfBusiness[],
  stateCodes: string[] = MATRIX_STATE_CODES,
): MatrixResult {
  const rows: MatrixRow[] = personas.map(persona => {
    const personaRecs = records.filter(r => r.persona === persona)

    const subRows: MatrixSubRow[] = lobs.map(lob => {
      const subRecs = personaRecs.filter(r => r.lob === lob)
      const cells = stateCodes.map(code => cellFor(subRecs.filter(r => r.stateCode === code), clock))
      return { lob, cells, rowTotal: cellFor(subRecs, clock) }
    })

    const cells = stateCodes.map(code => cellFor(personaRecs.filter(r => r.stateCode === code), clock))
    return { persona, cells, rowTotal: cellFor(personaRecs, clock), subRows }
  })

  const totalCells = stateCodes.map(code => cellFor(records.filter(r => r.stateCode === code), clock))
  const grandTotal = cellFor(records, clock)

  return { stateCodes, rows, totalRow: { cells: totalCells, grandTotal } }
}
