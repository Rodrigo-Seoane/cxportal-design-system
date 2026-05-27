'use client'

export const CSV_COLUMNS = [
  { header: 'email',              defaultAttr: 'email'       },
  { header: 'first_name',         defaultAttr: 'firstName'   },
  { header: 'last_name',          defaultAttr: 'lastName'    },
  { header: 'date_of_birth',      defaultAttr: 'dateOfBirth' },
  { header: 'phone',              defaultAttr: 'phone'       },
  { header: 'member_id',          defaultAttr: 'memberId'    },
  { header: 'preferred_language', defaultAttr: '_custom'     },
  { header: 'zip_code',           defaultAttr: '_custom'     },
] as const

export const SYSTEM_ATTRS = [
  { value: 'email',       label: 'Email'           },
  { value: 'firstName',   label: 'First Name'      },
  { value: 'lastName',    label: 'Last Name'       },
  { value: 'phone',       label: 'Phone'           },
  { value: 'dateOfBirth', label: 'Date of Birth'   },
  { value: 'memberId',    label: 'Member ID'       },
  { value: '_custom',     label: 'Custom attribute'},
  { value: '_ignore',     label: 'Ignore'          },
]

export interface ColMapping {
  attr:       string
  customName: string
}

export type MappingState = Record<string, ColMapping>

export const DEFAULT_MAPPINGS: MappingState = {
  email:              { attr: 'email',       customName: ''                  },
  first_name:         { attr: 'firstName',   customName: ''                  },
  last_name:          { attr: 'lastName',    customName: ''                  },
  date_of_birth:      { attr: 'dateOfBirth', customName: ''                  },
  phone:              { attr: 'phone',       customName: ''                  },
  member_id:          { attr: 'memberId',    customName: ''                  },
  preferred_language: { attr: '_custom',     customName: 'preferred_language'},
  zip_code:           { attr: '_custom',     customName: 'zip_code'          },
}

function chipStyle(attr: string): React.CSSProperties {
  if (attr === '_ignore') return { background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' }
  if (attr === '_custom') return { background: 'var(--color-warning-100)',     color: '#7a4a00'                     }
  return                         { background: 'var(--color-info-100)',         color: '#1a4f9e'                     }
}

function chipLabel(attr: string, customName: string): string {
  if (attr === '_ignore') return 'Ignored'
  if (attr === '_custom') return customName ? `Custom: ${customName}` : 'Custom'
  return SYSTEM_ATTRS.find(a => a.value === attr)?.label ?? attr
}

export interface StepMappingProps {
  mappings: MappingState
  onChange: (m: MappingState) => void
  error:    string
}

export function StepMapping({ mappings, onChange, error }: StepMappingProps) {
  const usedCount = Object.values(mappings).filter(m => m.attr !== '_ignore').length

  function setAttr(header: string, attr: string) {
    onChange({ ...mappings, [header]: { ...mappings[header], attr } })
  }

  function setCustomName(header: string, customName: string) {
    onChange({ ...mappings, [header]: { ...mappings[header], customName } })
  }

  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Map each CSV column to a system attribute. Columns set to "Ignore" will not be imported.
      </p>

      <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '160px 1fr 130px', padding: '8px 14px',
          background: 'var(--color-surface-display)', borderBottom: '1px solid var(--color-border)',
          fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.4px',
        }}>
          <span>CSV Column</span>
          <span>Maps to</span>
          <span>Status</span>
        </div>

        {CSV_COLUMNS.map(({ header }, i) => {
          const { attr, customName } = mappings[header] ?? { attr: 'email', customName: '' }
          const isLast = i === CSV_COLUMNS.length - 1
          return (
            <div key={header} style={{
              display: 'grid', gridTemplateColumns: '160px 1fr 130px',
              padding: '10px 14px', alignItems: 'center', gap: 12,
              borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
              background: i % 2 === 0 ? 'var(--color-surface-section)' : 'var(--color-surface-zebra)',
            }}>
              <code style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{header}</code>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <select
                  value={attr}
                  onChange={e => setAttr(header, e.target.value)}
                  style={{
                    fontSize: 12, padding: '5px 8px', borderRadius: 6,
                    border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
                    color: 'var(--color-text-primary)', width: '100%',
                  }}
                >
                  {SYSTEM_ATTRS.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
                {attr === '_custom' && (
                  <input
                    value={customName}
                    onChange={e => setCustomName(header, e.target.value)}
                    placeholder="Attribute name"
                    style={{
                      fontSize: 12, padding: '5px 8px', borderRadius: 6,
                      border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
                      color: 'var(--color-text-primary)', width: '100%',
                    }}
                  />
                )}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                display: 'inline-block', whiteSpace: 'nowrap',
                ...chipStyle(attr),
              }}>
                {chipLabel(attr, customName)}
              </span>
            </div>
          )
        })}
      </div>

      {error && (
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#c0152f', fontWeight: 500 }}>
          {error}
        </p>
      )}

      <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
        {usedCount} of 100 attributes used
      </p>
    </div>
  )
}
