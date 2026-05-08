/**
 * Focus order: filter → status chips → search → sort/density → first row → kebab → scorecard link
 * Keyboard: arrow keys move rows; Enter → scorecard; M → kebab on focused row
 * ARIA live region: polite announcement on agent status change
 * Pills: text + color + icon, never color alone
 * Density-Comfortable: kebab target ≥ 44px; Compact: 44px height maintained on kebab only
 * Reduced-motion: row highlight transition disabled
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  ArrowClockwiseIcon, HouseIcon, CaretRightIcon,
  FloppyDiskIcon, MagnifyingGlassIcon, RowsIcon,
} from '@phosphor-icons/react'

import { WFMContext, INITIAL_KPI, INITIAL_DELTAS, INITIAL_ALERTS, DEFAULT_SCOPE, AGENT_BANK, INITIAL_SAVED_VIEWS } from '@/mocks/wfm/store'
import type { ForceState, Role, WFMStore, SavedView } from '@/mocks/wfm/store'

import { HierarchyFilter } from '@/components/wfm/HierarchyFilter'
import { DegradedSourceBanner } from '@/components/wfm/DegradedSourceBanner'
import { RoleSwitcher } from '@/components/wfm/RoleSwitcher'
import { ForceStateTool } from '@/components/wfm/ForceStateTool'
import { ScopeGate } from './ScopeGate'
import { AgentTable } from './AgentTable'
import type { SortField, Density } from './AgentTable'

// ── Status filter chips ────────────────────────────────────────────────────────

const STATUS_CHIPS = ['Available', 'On Call', 'Aux', 'Offline', 'Time Off', 'Out of Adherence', 'Pending']

// ── Inner page (needs Suspense for useSearchParams) ────────────────────────────

function AgentStatusSummaryInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // ── Store state ────────────────────────────────────────────────────────────
  const [role, setRoleRaw]          = useState<Role>('supervisor')
  const [forceState, setForceState]  = useState<ForceState>('data')
  const [lastUpdated, setLastUpdated]= useState(new Date())
  const [savedViews, setSavedViews]  = useState<SavedView[]>(INITIAL_SAVED_VIEWS)
  const [savedViewsOpen, setSavedViewsOpen] = useState(false)

  const setRole = (r: Role) => setRoleRaw(r)
  const defaultStaffingGroupId = DEFAULT_SCOPE[role]

  // ── Filter state from URL ──────────────────────────────────────────────────
  const staffingGroupIds = searchParams.get('sg')?.split(',').filter(Boolean) ?? []
  const forecastGroupIds = searchParams.get('fg')?.split(',').filter(Boolean) ?? []
  const statusParam      = searchParams.get('status')?.split(',').filter(Boolean) ?? []

  // ── Local state ────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string[]>(statusParam)
  const [search, setSearch]             = useState('')
  const [sortField, setSortField]       = useState<SortField>('adherence')
  const [density, setDensity]           = useState<Density>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('wfm-density') as Density) ?? 'comfortable'
    }
    return 'comfortable'
  })

  const hasScope = staffingGroupIds.length > 0 || forecastGroupIds.length > 0

  // ── Sync status chips to URL ───────────────────────────────────────────────
  const toggleStatus = (chip: string) => {
    const next = statusFilter.includes(chip)
      ? statusFilter.filter(s => s !== chip)
      : [...statusFilter, chip]
    setStatusFilter(next)
    const p = new URLSearchParams(searchParams)
    if (next.length) p.set('status', next.join(','))
    else p.delete('status')
    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
  }

  // ── Saved views ────────────────────────────────────────────────────────────
  const applyView = (view: SavedView) => {
    const p = new URLSearchParams(searchParams)
    if (view.staffingGroupIds.length) p.set('sg', view.staffingGroupIds.join(','))
    else p.delete('sg')
    if (view.forecastGroupIds.length) p.set('fg', view.forecastGroupIds.join(','))
    else p.delete('fg')
    if (view.statusFilter.length) p.set('status', view.statusFilter.join(','))
    else p.delete('status')
    setStatusFilter(view.statusFilter)
    setSortField(view.sortField as SortField)
    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
    setSavedViewsOpen(false)
  }

  const saveCurrentView = () => {
    const label = prompt('Name this view:')
    if (!label) return
    const view: SavedView = {
      id:              `sv-${Date.now()}`,
      label,
      staffingGroupIds,
      forecastGroupIds,
      statusFilter,
      sortField,
    }
    setSavedViews(prev => [...prev, view])
  }

  // ── Density persistence ────────────────────────────────────────────────────
  const toggleDensity = () => {
    const next: Density = density === 'comfortable' ? 'compact' : 'comfortable'
    setDensity(next)
    localStorage.setItem('wfm-density', next)
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'r') setLastUpdated(new Date())
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const isDegraded  = forceState === 'degraded'
  const filterParams = searchParams.toString()
  const showInactivityBanner = statusFilter.includes('Inactivity Detected')

  const store: WFMStore = {
    forecastGroups: [], staffingGroups: [], agents: AGENT_BANK, queues: [],
    kpiValues: INITIAL_KPI, kpiDeltas: INITIAL_DELTAS, activeAlerts: INITIAL_ALERTS,
    lastUpdated, forceState, role, defaultStaffingGroupId, setForceState, setRole,
  }

  return (
    <WFMContext.Provider value={store}>
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-display)', fontFamily: 'var(--font-sans)' }}>

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 24px', height: 64,
          background: '#ffffff', borderBottom: '1px solid #e2e5e8',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
            <HouseIcon size={14} color="#7a828c" weight="regular" aria-hidden="true" />
            <span style={{ fontSize: 12, color: '#7a828c' }}>Reporting</span>
            <CaretRightIcon size={12} color="#aab0b8" weight="regular" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#021920', whiteSpace: 'nowrap' }}>
              Agent Status Summary
            </span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Saved views */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setSavedViewsOpen(o => !o)} style={headerBtn}>
                <FloppyDiskIcon size={14} weight="regular" aria-hidden="true" />
                Saved views
              </button>
              {savedViewsOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                  background: '#ffffff', border: '1px solid #e2e5e8', borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(2,25,32,0.12)', minWidth: 240, zIndex: 9999, overflow: 'hidden',
                }}>
                  {savedViews.map(v => (
                    <button key={v.id} onClick={() => applyView(v)} style={dropdownItem}>
                      {v.label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid #eff1f3', padding: 4 }}>
                    <button onClick={saveCurrentView} style={{ ...dropdownItem, color: '#4285f4' }}>
                      + Save current view
                    </button>
                  </div>
                </div>
              )}
            </div>
            <ForceStateTool />
            <RoleSwitcher />
            <button onClick={() => setLastUpdated(new Date())} aria-label="Refresh (r)" style={iconBtn}>
              <ArrowClockwiseIcon size={16} weight="regular" />
            </button>
          </div>
        </header>

        {/* ── Hierarchy filter ─────────────────────────────────────────────── */}
        <Suspense>
          <HierarchyFilter mode="top-bar" defaultRange="live" />
        </Suspense>

        {/* ── Status chip row ──────────────────────────────────────────────── */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e5e8', padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7a828c', textTransform: 'uppercase', letterSpacing: '0.4px', marginRight: 4 }}>Status</span>
          {STATUS_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => toggleStatus(chip)}
              aria-pressed={statusFilter.includes(chip)}
              style={{
                padding:     '4px 10px',
                borderRadius: 64,
                border:      `1px solid ${statusFilter.includes(chip) ? '#4285f4' : '#d9dce0'}`,
                background:   statusFilter.includes(chip) ? '#d6e2f5' : '#ffffff',
                cursor:      'pointer',
                fontSize:     12,
                fontWeight:   statusFilter.includes(chip) ? 600 : 400,
                color:        statusFilter.includes(chip) ? '#1a3561' : '#021920',
                fontFamily:  'var(--font-sans)',
                transition:  'all 120ms ease',
              }}
            >
              {chip}
            </button>
          ))}
          {statusFilter.length > 0 && (
            <button
              onClick={() => { setStatusFilter([]); const p = new URLSearchParams(searchParams); p.delete('status'); router.replace(`${pathname}?${p.toString()}`, { scroll: false }) }}
              style={{ fontSize: 11, color: '#4285f4', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Degraded banner ──────────────────────────────────────────────── */}
        {isDegraded && (
          <DegradedSourceBanner
            cachedAt={lastUpdated}
            onRetry={() => { setForceState('data'); setLastUpdated(new Date()) }}
          />
        )}

        {/* ── Inactivity design-only banner ────────────────────────────────── */}
        {showInactivityBanner && (
          <div role="alert" style={{ background: '#fbeed8', borderBottom: '1px solid #f7ddb1', padding: '8px 24px', fontSize: 13, color: '#7a4a00', fontFamily: 'var(--font-sans)' }}>
            ⚡ Inactivity-detected sources are <strong>design-only</strong>. Implementation is scoped to a future SOW per §e.
          </div>
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {!hasScope ? (
            <div style={panelCard}>
              <ScopeGate />
            </div>
          ) : (
            <>
              {/* Sort + search + density toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px solid #d9dce0', borderRadius: 6, background: '#ffffff', flex: '0 0 240px' }}>
                  <MagnifyingGlassIcon size={14} color="#7a828c" weight="regular" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search agents…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Search agents by name"
                    style={{ border: 'none', outline: 'none', fontSize: 13, color: '#021920', background: 'transparent', fontFamily: 'var(--font-sans)', width: '100%' }}
                  />
                </div>

                {/* Sort field */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#7a828c' }}>Sort:</span>
                  {(['adherence', 'name', 'duration'] as SortField[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setSortField(f)}
                      style={{
                        padding:     '4px 10px',
                        borderRadius: 6,
                        border:      `1px solid ${sortField === f ? '#4285f4' : '#d9dce0'}`,
                        background:   sortField === f ? '#f0f4fb' : '#ffffff',
                        cursor:      'pointer',
                        fontSize:     12,
                        fontWeight:   sortField === f ? 600 : 400,
                        color:        sortField === f ? '#1a3561' : '#021920',
                        fontFamily:  'var(--font-sans)',
                      }}
                    >
                      {f === 'adherence' ? 'Out of adherence first' : f === 'name' ? 'Name A–Z' : 'Duration'}
                    </button>
                  ))}
                </div>

                {/* Density */}
                <button
                  onClick={toggleDensity}
                  title={`Switch to ${density === 'comfortable' ? 'compact' : 'comfortable'} density`}
                  style={{ ...iconBtn, marginLeft: 'auto' }}
                >
                  <RowsIcon size={16} weight="regular" aria-hidden="true" />
                </button>
              </div>

              {/* Table */}
              <div style={panelCard}>
                <AgentTable
                  forceState={forceState}
                  staffingGroupIds={staffingGroupIds}
                  forecastGroupIds={forecastGroupIds}
                  statusFilter={statusFilter}
                  search={search}
                  sortField={sortField}
                  onSortChange={setSortField}
                  density={density}
                  filterParams={filterParams}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </WFMContext.Provider>
  )
}

export default function AgentStatusSummaryPage() {
  return <Suspense><AgentStatusSummaryInner /></Suspense>
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const headerBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 14px', borderRadius: 6, border: '1px solid #d9dce0',
  background: '#ffffff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
  color: '#021920', fontFamily: 'var(--font-sans)', minHeight: 44,
}

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 44, height: 44, borderRadius: 6, border: '1px solid #d9dce0',
  background: '#ffffff', cursor: 'pointer', color: '#7a828c',
}

const panelCard: React.CSSProperties = {
  background: '#ffffff', borderRadius: 8, border: '1px solid #e2e5e8', padding: '20px',
}

const dropdownItem: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
  border: 'none', background: 'transparent', cursor: 'pointer',
  fontSize: 13, color: '#021920', fontFamily: 'var(--font-sans)',
}

export const dynamic = 'force-dynamic'
