'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createPortal } from 'react-dom'
import { ChevronDown, Filter, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InlineContextData } from '@/components/ui/inline-context-data'
import { PERSONAS, LINES_OF_BUSINESS, ALL_STATES, TYPES_OF_WORK, URGENCIES, TYPE_OF_WORK_LABEL } from '@/mocks/open-inventory/taxonomy'
import { EMPTY_FILTERS, type FilterState } from '@/mocks/open-inventory/aggregations'
import { formatTime } from '@/mocks/open-inventory/format'
import { useOpenInventoryStore } from '@/mocks/open-inventory/store'
import { SavedFilterSetsMenu } from './SavedFilterSetsMenu'

// ── URL <-> filter-state (mirrors components/wfm/HierarchyFilter.tsx) ───────

function parseFromParams(params: URLSearchParams): FilterState {
  return {
    personas: (params.get('persona')?.split(',').filter(Boolean) ?? []) as FilterState['personas'],
    lobs: (params.get('lob')?.split(',').filter(Boolean) ?? []) as FilterState['lobs'],
    states: params.get('state')?.split(',').filter(Boolean) ?? [],
    typesOfWork: (params.get('tow')?.split(',').filter(Boolean) ?? []) as FilterState['typesOfWork'],
    urgencies: (params.get('urgency')?.split(',').filter(Boolean) ?? []) as FilterState['urgencies'],
  }
}

function writeToParams(f: FilterState, params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params)
  const set = (key: string, values: string[]) => {
    if (values.length) next.set(key, values.join(','))
    else next.delete(key)
  }
  set('persona', f.personas)
  set('lob', f.lobs)
  set('state', f.states)
  set('tow', f.typesOfWork)
  set('urgency', f.urgencies)
  return next
}

type DropdownKey = 'persona' | 'lob' | 'state' | 'tow' | 'urgency' | null

// ── Generic multi-select dropdown (used 5x below) ───────────────────────────

interface Option { value: string; label: string }

function MultiSelectDropdown({
  label, options, selected, onToggle, open, onOpenChange, searchable = false,
}: {
  label: string
  options: Option[]
  selected: string[]
  onToggle: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  searchable?: boolean
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open || !triggerRef.current) return
    setRect(triggerRef.current.getBoundingClientRect())
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return
      onOpenChange(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onOpenChange])

  const visible = searchable && search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const buttonLabel = selected.length ? `${selected.length} ${label}` : label

  const panel = open && rect && mounted ? createPortal(
    <div
      className="fixed z-[9999] min-w-52 overflow-hidden rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] shadow-lg"
      style={{ top: rect.bottom + 4, left: rect.left }}
    >
      {searchable && (
        <div className="p-2">
          <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border-color-form-fields-default)] px-2 py-1">
            <Search className="size-3 text-[var(--text-body-secondary)]" aria-hidden="true" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="w-full border-none bg-transparent text-xs text-[var(--text-body-primary)] outline-none"
            />
          </div>
        </div>
      )}
      <div className="max-h-56 overflow-y-auto py-1">
        {visible.map(opt => (
          <label
            key={opt.value}
            className={cn(
              'flex cursor-pointer items-center gap-2 px-3 py-2',
              selected.includes(opt.value) && 'bg-[var(--content-action-primary-100)]',
            )}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="accent-[var(--content-action-primary-600)]"
            />
            <span className="text-sm text-[var(--text-body-primary)]">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>,
    document.body,
  ) : null

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => onOpenChange(!open)}
        className={cn(
          'inline-flex items-center gap-1 whitespace-nowrap rounded-sm border px-2.5 py-1.5 text-xs font-medium text-[var(--text-body-primary)]',
          open
            ? 'border-[var(--border-color-surface-active-primary-default)] bg-[var(--content-action-primary-100)]'
            : 'border-[var(--border-color-form-fields-default)] bg-[var(--surface-section-bg)]',
        )}
      >
        {buttonLabel}
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {panel}
    </div>
  )
}

// ── Filter Bar ────────────────────────────────────────────────────────────

export function FilterBar() {
  const { filters, setFilters, lastUpdated } = useOpenInventoryStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null)
  const didInit = useRef(false)

  // Hydrate the store from the URL exactly once per mount (drill-through carries filters).
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    const fromUrl = parseFromParams(searchParams)
    const hasAny = fromUrl.personas.length || fromUrl.lobs.length || fromUrl.states.length
      || fromUrl.typesOfWork.length || fromUrl.urgencies.length
    if (hasAny) setFilters(fromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (next: FilterState) => {
    setFilters(next)
    const params = writeToParams(next, searchParams)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const toggle = (key: keyof FilterState, value: string) => {
    const list = filters[key] as string[]
    const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value]
    update({ ...filters, [key]: next } as FilterState)
  }

  const clearAll = () => update(EMPTY_FILTERS)

  const hasFilters = filters.personas.length + filters.lobs.length + filters.states.length
    + filters.typesOfWork.length + filters.urgencies.length > 0

  const stateOptions: Option[] = ALL_STATES.map(s => ({ value: s.code, label: `${s.name} (${s.code})` }))

  return (
    <div className="border-b border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)]">
      <div className="flex flex-wrap items-center gap-2 px-4 py-2">
        <Filter className="size-4 text-[var(--text-body-secondary)]" aria-hidden="true" />

        <MultiSelectDropdown
          label="Persona"
          options={PERSONAS.map(p => ({ value: p, label: p }))}
          selected={filters.personas}
          onToggle={v => toggle('personas', v)}
          open={openDropdown === 'persona'}
          onOpenChange={o => setOpenDropdown(o ? 'persona' : null)}
        />
        <MultiSelectDropdown
          label="Line of Business"
          options={LINES_OF_BUSINESS.map(l => ({ value: l, label: l }))}
          selected={filters.lobs}
          onToggle={v => toggle('lobs', v)}
          open={openDropdown === 'lob'}
          onOpenChange={o => setOpenDropdown(o ? 'lob' : null)}
        />
        <MultiSelectDropdown
          label="State"
          options={stateOptions}
          selected={filters.states}
          onToggle={v => toggle('states', v)}
          open={openDropdown === 'state'}
          onOpenChange={o => setOpenDropdown(o ? 'state' : null)}
          searchable
        />
        <MultiSelectDropdown
          label="Type of Work"
          options={TYPES_OF_WORK.map(t => ({ value: t, label: `${t} — ${TYPE_OF_WORK_LABEL[t]}` }))}
          selected={filters.typesOfWork}
          onToggle={v => toggle('typesOfWork', v)}
          open={openDropdown === 'tow'}
          onOpenChange={o => setOpenDropdown(o ? 'tow' : null)}
        />
        <MultiSelectDropdown
          label="Urgency"
          options={URGENCIES.map(u => ({ value: u, label: u }))}
          selected={filters.urgencies}
          onToggle={v => toggle('urgencies', v)}
          open={openDropdown === 'urgency'}
          onOpenChange={o => setOpenDropdown(o ? 'urgency' : null)}
        />

        {hasFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-action)]"
          >
            <X className="size-3" aria-hidden="true" />
            Clear all
          </button>
        )}

        <SavedFilterSetsMenu currentFilters={filters} onApply={update} />

        <div className="ml-auto">
          <InlineContextData
            label="Updated"
            value={formatTime(lastUpdated)}
            value2="Refreshes every 15 min"
          />
        </div>
      </div>
    </div>
  )
}
