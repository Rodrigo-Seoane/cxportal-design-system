import { EnvelopeIcon, ChatCircleIcon, PhoneCallIcon, WhatsappLogoIcon } from '@phosphor-icons/react'

export type Channel = 'email' | 'sms' | 'voice' | 'whatsapp'

export interface ChannelBadgeProps {
  channel: Channel
}

// Mirrors the chip.tsx CHIP_COLORS 100-shade tokens
const CONFIG: Record<Channel, { label: string; bg: string; textColor: string; iconColor: string; comingSoon?: boolean }> = {
  email:    { label: 'Email',    bg: 'var(--info-100)', textColor: 'var(--text-body-primary)', iconColor: 'var(--text-info)' },
  sms:      { label: 'SMS',      bg: 'var(--success-100)', textColor: 'var(--text-body-primary)', iconColor: 'var(--surface-accent-success-dark)' },
  voice:    { label: 'Voice',    bg: 'var(--warning-100)', textColor: 'var(--text-body-primary)', iconColor: 'var(--surface-accent-warning-dark)' },
  whatsapp: { label: 'WhatsApp', bg: '#d2f4e0', textColor: 'var(--text-body-primary)', iconColor: '#1a8a42', comingSoon: true },
}

const ICONS: Record<Channel, React.ComponentType<{ size: number; color: string; weight: 'fill' }>> = {
  email:    EnvelopeIcon,
  sms:      ChatCircleIcon,
  voice:    PhoneCallIcon,
  whatsapp: WhatsappLogoIcon,
}

export function ChannelBadge({ channel }: ChannelBadgeProps) {
  const { label, bg, textColor, iconColor, comingSoon } = CONFIG[channel]
  const Icon = ICONS[channel]

  return (
    <span
      title={comingSoon ? 'Coming Soon' : undefined}
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:          5,
        padding:     '3px 8px',
        borderRadius: 8,
        background:   bg,
        opacity:      comingSoon ? 0.6 : 1,
        cursor:       comingSoon ? 'default' : undefined,
      }}
    >
      <Icon size={11} color={iconColor} weight="fill" aria-hidden="true" />
      <span style={{ fontSize: 10, fontWeight: 600, lineHeight: '12px', letterSpacing: '0.4px', color: textColor, whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {comingSoon && (
        <span style={{ fontSize: 9, fontWeight: 600, color: textColor, opacity: 0.7 }}>soon</span>
      )}
    </span>
  )
}
