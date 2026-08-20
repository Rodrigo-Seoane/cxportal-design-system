import { DUE_BUCKETS, type DueBucketDef } from '@/mocks/open-inventory/taxonomy'
import { cn } from '@/lib/utils'

// ── Status legend — the 5 due-bucket colours + their meanings (spec §6.1 item 4) ─

const SWATCH: Record<DueBucketDef['surfaceType'], string> = {
  error: 'bg-[var(--error-default)]',
  warning: 'bg-[var(--warning-default)]',
  info: 'bg-[var(--info-default)]',
  success: 'bg-[var(--success-default)]',
}

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] px-4 py-3">
      {DUE_BUCKETS.map(b => (
        <div key={b.key} className="flex items-center gap-2">
          <span className={cn('size-3 rounded-xs', SWATCH[b.surfaceType])} aria-hidden="true" />
          <span className="text-sm text-[var(--text-body-primary)]">{b.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-xs bg-[var(--neutral-400)]" aria-hidden="true" />
        <span className="text-sm text-[var(--text-body-primary)]">Total Inventory</span>
      </div>
    </div>
  )
}
