import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ── Chart Card shell — Figma node 362:2527 §8.2 item 4 ──────────────────────
// 24px horizontal padding, title+subtitle, plot slot, separator rule, then a
// 24×4 rounded colour indicator beside an insight sentence. Reused by every
// chart on the dashboard so the deck's framing questions have one home.

export function ChartCardShell({
  title,
  subtitle,
  insight,
  indicatorClassName = 'bg-[var(--content-action-primary-600)]',
  children,
  className,
}: {
  title: string
  subtitle?: string
  insight?: string
  indicatorClassName?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex h-full w-full flex-col rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)]', className)}>
      <div className="flex flex-col gap-1 px-6 pt-6 pb-4">
        <p className="text-base font-semibold leading-6 text-[var(--text-body-primary)]">{title}</p>
        {subtitle && <p className="text-sm leading-5 text-[var(--text-body-secondary)]">{subtitle}</p>}
      </div>

      <div className="flex-1 px-6">{children}</div>

      {insight && (
        <>
          <div className="mx-6 mt-6 border-t border-[var(--border-color-neutral-light)]" />
          <div className="flex items-center gap-2 px-6 py-4">
            <span className={cn('h-1 w-6 shrink-0 rounded-full', indicatorClassName)} aria-hidden="true" />
            <p className="text-sm leading-5 text-[var(--text-body-primary)]">{insight}</p>
          </div>
        </>
      )}
    </div>
  )
}
