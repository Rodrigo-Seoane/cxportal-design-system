'use client'

import Link from 'next/link'
import { HouseIcon, CaretRightIcon } from '@phosphor-icons/react'

// ── Design tokens (Figma: nodes 1933-2500 / 2303-5400 / 2303-5312) ────────────

const T = {
  textColor:      'var(--text-on-action-transparent)',
  caretColor:     'var(--neutral-300)',
  fontSize:       12,
  lineHeight:    '20px',
  letterSpacing: '0.24px',
} as const

/** Max visible ancestor items before truncation kicks in. */
const MAX_VISIBLE_ANCESTORS = 4

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  /** Label text. The last item in the array is treated as the current page. */
  label: string
  /** Destination for this item. Omit only on the last (current-page) item. */
  href?: string
}

export interface BreadcrumbProps {
  /** Ancestor + current page trail. 1–5 items shown in full; beyond 5 the Max variant truncates middle ancestors with an ellipsis. */
  items: BreadcrumbItem[]
  /** Destination for the leading Home icon (the module root). */
  homeHref: string
  className?: string
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────────

export function Breadcrumb({ items, homeHref, className }: BreadcrumbProps) {
  // Determine visible items — Max variant truncates middle ancestors
  const ancestors = items.slice(0, -1)
  const current = items[items.length - 1]
  const needsTruncation = ancestors.length > MAX_VISIBLE_ANCESTORS
  const visibleAncestors = needsTruncation
    ? ancestors.slice(-3)  // last 3 ancestors before current
    : ancestors

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:          4,
          listStyle:   'none',
          margin:       0,
          padding:      0,
        }}
      >
        {/* Home icon */}
        <li style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link
            href={homeHref}
            aria-label="Home"
            style={{ display: 'flex', alignItems: 'center', padding: 2 }}
          >
            <HouseIcon size={14} color={T.textColor} weight="regular" />
          </Link>
          <CaretRightIcon size={12} color={T.caretColor} weight="regular" aria-hidden="true" />
        </li>

        {/* Ellipsis for Max variant */}
        {needsTruncation && (
          <li style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                padding:    2,
                fontSize:   T.fontSize,
                fontWeight: 400,
                lineHeight: T.lineHeight,
                color:      T.textColor,
                whiteSpace: 'nowrap',
              }}
            >
              &hellip;
            </span>
            <CaretRightIcon size={12} color={T.caretColor} weight="regular" aria-hidden="true" />
          </li>
        )}

        {/* Ancestor links */}
        {visibleAncestors.map((item, index) => (
          <li key={`${item.label}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link
              href={item.href ?? '#'}
              style={{
                padding:        2,
                fontSize:        T.fontSize,
                fontWeight:      400,
                lineHeight:      T.lineHeight,
                color:           T.textColor,
                whiteSpace:     'nowrap',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
            <CaretRightIcon size={12} color={T.caretColor} weight="regular" aria-hidden="true" />
          </li>
        ))}

        {/* Current page */}
        {current && (
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <span
              aria-current="page"
              style={{
                padding:       2,
                fontSize:       T.fontSize,
                fontWeight:     600,
                lineHeight:     T.lineHeight,
                letterSpacing:  T.letterSpacing,
                color:          T.textColor,
                whiteSpace:    'nowrap',
              }}
            >
              {current.label}
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}
