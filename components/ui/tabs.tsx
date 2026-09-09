'use client'

import {
  createContext,
  useContext,
  useState,
  useId,
  useRef,
  useCallback,
} from 'react'
import { TableIcon } from '@phosphor-icons/react'

// Re-export for use in component-registry scope (must stay behind the
// 'use client' boundary — do not import @phosphor-icons/react directly in
// server-side modules like component-registry.ts).
export { TableIcon }

// ── Design tokens (Figma: nodes 280-20673 / 280-20700) ────────────────────────
const T = {
  // Tab group container — Button type
  groupBg:       'var(--surface-main-panel)',
  groupPad:       4,
  groupGap:       4,
  groupRadius:    4,                 // --border-radius/sm

  // Tab group container — Minimal type (Figma: 12px gap, 4px horizontal
  // padding only, items pinned to the bottom edge so the underline sits flush)
  minimalGroupGap:     12,
  minimalGroupPadH:     4,
  minimalGroupMinH:    24,

  // Active tab — Figma's "Focus" state name means the selected tab, not
  // keyboard focus. Points at the raw ramp step directly (not --text-action /
  // --text-on-action-secondary) because those shared aliases are themselves
  // wrong-ramp-stepped — see HANDOFF-PROMPT.md.
  activeBg:      'var(--surface-form-field)',
  activeBorder:  'var(--border-color-surface-active-primary-default)',
  activeText:    'var(--content-action-primary-default)',

  // Default (idle) tab
  defaultBg:     'transparent',
  defaultText:   'var(--neutral-800)',

  // Hover tab — Figma: Button type gets a solid white fill (same bg as
  // active, no border); both types get the active green text/icon colour.
  hoverBg:       'var(--surface-form-field)',

  // Disabled tab
  disabledText:  'var(--text-form-field-disabled)',

  // Tab trigger — Button type
  tabPadV:        4,
  tabPadH:       12,
  tabGap:         8,
  tabRadius:      4,

  // Tab trigger — Minimal type (2px horizontal / 4px vertical, not uniform)
  minimalPadV:    4,
  minimalPadH:    2,
  minimalGap:     4,
  minimalMinH:   24,

  // Typography — Caption/regular
  fontSize:       10,
  fontWeight:     600,
  lineHeight:    '12px',
  letterSpacing: '0.4px',
} as const

// ── Type ──────────────────────────────────────────────────────────────────────

export type TabType = 'button' | 'minimal'

// ── Context ───────────────────────────────────────────────────────────────────

interface TabsCtxValue {
  value: string
  onChange: (value: string) => void
  uid: string
  type: TabType
}

const TabsCtx = createContext<TabsCtxValue | null>(null)

// ── Tabs (root) ───────────────────────────────────────────────────────────────

export interface TabsProps {
  /** Controlled active value */
  value?: string
  /** Initial value for uncontrolled mode */
  defaultValue?: string
  /** Called when the active tab changes */
  onChange?: (value: string) => void
  /** Visual type — 'button' (pill container) or 'minimal' (underline). Default: 'button' */
  type?: TabType
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function Tabs({
  value: controlledValue,
  defaultValue = '',
  onChange,
  type = 'button',
  children,
  style,
  className,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue)
  const isControlled  = controlledValue !== undefined
  const value         = isControlled ? controlledValue : internal
  const uid           = useId()

  const handleChange = useCallback(
    (v: string) => {
      if (!isControlled) setInternal(v)
      onChange?.(v)
    },
    [isControlled, onChange],
  )

  return (
    <TabsCtx.Provider value={{ value, onChange: handleChange, uid, type }}>
      <div style={style} className={className}>
        {children}
      </div>
    </TabsCtx.Provider>
  )
}

// ── TabList ───────────────────────────────────────────────────────────────────

export interface TabListProps {
  children: React.ReactNode
  /** Accessible label for the tab group — required when there are multiple tab lists on a page */
  'aria-label'?: string
  style?: React.CSSProperties
  className?: string
}

export function TabList({
  children,
  style,
  className,
  'aria-label': ariaLabel,
}: TabListProps) {
  const ref = useRef<HTMLDivElement>(null)
  const ctx = useContext(TabsCtx)
  const isMinimal = ctx?.type === 'minimal'

  // Roving-tabindex keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!ref.current) return
    const tabs = Array.from(
      ref.current.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      ),
    )
    const idx = tabs.findIndex((t) => t === document.activeElement)
    if (idx === -1) return

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      tabs[(idx + 1) % tabs.length].focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      tabs[(idx - 1 + tabs.length) % tabs.length].focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      tabs[0].focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      tabs[tabs.length - 1].focus()
    }
  }

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      style={{
        display:      'inline-flex',
        alignItems:   isMinimal ? 'flex-end' : 'center',
        gap:          isMinimal ? T.minimalGroupGap : T.groupGap,
        padding:      isMinimal ? `0 ${T.minimalGroupPadH}px` : T.groupPad,
        minHeight:    isMinimal ? T.minimalGroupMinH : undefined,
        borderRadius: isMinimal ? 0 : T.groupRadius,
        background:   isMinimal ? 'transparent' : T.groupBg,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  )
}

// ── Tab ───────────────────────────────────────────────────────────────────────

export interface TabProps {
  /** Unique value that identifies this tab — must match the corresponding TabPanel */
  value: string
  /** Optional leading icon (16 × 16 px recommended) */
  icon?: React.ReactNode
  /** Prevent interaction */
  disabled?: boolean
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function Tab({
  value,
  icon,
  disabled = false,
  children,
  style,
  className,
}: TabProps) {
  const ctx       = useContext(TabsCtx)
  const active    = ctx?.value === value
  const isMinimal = ctx?.type === 'minimal'
  const [hovered, setHovered] = useState(false)

  // Figma previews the active look on hover too — same green text/icon
  // colour for both types, plus a solid white fill for Button type.
  const textColor = disabled
    ? T.disabledText
    : active || (hovered && !disabled)
    ? T.activeText
    : T.defaultText

  const bg = isMinimal
    ? 'transparent'
    : active
    ? T.activeBg
    : hovered && !disabled
    ? T.hoverBg
    : T.defaultBg

  const border = isMinimal
    ? 'none'
    : active
    ? `1px solid ${T.activeBorder}`
    : '1px solid transparent'

  const borderBottom = isMinimal && active
    ? `1px solid ${T.activeBorder}`
    : isMinimal
    ? '1px solid transparent'
    : undefined

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={ctx ? `${ctx.uid}-panel-${value}` : undefined}
      id={ctx ? `${ctx.uid}-tab-${value}` : undefined}
      disabled={disabled}
      tabIndex={active ? 0 : -1}
      onClick={() => !disabled && ctx?.onChange(value)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          isMinimal ? T.minimalGap : T.tabGap,
        padding:      isMinimal
          ? `${T.minimalPadV}px ${T.minimalPadH}px`
          : `${T.tabPadV}px ${T.tabPadH}px`,
        minHeight:    isMinimal ? T.minimalMinH : undefined,
        borderRadius: isMinimal ? 0 : T.tabRadius,
        background:   bg,
        border,
        borderBottom,
        cursor:       disabled ? 'not-allowed' : 'pointer',
        transition:   'background 100ms ease, border-color 100ms ease',
        userSelect:   'none',
        ...style,
      }}
      className={className}
    >
      {icon && (
        <span
          style={{
            display:    'flex',
            flexShrink: 0,
            color:      textColor,
            opacity:    disabled ? 0.4 : 1,
            transition: 'color 100ms ease, opacity 100ms ease',
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      <span
        style={{
          fontSize:      T.fontSize,
          fontWeight:    T.fontWeight,
          lineHeight:    T.lineHeight,
          letterSpacing: T.letterSpacing,
          color:         textColor,
          whiteSpace:    'nowrap',
          transition:    'color 100ms ease',
        }}
      >
        {children}
      </span>
    </button>
  )
}

// ── TabPanel ──────────────────────────────────────────────────────────────────

export interface TabPanelProps {
  /** Must match the `value` of the corresponding Tab */
  value: string
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function TabPanel({
  value,
  children,
  style,
  className,
}: TabPanelProps) {
  const ctx     = useContext(TabsCtx)
  const visible = ctx?.value === value

  return (
    <div
      role="tabpanel"
      id={ctx ? `${ctx.uid}-panel-${value}` : undefined}
      aria-labelledby={ctx ? `${ctx.uid}-tab-${value}` : undefined}
      hidden={!visible}
      style={style}
      className={className}
    >
      {visible ? children : null}
    </div>
  )
}
