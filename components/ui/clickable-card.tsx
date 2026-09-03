'use client'

import { cn } from '@/lib/utils'
import {
  PaperPlaneTiltIcon,
  PhoneCallIcon,
  CheckCircleIcon,
  EnvelopeOpenIcon,
  ChatCircleIcon,
  UserMinusIcon,
  MicrophoneIcon,
  BellSimpleIcon,
  ChatTextIcon,
  ChatDotsIcon,
  UserSoundIcon,
  EnvelopeIcon,
} from '@phosphor-icons/react'

// ── Icon map ──────────────────────────────────────────────────────────────────

export const CLICKABLE_CARD_ICON_KEYS = [
  'sms-sent',
  'voice-duration',
  'delivery-rate',
  'open-rate',
  'response-rate',
  'opt-out',
  'voice-survey',
  'voice-notification',
  'sms-survey',
  'sms-notification',
  'email-campaign',
] as const

export type ClickableCardIconKey = (typeof CLICKABLE_CARD_ICON_KEYS)[number]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICONS: Record<ClickableCardIconKey, React.ComponentType<any>> = {
  'sms-sent':           PaperPlaneTiltIcon,
  'voice-duration':     PhoneCallIcon,
  'delivery-rate':      CheckCircleIcon,
  'open-rate':          EnvelopeOpenIcon,
  'response-rate':      ChatCircleIcon,
  'opt-out':            UserMinusIcon,
  'voice-survey':       UserSoundIcon,
  'voice-notification': BellSimpleIcon,
  'sms-survey':         ChatTextIcon,
  'sms-notification':   ChatDotsIcon,
  'email-campaign':     EnvelopeIcon,
}

// ── Radio dot (internal) ──────────────────────────────────────────────────────

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div
      className={cn(
        'shrink-0 size-[18px] rounded-full border bg-[var(--neutral-0)] overflow-hidden',
        selected
          ? 'border-[var(--content-action-primary-600)] flex items-center justify-center'
          : 'border-[var(--neutral-100)]',
      )}
    >
      {selected && <div className="size-3 rounded-full bg-[var(--content-action-primary-600)]" />}
    </div>
  )
}

// ── ClickableCard ─────────────────────────────────────────────────────────────

export type ClickableCardProps = {
  title?:       string
  description?: string
  icon?:        ClickableCardIconKey
  selected?:    boolean
  onClick?:     () => void
  className?:   string
}

export function ClickableCard({
  title       = 'Voice Survey',
  description = 'Collect feedback through interactive voice calls with up to 5 questions. Responses are entered via keypad.',
  icon        = 'voice-survey',
  selected    = false,
  onClick,
  className,
}: ClickableCardProps) {
  const IconComp = ICONS[icon] ?? PaperPlaneTiltIcon

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex gap-6 items-start p-4 rounded-lg border text-left w-full cursor-pointer transition-colors',
        selected
          ? 'bg-[var(--neutral-200)] border-[var(--content-action-primary-600)]'
          : 'bg-[var(--neutral-0)] border-[var(--neutral-100)] hover:border-[var(--content-action-primary-600)]',
        className,
      )}
    >
      {/* Category icon */}
      <div className="bg-[var(--content-action-primary-600)] flex items-center justify-center shrink-0 overflow-hidden rounded-[4px] size-9">
        <IconComp size={20} color="var(--neutral-0)" weight="fill" />
      </div>

      {/* Content: title + description */}
      <div className="flex flex-col justify-between flex-1 min-h-[92px] min-w-0">
        <p className="text-[18px] leading-[24px] font-normal text-[var(--text-body-primary)] truncate">
          {title}
        </p>
        <p className="text-[12px] leading-[20px] font-normal text-[var(--text-body-primary)]">
          {description}
        </p>
      </div>

      {/* Radio indicator */}
      <RadioDot selected={selected} />
    </button>
  )
}

// ── ClickableHorizontalCard ───────────────────────────────────────────────────

export type ClickableHorizontalCardProps = {
  label?:     string
  selected?:  boolean
  onClick?:   () => void
  className?: string
}

export function ClickableHorizontalCard({
  label    = 'Schedule Campaign',
  selected = false,
  onClick,
  className,
}: ClickableHorizontalCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex gap-3 items-center p-6 rounded-[4px] border text-left cursor-pointer transition-colors',
        selected
          ? 'bg-[var(--neutral-200)] border-[var(--content-action-primary-600)]'
          : 'bg-[var(--neutral-0)] border-[var(--neutral-100)] hover:border-[var(--content-action-primary-600)]',
        className,
      )}
    >
      <RadioDot selected={selected} />
      <span
        className="text-[12px] font-semibold leading-[16px] uppercase text-[var(--text-body-primary)] whitespace-nowrap"
        style={{ letterSpacing: '0.48px' }}
      >
        {label}
      </span>
    </button>
  )
}
