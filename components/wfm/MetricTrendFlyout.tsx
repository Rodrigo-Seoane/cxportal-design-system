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
        <div style={{ marginBottom: 20, padding: '12px 14px', background: '#f8f8f8', borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7a828c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Current Value
          </div>
          <div style={{ fontSize: 28, fontWeight: 400, color: '#021920', marginTop: 2 }}>
            {currentValue}{unit}
          </div>
        </div>

        {/* Trend chart with grace band */}
        <div style={{ height: 220, marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e0e4e8" strokeOpacity={0.6} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#7a828c', fontFamily: 'var(--font-sans)' }}
                axisLine={false} tickLine={false} interval={9} />
              <YAxis tick={{ fontSize: 10, fill: '#7a828c', fontFamily: 'var(--font-sans)' }}
                axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #eff1f3', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-sans)' }}
                formatter={(v) => [`${(v as number).toFixed(1)}${unit}`, metricLabel]}
              />

              {/* Threshold reference lines */}
              <ReferenceLine y={thresholdGreen} stroke="#4b9924" strokeDasharray="4 3" strokeWidth={1}
                label={{ value: `Green ≥ ${thresholdGreen}${unit}`, position: 'insideTopRight', fontSize: 10, fill: '#4b9924', fontFamily: 'var(--font-sans)' }} />
              <ReferenceLine y={thresholdAmber} stroke="#c97000" strokeDasharray="4 3" strokeWidth={1}
                label={{ value: `Amber ≥ ${thresholdAmber}${unit}`, position: 'insideBottomRight', fontSize: 10, fill: '#c97000', fontFamily: 'var(--font-sans)' }} />

              {/* Grace band shading (amber zone) */}
              <ReferenceArea y1={thresholdAmber} y2={thresholdGreen} fill="#fbeed8" fillOpacity={0.25} />

              <Line type="monotone" dataKey="value" stroke="#4285f4" strokeWidth={1.5}
                dot={false} activeDot={{ r: 3, fill: '#4285f4' }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabular toggle — a11y alternative */}
        <details style={{ marginTop: 16 }}>
          <summary style={{ fontSize: 12, color: '#4285f4', cursor: 'pointer', fontWeight: 500 }}>
            View as table (screen reader)
          </summary>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 8px', color: '#7a828c', fontWeight: 600 }}>Time</th>
                <th style={{ textAlign: 'right', padding: '4px 8px', color: '#7a828c', fontWeight: 600 }}>{metricLabel}</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <tr key={row.label} style={{ borderTop: '1px solid #eff1f3' }}>
                  <td style={{ padding: '4px 8px', color: '#021920' }}>{row.label}</td>
                  <td style={{ padding: '4px 8px', color: '#021920', textAlign: 'right' }}>{row.value.toFixed(1)}{unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    </Flyout>
  )
}
