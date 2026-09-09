'use client'

import { cn } from '@/lib/utils'
import {
  ArrowFatLineUpIcon,
  ArrowFatLineDownIcon,
  PaperPlaneTiltIcon,
  MicrophoneIcon,
  BoxArrowUpIcon,
  EnvelopeOpenIcon,
  UploadSimpleIcon,
  SubtitlesSlashIcon,
  UserSoundIcon,
  ListChecksIcon,
  ChatTextIcon,
  ClipboardTextIcon,
  UsersThreeIcon,
  UserFocusIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'

// ── Icon map ──────────────────────────────────────────────────────────────────
// Source: Figma node 814-10540 "Metric Tile Icons" — verified per iconLabel.
// 7 of the 10 mappings below were wrong before this pass (wrong Phosphor
// icon entirely, not just a colour/token mismatch).

export const STAT_ICON_KEYS = [
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
] as const

export type StatIconKey = (typeof STAT_ICON_KEYS)[number]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STAT_ICONS: Record<StatIconKey, React.ComponentType<any>> = {
  'sms-sent':           PaperPlaneTiltIcon,
  'voice-duration':     MicrophoneIcon,
  'delivery-rate':      BoxArrowUpIcon,
  'open-rate':          EnvelopeOpenIcon,
  'response-rate':      UploadSimpleIcon,
  'opt-out':            SubtitlesSlashIcon,
  'voice-survey':       UserSoundIcon,
  'voice-notification': ListChecksIcon,
  'sms-survey':         ChatTextIcon,
  'sms-notification':   ClipboardTextIcon,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatCardProps = {
  title?:     string
  value?:     string
  trend?:     string
  trendType?: 'increase' | 'decrease' | 'neutral'
  showTrend?: boolean
  surface?:   'white' | 'blue'
  size?:      'regular' | 'small'
  icon?:      StatIconKey
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function StatCard({
  title     = 'SMS Sent',
  value     = '6,893',
  trend     = '5.2% vs last week',
  trendType = 'increase',
  showTrend = true,
  surface   = 'white',
  size      = 'regular',
  icon      = 'sms-sent',
  className,
}: StatCardProps) {
  const IconComp           = STAT_ICONS[icon] ?? PaperPlaneTiltIcon
  const isRegular          = size === 'regular'
  const iconInnerSize      = isRegular ? 24 : 16
  const iconContainerSize  = isRegular ? 36 : 24
  const iconContainerRadius = isRegular ? 4 : 3

  const TrendArrow = trendType === 'decrease' ? ArrowFatLineDownIcon : ArrowFatLineUpIcon
  const trendColor =
    trendType === 'increase' ? 'var(--text-success)' :
    // Figma's Decrease state uses error/default (#ef2056), not --text-destructive
    // (which resolves to error-500, #ab0c36, a darker step).
    trendType === 'decrease' ? 'var(--error-default)' :
    'var(--text-body-secondary)'

  return (
    <div
      className={cn(
        'flex flex-col rounded-[8px] border border-[var(--border-color-form-fields-default)]',
        // Figma's "Blue" surface doesn't actually render blue — it's the
        // same gray used for the table zebra-stripe row. Kept the prop name
        // (matches Figma), flagged the naming oddity in Open Questions.
        surface === 'white' ? 'bg-white' : 'bg-[var(--surface-table-zebra-row)]',
        className,
      )}
      style={{
        width:          isRegular ? 180 : 172,
        height:         isRegular ? undefined : 80,
        minHeight:      isRegular ? 98 : undefined,
        justifyContent: isRegular ? undefined : 'space-between',
        gap:            isRegular ? 12 : undefined,
        padding:        isRegular ? 12 : 8,
      }}
    >
      {/* Top row: icon + trend indicator */}
      <div className="flex items-start justify-between w-full">
        {/* Category icon */}
        <div
          className="bg-[var(--surface-action-primary-default)] flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            width:        iconContainerSize,
            height:       iconContainerSize,
            borderRadius: iconContainerRadius,
          }}
        >
          <IconComp size={iconInnerSize} color="var(--neutral-0)" weight="regular" />
        </div>

        {/* Trend indicator */}
        {showTrend && (
          <div className="flex items-center gap-[2px]">
            <TrendArrow size={8} color={trendColor} weight="fill" />
            <span className="text-[10px] leading-[16px] font-normal text-[var(--text-body-secondary)] whitespace-nowrap">
              {trend}
            </span>
          </div>
        )}
      </div>

      {/* Metric label + value */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] leading-[16px] font-semibold text-[var(--neutral-800)]">
          {title}
        </span>
        <span
          className={cn(
            'font-normal text-[var(--neutral-800)]',
            isRegular ? 'text-[24px] leading-[30px]' : 'text-[18px] leading-[24px]',
          )}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

// ── MetricTileAcgr ────────────────────────────────────────────────────────────
// Source: Figma node 1969-2493 "Data Card / ACGR" — a distinct card family
// from StatCard/MetricTileCampaigns above: a fixed-role icon (assigned
// agents), an optional "Assigned to N TDGs" caption, an info affordance next
// to the label, and an "Action" state that turns the whole card into a red
// alert with an inline CTA instead of a trend indicator.

export type MetricTileAcgrType = 'action' | 'only-view'

export interface MetricTileAcgrProps {
  label?: string
  value?: string
  type?: MetricTileAcgrType
  /** "Only View" caption — e.g. 3 renders "Assigned to 3 TDGs". Omit to hide. */
  assignedTdgCount?: number
  /** "Action" CTA handler — only rendered when type="action". */
  onAssign?: () => void
  className?: string
}

export function MetricTileAcgr({
  label            = 'Total Agents',
  value            = '6,893',
  type             = 'only-view',
  assignedTdgCount,
  onAssign,
  className,
}: MetricTileAcgrProps) {
  const isAction = type === 'action'

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-[8px] border border-[var(--border-color-form-fields-default)]',
        isAction ? 'bg-[var(--error-default)]' : 'bg-white',
        className,
      )}
      style={{ width: 172, padding: '8px 12px' }}
    >
      {/* Top row: icon + optional TDG caption (Only View only) */}
      <div className="flex items-center justify-between w-full">
        <div
          className={cn(
            'flex items-center justify-center shrink-0 overflow-hidden rounded-[2.667px] size-6',
            isAction ? 'bg-white' : 'bg-[var(--surface-action-primary-default)]',
          )}
        >
          {isAction ? (
            <UserFocusIcon size={16} weight="regular" color="var(--neutral-800)" />
          ) : (
            <UsersThreeIcon size={16} weight="regular" color="var(--neutral-0)" />
          )}
        </div>

        {!isAction && assignedTdgCount != null && (
          <span className="text-[10px] leading-[16px] font-normal text-[var(--text-body-secondary)] whitespace-nowrap">
            Assigned to {assignedTdgCount} TDGs
          </span>
        )}
      </div>

      {/* Label + value */}
      <div className={cn('flex flex-col gap-1', isAction && 'w-full')}>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'text-[10px] leading-[16px] font-semibold whitespace-nowrap',
              isAction ? 'text-[var(--text-body-on-dark-surface)]' : 'text-[var(--neutral-800)]',
            )}
          >
            {label}
          </span>
          <WarningCircleIcon
            size={12}
            weight="regular"
            color={isAction ? 'var(--text-body-on-dark-surface)' : 'var(--text-body-secondary)'}
          />
        </div>

        {isAction ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[20px] leading-[28px] font-normal text-[var(--text-body-on-dark-surface)] whitespace-nowrap">
              {value}
            </span>
            <button
              type="button"
              onClick={onAssign}
              className="text-[10px] leading-[16px] font-normal whitespace-nowrap"
              style={{
                background:   'var(--surface-action-terciary-default)',
                border:       '0.75px solid var(--border-color-surface-active-secondary-default)',
                borderRadius: 4,
                padding:      '4px 8px',
                color:        'var(--neutral-800)',
              }}
            >
              Assign
            </button>
          </div>
        ) : (
          <span className="text-[20px] leading-[28px] font-normal text-[var(--neutral-800)] whitespace-nowrap">
            {value}
          </span>
        )}
      </div>
    </div>
  )
}
