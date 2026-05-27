'use client'

import { CSV_COLUMNS, SYSTEM_ATTRS } from './StepMapping'
import type { MappingState } from './StepMapping'

const PREVIEW_DATA: Record<string, string>[] = [
  { email: 'james.smith@example.gov',    first_name: 'James',    last_name: 'Smith',    date_of_birth: '1958-04-12', phone: '301-555-0101', member_id: 'M100001', preferred_language: 'English', zip_code: '20814' },
  { email: 'mary.johnson@example.gov',   first_name: 'Mary',     last_name: 'Johnson',  date_of_birth: '1962-08-23', phone: '301-555-0102', member_id: 'M100002', preferred_language: 'Spanish', zip_code: '20902' },
  { email: 'robert.williams@example.gov',first_name: 'Robert',   last_name: 'Williams', date_of_birth: '1955-01-30', phone: '301-555-0103', member_id: 'M100003', preferred_language: 'English', zip_code: '20910' },
  { email: 'patricia.brown@example.gov', first_name: 'Patricia', last_name: 'Brown',    date_of_birth: '1960-11-14', phone: '301-555-0104', member_id: 'M100004', preferred_language: 'French',  zip_code: '20904' },
  { email: 'john.jones@example.gov',     first_name: 'John',     last_name: 'Jones',    date_of_birth: '1957-07-08', phone: '301-555-0105', member_id: 'M100005', preferred_language: 'English', zip_code: '20906' },
]

interface StepPreviewProps {
  mappings: MappingState
}

function getColumnLabel(header: string, mappings: MappingState): string {
  const col  = CSV_COLUMNS.find(c => c.header === header)
  const m    = mappings[header]
  const attr = m?.attr ?? col?.defaultAttr ?? header
  if (attr === '_ignore') return ''
  if (attr === '_custom') return m?.customName || header
  return SYSTEM_ATTRS.find(a => a.value === attr)?.label ?? attr
}

export function StepPreview({ mappings }: StepPreviewProps) {
  const visibleCols = CSV_COLUMNS
    .map(c => ({ header: c.header, label: getColumnLabel(c.header, mappings) }))
    .filter(c => c.label !== '')

  const thStyle: React.CSSProperties = {
    padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px',
    background: 'var(--color-surface-display)', borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '9px 12px', fontSize: 12, color: 'var(--color-text-primary)',
    borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap',
  }

  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Showing the first 5 rows from your file. Verify the data looks correct before importing.
      </p>
      <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {visibleCols.map(c => <th key={c.header} style={thStyle}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {PREVIEW_DATA.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--color-surface-section)' : 'var(--color-surface-zebra)' }}>
                {visibleCols.map(c => (
                  <td key={c.header} style={{ ...tdStyle, borderBottom: i === PREVIEW_DATA.length - 1 ? 'none' : tdStyle.borderBottom }}>
                    {row[c.header] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
