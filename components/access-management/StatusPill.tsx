export type PillTone = 'success' | 'warning' | 'error' | 'neutral'

const TONE_STYLES: Record<PillTone, { bg: string; text: string }> = {
  success: { bg: '#ddf4d2', text: '#1a6b1a' },
  warning: { bg: '#fbeed8', text: '#7a4a00' },
  error:   { bg: '#fbc6d4', text: '#8b1a2a' },
  neutral: { bg: '#eff1f3', text: '#4b535e' },
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
