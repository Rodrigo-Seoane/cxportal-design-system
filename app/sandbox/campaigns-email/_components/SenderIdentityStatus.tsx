import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'

export type SenderStatus = 'verified' | 'pending' | 'failed' | 'expired'

export interface SenderIdentityStatusProps {
  status: SenderStatus
  /** Show icon alongside the label */
  showIcon?: boolean
}

const CONFIG: Record<SenderStatus, {
  label:   string
  bg:      string
  color:   string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon:    React.ComponentType<any>
}> = {
  verified: { label: 'Verified', bg: 'var(--color-success-100)', color: '#1a6b1a', Icon: CheckCircleIcon  },
  pending:  { label: 'Pending',  bg: 'var(--color-warning-100)', color: '#7a4a00', Icon: ClockIcon        },
  failed:   { label: 'Failed',   bg: 'var(--color-error-100)',   color: '#8b1a2a', Icon: XCircleIcon      },
  expired:  { label: 'Expired',  bg: 'var(--color-error-100)',   color: '#8b1a2a', Icon: WarningCircleIcon },
}

export function SenderIdentityStatus({ status, showIcon = true }: SenderIdentityStatusProps) {
  const { label, bg, color, Icon } = CONFIG[status]

  return (
    <span style={{
      display:     'inline-flex',
      alignItems:  'center',
      gap:          4,
      padding:     '3px 8px',
      borderRadius: 6,
      background:   bg,
    }}>
      {showIcon && <Icon size={12} color={color} weight="fill" aria-hidden="true" />}
      <span style={{ fontSize: 11, fontWeight: 600, lineHeight: '16px', color, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </span>
  )
}
