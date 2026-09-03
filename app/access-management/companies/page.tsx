'use client'

import { useMemo, useState } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { CompaniesTable } from '@/components/access-management/CompaniesTable'
import { AddCompanyModal, type NewCompanyInput } from '@/components/access-management/AddCompanyModal'
import { ConfirmActionModal } from '@/components/access-management/ConfirmActionModal'
import { COMPANY_SUMMARIES, type CompanySummary } from '@/mocks/access-management/companies'

const SEARCH_FIELDS = ['Company Name', 'Company ID', 'Group'] as const
type SearchField = (typeof SEARCH_FIELDS)[number]

export default function CompaniesIndexPage() {
  const [companies, setCompanies] = useState<CompanySummary[]>(COMPANY_SUMMARIES)
  const [searchField, setSearchField] = useState<SearchField>('Company Name')
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<CompanySummary | null>(null)

  const filteredCompanies = useMemo(() => {
    if (!search) return companies
    const q = search.toLowerCase()
    return companies.filter(c => {
      const field = { 'Company Name': c.name, 'Company ID': c.companyId, Group: c.group ?? '' }[searchField]
      return field.toLowerCase().includes(q)
    })
  }, [companies, search, searchField])

  const handleCreateCompany = (input: NewCompanyInput) => {
    const id = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setCompanies(prev => [
      { id: id || `company-${prev.length + 1}`, name: input.name, companyId: input.companyId, group: null },
      ...prev,
    ])
    setAddOpen(false)
  }

  return (
    <>
      <main style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400, lineHeight: '30px', color: 'var(--text-body-primary)' }}>
            Companies ({filteredCompanies.length})
          </h2>
          <Button variant="primary-central" size="xs" onClick={() => setAddOpen(true)}>
            <PlusIcon size={14} weight="bold" aria-hidden="true" />
            Add New Company
          </Button>
        </div>

        <div style={{ display: 'flex' }}>
          <select
            value={searchField}
            onChange={e => setSearchField(e.target.value as SearchField)}
            style={{
              height: 36, padding: '0 8px', border: '1px solid var(--neutral-200)', borderRight: 'none',
              borderRadius: '8px 0 0 8px', fontSize: 13, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)', background: 'var(--neutral-0)',
            }}
          >
            {SEARCH_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 320, height: 36, padding: '0 8px', border: '1px solid var(--neutral-200)', borderRadius: '0 8px 8px 0', background: 'var(--neutral-0)' }}>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${searchField.toLowerCase()}`}
              aria-label={`Search companies by ${searchField}`}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)' }}
            />
            <MagnifyingGlassIcon size={16} color="var(--text-body-secondary)" weight="regular" aria-hidden="true" />
          </div>
        </div>

        <CompaniesTable companies={filteredCompanies} onDeleteCompany={setCompanyToDelete} />
      </main>

      <AddCompanyModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreateCompany} />

      <ConfirmActionModal
        open={companyToDelete !== null}
        title="Delete Company"
        message={`Are you sure you want to delete ${companyToDelete?.name ?? 'this company'}? This cannot be undone.`}
        confirmLabel="Delete Company"
        destructive
        onClose={() => setCompanyToDelete(null)}
        onConfirm={() => {
          if (companyToDelete) setCompanies(prev => prev.filter(c => c.id !== companyToDelete.id))
          setCompanyToDelete(null)
        }}
      />
    </>
  )
}
