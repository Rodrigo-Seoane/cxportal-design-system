'use client'

import { SelectionAllIcon, FunnelSimpleIcon } from '@phosphor-icons/react'

// ── Design tokens ─────────────────────────────────────────────────────────────
// Source: Figma node 71-16179 (Table Filter)

const T = {
  border:       'var(--border-color-surface-active-terciary-default)',
  borderActive: 'var(--border-color-surface-active-primary-default)',
  bg:           'var(--surface-form-field)',
  // Figma names this text/on-action/secondary (#1d1d1d) — bypassed to
  // --neutral-800 directly since the shared alias resolves to the wrong
  // ramp step in this codebase, the same recurring bug found throughout
  // this audit.
  label:        'var(--neutral-800)',
  selectAll:    'var(--content-action-primary-default)',
  counterBg:    'var(--surface-action-primary-default)',
  counterBorder: 'var(--border-color-surface-active-primary-default)',
  counterText:  'var(--text-body-on-dark-surface)',
} as const

export interface TableFilterProps {
  /** Trigger label. */
  label?: string
  /** Renders the active (green border) state with a count badge. */
  active?: boolean
  /** Number of applied filters — shown in the leading badge when active. */
  count?: number
  /** Show/hide the "All" select-all shortcut. */
  showSelectAll?: boolean
  onSelectAll?: () => void
  onClick?: () => void
  /**
   * 'regular' (40px, standalone) matches the standalone Table Filter pull.
   * 'compact' (36px) matches Figma's own Collapsible Filters pull, where
   * every embedded Table Filter row measures 36px instead — the same
   * category of context-dependent sizing drift found on Pagination's
   * Back/Next buttons earlier in this audit.
   */
  size?: 'regular' | 'compact'
  className?: string
}

export function TableFilter({
  label = 'Select Option',
  active = false,
  count,
  showSelectAll = true,
  onSelectAll,
  onClick,
  size = 'regular',
  className,
}: TableFilterProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:           8,
        minWidth:      220,
        height:        size === 'compact' ? 36 : 40,
        padding:       8,
        borderRadius:  8,
        border:       `1px solid ${active ? T.borderActive : T.border}`,
        background:    T.bg,
        cursor:        'pointer',
      }}
    >
      {active && count != null && count > 0 && (
        <span style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          minWidth:        18,
          height:          18,
          padding:        '0 4px',
          borderRadius:    64,
          background:      T.counterBg,
          border:         `1px solid ${T.counterBorder}`,
          fontSize:        10,
          fontWeight:      600,
          color:           T.counterText,
          flexShrink:      0,
        }}>
          {count}
        </span>
      )}

      <span style={{
        flex:          1,
        textAlign:     'left',
        fontSize:      12,
        fontWeight:    600,
        letterSpacing: '0.24px',
        color:         T.label,
      }}>
        {label}
      </span>

      <span style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        {showSelectAll && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onSelectAll?.() }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                onSelectAll?.()
              }
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          >
            <SelectionAllIcon size={16} weight="regular" color={T.selectAll} />
            <span style={{ fontSize: 10, fontWeight: 600, color: T.selectAll }}>All</span>
          </span>
        )}
        <FunnelSimpleIcon size={16} weight="regular" color={T.label} />
      </span>
    </button>
  )
}
