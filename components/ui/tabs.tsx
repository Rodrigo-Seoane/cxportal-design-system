'use client'

import {
  createContext,
  useContext,
  useState,
  useId,
  useRef,
  useCallback,
} from 'react'

// ── Design tokens (Figma: nodes 280-20671 / 280-20700) ────────────────────────
const T = {
  // Tab group container
  groupBg:       '#eff1f3',          // --surface/main-panel
  groupPad:       4,
  groupGap:       4,
  groupRadius:    4,                 // --border-radius/sm

  // Active tab
  activeBg:      '#ffffff',          // --surface/form-field
  activeBorder:  '#689df6',          // --border-color/surface-active/primary
  activeText:    '#4285f4',          // --text/action

  // Default (idle) tab
  defaultBg:     'transparent',
  defaultText:   '#021920',          // --text/on-action/secondary

  // Hover tab (not in Figma spec — inferred)
  hoverBg:       'rgba(255,255,255,0.65)',

  // Disabled tab
  disabledText:  '#aab0b8',          // --text/form-field/disabled

  // Tab trigger shared
  tabPadV:        4,
  tabPadH:       12,
  tabGap:         8,
  tabRadius:      4,

  // Typography — Caption/regular
  fontSize:       10,
  fontWeight:     600,
  lineHeight:    '12px',
  letterSpacing: '0.4px',
} as const

// ── Context ───────────────────────────────────────────────────────────────────

interface TabsCtxValue {
  value: string
  onChange: (value: string) => void
  uid: string
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
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function Tabs({
  value: controlledValue,
  defaultValue = '',
  onChange,
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
    <TabsCtx.Provider value={{ value, onChange: handleChange, uid }}>
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
        display:     'inline-flex',
        alignItems:  'center',
        gap:         T.groupGap,
        padding:     T.groupPad,
        borderRadius: T.groupRadius,
        background:  T.groupBg,
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
  const ctx    = useContext(TabsCtx)
  const active = ctx?.value === value
  const [hovered, setHovered] = useState(false)

  const textColor = disabled
    ? T.disabledText
    : active
    ? T.activeText
    : T.defaultText

  const bg = active
    ? T.activeBg
    : hovered && !disabled
    ? T.hoverBg
    : T.defaultBg

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
        display:     'inline-flex',
        alignItems:  'center',
        gap:         T.tabGap,
        padding:     `${T.tabPadV}px ${T.tabPadH}px`,
        borderRadius: T.tabRadius,
        background:  bg,
        border:      active
          ? `1px solid ${T.activeBorder}`
          : '1px solid transparent',
        cursor:      disabled ? 'not-allowed' : 'pointer',
        transition:  'background 100ms ease, border-color 100ms ease',
        userSelect:  'none',
        ...style,
      }}
      className={className}
    >
      {icon && (
        <span
          style={{
            display:  'flex',
            flexShrink: 0,
            color:    textColor,
            opacity:  disabled ? 0.4 : 1,
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
