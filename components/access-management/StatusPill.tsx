export type PillTone = 'success' | 'warning' | 'error' | 'neutral'

const TONE_STYLES: Record<PillTone, { bg: string; text: string }> = {
  success: { bg: 'var(--success-100)', text: 'var(--success-600)' },
  warning: { bg: 'var(--warning-100)', text: 'var(--warning-600)' },
  error:   { bg: 'var(--error-100)', text: 'var(--text-destructive)' },
  neutral: { bg: 'var(--neutral-100)', text: 'var(--text-body-primary)' },
}

export function StatusPill({ label, tone }: { label: string; tone: PillTone }) {
  const { bg, text } = TONE_STYLES[tone]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 10px', borderRadius: 16,
      background: bg, color: text,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}
