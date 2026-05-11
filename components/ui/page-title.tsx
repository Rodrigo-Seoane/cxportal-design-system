'use client'

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  titleColor:   '#4285f4',
  subtitleColor:'#021920',
  metaLabel:    '#7a828c',
  metaValue:    '#021920',
  chipBg:       '#d9dce0',
  chipText:     '#021920',
  divider:      '#d9dce0',
} as const

// ── Types ─────────────────────────────────────────────────────────────────────

export type PageTitleVariant = 'default' | 'with-chip' | 'with-kb-details'

export interface PageTitleProps {
  title:        string
  subtitle?:    string
  variant?:     PageTitleVariant
  chip?:        string
  actions?:     React.ReactNode
  association?: string
  version?:     string
  dateCreated?: string
}

// ── Internal: Chip ────────────────────────────────────────────────────────────

function Chip({ label }: { label: string }) {
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      padding:       '4px 12px',
      borderRadius:  16,
      background:     T.chipBg,
      fontSize:      10,
      fontWeight:    600,
      lineHeight:    '12px',
      letterSpacing: '0.4px',
      color:          T.chipText,
      whiteSpace:    'nowrap',
    }}>
      {label}
    </span>
  )
}

// ── Internal: KB metadata divider ─────────────────────────────────────────────

function KbDivider() {
  return (
    <div style={{
      width:      1,
      height:     40,
      background:  T.divider,
      flexShrink: 0,
    }} />
  )
}

// ── Internal: KB metadata item ────────────────────────────────────────────────

function KbMetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontSize:      10,
        fontWeight:    600,
        lineHeight:    '12px',
        letterSpacing: '0.4px',
        color:          T.metaLabel,
        whiteSpace:    'nowrap',
      }}>
        {label}
      </span>
      <span style={{
        fontSize:   12,
        fontWeight: 400,
        lineHeight: '20px',
        color:       T.metaValue,
        whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  )
}

// ── PageTitle ─────────────────────────────────────────────────────────────────

export function PageTitle({
  title,
  subtitle,
  variant    = 'default',
  chip       = 'Current',
  actions,
  association,
  version,
  dateCreated,
}: PageTitleProps) {
  const showChip    = variant === 'with-chip' || variant === 'with-kb-details'
  const showKbMeta  = variant === 'with-kb-details'
  const showActions = variant !== 'with-kb-details' && actions != null

  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '16px 24px',
      width:          '100%',
      backgroundColor:'var(--color-surface-section)',
    }}>
      {/* Left — title + optional chip + subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{
              margin:     0,
              fontSize:   28,
              fontWeight: 400,
              lineHeight: '34px',
              color:       T.titleColor,
              whiteSpace: 'nowrap',
            }}>
              {title}
            </h1>
            {showChip && <Chip label={chip} />}
          </div>
          {subtitle && (
            <p style={{
              margin:     0,
              fontSize:   12,
              fontWeight: 400,
              lineHeight: '20px',
              color:       T.subtitleColor,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right — actions or KB metadata */}
      {showActions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {actions}
        </div>
      )}

      {showKbMeta && (association || version || dateCreated) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {association && (
            <>
              <KbMetaItem label="Association:" value={association} />
              {(version || dateCreated) && <KbDivider />}
            </>
          )}
          {version && (
            <>
              <KbMetaItem label="Version" value={version} />
              {dateCreated && <KbDivider />}
            </>
          )}
          {dateCreated && (
            <KbMetaItem label="Date Created:" value={dateCreated} />
          )}
        </div>
      )}
    </div>
  )
}
