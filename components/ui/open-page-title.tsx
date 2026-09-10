'use client'

import type { ReactNode } from 'react'
import { Breadcrumb, type BreadcrumbItem } from './breadcrumbs'
import { PageTitle } from './page-title'

// ── OpenPageTitle ─────────────────────────────────────────────────────────────
//
// Figma's "Open Page Title" frame (node 3700-1594) stacks a Breadcrumb above
// PageTitle with a 16px gap, both aligned to the same 16px horizontal
// padding. Thin composition wrapper -- no new visual logic, reuses both
// components exactly as-is. Breadcrumb gets its own top/side padding (16px,
// 0 bottom); PageTitle's own 16px padding on all sides supplies the 16px gap
// beneath it. See page-title.mdx's Do's & Don'ts: breadcrumbs don't belong
// inside PageTitle itself, only above it in the layout hierarchy -- this
// component is that hierarchy, pre-composed for the common case.

export interface OpenPageTitleProps {
  /** Breadcrumb ancestor + current page trail. Last item is the current page. */
  breadcrumbItems: BreadcrumbItem[]
  /** Destination for the breadcrumb's leading Home icon (the module root). */
  homeHref: string
  /** Primary page title text. */
  title: string
  /** Supporting description text below the title. */
  subtitle?: string
  /** Category or status chip label. */
  chip?: string
  /** Show/hide the chip. Default: false. */
  showChip?: boolean
  /** Callback when chip dismiss button is clicked. If omitted, chip has no dismiss. */
  onChipDismiss?: () => void
  /** Right-side slot for composable action controls (buttons, search, tabs, etc.). */
  actions?: ReactNode
  className?: string
}

export function OpenPageTitle({
  breadcrumbItems,
  homeHref,
  title,
  subtitle,
  chip,
  showChip,
  onChipDismiss,
  actions,
  className,
}: OpenPageTitleProps) {
  return (
    // Open Page Title (Breadcrumb + Page Title) is a transparent section of
    // the page shell (2026-09-10 rule).
    <div className={className} style={{ backgroundColor: 'transparent' }}>
      <div style={{ padding: '16px 16px 0' }}>
        <Breadcrumb items={breadcrumbItems} homeHref={homeHref} />
      </div>
      <PageTitle
        title={title}
        subtitle={subtitle}
        chip={chip}
        showChip={showChip}
        onChipDismiss={onChipDismiss}
        actions={actions}
      />
    </div>
  )
}
