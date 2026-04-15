import { TopBar } from '@/components/layout/TopBar'
import { ExperimentCard } from '@/components/sandbox/ExperimentCard'
import { getExperiments } from '@/lib/sandbox-registry'

export default function SandboxIndexPage() {
  const experiments = getExperiments()

  return (
    <>
      <TopBar title="Sandbox" />
      <main className="flex-1 px-8 py-10" style={{ maxWidth: 900 }}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Sandbox
        </h2>
        <p className="mb-10 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          A workspace for building and validating new flows before they ship to CxPortal.
          Every experiment uses design system components as building blocks — nothing gets
          built twice. When a flow is validated, it ships; any new component it introduced
          graduates into the documented system.
        </p>

        {/* ── Status legend ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 20, marginBottom: 32,
          padding: '12px 20px',
          background: 'var(--color-surface-display)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
        }}>
          {[
            { label: 'Draft',     bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)', desc: 'Work in progress, not ready for review' },
            { label: 'In Review', bg: 'var(--color-warning-100)',      color: '#7a4a00',                    desc: 'Ready for stakeholder feedback' },
            { label: 'Validated', bg: 'var(--color-success-100)',      color: '#1a6b1a',                    desc: 'Approved and ready to ship' },
          ].map(({ label, bg, color, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, lineHeight: '16px',
                padding: '2px 7px', borderRadius: 4,
                background: bg, color,
                border: label === 'Draft' ? '1px solid var(--color-border)' : 'none',
                flexShrink: 0,
              }}>
                {label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {desc}
              </span>
            </div>
          ))}
        </div>

        {/* ── Experiments grid ──────────────────────────────────────────── */}
        {experiments.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            border: '1px dashed var(--color-border)', borderRadius: 8,
          }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>
              No experiments yet. Add one to <code>lib/sandbox-registry.ts</code> to get started.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}>
            {experiments.map(exp => (
              <ExperimentCard key={exp.slug} experiment={exp} />
            ))}
          </div>
        )}

      </main>
    </>
  )
}
