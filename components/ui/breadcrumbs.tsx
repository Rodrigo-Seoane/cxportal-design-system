'use client'

import Link from 'next/link'
import { HouseIcon, CaretRightIcon } from '@phosphor-icons/react'

// ── Design tokens (Figma: nodes 1933-2500 / 2303-5400 / 2303-5312) ────────────

const T = {
  // Figma's component instance renders every label — ancestor and current —
  // in --text-on-action-transparent (#3a8015). Principles/Usage each claim a
  // different neutral gray instead, and disagree with each other too; the
  // component node wins per the design-system audit convention.
  textColor:   'var(--text-on-action-transparent)',
  caretColor:  'var(--neutral-300)',
  fontSize:    10,
  lineHeight: '16px',
} as const

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  /** Label text. The last item in the array is treated as the current page. */
  label: string
  /** Destination for this item. Omit only on the last (current-page) item. */
  href?: string
}

export interface BreadcrumbProps {
  /** Ancestor + current page trail. Depth (1-4 per Figma) is items.length. */
  items: BreadcrumbItem[]
  /** Destination for the leading Home icon (the module root). */
  homeHref: string
  className?: string
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────────

export function Breadcrumb({ items, homeHref, className }: BreadcrumbProps) {
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
        <li style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link
            href={homeHref}
            aria-label="Home"
            style={{ display: 'flex', alignItems: 'center', padding: 2 }}
          >
            <HouseIcon size={16} color={T.textColor} weight="regular" />
          </Link>
          <CaretRightIcon size={12} color={T.caretColor} weight="regular" aria-hidden="true" />
        </li>

        {items.map((item, index) => {
          const isCurrent = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {isCurrent ? (
                <span
                  aria-current="page"
                  style={{
                    padding:      2,
                    fontSize:      T.fontSize,
                    fontWeight:    600,
                    lineHeight:    T.lineHeight,
                    color:         T.textColor,
                    whiteSpace:   'nowrap',
                  }}
                >
                  {item.label}
                </span>
              ) : (
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
              )}
              {!isCurrent && (
                <CaretRightIcon size={12} color={T.caretColor} weight="regular" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
