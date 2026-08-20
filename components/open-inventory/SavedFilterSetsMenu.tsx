'use client'

import { useEffect, useRef, useState } from 'react'
import { Bookmark, Pencil, Save, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  deleteFilterSet, listSavedFilterSets, renameFilterSet, saveFilterSet,
  type SavedFilterSet,
} from '@/mocks/open-inventory/store'
import type { FilterState } from '@/mocks/open-inventory/aggregations'

// ── Local-only saved filter sets (spec §5) — no sharing, no global publish ─

export function SavedFilterSetsMenu({
  currentFilters,
  onApply,
}: {
  currentFilters: FilterState
  onApply: (filters: FilterState) => void
}) {
  const [open, setOpen] = useState(false)
  const [sets, setSets] = useState<SavedFilterSet[]>([])
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setSets(listSavedFilterSets()) }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSave = () => {
    const label = window.prompt('Name this filter set:')
    if (!label) return
    setSets(saveFilterSet(label, currentFilters))
  }

  const handleRenameCommit = (id: string) => {
    if (renameValue.trim()) setSets(renameFilterSet(id, renameValue.trim()))
    setRenamingId(null)
  }

  const handleDelete = (id: string) => setSets(deleteFilterSet(id))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 rounded-sm border border-[var(--border-color-form-fields-default)] bg-[var(--surface-section-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-body-primary)]"
      >
        <Bookmark className="size-3.5" aria-hidden="true" />
        Saved filters
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[60] min-w-64 overflow-hidden rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] shadow-lg">
          {sets.length === 0 && (
            <p className="px-3 py-3 text-xs text-[var(--text-body-secondary)]">No saved filter sets yet.</p>
          )}
          {sets.map(s => (
            <div key={s.id} className="flex items-center gap-1 border-b border-[var(--neutral-50)] px-2 py-1.5 last:border-b-0">
              {renamingId === s.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameCommit(s.id)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRenameCommit(s.id) }}
                  className="flex-1 rounded-sm border border-[var(--border-color-form-fields-focus)] px-1.5 py-1 text-sm outline-none"
                />
              ) : (
                <button
                  onClick={() => { onApply(s.filters); setOpen(false) }}
                  className="flex-1 truncate text-left text-sm text-[var(--text-body-primary)]"
                >
                  {s.label}
                </button>
              )}
              <button
                onClick={() => { setRenamingId(s.id); setRenameValue(s.label) }}
                aria-label={`Rename ${s.label}`}
                className="rounded-sm p-1 text-[var(--text-body-secondary)]"
              >
                <Pencil className="size-3.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                aria-label={`Delete ${s.label}`}
                className="rounded-sm p-1 text-[var(--text-error)]"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            onClick={handleSave}
            className={cn(
              'flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm font-medium text-[var(--text-action)]',
            )}
          >
            <Save className="size-3.5" aria-hidden="true" />
            Save current filters
          </button>
        </div>
      )}
    </div>
  )
}
