// ── US tile-grid cartogram layout ───────────────────────────────────────────
// Grid-cartogram fallback for the state heat map (spec §9) — no real SVG path
// geometry was sourced (would require a new mapping dependency or fabricated
// paths, both explicitly disallowed), so every state renders as an
// equal-size tile arranged in a US-shaped grid instead. Rows increase
// south, columns increase east; AK and HI sit in the conventional bottom-left
// inset position used by most published tile-grid maps.

export interface GridPosition {
  row: number
  col: number
}

export const US_GRID_POSITIONS: Record<string, GridPosition> = {
  AK: { row: 7, col: 0 },
  HI: { row: 7, col: 1 },

  WA: { row: 0, col: 0 },
  OR: { row: 1, col: 0 },
  CA: { row: 2, col: 0 },

  ID: { row: 1, col: 1 },
  NV: { row: 2, col: 1 },
  AZ: { row: 3, col: 1 },

  MT: { row: 0, col: 2 },
  WY: { row: 1, col: 2 },
  UT: { row: 2, col: 2 },
  NM: { row: 3, col: 2 },

  ND: { row: 0, col: 3 },
  SD: { row: 1, col: 3 },
  CO: { row: 2, col: 3 },
  OK: { row: 3, col: 3 },
  TX: { row: 4, col: 3 },

  MN: { row: 0, col: 4 },
  IA: { row: 1, col: 4 },
  NE: { row: 2, col: 4 },
  KS: { row: 3, col: 4 },
  AR: { row: 4, col: 4 },
  LA: { row: 5, col: 4 },

  WI: { row: 0, col: 5 },
  IL: { row: 1, col: 5 },
  MO: { row: 2, col: 5 },
  MS: { row: 4, col: 5 },

  MI: { row: 0, col: 6 },
  IN: { row: 1, col: 6 },
  KY: { row: 2, col: 6 },
  TN: { row: 3, col: 6 },
  AL: { row: 4, col: 6 },

  OH: { row: 1, col: 7 },
  WV: { row: 2, col: 7 },
  GA: { row: 4, col: 7 },
  FL: { row: 5, col: 7 },

  NY: { row: 0, col: 8 },
  PA: { row: 1, col: 8 },
  VA: { row: 2, col: 8 },
  NC: { row: 3, col: 7 },
  SC: { row: 4, col: 8 },

  VT: { row: 0, col: 9 },
  NJ: { row: 1, col: 9 },
  MD: { row: 2, col: 9 },
  DC: { row: 3, col: 9 },

  NH: { row: 0, col: 10 },
  CT: { row: 1, col: 10 },
  DE: { row: 2, col: 10 },

  ME: { row: 0, col: 11 },
  MA: { row: 1, col: 11 },
  RI: { row: 1, col: 12 },
}

export const GRID_ROWS = 8
export const GRID_COLS = 13
