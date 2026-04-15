import { TopBar } from '@/components/layout/TopBar'
import { GraphCard } from '@/components/charts/GraphCard'
import type { GraphCardChartType } from '@/components/charts/GraphCard'

// ── Layout helpers ─────────────────────────────────────────────────────────────

function Section({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mt-12 mb-4">
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      )}
    </div>
  )
}

function CardGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 16,
    }}>
      {children}
    </div>
  )
}

function GroupHeader({ title }: { title: string }) {
  return (
    <p style={{
      margin: '24px 0 12px',
      fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: '#7a828c',
    }}>
      {title}
    </p>
  )
}

// ── Reusable card with label ───────────────────────────────────────────────────

function Variant({
  type, title, description, insight, trendDirection, period,
}: {
  type:          GraphCardChartType
  title:         string
  description:   string
  insight?:      string
  trendDirection?: 'up' | 'down' | 'neutral'
  period?:       string
}) {
  return (
    <GraphCard
      chartType={type}
      title={title}
      description={description}
      insight={insight}
      trendDirection={trendDirection}
      period={period}
    />
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function GraphCardsPage() {
  return (
    <>
      <TopBar title="Graph Cards" figmaUpdated="Apr 14, 2026" />
      <main className="flex-1 px-8 py-10" style={{ maxWidth: 1100 }}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-2">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Graph Cards
          </h2>
        </div>
        <p className="mb-10 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          Compact chart panels for metric grids. Each card pairs a chart-type label, a title, a
          single chart, and a footer. Cards support 22 chart styles across 5 families: Area, Bar,
          Line, Pie, and Radial.
        </p>

        {/* ── Anatomy ──────────────────────────────────────────────────── */}
        <Section title="Anatomy" description="Every Graph Card has four layers stacked vertically." />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16, padding: '20px 24px',
          background: '#ffffff', border: '1px solid #eff1f3', borderRadius: 8,
        }}>
          {[
            {
              label: 'Chart type header',
              desc:  'Icon + group name (Area Chart, Bar Chart…) and variant label on the right.',
            },
            {
              label: 'Title & description',
              desc:  'Short metric name (16px/600) and a one-line context string (14px/400).',
            },
            {
              label: 'Chart body',
              desc:  'Recharts chart scaled to card width. Horizontal grid lines only; no Y-axis values.',
            },
            {
              label: 'Footer',
              desc:  'Insight (trend text + icon + period) or Captions (colored legend dots). Pie/Radial default to Captions.',
            },
          ].map(({ label, desc }) => (
            <div key={label}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#021920' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: '#7a828c', lineHeight: '18px' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            CHART STYLES — all 22 variants
        ════════════════════════════════════════════════════════════════ */}
        <Section
          title="Chart styles"
          description="All supported chart variants. Each card shows the Figma-specified style applied to sample data."
        />

        {/* ── Area (3 variants) ─────────────────────────────────────────── */}
        <GroupHeader title="Area" />
        <CardGrid cols={3}>
          <Variant type="area"
            title="Single Value"
            description="One series, gradient fill under the line"
            insight="Trending up by 5.2% this month"
            trendDirection="up" period="January – June 2024"
          />
          <Variant type="area-two"
            title="Two Values"
            description="Two overlapping area series, distinct fills"
            insight="Primary up 5.2%, secondary up 3.8%"
            trendDirection="up" period="January – June 2024"
          />
          <Variant type="area-duo"
            title="Duo + Background"
            description="Background fill layer behind two area curves"
            insight="Combined volume trending upward"
            trendDirection="up" period="January – June 2024"
          />
        </CardGrid>

        {/* ── Bar (6 variants) ──────────────────────────────────────────── */}
        <GroupHeader title="Bar" />
        <CardGrid cols={3}>
          <Variant type="bar"
            title="Vertical · 1 Color"
            description="Vertical bars, single primary color, value labels on top"
            insight="Trending up by 5.2% this month"
            trendDirection="up" period="January – June 2024"
          />
          <Variant type="bar-grouped"
            title="Two Verticals"
            description="Grouped bars, two series side by side"
            insight="Primary series outperformed secondary"
            trendDirection="up" period="January – June 2024"
          />
          <Variant type="bar-multi"
            title="Vertical · 5 Colors"
            description="Vertical bars, each column a step of the primary palette"
            insight="Highest volume in February"
            trendDirection="up" period="January – June 2024"
          />
          <Variant type="bar-h"
            title="Horizontal · 1 Color"
            description="Horizontal bars, single color, labels and values outside"
            insight="Chrome leads with 320 sessions"
            trendDirection="up" period="January – June 2024"
          />
          <Variant type="bar-h-multi"
            title="Horizontal · 5 Colors"
            description="Horizontal bars, each row a step of the primary palette"
            insight="Chrome leads by a wide margin"
            trendDirection="up" period="January – June 2024"
          />
          <Variant type="bar-negative"
            title="Negative · 2 Colors"
            description="Positive bars in primary blue, negative bars in a lighter shade"
            insight="Net positive for the period"
            trendDirection="up" period="January – June 2024"
          />
        </CardGrid>

        {/* ── Line (4 variants) ─────────────────────────────────────────── */}
        <GroupHeader title="Line" />
        <CardGrid cols={2}>
          <Variant type="line"
            title="1 Line"
            description="Single smooth line, no dots"
            insight="Stable trend over the period"
            trendDirection="neutral" period="January – June 2024"
          />
          <Variant type="line-dots"
            title="1 Line + Dots"
            description="Line with visible data-point dots"
            insight="Trending up by 5.2% this month"
            trendDirection="up" period="January – June 2024"
          />
          <Variant type="line-two"
            title="2 Lines"
            description="Two series, primary and secondary blue"
            insight="Primary consistently above secondary"
            trendDirection="up" period="January – June 2024"
          />
          <Variant type="line-dots-val"
            title="Dots + Values"
            description="Line with dots and value labels at each data point"
            insight="Peak of 305 reached in February"
            trendDirection="up" period="January – June 2024"
          />
        </CardGrid>

        {/* ── Pie (5 variants) ──────────────────────────────────────────── */}
        <GroupHeader title="Pie" />
        <CardGrid cols={3}>
          <GraphCard chartType="pie-disc"
            title="Disc"
            description="Solid filled pie, no labels, 5-segment palette"
          />
          <GraphCard chartType="pie-disc-val"
            title="Disc + Values"
            description="Pie with numeric value labels on each segment"
          />
          <GraphCard chartType="pie-donut"
            title="Donut"
            description="Hollow center donut chart, 5-segment palette"
          />
          <GraphCard chartType="pie-donut-val"
            title="Donut + Value"
            description="Donut with total visitor count in center"
          />
          <GraphCard chartType="pie-donut-pop"
            title="Donut + 1 Pop"
            description="One segment expanded outward to draw attention"
          />
        </CardGrid>

        {/* ── Radial (4 variants) ───────────────────────────────────────── */}
        <GroupHeader title="Radial" />
        <CardGrid cols={2}>
          <GraphCard chartType="radial-5"
            title="5 Radials"
            description="Five concentric rings, each representing a series"
          />
          <GraphCard chartType="radial-thin"
            title="Thin + Value"
            description="Thin single ring with a center value label"
          />
          <GraphCard chartType="radial-thick"
            title="Thick + Value"
            description="Thicker single ring with a prominent center value"
          />
          <GraphCard chartType="radial-semi"
            title="Semi Circle + Value"
            description="Half-ring arc with a value label beneath the arc"
          />
        </CardGrid>

        {/* ── Footer variants ───────────────────────────────────────────── */}
        <Section
          title="Footer variants"
          description="Two footer modes: Insight for trend summaries, Captions for series legends."
        />
        <CardGrid>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#021920' }}>Insight</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#7a828c', lineHeight: '18px' }}>
              Bold trend sentence + directional icon + period. Default for Area, Bar, Line.
            </p>
            <GraphCard chartType="area" footerType="insight"
              title="Total Sessions"
              description="Showing total sessions for the last 6 months"
              insight="Trending up by 5.2% this month"
              period="January – June 2024"
              trendDirection="up"
            />
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#021920' }}>Captions</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#7a828c', lineHeight: '18px' }}>
              Colored legend dots mapping each series to a label. Default for Pie and Radial.
            </p>
            <GraphCard chartType="area" footerType="captions"
              title="Browser Share"
              description="Visitor breakdown by browser for the last 6 months"
              captions={[
                { label: 'Chrome',  color: '#a0c2f9' },
                { label: 'Safari',  color: '#689df6' },
                { label: 'Firefox', color: '#4285f4' },
                { label: 'Edge',    color: '#3264b8' },
                { label: 'Other',   color: '#1a3561' },
              ]}
            />
          </div>
        </CardGrid>

        {/* ── Trend directions ──────────────────────────────────────────── */}
        <Section
          title="Trend directions"
          description="Use the correct direction — don't use 'up' for a metric where increase is bad."
        />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          padding: '20px 24px', background: '#ffffff',
          border: '1px solid #eff1f3', borderRadius: 8,
        }}>
          {[
            { dir: 'up',      label: 'Up',      color: '#3ba55d', insight: 'Trending up by 5.2% this month'   },
            { dir: 'down',    label: 'Down',    color: '#e53e3e', insight: 'Down 3.1% compared to last month' },
            { dir: 'neutral', label: 'Neutral', color: '#aab0b8', insight: 'Stable — within 2% of target'     },
          ].map(({ dir, label, color, insight }) => (
            <div key={dir} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#021920' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, color, lineHeight: '18px' }}>{insight}</p>
            </div>
          ))}
        </div>

        {/* ── When to use ───────────────────────────────────────────────── */}
        <Section title="When to use" />
        <div style={{
          padding: '20px 24px', background: '#ffffff',
          border: '1px solid #eff1f3', borderRadius: 8,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
        }}>
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#1a6b1a' }}>Use when</p>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#021920', lineHeight: '22px' }}>
              <li style={{ marginBottom: 6 }}>
                You need <strong>multiple metrics side-by-side</strong> in a 2- or 3-column grid.
              </li>
              <li style={{ marginBottom: 6 }}>
                The key message is the <strong>trend direction and insight</strong>, not exact values.
              </li>
              <li style={{ marginBottom: 6 }}>
                The data covers a <strong>fixed standard period</strong> that doesn't need a date picker.
              </li>
              <li>
                You want to give users a <strong>quick overview</strong> before they drill into a detail view.
              </li>
            </ul>
          </div>
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#8b1a2a' }}>Do not use when</p>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#021920', lineHeight: '22px' }}>
              <li style={{ marginBottom: 6 }}>
                The chart is the <strong>focal point of the page</strong> — use the Full Size Chart instead.
              </li>
              <li style={{ marginBottom: 6 }}>
                You need to compare <strong>two or more series</strong> deeply — use the Full Size Chart.
              </li>
              <li style={{ marginBottom: 6 }}>
                The metric is <strong>part-to-whole</strong> without needing the card context.
              </li>
              <li>
                Space is very tight. Below ~340 px wide, use a Stats Card instead.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Layout guidance ───────────────────────────────────────────── */}
        <Section
          title="Layout"
          description="Graph Cards are designed for fixed-column grids. Avoid mixing card widths in the same row."
        />
        <div style={{
          padding: '20px 24px', background: '#ffffff',
          border: '1px solid #eff1f3', borderRadius: 8,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        }}>
          {[
            { cols: '2 columns', desc: 'Default. Best for 2 key metrics of equal weight. Cards comfortable at ~420 px wide.' },
            { cols: '3 columns', desc: 'Use for 3–6 metrics of equal importance. Cards sit at ~280 px — keep titles short.' },
            { cols: 'Mixed',     desc: 'Avoid. Mixing 2-column and 3-column rows creates uneven rhythm. Use consistent columns per section.' },
          ].map(({ cols, desc }) => (
            <div key={cols}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#021920' }}>{cols}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#7a828c', lineHeight: '18px' }}>{desc}</p>
            </div>
          ))}
        </div>

      </main>
    </>
  )
}
