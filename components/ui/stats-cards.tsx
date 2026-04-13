'use client'

import { cn } from '@/lib/utils'
import {
  ArrowFatLineUpIcon,
  ArrowFatLineDownIcon,
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
} from '@phosphor-icons/react'

// ── Icon map ──────────────────────────────────────────────────────────────────

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
  'voice-duration':     PhoneCallIcon,
  'delivery-rate':      CheckCircleIcon,
  'open-rate':          EnvelopeOpenIcon,
  'response-rate':      ChatCircleIcon,
  'opt-out':            UserMinusIcon,
  'voice-survey':       MicrophoneIcon,
  'voice-notification': BellSimpleIcon,
  'sms-survey':         ChatTextIcon,
  'sms-notification':   ChatDotsIcon,
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
  const iconInnerSize      = size === 'regular' ? 20 : 14
  const iconContainerSize  = size === 'regular' ? 36 : 24
  const iconContainerRadius = size === 'regular' ? 4 : 3

  const TrendArrow = trendType === 'decrease' ? ArrowFatLineDownIcon : ArrowFatLineUpIcon
  const trendColor =
    trendType === 'increase' ? '#1a6b1a' :
    trendType === 'decrease' ? '#8b1a2a' :
    '#7a828c'

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-[8px] border border-[#eff1f3]',
        surface === 'white' ? 'bg-white' : 'bg-[#f8f8f8]',
        className,
      )}
      style={{
        width:     size === 'regular' ? 180 : 172,
        minHeight: size === 'regular' ? 98  : 82,
        padding:   '8px 12px',
      }}
    >
      {/* Top row: icon + trend indicator */}
      <div className="flex items-start justify-between w-full">
        {/* Category icon */}
        <div
          className="bg-[#4285f4] flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            width:        iconContainerSize,
            height:       iconContainerSize,
            borderRadius: iconContainerRadius,
          }}
        >
          <IconComp size={iconInnerSize} color="#ffffff" weight="fill" />
        </div>

        {/* Trend indicator */}
        {showTrend && (
          <div className="flex items-center gap-[2px]">
            <TrendArrow size={8} color={trendColor} weight="fill" />
            <span className="text-[10px] leading-[16px] font-normal text-[#7a828c] whitespace-nowrap">
              {trend}
            </span>
          </div>
        )}
      </div>

      {/* Metric label + value */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] leading-[16px] font-semibold text-[#021920]">
          {title}
        </span>
        <span
          className={cn(
            'font-normal text-[#021920]',
            size === 'regular' ? 'text-[24px] leading-[30px]' : 'text-[20px] leading-[28px]',
          )}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
