'use client'

import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'
import { Flyout } from '@/components/wfm/Flyout'
import { generateSparkline } from '@/mocks/wfm/store'

export interface MetricTrendFlyoutProps {
  open: boolean
  onClose: () => void
  metricLabel: string
  currentValue: number | string
  unit?: string
  thresholdGreen?: number
  thresholdAmber?: number
}

export function MetricTrendFlyout({
  open,
  onClose,
  metricLabel,
  currentValue,
  unit = '',
  thresholdGreen = 90,
  thresholdAmber = 75,
}: MetricTrendFlyoutProps) {
  const baseVal = typeof currentValue === 'string' ? parseFloat(currentValue) : currentValue
  const data = useMemo(() => {
    const pts = generateSparkline(isNaN(baseVal) ? 80 : baseVal, 4, 60)
    return pts.map((p, i) => ({
      label: `${60 - i}m ago`,
      value: p.v,
    }))
  }, [baseVal])

  const tableData = data.filter((_, i) => i % 10 === 0)

  return (
    <Flyout open={open} onClose={onClose} title={`${metricLabel} — Last 60 min`} width={520}>
      <div style={{ fontFamily: 'var(--font-sans)' }}>
        {/* Current value summary */}
        <div style={{ marginBottom: 20, padding: '12px 14px', background: 'var(--surface-section-group-bg)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-body-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Current Value
          </div>
          <div style={{ fontSize: 28, fontWeight: 400, color: 'var(--text-body-primary)', marginTop: 2 }}>
            {currentValue}{unit}
          </div>
        </div>

        {/* Trend chart with grace band */}
        <div style={{ height: 220, marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--neutral-200)" strokeOpacity={0.6} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-body-secondary)', fontFamily: 'var(--font-sans)' }}
                axisLine={false} tickLine={false} interval={9} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-body-secondary)', fontFamily: 'var(--font-sans)' }}
                axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-section-bg)', border: '1px solid var(--neutral-100)', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-sans)' }}
                formatter={(v) => [`${(v as number).toFixed(1)}${unit}`, metricLabel]}
              />

              {/* Threshold reference lines */}
              <ReferenceLine y={thresholdGreen} stroke="var(--surface-accent-success-dark)" strokeDasharray="4 3" strokeWidth={1}
                label={{ value: `Green ≥ ${thresholdGreen}${unit}`, position: 'insideTopRight', fontSize: 10, fill: 'var(--surface-accent-success-dark)', fontFamily: 'var(--font-sans)' }} />
              <ReferenceLine y={thresholdAmber} stroke="var(--icon-warning)" strokeDasharray="4 3" strokeWidth={1}
                label={{ value: `Amber ≥ ${thresholdAmber}${unit}`, position: 'insideBottomRight', fontSize: 10, fill: 'var(--icon-warning)', fontFamily: 'var(--font-sans)' }} />

              {/* Grace band shading (amber zone) */}
              <ReferenceArea y1={thresholdAmber} y2={thresholdGreen} fill="var(--warning-100)" fillOpacity={0.25} />

              <Line type="monotone" dataKey="value" stroke="var(--content-action-primary-600)" strokeWidth={1.5}
                dot={false} activeDot={{ r: 3, fill: 'var(--content-action-primary-600)' }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabular toggle — a11y alternative */}
        <details style={{ marginTop: 16 }}>
          <summary style={{ fontSize: 12, color: 'var(--content-action-primary-600)', cursor: 'pointer', fontWeight: 500 }}>
            View as table (screen reader)
          </summary>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--text-body-secondary)', fontWeight: 600 }}>Time</th>
                <th style={{ textAlign: 'right', padding: '4px 8px', color: 'var(--text-body-secondary)', fontWeight: 600 }}>{metricLabel}</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <tr key={row.label} style={{ borderTop: '1px solid var(--neutral-100)' }}>
                  <td style={{ padding: '4px 8px', color: 'var(--text-body-primary)' }}>{row.label}</td>
                  <td style={{ padding: '4px 8px', color: 'var(--text-body-primary)', textAlign: 'right' }}>{row.value.toFixed(1)}{unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    </Flyout>
  )
}
