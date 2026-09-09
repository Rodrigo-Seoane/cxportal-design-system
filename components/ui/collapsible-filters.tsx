'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import {
  SlidersHorizontalIcon,
  XCircleIcon,
  CheckIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { Button } from './button'

// ── Design tokens (Figma node 2212-5926 "Collapsible Filters") ───────────────
//
// Figma's own live component uses an identical green-bordered "secondary"-
// style icon button for BOTH the collapsed toggle AND the expanded-state
// collapse toggle (`border-color/surface-active/primary-default`, #629944,
// on both). The real sandbox reference this doc points to
// (app/sandbox/collapsible-filter/page.tsx) used `variant="form-controls"`
// (a gray border) for the expanded-state toggle instead — a real drift in
// that page's own implementation relative to the actual Figma component.
// Built to match the live component: `variant="secondary"` for both.
//
// Figma names the label text colour text/body/primary, but that alias
// resolves to the wrong ramp step (--neutral-700, #373737) in this
// codebase — bypassed to --neutral-800 directly, the same recurring bug
// found throughout this whole audit (now confirmed here too).
const T = {
  panelBg:      'var(--surface-section-bg)',
  border:       'var(--border-color-surface-active-terciary-default)',
  label:        'var(--neutral-800)',
  accent:       'var(--text-on-action-transparent)',
  badgeBg:      'var(--content-action-primary-default)',
  badgeText:    'var(--text-on-action-primary)',
  rowHover:     'var(--surface-section-group-bg)',
  rowSelected:  'var(--content-action-primary-100)',
  rowDivider:   'var(--border-color-surface-active-terciary-default)',
  tagLabel:     'var(--neutral-700)',
  menuBg:       'var(--surface-section-bg)',
  menuBorder:   'var(--border-color-surface-active-terciary-default)',
  menuText:     'var(--neutral-800)',
  menuHover:    'var(--surface-section-group-bg)',
} as const

const COLLAPSED_W = 48
const EXPANDED_W = 240

export interface CollapsibleFiltersProps {
  /** Controlled — Figma's own principle is that filter state (including collapse) persists across cycles. */
  collapsed: boolean
  onToggleCollapsed: () => void
  /** Drives the collapsed-state count badge. Omit or 0 to hide it. */
  activeCount?: number
  /** Shows the "Clear Filters" ghost link in the expanded header when provided. */
  onClearFilters?: () => void
  /** Filter content area — compose TableFilter rows, a Tags section, etc. */
  children?: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function CollapsibleFilters({
  collapsed,
  onToggleCollapsed,
  activeCount = 0,
  onClearFilters,
  children,
  className,
  style,
}: CollapsibleFiltersProps) {
  return (
    <div
      className={className}
      style={{
        width: collapsed ? COLLAPSED_W : EXPANDED_W,
        flexShrink: 0,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        borderRight: `1px solid ${T.border}`,
        background: T.panelBg,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? 0 : '0 8px 0 12px',
          flexShrink: 0,
          borderBottom: `1px solid ${T.border}`,
          minWidth: collapsed ? COLLAPSED_W : EXPANDED_W,
        }}
      >
        {collapsed ? (
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Button
              variant="secondary"
              size="icon-xs"
              onClick={onToggleCollapsed}
              title="Expand filters"
              aria-label={activeCount > 0 ? `Expand filters — ${activeCount} active` : 'Expand filters'}
            >
              <SlidersHorizontalIcon size={16} weight="regular" />
            </Button>
            {activeCount > 0 && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: T.badgeBg,
                  border: `1px solid ${T.badgeBg}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 600,
                  color: T.badgeText,
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}
              >
                {activeCount}
              </span>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button variant="secondary" size="icon-xs" onClick={onToggleCollapsed} title="Collapse filters">
                <SlidersHorizontalIcon size={16} weight="regular" />
              </Button>
              <span style={{ fontSize: 18, fontWeight: 400, lineHeight: '24px', color: T.label }}>
                Filters
              </span>
            </div>
            {onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 24,
                  padding: '4px 8px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                <XCircleIcon size={16} weight="regular" color={T.accent} />
                <span style={{ fontSize: 10, fontWeight: 600, lineHeight: '16px', color: T.accent, whiteSpace: 'nowrap' }}>
                  Clear Filters
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {!collapsed && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minWidth: EXPANDED_W,
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// ── FilterTagItem ─────────────────────────────────────────────────────────────
// Figma Anatomy item 8: a 32px row with a custom checkbox, a color dot
// (solid or dashed), and the tag label. Hover or an open context menu
// reveals a "⋯" overflow button for Edit/Delete.

export interface FilterTagItemProps {
  label: string
  /** Dot fill color — caller-supplied since tag colors are per-tag data, not a fixed palette. */
  dotColor: string
  /** Dashed-outline dot instead of a solid fill. */
  dotDashed?: boolean
  checked?: boolean
  onToggle?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function FilterTagItem({
  label,
  dotColor,
  dotDashed = false,
  checked = false,
  onToggle,
  onEdit,
  onDelete,
  className,
}: FilterTagItemProps) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuBtnRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const showMenu = (hovered || menuOpen) && (onEdit || onDelete)
  const bg = checked ? T.rowSelected : hovered ? T.rowHover : 'transparent'

  return (
    <div
      className={className}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 32,
        padding: '4px 8px',
        cursor: onToggle ? 'pointer' : 'default',
        background: bg,
        borderBottom: `1px solid ${T.rowDivider}`,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, padding: '0 4px' }}>
        <div
          aria-hidden="true"
          style={{
            width: 12,
            height: 12,
            borderRadius: 2,
            flexShrink: 0,
            background: checked ? 'var(--surface-action-primary-default)' : 'var(--surface-form-field)',
            border: '1px solid var(--border-color-surface-active-primary-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {checked && <CheckIcon size={8} color="var(--neutral-0)" weight="bold" />}
        </div>
        <div
          aria-hidden="true"
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            flexShrink: 0,
            background: dotDashed ? 'transparent' : dotColor,
            border: dotDashed ? `1px dashed ${dotColor}` : 'none',
          }}
        />
        <span style={{
          fontSize: 12,
          fontWeight: 400,
          lineHeight: '20px',
          color: T.tagLabel,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          userSelect: 'none',
        }}>
          {label}
        </span>
      </div>

      {showMenu && (
        <button
          ref={menuBtnRef}
          type="button"
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          aria-label={`${label} options`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: menuOpen ? T.rowSelected : 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: '2px 3px',
            cursor: 'pointer',
            color: 'var(--text-body-secondary)',
            flexShrink: 0,
          }}
        >
          <DotsThreeIcon size={14} weight="bold" />
        </button>
      )}

      {menuOpen && (onEdit || onDelete) && (
        <div
          ref={menuRef}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            zIndex: 10,
            marginTop: 4,
            background: T.menuBg,
            border: `1px solid ${T.menuBorder}`,
            borderRadius: 8,
            boxShadow: '0px 4px 16px rgba(5,3,38,0.12)',
            minWidth: 128,
            overflow: 'hidden',
          }}
        >
          {onEdit && (
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onEdit() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '9px 12px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, color: T.menuText, textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = T.menuHover }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              <PencilSimpleIcon size={14} weight="regular" />
              Edit Tag
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onDelete() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '9px 12px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, color: T.menuText, textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = T.menuHover }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              <TrashIcon size={14} weight="regular" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
