import { KeyIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import { LOGIN_STATUS_LABEL, type LoginStatus } from '@/mocks/access-management/users'

// Figma: node 3130-46022 (USER MANAGEMENT/Index, CxCentral) — every tone uses
// the same dark text/on-action/secondary color (--text-body-primary), not a
// contrasting tint per tone; only the background and icon (Key vs ShieldCheck) change.
const TONE_BG: Record<LoginStatus, string> = {
  'not-configured': 'var(--info-100)',
  confirmed:        'var(--success-200)',
  'invite-expired': 'var(--warning-100)',
  active:           'var(--success-200)',
}

export function LoginStatusPill({ status }: { status: LoginStatus }) {
  const Icon = status === 'active' ? ShieldCheckIcon : KeyIcon

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '4px 12px', borderRadius: 8,
      background: TONE_BG[status], color: 'var(--text-body-primary)',
      fontSize: 10, fontWeight: 600, letterSpacing: '0.4px', whiteSpace: 'nowrap',
    }}>
      <Icon size={12} weight="regular" aria-hidden="true" />
      {LOGIN_STATUS_LABEL[status]}
    </span>
  )
}
