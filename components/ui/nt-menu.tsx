'use client'

import Link from 'next/link'
import {
  HouseIcon,
  TreeViewIcon,
  CaretRightIcon,
  CaretDownIcon,
  ArrowElbowDownRightIcon,
} from '@phosphor-icons/react'

// Re-export defaults for use in component-registry scope (must stay behind
// the 'use client' boundary — do not import @phosphor-icons/react directly
// in server-side modules like component-registry.ts).
export { HouseIcon as NTMenuHomeIcon, TreeViewIcon as NTMenuModuleIcon }

// ── NT Menu ────────────────────────────────────────────────────────────────────
// The in-progress redesign of the left/vertical nav (Figma: nodes 3660-6232 /
// 3869-13623 / 3660-6296, internally named "MenuItemRow" / "MenuItemRowCollapsed"
// / "ModuleMenuGroup"). Light theme, rounded pill rows, drop shadows, tree
// connector lines — a completely different visual language from the dark
// sidebar in nav-item.tsx / Sidebar.tsx, which it's expected to eventually
// replace. Buildable and testable here ahead of that swap.

const T = {
  rowRadius:    8,
  rowPadV:     12,
  rowMaxH:     36,
  fontSize:    12,
  lineHeight: '20px',
  tracking:   '0.24px',
  // Figma names this token text/on-action/secondary — bypassed directly
  // because that shared alias is itself wrong-ramp-stepped in this codebase
  // (see HANDOFF-PROMPT.md).
  text:        'var(--neutral-800)',
  textMuted:   'var(--text-body-secondary)',
  idleBg:      'var(--surface-section-bg)',
  activeBg:    'var(--surface-action-highlight-active)',
  hoverBg:     'var(--surface-action-highlight-active-hover)',
  activeBorder: 'var(--border-color-surface-active-highlight-active)',
  hoverBorder:  'var(--border-color-surface-active-highlight-active-hover)',
  shadowIdle:   '0px 4px 4px rgba(0, 0, 0, 0.06)',
  shadowRaised: '0px 4px 4px rgba(0, 0, 0, 0.14)',
} as const

export type NTMenuRowState = 'default' | 'hover' | 'active'

// ── Shared row chrome ──────────────────────────────────────────────────────────

function useRowStyle(state: NTMenuRowState, raised: boolean): React.CSSProperties {
  const isHover  = state === 'hover'
  const isActive = state === 'active'
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:             8,
    width:           220,
    maxHeight:       T.rowMaxH,
    padding:         T.rowPadV,
    borderRadius:    T.rowRadius,
    border:          isHover
      ? `0.5px solid ${T.hoverBorder}`
      : isActive
      ? `0.5px solid ${T.activeBorder}`
      : 'none',
    background:      isHover ? T.hoverBg : isActive ? T.activeBg : T.idleBg,
    boxShadow:        raised ? T.shadowRaised : T.shadowIdle,
    cursor:          'pointer',
    textAlign:       'left',
    transition:      'background 100ms ease, border-color 100ms ease',
  }
}

// Polymorphic row container — renders a real `next/link` Link when `href` is
// given (real navigation, wired into Sidebar.tsx), or a plain button when
// it's a pure toggle (a group header with no destination of its own).
function RowContainer({
  href, onClick, style, ariaExpanded, children,
}: {
  href?: string
  onClick?: () => void
  style: React.CSSProperties
  ariaExpanded?: boolean
  children: React.ReactNode
}) {
  if (href) {
    return (
      <Link href={href} onClick={onClick} style={{ ...style, textDecoration: 'none' }}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} aria-expanded={ariaExpanded} style={style}>
      {children}
    </button>
  )
}

function RowLabel({ children, semibold = false }: { children: React.ReactNode; semibold?: boolean }) {
  return (
    <span
      style={{
        flex:          1,
        minWidth:       0,
        fontSize:       T.fontSize,
        fontWeight:     semibold ? 600 : 400,
        lineHeight:     T.lineHeight,
        letterSpacing:  semibold ? T.tracking : undefined,
        color:          T.text,
        overflow:       'hidden',
        whiteSpace:     'nowrap',
        textOverflow:   'ellipsis',
      }}
    >
      {children}
    </span>
  )
}

// ── NTMenuHomeItem ──────────────────────────────────────────────────────────────
// The root "Home" row. Pass `ancestor` to render it as a breadcrumb trail
// ("Home > {ancestor}") — Figma's "Nested" state.

export interface NTMenuHomeItemProps {
  state?:    NTMenuRowState
  ancestor?: string
  onClick?:  () => void
}

export function NTMenuHomeItem({ state = 'default', ancestor, onClick }: NTMenuHomeItemProps) {
  const iconSize = 13
  if (ancestor) {
    // Breadcrumb trail is display-only in Figma — muted, non-interactive.
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12 }}>
        <HouseIcon size={iconSize} color={T.textMuted} weight="regular" />
        <span style={{ fontSize: T.fontSize, color: T.textMuted, lineHeight: T.lineHeight, whiteSpace: 'nowrap' }}>
          Home
        </span>
        <ArrowElbowDownRightIcon size={11} color={T.textMuted} weight="regular" style={{ transform: 'rotate(-90deg)' }} />
        <span style={{ fontSize: T.fontSize, fontWeight: 600, color: T.text, lineHeight: T.lineHeight, letterSpacing: T.tracking, whiteSpace: 'nowrap' }}>
          {ancestor}
        </span>
      </div>
    )
  }

  return (
    <button type="button" onClick={onClick} style={useRowStyle(state, state === 'default')}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <HouseIcon size={iconSize} color={T.text} weight="regular" />
        <RowLabel semibold={state === 'active'}>Home</RowLabel>
      </span>
      <CaretRightIcon size={iconSize} color={T.text} weight="regular" />
    </button>
  )
}

// ── NTMenuModuleItem ────────────────────────────────────────────────────────────
// A top-level module row — collapsible group header. Renders CaretDown when
// open (matches the "Active" state's expanded look), CaretRight otherwise.

export interface NTMenuModuleItemProps {
  label:    string
  icon?:    React.ReactNode
  state?:   NTMenuRowState
  isOpen?:  boolean
  onClick?: () => void
  /** Real navigation target. When set, the row renders as a Link instead of a toggle button. */
  href?:    string
  /**
   * Show the trailing expand/collapse caret. Default true. Set false for a
   * flat entry with no sub-items (no Figma state for this -- inferred for
   * Sidebar.tsx's "Guidelines" link, which has no group to expand).
   */
  showCaret?: boolean
}

export function NTMenuModuleItem({ label, icon, state = 'default', isOpen = false, onClick, href, showCaret = true }: NTMenuModuleItemProps) {
  const iconSize = 13
  return (
    <RowContainer href={href} onClick={onClick} ariaExpanded={showCaret ? isOpen : undefined} style={useRowStyle(state, true)}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: T.text }}>
          {icon ?? <TreeViewIcon size={iconSize} color={T.text} weight="regular" />}
        </span>
        <RowLabel semibold={state === 'active'}>{label}</RowLabel>
      </span>
      {showCaret && (
        isOpen
          ? <CaretDownIcon  size={iconSize} color={T.text} weight="regular" />
          : <CaretRightIcon size={iconSize} color={T.text} weight="regular" />
      )}
    </RowContainer>
  )
}

// ── NTMenuSubItem ───────────────────────────────────────────────────────────────
// A nested child row inside an NTMenuGroup. The leading elbow glyph plus the
// group's own vertical trunk line (rendered by NTMenuGroup) form the tree.

export interface NTMenuSubItemProps {
  label:    string
  state?:   NTMenuRowState
  onClick?: () => void
  /** Real navigation target. When set, the row renders as a Link instead of a button. */
  href?:    string
}

export function NTMenuSubItem({ label, state = 'default', onClick, href }: NTMenuSubItemProps) {
  return (
    <RowContainer href={href} onClick={onClick} style={{ ...useRowStyle(state, false), width: 205, justifyContent: 'flex-start' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <ArrowElbowDownRightIcon size={11} color={T.text} weight="regular" />
        <RowLabel semibold={state === 'active'}>{label}</RowLabel>
      </span>
    </RowContainer>
  )
}

// ── NTMenuGroup ─────────────────────────────────────────────────────────────────
// Composes a Module header with its Sub Items, drawing the vertical trunk
// line that connects them. Row height matches NTMenuSubItem's rendered
// height (36px pill + 8px gap = 44px) — computed from a single constant
// rather than a per-count lookup table, so it scales to any number of items.

const SUB_ROW_STEP = T.rowMaxH + T.rowPadV / 3 + 8 // ≈ approximates Figma's ~44-45px row cadence

export interface NTMenuGroupProps {
  label:   string
  icon?:   React.ReactNode
  open?:   boolean
  state?:  NTMenuRowState
  onToggle?: () => void
  children?: React.ReactNode
}

export function NTMenuGroup({ label, icon, open = false, state = 'default', onToggle, children }: NTMenuGroupProps) {
  const items = children ? Array.isArray(children) ? children : [children] : []
  const trunkHeight = items.length > 1 ? (items.length - 1) * SUB_ROW_STEP + T.rowMaxH / 2 : T.rowMaxH / 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 240, position: 'relative' }}>
      <div style={{ paddingLeft: 12 }}>
        <NTMenuModuleItem label={label} icon={icon} state={state} isOpen={open} onClick={onToggle} />
      </div>

      {open && items.length > 0 && (
        <>
          <div
            aria-hidden
            style={{
              position:  'absolute',
              left:       25,
              top:        T.rowMaxH + 8 + T.rowMaxH / 2,
              width:      1,
              height:     trunkHeight,
              background: T.hoverBorder,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 36 }}>
            {items}
          </div>
        </>
      )}
    </div>
  )
}

// ── NTMenuItemCollapsed ─────────────────────────────────────────────────────────
// Icon-only pill for the collapsed sidebar state.

export interface NTMenuItemCollapsedProps {
  icon?:    React.ReactNode
  state?:   NTMenuRowState
  onClick?: () => void
  /** Real navigation target (a flat entry). Omit for a group pill, whose click expands the rail. */
  href?:    string
}

export function NTMenuItemCollapsed({ icon, state = 'default', onClick, href }: NTMenuItemCollapsedProps) {
  const isHover  = state === 'hover'
  const isActive = state === 'active'
  return (
    <RowContainer
      href={href}
      onClick={onClick}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:         12,
        borderRadius:    T.rowRadius,
        border:          isHover
          ? `0.5px solid ${T.hoverBorder}`
          : isActive
          ? `0.5px solid ${T.activeBorder}`
          : 'none',
        background:      isHover ? T.hoverBg : isActive ? T.activeBg : T.idleBg,
        boxShadow:        T.shadowIdle,
        cursor:          'pointer',
      }}
    >
      {icon ?? <HouseIcon size={13} color={T.text} weight="regular" />}
    </RowContainer>
  )
}
