import { TopBar } from '@/components/layout/TopBar'
import { FullSizeChart } from '@/components/charts/FullSizeChart'

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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function FullSizeChartPage() {
  return (
    <>
      <TopBar title="Full Size Chart" figmaUpdated="Apr 13, 2026" />
      <main className="flex-1 px-8 py-10" style={{ maxWidth: 1400 }}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-2">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Full Size Chart
          </h2>
          <span
            className="mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--color-warning-100)', color: '#7a4a00' }}
          >
            wip
          </span>
        </div>
        <p className="mb-10 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          A full-width chart panel for dashboards. Combines a configurable header with one of three
          graph types — Bar, Area, or Line — and supports two header variants: a period selector or
          side-by-side stat cards.
        </p>

        {/* ── Anatomy ──────────────────────────────────────────────────── */}
        <Section
          title="Anatomy"
          description="Each panel is composed of a Header and a Graph body. The header is always present; the graph type is selected independently."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 16,
            padding: '20px 24px',
            background: '#ffffff',
            border: '1px solid #eff1f3',
            borderRadius: 8,
          }}
        >
          {[
            { label: 'Header',      desc: 'Title, description, and either a period selector button or two stat card blocks.' },
            { label: 'Graph body',  desc: 'Recharts-powered visualization — Bar, Area (dual-series), or Line.' },
            { label: 'X-axis',      desc: 'Date labels at each data point. Y-axis is intentionally hidden for a clean look.' },
          ].map(({ label, desc }) => (
            <div key={label}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#021920' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: '#7a828c', lineHeight: '18px' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Header variants ──────────────────────────────────────────── */}
        <Section
          title="Header — Calendar button"
          description="Use when the dataset is time-scoped and users may need to change the period."
        />
        <FullSizeChart graphType="bar" headerType="calendar" />

        <Section
          title="Header — Stat cards"
          description="Use when two aggregate values (e.g. Desktop vs. Mobile totals) need to be displayed alongside the chart."
        />
        <FullSizeChart
          graphType="bar"
          headerType="stats"
          stat1={{ label: 'Desktop', value: '24,828' }}
          stat2={{ label: 'Mobile',  value: '25,010' }}
        />

        {/* ── Graph types ──────────────────────────────────────────────── */}
        <Section
          title="Bar"
          description="Best for comparing discrete values over time. Single series. Use when individual data points are more important than the trend."
        />
        <FullSizeChart graphType="bar" headerType="calendar" />

        <Section
          title="Area"
          description="Best for showing volume and comparing two overlapping series. Dual series with a bottom legend."
        />
        <FullSizeChart
          graphType="area"
          headerType="stats"
          title="Area Chart - Interactive"
          description="Showing total visitors for the last 3 months"
          stat1={{ label: 'Desktop', value: '24,828' }}
          stat2={{ label: 'Mobile',  value: '25,010' }}
        />

        <Section
          title="Line"
          description="Best for showing a continuous trend over time. Single series. Use when the shape of the curve matters more than individual values."
        />
        <FullSizeChart
          graphType="line"
          headerType="calendar"
          title="Line Chart - Interactive"
          description="Showing daily sessions for the last 3 months"
        />

        {/* ── Usage guidelines ─────────────────────────────────────────── */}
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
          {/* Use when */}
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#1a6b1a' }}>Use when</p>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#021920', lineHeight: '22px' }}>
              <li style={{ marginBottom: 6 }}>
                The chart is the <strong>primary focal point</strong> of a dashboard or overview screen and
                needs the full available width to communicate the data clearly.
              </li>
              <li style={{ marginBottom: 6 }}>
                You are visualising <strong>time-series data</strong> — sessions, revenue, traffic, or any
                metric measured over days, weeks, or months.
              </li>
              <li style={{ marginBottom: 6 }}>
                You need to let users <strong>switch the period</strong> (calendar header) or compare two
                aggregate values side-by-side (stat-card header).
              </li>
              <li>
                You are comparing <strong>two related series</strong> (e.g. Desktop vs. Mobile) — use the
                Area variant with the stat-card header and series toggle.
              </li>
            </ul>
          </div>

          {/* Do not use when */}
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#8b1a2a' }}>Do not use when</p>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#021920', lineHeight: '22px' }}>
              <li style={{ marginBottom: 6 }}>
                The data is <strong>part-to-whole</strong> — proportional breakdowns belong in a Pie or
                Donut chart, not a time-series panel.
              </li>
              <li style={{ marginBottom: 6 }}>
                Space is constrained. Use <strong>Graph Cards</strong> when you need compact metric tiles
                that fit in a multi-column grid rather than spanning the full width.
              </li>
              <li style={{ marginBottom: 6 }}>
                You need to display <strong>more than two series</strong> simultaneously — the chart becomes
                too noisy and a data table is the better choice.
              </li>
              <li>
                The data has <strong>no natural time ordering</strong>. Categorical comparisons (e.g. sales
                by region) are better served by a grouped Bar chart or a Table component.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Graph type guidance ───────────────────────────────────────── */}
        <Section
          title="Choosing a graph type"
          description="All three types share the same header and X-axis. Choose based on what the data needs to communicate."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 16,
            padding: '20px 24px',
            background: '#ffffff',
            border: '1px solid #eff1f3',
            borderRadius: 8,
          }}
        >
          {[
            {
              label: 'Bar',
              desc:  'Use when individual data-point magnitude matters more than the overall trend. Ideal for spotting outliers in a discrete time series.',
            },
            {
              label: 'Area',
              desc:  'Use when volume and continuity are important — especially for dual-series comparisons (e.g. Desktop vs. Mobile) where filled regions aid differentiation.',
            },
            {
              label: 'Line',
              desc:  'Use when the shape of the curve (acceleration, peaks, plateaus) is the story. The absence of fill keeps the focus on direction rather than magnitude.',
            },
          ].map(({ label, desc }) => (
            <div key={label}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#021920' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: '#7a828c', lineHeight: '18px' }}>{desc}</p>
            </div>
          ))}
        </div>

      </main>
    </>
  )
}
