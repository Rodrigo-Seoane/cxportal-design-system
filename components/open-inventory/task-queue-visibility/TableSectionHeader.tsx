'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface FilterChip {
  key: string
  label: string
  onRemove: () => void
}

export interface TableSectionHeaderProps {
  title: string
  count: number
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  chips?: FilterChip[]
  /** Extra control rendered at the end of the "Filtering:" row (e.g. Eligible-only toggle). */
  chipRowExtra?: React.ReactNode
}

/**
 * "{Title} ({count})" + collapsible search icon button, reused across the
 * Queues / Tasks / Workers active tables — reflects the Figma reference's
 * section-header + search-icon-button + "Filtering:" chip strip pattern.
 */
export function TableSectionHeader({
  title, count, searchValue, onSearchChange, searchPlaceholder, chips = [], chipRowExtra,
}: TableSectionHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2 px-4 pb-2 pt-3">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-[var(--text-body-primary)]">
          {title} <span className="font-normal text-[var(--text-body-secondary)]">({count.toLocaleString('en-US')})</span>
        </p>

        {searchOpen ? (
          <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border-color-form-fields-default)] px-2 py-1">
            <MagnifyingGlassIcon size={14} className="text-[var(--text-body-secondary)]" aria-hidden="true" />
            <input
              autoFocus
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-48 border-none bg-transparent text-xs text-[var(--text-body-primary)] outline-none"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => { onSearchChange(''); setSearchOpen(false) }}
              className="flex items-center text-[var(--text-body-secondary)] hover:text-[var(--text-body-primary)]"
            >
              <XIcon size={12} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={`Search ${title.toLowerCase()}`}
            onClick={() => setSearchOpen(true)}
            className="flex size-7 items-center justify-center rounded-sm text-[var(--text-body-secondary)] hover:bg-[var(--content-action-primary-100)] hover:text-[var(--text-action)]"
          >
            <MagnifyingGlassIcon size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {(chips.length > 0 || chipRowExtra) && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.length > 0 && (
            <span className="text-xs font-medium text-[var(--text-body-secondary)]">Filtering:</span>
          )}
          {chips.map(chip => (
            <span
              key={chip.key}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                'bg-[var(--content-action-primary-100)] text-[var(--text-body-primary)]',
              )}
            >
              {chip.label}
              <button type="button" onClick={chip.onRemove} aria-label={`Remove ${chip.label}`} className="flex items-center">
                <XIcon size={10} aria-hidden="true" />
              </button>
            </span>
          ))}
          {chipRowExtra}
        </div>
      )}
    </div>
  )
}
