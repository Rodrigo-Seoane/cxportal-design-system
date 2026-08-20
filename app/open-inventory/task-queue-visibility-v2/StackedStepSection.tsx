'use client'

import { forwardRef, useId, useImperativeHandle, useRef } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// One numbered, always-visible step section in the v2 stacked layout. Owns
// the aria-disabled + inert semantics for the dimmed variant and exposes a
// focusFirstRow() imperative handle so the page can jump focus into the
// section when it becomes newly active.

export type StackedSectionVariant = 'disabled' | 'active' | 'filled'

export interface StackedStepSectionRef {
  /** Move focus to the section's first interactive row / control. */
  focusFirstRow: () => void
}

export interface StackedStepSectionProps {
  index: 1 | 2 | 3
  heading: string
  /** Shown under the heading only when variant === 'disabled'. */
  disabledHint?: string
  variant: StackedSectionVariant
  /** Optional value chip shown next to the heading when variant === 'filled'. */
  filledValue?: string
  children: React.ReactNode
}

function SectionBullet({ index, variant }: { index: 1 | 2 | 3; variant: StackedSectionVariant }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
        (variant === 'filled' || variant === 'active') && 'bg-[var(--content-action-primary-600)] text-white',
        variant === 'disabled' && 'border-2 border-[var(--border-color-neutral-light)] text-[var(--text-body-secondary)] opacity-60',
      )}
    >
      {variant === 'filled' ? <CheckIcon size={16} weight="bold" /> : index}
    </span>
  )
}

export const StackedStepSection = forwardRef<StackedStepSectionRef, StackedStepSectionProps>(function StackedStepSection(
  { index, heading, disabledHint, variant, filledValue, children },
  ref,
) {
  const headingId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    focusFirstRow: () => {
      const root = containerRef.current
      if (!root) return
      // Prefer a radio row (Task / Worker tables). Fall back to the first
      // focusable control (Queue table row buttons, empty-state buttons).
      const radio = root.querySelector<HTMLElement>('input[type="radio"]:not(:disabled)')
      if (radio) { radio.focus(); return }
      const clickableRow = root.querySelector<HTMLElement>('tr[role="row"] button, tr td button, tbody tr')
      if (clickableRow) { clickableRow.focus(); return }
      const first = root.querySelector<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])')
      first?.focus()
    },
  }))

  const isDisabled = variant === 'disabled'

  return (
    <section
      aria-labelledby={headingId}
      aria-disabled={isDisabled || undefined}
      data-disabled={isDisabled || undefined}
      className={cn(
        'rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] transition-opacity duration-200',
        isDisabled && 'opacity-50',
      )}
    >
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color-neutral-light)]">
        <SectionBullet index={index} variant={variant} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 id={headingId} className="text-sm font-semibold text-[var(--text-body-primary)]">
            {heading}
          </h2>
          {isDisabled && disabledHint && (
            <p className="text-xs text-[var(--text-body-secondary)]">{disabledHint}</p>
          )}
        </div>
        {variant === 'filled' && filledValue && (
          <span className="truncate text-sm font-medium text-[var(--text-body-secondary)]">
            {filledValue}
          </span>
        )}
      </header>

      {/* `inert` (React 19) removes children from tab order + hit-testing while
          keeping them perceivable. If SSR/hydration issues surface, replace
          with a query-selector effect that sets tabindex="-1" on descendants. */}
      <div
        ref={containerRef}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error — React 19 accepts `inert` as a boolean prop; TS lib.dom may lag.
        inert={isDisabled ? '' : undefined}
        className={cn('flex flex-col', isDisabled && 'pointer-events-none')}
      >
        {children}
      </div>
    </section>
  )
})
