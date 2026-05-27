'use client'

import { ClickableHorizontalCard } from '@/components/ui/clickable-card'
import type { Draft } from '../../_draft'

interface Props { draft: Draft; update: (p: Partial<Draft>) => void }

export function StepSchedule({ draft, update }: Props) {
  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
        Schedule Your Campaign
      </p>

      <div className="flex gap-3">
        <ClickableHorizontalCard
          label="Send Now"
          selected={draft.scheduleMode === 'now'}
          onClick={() => update({ scheduleMode: 'now', scheduleDate: '', scheduleTime: '' })}
          className="flex-1"
        />
        <ClickableHorizontalCard
          label="Scheduled"
          selected={draft.scheduleMode === 'scheduled'}
          onClick={() => update({ scheduleMode: 'scheduled' })}
          className="flex-1"
        />
      </div>

      {draft.scheduleMode === 'scheduled' && (
        <div className="flex gap-4 pl-1">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[var(--color-text-primary)]">
              Start Date <span className="text-[var(--color-error-600)]">*</span>
            </label>
            <input
              type="date"
              value={draft.scheduleDate}
              onChange={e => update({ scheduleDate: e.target.value })}
              className="px-3 py-2 text-[13px] border border-[var(--color-border)] rounded-md bg-[var(--color-surface-section)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[var(--color-text-primary)]">
              Start Time <span className="text-[var(--color-error-600)]">*</span>
            </label>
            <input
              type="time"
              value={draft.scheduleTime}
              onChange={e => update({ scheduleTime: e.target.value })}
              className="px-3 py-2 text-[13px] border border-[var(--color-border)] rounded-md bg-[var(--color-surface-section)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
