'use client'

import { useRouter } from 'next/navigation'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { KebabMenu } from '@/components/wfm/KebabMenu'
import type { CompanySummary } from '@/mocks/access-management/companies'

export interface CompaniesTableProps {
  companies: CompanySummary[]
  onDeleteCompany: (company: CompanySummary) => void
}

export function CompaniesTable({ companies, onDeleteCompany }: CompaniesTableProps) {
  const router = useRouter()

  if (companies.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--neutral-200)', borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-body-secondary)' }}>No companies match this search.</p>
      </div>
    )
  }

  return (
    <Table size="compact">
      <TableHeader style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <tr>
          <TableHead>Company Name</TableHead>
          <TableHead>Company ID</TableHead>
          <TableHead>Group</TableHead>
          <TableHead aria-label="Actions" />
        </tr>
      </TableHeader>
      <TableBody>
        {companies.map((company, i) => (
          <TableRow key={company.id} striped={i % 2 === 1}>
            <TableCell
              variant="link"
              onClick={() => router.push(`/access-management/companies/${company.id}`)}
              style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--content-action-primary-default)' }}
            >
              {company.name}
            </TableCell>
            <TableCell>{company.companyId}</TableCell>
            <TableCell variant="secondary">{company.group ?? '-'}</TableCell>
            <TableCell align="center">
              <KebabMenu
                agentName={company.name}
                actions={[
                  { label: 'Open Company', onClick: () => router.push(`/access-management/companies/${company.id}`) },
                  { label: 'Delete Company', onClick: () => onDeleteCompany(company) },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
