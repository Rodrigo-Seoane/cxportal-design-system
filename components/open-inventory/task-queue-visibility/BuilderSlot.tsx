'use client'

import { CheckIcon, PencilSimpleIcon } from '@phosphor-icons/react'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type SlotVariant = 'empty' | 'active' | 'filled' | 'disabled'

export interface BuilderSlotProps {
  index: number
  placeholder: string
  value?: string
  variant: SlotVariant
  disabledReason?: string
  onEdit?: () => void
}

function SlotBullet({ index, variant }: { index: number; variant: SlotVariant }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        (variant === 'filled' || variant === 'active') && 'bg-[var(--content-action-primary-600)] text-white',
        (variant === 'empty' || variant === 'disabled') &&
          'border-2 border-[var(--border-color-neutral-light)] text-[var(--text-body-secondary)]',
        variant === 'disabled' && 'opacity-60',
      )}
    >
      {variant === 'filled' ? <CheckIcon size={14} weight="bold" /> : index}
    </span>
  )
}

/**
 * One numbered step in the Assignment Builder header. Four visual states —
 * empty / active / filled / disabled — reused for Queue → Task → Worker.
 */
export function BuilderSlot({ index, placeholder, value, variant, disabledReason, onEdit }: BuilderSlotProps) {
  const body = (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-1 rounded-md px-3 py-1.5',
        variant === 'active' && 'bg-[var(--content-action-primary-100)]',
        variant === 'disabled' && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-2">
        <SlotBullet index={index} variant={variant} />
        <span
          className={cn(
            'truncate text-sm',
            variant === 'filled' && 'font-semibold text-[var(--text-body-primary)]',
            variant === 'active' && 'font-medium text-[var(--text-body-primary)]',
            (variant === 'empty' || variant === 'disabled') && 'text-[var(--text-body-secondary)]',
          )}
        >
          {value ?? placeholder}
        </span>
        {variant === 'filled' && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Change ${placeholder.toLowerCase()}`}
            className="ml-1 flex shrink-0 items-center text-[var(--text-body-secondary)] transition-colors hover:text-[var(--text-action)]"
          >
            <PencilSimpleIcon size={14} weight="regular" />
          </button>
        )}
      </div>
      {variant === 'active' && (
        <div className="ml-8 h-0.5 w-6 rounded-full bg-[var(--content-action-primary-600)]" />
      )}
    </div>
  )

  if (variant === 'disabled' && disabledReason) {
    return (
      <Tooltip content={disabledReason} className="min-w-0 flex-1">
        {body}
      </Tooltip>
    )
  }
  return body
}
