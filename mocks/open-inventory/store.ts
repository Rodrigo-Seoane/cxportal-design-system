'use client'

import { createContext, useContext } from 'react'
import { AUTH_RECORDS, type AuthRecord } from './generator'
import { EMPTY_FILTERS, type FilterState } from './aggregations'

// ── Types ──────────────────────────────────────────────────────────────────

export type ForceState = 'data' | 'loading' | 'empty' | 'error' | 'partial' | 'degraded'

export type Role = 'executive' | 'operational'

export interface OpenInventoryStore {
  records: AuthRecord[]
  filters: FilterState
  setFilters: (f: FilterState) => void
  forceState: ForceState
  setForceState: (s: ForceState) => void
  role: Role
  setRole: (r: Role) => void
  lastUpdated: Date
  setLastUpdated: (d: Date) => void
}

export const OpenInventoryContext = createContext<OpenInventoryStore | null>(null)

export function useOpenInventoryStore(): OpenInventoryStore {
  const ctx = useContext(OpenInventoryContext)
  if (!ctx) throw new Error('useOpenInventoryStore must be used inside OpenInventoryContext.Provider')
  return ctx
}

export { AUTH_RECORDS, EMPTY_FILTERS }
export type { AuthRecord, FilterState }

// ── Saved filter sets — local-only persistence (spec §5) ───────────────────

const STORAGE_KEY = 'open-inventory-saved-filter-sets'

export interface SavedFilterSet {
  id: string
  label: string
  filters: FilterState
}

function readSavedSets(): SavedFilterSet[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedFilterSet[]) : []
  } catch {
    return []
  }
}

function writeSavedSets(sets: SavedFilterSet[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
}

export function listSavedFilterSets(): SavedFilterSet[] {
  return readSavedSets()
}

export function saveFilterSet(label: string, filters: FilterState): SavedFilterSet[] {
  const sets = readSavedSets()
  const next: SavedFilterSet = { id: `oi-fs-${Date.now()}`, label, filters }
  const updated = [...sets, next]
  writeSavedSets(updated)
  return updated
}

export function renameFilterSet(id: string, label: string): SavedFilterSet[] {
  const updated = readSavedSets().map(s => (s.id === id ? { ...s, label } : s))
  writeSavedSets(updated)
  return updated
}

export function deleteFilterSet(id: string): SavedFilterSet[] {
  const updated = readSavedSets().filter(s => s.id !== id)
  writeSavedSets(updated)
  return updated
}
