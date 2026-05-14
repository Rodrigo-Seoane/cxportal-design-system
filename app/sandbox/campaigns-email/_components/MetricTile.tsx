import { ArrowFatLineUpIcon, ArrowFatLineDownIcon } from '@phosphor-icons/react'

export type MetricFormat = 'number' | 'percent' | 'currency'

export interface MetricTileProps {
  title:       string
  value:       number
  format?:     MetricFormat
  /** Signed delta vs comparison period (e.g. +0.023 = +2.3pp) */
  delta?:      number
  deltaLabel?: string
  /** Array of data points for the sparkline (12–60 values) */
  sparkline?:  number[]
  surface?:    'white' | 'gray'
}

function formatValue(value: number, format: MetricFormat): string {
  if (format === 'percent')  return `${(value * 100).toFixed(1)}%`
  if (format === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
  if (value >= 1_000_000)    return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)        return `${(value / 1_000).toFixed(0)}K`
  return value.toLocaleString()
}

function Sparkline({ data }: { data: number[] }) {
  const w = 80, h = 28, pad = 2
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - pad * 2))
  const ys = data.map(v => h - pad - ((v - min) / range) * (h - pad * 2))
  const points = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  return (
    <svg width={w} height={h} aria-hidden="true" style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function MetricTile({
  title,
  value,
  format      = 'number',
  delta,
  deltaLabel  = 'vs last period',
  sparkline,
  surface     = 'white',
}: MetricTileProps) {
  const positive   = delta !== undefined && delta >= 0
  const DeltaArrow = positive ? ArrowFatLineUpIcon : ArrowFatLineDownIcon
  const deltaColor = delta === undefined ? '' : positive ? '#1a6b1a' : '#8b1a2a'

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:            8,
      padding:       '12px 16px',
      borderRadius:   10,
      border:        '1px solid var(--color-border)',
      background:     surface === 'white' ? 'var(--color-surface-section)' : 'var(--color-surface-display)',
      minWidth:       160,
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: '16px' }}>
        {title}
      </span>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: 'var(--color-text-primary)' }}>
          {formatValue(value, format)}
        </span>
        {sparkline && sparkline.length >= 2 && <Sparkline data={sparkline} />}
      </div>

      {delta !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <DeltaArrow size={10} color={deltaColor} weight="fill" />
          <span style={{ fontSize: 11, color: deltaColor, fontWeight: 500, lineHeight: '16px' }}>
            {format === 'percent'
              ? `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(1)}pp`
              : `${delta >= 0 ? '+' : ''}${formatValue(Math.abs(delta), format)}`
            }{' '}
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>{deltaLabel}</span>
          </span>
        </div>
      )}
    </div>
  )
}
