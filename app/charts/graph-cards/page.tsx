import { TopBar } from '@/components/layout/TopBar'
import { GraphCard } from '@/components/charts/GraphCard'

// ── Section header ─────────────────────────────────────────────────────────────

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

// ── Card grid wrapper ──────────────────────────────────────────────────────────

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
      {children}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function GraphCardsPage() {
  return (
    <>
      <TopBar title="Graph Cards" figmaUpdated="Apr 13, 2026" />
      <main className="flex-1 px-8 py-10" style={{ maxWidth: 1100 }}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-2">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Graph Cards
          </h2>
          <span
            className="mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--color-warning-100)', color: '#7a4a00' }}
          >
            wip
          </span>
        </div>
        <p className="mb-10 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          Compact chart panels designed for metric grids. Each card combines a chart type label, a
          title, a single-series graph, and a footer with an insight and period. Use them in 2- or
          3-column layouts where the Full Size Chart would be too dominant.
        </p>

        {/* ── Anatomy ──────────────────────────────────────────────────── */}
        <Section
          title="Anatomy"
          description="Every Graph Card has four layers stacked vertically."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            padding: '20px 24px',
            background: '#ffffff',
            border: '1px solid #eff1f3',
            borderRadius: 8,
          }}
        >
          {[
            {
              label: 'Chart Type Header',
              desc:  'Icon + label identifying the graph type (Area, Bar, Line). Always present.',
            },
            {
              label: 'Title & description',
              desc:  'Short metric name (16px/600) and a one-line context string (14px/400).',
            },
            {
              label: 'Graph body',
              desc:  'Recharts-powered chart scaled to the card width. Horizontal grid lines only; no Y-axis values.',
            },
            {
              label: 'Footer',
              desc:  'Bold insight sentence with a trend icon, followed by the data period in secondary text.',
            },
          ].map(({ label, desc }) => (
            <div key={label}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#021920' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: '#7a828c', lineHeight: '18px' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Chart type variants ───────────────────────────────────────── */}
        <Section
          title="Chart types"
          description="Graph Cards support three graph types. The same card shell adapts to each."
        />
        <CardGrid>
          <GraphCard
            chartType="area"
            title="Total Sessions"
            description="Showing total sessions for the last 6 months"
            insight="Trending up by 5.2% this month"
            period="January – June 2024"
            trendDirection="up"
          />
          <GraphCard
            chartType="bar"
            title="Resolved Tickets"
            description="Monthly resolution count for the last 6 months"
            insight="Down 3.1% compared to last month"
            period="January – June 2024"
            trendDirection="down"
          />
          <GraphCard
            chartType="line"
            title="Avg. Handle Time"
            description="Average handle time in seconds over 6 months"
            insight="Stable — within 2% of target"
            period="January – June 2024"
            trendDirection="neutral"
          />
          <GraphCard
            chartType="area"
            title="Customer Satisfaction"
            description="CSAT score trend for the last 6 months"
            insight="Trending up by 8.4% this month"
            period="January – June 2024"
            trendDirection="up"
            data={[
              { month: 'Jan', value: 72  },
              { month: 'Feb', value: 78  },
              { month: 'Mar', value: 74  },
              { month: 'Apr', value: 81  },
              { month: 'May', value: 85  },
              { month: 'Jun', value: 90  },
            ]}
          />
        </CardGrid>

        {/* ── Trend directions ──────────────────────────────────────────── */}
        <Section
          title="Trend directions"
          description="The footer icon communicates direction. Use the correct direction — don't use 'up' for a metric where increase is bad."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            padding: '20px 24px',
            background: '#ffffff',
            border: '1px solid #eff1f3',
            borderRadius: 8,
          }}
        >
          {[
            { dir: 'up',      label: 'Up',      color: '#3ba55d', insight: 'Trending up by 5.2% this month'         },
            { dir: 'down',    label: 'Down',    color: '#e53e3e', insight: 'Down 3.1% compared to last month'       },
            { dir: 'neutral', label: 'Neutral', color: '#aab0b8', insight: 'Stable — within 2% of target'           },
          ].map(({ dir, label, color, insight }) => (
            <div key={dir} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#021920' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, color, lineHeight: '18px' }}>{insight}</p>
            </div>
          ))}
        </div>

        {/* ── When to use ───────────────────────────────────────────────── */}
        <Section title="When to use" />
        <div
          style={{
            padding: '20px 24px',
            background: '#ffffff',
            border: '1px solid #eff1f3',
            borderRadius: 8,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
          }}
        >
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#1a6b1a' }}>Use when</p>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#021920', lineHeight: '22px' }}>
              <li style={{ marginBottom: 6 }}>
                You need to display <strong>multiple metrics side-by-side</strong> in a 2- or 3-column
                grid — Graph Cards are built to sit next to each other without competing for attention.
              </li>
              <li style={{ marginBottom: 6 }}>
                The key message is the <strong>trend direction and insight</strong>, not the exact data
                values. The footer surfaced the headline so users don't have to read the graph.
              </li>
              <li style={{ marginBottom: 6 }}>
                The data covers a <strong>fixed, standard period</strong> (e.g. last 6 months) that doesn't
                need a date-range picker. For adjustable periods, use the Full Size Chart.
              </li>
              <li>
                You want to give users a <strong>quick overview</strong> before they drill into a detail view.
                Graph Cards are a summary layer, not the primary data source.
              </li>
            </ul>
          </div>
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#8b1a2a' }}>Do not use when</p>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#021920', lineHeight: '22px' }}>
              <li style={{ marginBottom: 6 }}>
                The chart is the <strong>focal point of the page</strong>. Use the <strong>Full Size Chart</strong> instead —
                it fills the available width and supports an interactive date picker and series toggles.
              </li>
              <li style={{ marginBottom: 6 }}>
                You need to compare <strong>two or more series</strong> within the same card. Graph Cards are
                single-series by design; use the Full Size Chart for multi-series comparisons.
              </li>
              <li style={{ marginBottom: 6 }}>
                The metric is <strong>part-to-whole</strong> (e.g. share of total). A Pie or Donut chart
                communicates proportions more clearly than an area or bar card.
              </li>
              <li>
                Space is very tight. If cards would be narrower than ~340 px, consider a
                <strong> Stats Card</strong> (number + label only) instead.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Layout guidance ───────────────────────────────────────────── */}
        <Section
          title="Layout"
          description="Graph Cards are designed for fixed-column grids. Avoid mixing card widths in the same row."
        />
        <div
          style={{
            padding: '20px 24px',
            background: '#ffffff',
            border: '1px solid #eff1f3',
            borderRadius: 8,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {[
            { cols: '2 columns', desc: 'Default. Best when you have 2 key metrics of equal weight. Cards are comfortable at ~420 px wide.' },
            { cols: '3 columns', desc: 'Use when you have 3–6 metrics of equal importance. Cards sit at ~280 px — keep titles short.' },
            { cols: 'Mixed',     desc: 'Avoid. Mixing a 2-column and a 3-column row creates uneven visual rhythm. Use consistent columns per section.' },
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
