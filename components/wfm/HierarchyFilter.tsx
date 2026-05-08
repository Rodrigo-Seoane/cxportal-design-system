'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { MagnifyingGlassIcon, XIcon, FunnelIcon } from '@phosphor-icons/react'
import { FORECAST_GROUPS, STAFFING_GROUPS, QUEUES, useWFMStore } from '@/mocks/wfm/store'

const TIME_PRESETS = [
  { value: 'live',    label: 'Live' },
  { value: 'last-1h', label: 'Last hour' },
  { value: 'today',   label: 'Today' },
  { value: 'last-7d', label: 'Last 7 days' },
  { value: 'last-30d',label: 'Last 30 days' },
  { value: 'last-90d',label: 'Last 90 days' },
  { value: 'qtd',     label: 'Quarter to date' },
]

export type FilterMode = 'top-bar' | 'left-rail'

export interface FilterValue {
  forecastGroupIds: string[]
  staffingGroupIds: string[]
  queueIds: string[]
  timeRange: string
}

export interface HierarchyFilterProps {
  mode?: FilterMode
  defaultRange?: string
  value?: FilterValue
  onChange?: (v: FilterValue) => void
}

const EMPTY_FILTER: FilterValue = {
  forecastGroupIds: [],
  staffingGroupIds: [],
  queueIds:         [],
  timeRange:        'live',
}

function parseFromParams(params: URLSearchParams): FilterValue {
  return {
    forecastGroupIds: params.get('fg')?.split(',').filter(Boolean) ?? [],
    staffingGroupIds: params.get('sg')?.split(',').filter(Boolean) ?? [],
    queueIds:         params.get('q')?.split(',').filter(Boolean)  ?? [],
    timeRange:        params.get('range') ?? 'live',
  }
}

function writeToParams(v: FilterValue, params: URLSearchParams) {
  const next = new URLSearchParams(params)
  if (v.forecastGroupIds.length) next.set('fg', v.forecastGroupIds.join(','))
  else next.delete('fg')
  if (v.staffingGroupIds.length) next.set('sg', v.staffingGroupIds.join(','))
  else next.delete('sg')
  if (v.queueIds.length) next.set('q', v.queueIds.join(','))
  else next.delete('q')
  next.set('range', v.timeRange)
  return next
}

type DropdownKey = 'fg' | 'sg' | 'queue' | 'time' | null

export function HierarchyFilter({ mode = 'top-bar', defaultRange = 'live', onChange }: HierarchyFilterProps) {
  const { role, defaultStaffingGroupId } = useWFMStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [filter, setFilter] = useState<FilterValue>(() => {
    const fromUrl = parseFromParams(searchParams)
    if (!fromUrl.forecastGroupIds.length && !fromUrl.staffingGroupIds.length) {
      // Apply role default on mount
      if (role === 'supervisor' && defaultStaffingGroupId) {
        return { ...EMPTY_FILTER, timeRange: defaultRange, staffingGroupIds: [defaultStaffingGroupId] }
      }
    }
    return { ...fromUrl, timeRange: fromUrl.timeRange || defaultRange }
  })

  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null)
  const [fgSearch, setFgSearch] = useState('')

  const update = useCallback((next: FilterValue) => {
    setFilter(next)
    onChange?.(next)
    const params = writeToParams(next, searchParams)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [onChange, searchParams, router, pathname])

  // Reset to role default when role changes
  useEffect(() => {
    if (role === 'supervisor' && defaultStaffingGroupId) {
      update({ ...EMPTY_FILTER, timeRange: filter.timeRange, staffingGroupIds: [defaultStaffingGroupId] })
    } else if (role === 'wfm-lead' || role === 'admin') {
      update({ ...filter, staffingGroupIds: [], forecastGroupIds: [] })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  const toggleFG = (id: string) => {
    const next = filter.forecastGroupIds.includes(id)
      ? filter.forecastGroupIds.filter(x => x !== id)
      : [...filter.forecastGroupIds, id]
    update({ ...filter, forecastGroupIds: next, staffingGroupIds: [] })
  }

  const toggleSG = (id: string) => {
    const next = filter.staffingGroupIds.includes(id)
      ? filter.staffingGroupIds.filter(x => x !== id)
      : [...filter.staffingGroupIds, id]
    update({ ...filter, staffingGroupIds: next })
  }

  const toggleQueue = (id: string) => {
    const next = filter.queueIds.includes(id)
      ? filter.queueIds.filter(x => x !== id)
      : [...filter.queueIds, id]
    update({ ...filter, queueIds: next })
  }

  const clearAll = () => update({ ...EMPTY_FILTER, timeRange: filter.timeRange })

  const activeSGs = filter.forecastGroupIds.length > 0
    ? STAFFING_GROUPS.filter(sg => filter.forecastGroupIds.includes(sg.forecastGroupId))
    : STAFFING_GROUPS

  const visibleFGs = fgSearch
    ? FORECAST_GROUPS.filter(fg => fg.label.toLowerCase().includes(fgSearch.toLowerCase()))
    : FORECAST_GROUPS

  const chips: { label: string; key: string; onRemove: () => void }[] = [
    ...filter.forecastGroupIds.map(id => ({
      key: id, label: FORECAST_GROUPS.find(f => f.id === id)?.label ?? id,
      onRemove: () => update({ ...filter, forecastGroupIds: filter.forecastGroupIds.filter(x => x !== id), staffingGroupIds: [] }),
    })),
    ...filter.staffingGroupIds.map(id => ({
      key: id, label: STAFFING_GROUPS.find(s => s.id === id)?.label ?? id,
      onRemove: () => update({ ...filter, staffingGroupIds: filter.staffingGroupIds.filter(x => x !== id) }),
    })),
    ...filter.queueIds.map(id => ({
      key: id, label: QUEUES.find(q => q.id === id)?.label ?? id,
      onRemove: () => update({ ...filter, queueIds: filter.queueIds.filter(x => x !== id) }),
    })),
  ]

  const currentPreset = TIME_PRESETS.find(t => t.value === filter.timeRange)?.label ?? filter.timeRange

  return (
    <div
      style={{
        background:   '#ffffff',
        borderBottom: '1px solid #e2e5e8',
        fontFamily:   'var(--font-sans)',
      }}
    >
      {/* Filter controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 24px', flexWrap: 'wrap' }}>
        <FunnelIcon size={16} color="#7a828c" weight="regular" aria-hidden="true" />

        {/* Forecast Group */}
        <FilterDropdown
          label={filter.forecastGroupIds.length ? `${filter.forecastGroupIds.length} Forecast Group${filter.forecastGroupIds.length > 1 ? 's' : ''}` : 'Forecast Group'}
          open={openDropdown === 'fg'}
          onToggle={() => setOpenDropdown(o => o === 'fg' ? null : 'fg')}
          onClose={() => setOpenDropdown(null)}
        >
          <div style={{ padding: '8px 8px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: '1px solid #d9dce0', borderRadius: 6 }}>
              <MagnifyingGlassIcon size={12} color="#7a828c" weight="regular" />
              <input
                placeholder="Search groups…"
                value={fgSearch}
                onChange={e => setFgSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: 12, flex: 1, color: '#021920', background: 'transparent', fontFamily: 'var(--font-sans)' }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {visibleFGs.map(fg => (
              <label key={fg.id} style={optionRow(filter.forecastGroupIds.includes(fg.id))}>
                <input type="checkbox" checked={filter.forecastGroupIds.includes(fg.id)} onChange={() => toggleFG(fg.id)}
                  style={{ accentColor: '#4285f4' }} />
                <span style={{ fontSize: 13, color: '#021920' }}>{fg.label}</span>
              </label>
            ))}
          </div>
        </FilterDropdown>

        {/* Staffing Group */}
        <FilterDropdown
          label={filter.staffingGroupIds.length ? `${filter.staffingGroupIds.length} Staffing Group${filter.staffingGroupIds.length > 1 ? 's' : ''}` : 'Staffing Group'}
          open={openDropdown === 'sg'}
          onToggle={() => setOpenDropdown(o => o === 'sg' ? null : 'sg')}
          onClose={() => setOpenDropdown(null)}
        >
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {activeSGs.map(sg => (
              <label key={sg.id} style={optionRow(filter.staffingGroupIds.includes(sg.id))}>
                <input type="checkbox" checked={filter.staffingGroupIds.includes(sg.id)} onChange={() => toggleSG(sg.id)}
                  style={{ accentColor: '#4285f4' }} />
                <span style={{ fontSize: 13, color: '#021920' }}>{sg.label}</span>
              </label>
            ))}
          </div>
        </FilterDropdown>

        {/* Queue */}
        <FilterDropdown
          label={filter.queueIds.length ? `${filter.queueIds.length} Queue${filter.queueIds.length > 1 ? 's' : ''}` : 'Queue'}
          open={openDropdown === 'queue'}
          onToggle={() => setOpenDropdown(o => o === 'queue' ? null : 'queue')}
          onClose={() => setOpenDropdown(null)}
        >
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {QUEUES.map(q => (
              <label key={q.id} style={optionRow(filter.queueIds.includes(q.id))}>
                <input type="checkbox" checked={filter.queueIds.includes(q.id)} onChange={() => toggleQueue(q.id)}
                  style={{ accentColor: '#4285f4' }} />
                <span style={{ fontSize: 13, color: '#021920' }}>{q.label}</span>
              </label>
            ))}
          </div>
        </FilterDropdown>

        {/* Time range */}
        <FilterDropdown
          label={currentPreset}
          open={openDropdown === 'time'}
          onToggle={() => setOpenDropdown(o => o === 'time' ? null : 'time')}
          onClose={() => setOpenDropdown(null)}
        >
          <div style={{ padding: '4px 0' }}>
            {TIME_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => { update({ ...filter, timeRange: p.value }); setOpenDropdown(null) }}
                style={{
                  display:    'block', width: '100%', textAlign: 'left',
                  padding:    '8px 14px', border: 'none',
                  background: p.value === filter.timeRange ? '#f0f4fb' : 'transparent',
                  cursor:     'pointer', fontSize: 13,
                  fontWeight: p.value === filter.timeRange ? 600 : 400,
                  color:      '#021920', fontFamily: 'var(--font-sans)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </FilterDropdown>
      </div>

      {/* Filter chips */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 24px 8px', flexWrap: 'wrap' }}>
          {chips.map(chip => (
            <span key={chip.key} style={chipStyle}>
              {chip.label}
              <button onClick={chip.onRemove} aria-label={`Remove ${chip.label}`} style={chipX}>
                <XIcon size={10} weight="regular" />
              </button>
            </span>
          ))}
          <button onClick={clearAll} style={{ fontSize: 11, color: '#4285f4', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontFamily: 'var(--font-sans)' }}>
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface FilterDropdownProps {
  label: string
  open: boolean
  onToggle: () => void
  onClose: () => void
  children: React.ReactNode
}

function FilterDropdown({ label, open, onToggle, onClose, children }: FilterDropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open || !triggerRef.current) return
    setRect(triggerRef.current.getBoundingClientRect())

    const updateRect = () => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
    }
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) return
      onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const panel = open && rect && mounted ? createPortal(
    <div
      style={{
        position:   'fixed',
        top:         rect.bottom + 4,
        left:        rect.left,
        background: '#ffffff',
        border:     '1px solid #e2e5e8',
        borderRadius: 8,
        boxShadow:  '0 4px 16px rgba(2,25,32,0.12)',
        minWidth:    Math.max(200, rect.width),
        zIndex:      9999,
        overflow:   'hidden',
      }}
    >
      {children}
    </div>,
    document.body
  ) : null

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        onClick={onToggle}
        style={{
          display:     'inline-flex',
          alignItems:  'center',
          gap:          4,
          padding:     '5px 10px',
          borderRadius: 6,
          border:      '1px solid #d9dce0',
          background:   open ? '#f0f4fb' : '#ffffff',
          cursor:      'pointer',
          fontSize:     12,
          fontWeight:   500,
          color:       '#021920',
          fontFamily:  'var(--font-sans)',
          whiteSpace:  'nowrap',
        }}
      >
        {label}
        <span style={{ fontSize: 10, color: '#7a828c' }}>{open ? '▲' : '▼'}</span>
      </button>
      {panel}
    </div>
  )
}

// ── Shared micro-styles ────────────────────────────────────────────────────────

function optionRow(checked: boolean): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    gap:         8,
    padding:    '8px 14px',
    cursor:     'pointer',
    background:  checked ? '#f0f4fb' : 'transparent',
    userSelect: 'none',
  }
}

const chipStyle: React.CSSProperties = {
  display:     'inline-flex',
  alignItems:  'center',
  gap:          4,
  padding:     '2px 8px',
  borderRadius: 64,
  background:  '#d6e2f5',
  fontSize:     11,
  fontWeight:   500,
  color:       '#1a3561',
  fontFamily:  'var(--font-sans)',
}

const chipX: React.CSSProperties = {
  display:     'flex',
  alignItems:  'center',
  background:  'none',
  border:      'none',
  cursor:      'pointer',
  padding:      0,
  color:       '#1a3561',
}
