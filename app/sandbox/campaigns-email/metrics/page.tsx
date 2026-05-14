'use client'

import Link from 'next/link'
import { ChartBarIcon } from '@phosphor-icons/react'
import { GraphCard }  from '@/components/charts/GraphCard'
import { MetricTile } from '../_components/MetricTile'
import { CAMPAIGNS }  from '../_mock/campaigns'
import { METRICS, METRICS_BY_CAMPAIGN, AGGREGATE_METRICS } from '../_mock/metrics'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  sent:      { bg: 'var(--color-success-100)', color: '#1a6b1a', label: 'Sent'      },
  sending:   { bg: 'var(--color-info-100)',    color: '#1a4f9e', label: 'Sending'   },
  scheduled: { bg: 'var(--color-warning-100)', color: '#7a4a00', label: 'Scheduled' },
  draft:     { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)', label: 'Draft' },
  paused:    { bg: 'var(--color-error-100)',   color: '#8b1a2a', label: 'Paused'    },
  cancelled: { bg: 'var(--color-error-100)',   color: '#8b1a2a', label: 'Cancelled' },
}

// Build per-campaign bar data from METRICS (sent campaigns only)
const campaignBarData = METRICS.map(m => {
  const c = CAMPAIGNS.find(x => x.id === m.campaignId)
  return {
    month: c?.name.split('—')[0].trim().slice(0, 18) ?? m.campaignId,
    value: Math.round(m.openRate * 1000) / 10, // open rate as percentage points
  }
})

// Aggregate opens-by-hour across all metrics (shows combined curve shape)
const combinedHourly = METRICS[0].opensByHour.map((_, i) =>
  ({ month: `${i + 1}h`, value: METRICS.reduce((s, m) => s + m.opensByHour[i], 0) })
).filter(d => d.value > 0)

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MetricsPage() {
  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <ChartBarIcon size={20} color="var(--color-text-secondary)" />
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Metrics
        </h2>
      </div>

      {/* ── Aggregate KPIs ─────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 10, marginBottom: 28,
      }}>
        <MetricTile title="Total Sent"       value={AGGREGATE_METRICS.totalSent}         format="number"  />
        <MetricTile title="Avg Open Rate"    value={AGGREGATE_METRICS.avgOpenRate}        format="percent" />
        <MetricTile title="Avg Click Rate"   value={AGGREGATE_METRICS.avgClickRate}       format="percent" />
        <MetricTile title="Avg Bounce Rate"  value={AGGREGATE_METRICS.avgBounceRate}      format="percent" />
        <MetricTile title="Avg Unsub Rate"   value={AGGREGATE_METRICS.avgUnsubscribeRate} format="percent" />
      </div>

      {/* ── Charts row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <GraphCard
          title="Opens by Hour"
          description="Combined open curve across all tracked campaigns"
          chartType="area"
          data={combinedHourly}
          footerType="insight"
          insight="Peak engagement at hour 2–3 after send"
          period="All tracked campaigns"
          trendDirection="up"
        />
        <GraphCard
          title="Open Rate by Campaign"
          description="Open rate (%) for each tracked campaign"
          chartType="bar"
          data={campaignBarData}
          footerType="insight"
          insight={`Highest: ${fmtPct(Math.max(...METRICS.map(m => m.openRate)))}`}
          period="Sent campaigns only"
          trendDirection="up"
        />
      </div>

      {/* ── Per-campaign breakdown ─────────────────────────────── */}
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>
        Campaign Breakdown
      </h3>
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10,
        overflow: 'hidden', background: 'var(--color-surface-section)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-display)' }}>
              {['Campaign', 'Status', 'Sent', 'Open Rate', 'Click Rate', 'Bounce Rate', 'Unsubscribes'].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600,
                  color: 'var(--color-text-secondary)', textAlign: 'left',
                  borderBottom: '1px solid var(--color-border)',
                  textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map(c => {
              const m  = METRICS_BY_CAMPAIGN[c.id]
              const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-display)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/sandbox/campaigns-email/campaigns/${c.id}`}
                      style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
                        textDecoration: 'none' }}>
                      {c.name}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {m ? fmtCount(m.sent) : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {m ? fmtPct(m.openRate) : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {m ? fmtPct(m.clickRate) : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {m ? fmtPct(m.bounceRate) : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {m ? fmtCount(m.unsubscribes) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
