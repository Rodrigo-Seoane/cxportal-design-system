'use client'

import { CaretLeft, CaretRight } from '@phosphor-icons/react'

// ── Design tokens (Figma: node 350-6690) ──────────────────────────────────────

const T = {
  // Shared button
  border:        '#689df6',              // --border-color/surface-active/primary
  textColor:     '#3264b8',              // --text/on-action/transparent
  idleBg:        'transparent',          // --surface/action/empty
  activeBg:      '#ffffff',              // --surface/form-field — current page
  hoverBg:       'rgba(66,133,244,0.06)',

  // Border radii
  radiusSm:       4,                     // --border-radius/sm — directional icons
  radiusMd:       8,                     // --border-radius/md — Back/Next + page nums

  // Page number button fixed size
  pageWidth:      36,

  // Typography — Body/Small
  fontSize:       12,
  fontWeight:     400,
  lineHeight:    '20px',

  // Counter label ("2 of 4") — Body/Regular
  counterSize:    14,
  counterColor:  '#021920',              // --text/body/primary
} as const

// ── Types ─────────────────────────────────────────────────────────────────────

export type PaginationVariant =
  | 'directional'          // arrows only
  | 'directional-counter'  // arrows + "X of Y" label
  | 'back-next'            // Back / Next labeled buttons (no page numbers)
  | 'numbered'             // Back / page numbers / Next (auto-truncates)

export interface PaginationProps {
  /** Current page (1-based) */
  page: number
  /** Total number of pages */
  totalPages: number
  /** Called when the user selects a new page */
  onChange: (page: number) => void
  /** Which variant to render. Defaults to 'numbered'. */
  variant?: PaginationVariant
  /** Disable all controls */
  disabled?: boolean
  style?: React.CSSProperties
  className?: string
}

// ── Truncation algorithm ──────────────────────────────────────────────────────
// Returns page numbers and '...' placeholders.
// Always shows first, last, current, and 1 adjacent on each side.

function getPageRange(page: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // Near the start
  if (page <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  // Near the end
  if (page >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  // Middle
  return [1, '...', page - 1, page, page + 1, '...', total]
}

// ── Shared button primitives ──────────────────────────────────────────────────

interface IconBtnProps {
  onClick: () => void
  disabled?: boolean
  'aria-label': string
  children: React.ReactNode
}

function IconBtn({ onClick, disabled, 'aria-label': ariaLabel, children }: IconBtnProps) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:         8,
        border:         `1px solid ${disabled ? '#d1d5db' : T.border}`,
        borderRadius:    T.radiusSm,
        background:      disabled ? 'transparent' : hovered ? T.hoverBg : T.idleBg,
        color:           disabled ? '#aab0b8' : T.textColor,
        cursor:          disabled ? 'not-allowed' : 'pointer',
        transition:     'background 100ms ease, border-color 100ms ease',
        flexShrink:      0,
      }}
    >
      {children}
    </button>
  )
}

interface LabelBtnProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

function LabelBtn({ onClick, disabled, children }: LabelBtnProps) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:          8,
        padding:      8,
        border:      `1px solid ${disabled ? '#d1d5db' : T.border}`,
        borderRadius: T.radiusMd,
        background:   disabled ? 'transparent' : hovered ? T.hoverBg : T.idleBg,
        color:        disabled ? '#aab0b8' : T.textColor,
        fontSize:     T.fontSize,
        fontWeight:   T.fontWeight,
        lineHeight:   T.lineHeight,
        whiteSpace:  'nowrap',
        cursor:       disabled ? 'not-allowed' : 'pointer',
        transition:  'background 100ms ease, border-color 100ms ease',
        flexShrink:   0,
      }}
    >
      {children}
    </button>
  )
}

interface PageBtnProps {
  page: number
  active?: boolean
  onClick: () => void
}

function PageBtn({ page, active, onClick }: PageBtnProps) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Page ${page}`}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:           T.pageWidth,
        minWidth:        T.pageWidth,
        padding:         8,
        border:         `1px solid ${T.border}`,
        borderRadius:    T.radiusMd,
        background:      active ? T.activeBg : hovered ? T.hoverBg : T.idleBg,
        color:           T.textColor,
        fontSize:        T.fontSize,
        fontWeight:      T.fontWeight,
        lineHeight:      T.lineHeight,
        cursor:         'pointer',
        transition:     'background 100ms ease',
        flexShrink:      0,
      }}
    >
      {page}
    </button>
  )
}

function Ellipsis() {
  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:           T.pageWidth,
        minWidth:        T.pageWidth,
        padding:         8,
        border:         `1px solid ${T.border}`,
        borderRadius:    T.radiusMd,
        background:      T.idleBg,
        color:           T.textColor,
        fontSize:        T.fontSize,
        fontWeight:      T.fontWeight,
        lineHeight:      T.lineHeight,
        flexShrink:      0,
        userSelect:     'none',
      }}
    >
      …
    </span>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

import React from 'react'

export function Pagination({
  page,
  totalPages,
  onChange,
  variant = 'numbered',
  disabled = false,
  style,
  className,
}: PaginationProps) {
  const atFirst = page <= 1
  const atLast  = page >= totalPages

  const prev = () => { if (!atFirst && !disabled) onChange(page - 1) }
  const next = () => { if (!atLast  && !disabled) onChange(page + 1) }

  // ── Directional (arrows only) ─────────────────────────────────────────────
  if (variant === 'directional') {
    return (
      <nav
        aria-label="Pagination"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}
        className={className}
      >
        <IconBtn onClick={prev} disabled={disabled || atFirst} aria-label="Previous page">
          <CaretLeft size={16} weight="regular" />
        </IconBtn>
        <IconBtn onClick={next} disabled={disabled || atLast} aria-label="Next page">
          <CaretRight size={16} weight="regular" />
        </IconBtn>
      </nav>
    )
  }

  // ── Directional + counter ("2 of 4") ─────────────────────────────────────
  if (variant === 'directional-counter') {
    return (
      <nav
        aria-label="Pagination"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 24, ...style }}
        className={className}
      >
        <IconBtn onClick={prev} disabled={disabled || atFirst} aria-label="Previous page">
          <CaretLeft size={16} weight="regular" />
        </IconBtn>
        <span
          aria-live="polite"
          aria-atomic="true"
          style={{
            fontSize:   T.counterSize,
            fontWeight: T.fontWeight,
            lineHeight: T.lineHeight,
            color:      T.counterColor,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {page} of {totalPages}
        </span>
        <IconBtn onClick={next} disabled={disabled || atLast} aria-label="Next page">
          <CaretRight size={16} weight="regular" />
        </IconBtn>
      </nav>
    )
  }

  // ── Back / Next (no page numbers) ────────────────────────────────────────
  if (variant === 'back-next') {
    return (
      <nav
        aria-label="Pagination"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}
        className={className}
      >
        <LabelBtn onClick={prev} disabled={disabled || atFirst}>
          <CaretLeft size={16} weight="thin" />
          Back
        </LabelBtn>
        <LabelBtn onClick={next} disabled={disabled || atLast}>
          Next
          <CaretRight size={16} weight="thin" />
        </LabelBtn>
      </nav>
    )
  }

  // ── Numbered (Back + page numbers + Next, auto-truncates) ─────────────────
  const range = getPageRange(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}
      className={className}
    >
      <LabelBtn onClick={prev} disabled={disabled || atFirst}>
        <CaretLeft size={16} weight="thin" />
        Back
      </LabelBtn>

      {range.map((item, i) =>
        item === '...' ? (
          <Ellipsis key={`ellipsis-${i}`} />
        ) : (
          <PageBtn
            key={item}
            page={item as number}
            active={item === page}
            onClick={() => !disabled && onChange(item as number)}
          />
        ),
      )}

      <LabelBtn onClick={next} disabled={disabled || atLast}>
        Next
        <CaretRight size={16} weight="thin" />
      </LabelBtn>
    </nav>
  )
}
