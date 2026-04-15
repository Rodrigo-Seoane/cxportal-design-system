import type { ExperimentStatus } from '@/lib/sandbox-registry'

// ── Status badge styles ────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ExperimentStatus, { bg: string; color: string }> = {
  'Draft':     { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
  'In Review': { bg: 'var(--color-warning-100)',      color: '#7a4a00' },
  'Validated': { bg: 'var(--color-success-100)',      color: '#1a6b1a' },
}

// ── Props ──────────────────────────────────────────────────────────────────────

type SandboxShellProps = {
  title:       string
  description: string
  status:      ExperimentStatus
  author:      string
  created:     string        // ISO date string — displayed as-is or formatted
  children:    React.ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SandboxShell({
  title,
  description,
  status,
  author,
  created,
  children,
}: SandboxShellProps) {
  const badge = STATUS_STYLE[status]

  const formattedDate = new Date(created).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })

  return (
    <>
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between h-14 px-8 border-b"
        style={{
          backgroundColor: 'var(--color-surface-section)',
          borderColor:     'var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1
            className="text-base font-semibold"
            style={{ color: 'var(--color-text-primary)', margin: 0 }}
          >
            {title}
          </h1>
          <span style={{
            fontSize: 11, fontWeight: 600, lineHeight: '16px',
            padding: '2px 7px', borderRadius: 4,
            background: badge.bg, color: badge.color,
            flexShrink: 0,
          }}>
            {status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {author}
          </span>
          <span style={{
            fontSize: 12, color: 'var(--color-text-secondary)',
            borderLeft: '1px solid var(--color-border)',
            paddingLeft: 16,
          }}>
            {formattedDate}
          </span>
        </div>
      </header>

      {/* ── Experiment description strip ──────────────────────────────── */}
      <div style={{
        padding:      '12px 32px',
        borderBottom: '1px solid var(--color-border)',
        background:   'var(--color-surface-display)',
      }}>
        <p style={{
          margin: 0, fontSize: 13,
          color: 'var(--color-text-secondary)',
          lineHeight: '20px',
        }}>
          {description}
        </p>
      </div>

      {/* ── Experiment content ────────────────────────────────────────── */}
      {children}
    </>
  )
}
