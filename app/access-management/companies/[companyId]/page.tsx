'use client'

import { useState } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import Link from 'next/link'
import { HouseIcon, CaretRightIcon, IdentificationCardIcon, UserFocusIcon } from '@phosphor-icons/react'
import { CompanyTabs, type CompanyTabValue } from '@/components/access-management/CompanyTabs'
import { CompanyInstancesTab } from '@/components/access-management/CompanyInstancesTab'
import { CompanyUsersTab } from '@/components/access-management/CompanyUsersTab'
import { CompanyRolesTab } from '@/components/access-management/CompanyRolesTab'
import { CompanyModulesTab } from '@/components/access-management/CompanyModulesTab'
import { getCompanyDetail } from '@/mocks/access-management/companies'

export default function CompanyDetailPage() {
  const params = useParams<{ companyId: string }>()
  const router = useRouter()
  const company = getCompanyDetail(params.companyId)
  const [tab, setTab] = useState<CompanyTabValue>('instances')

  if (!company) notFound()

  const initials = company.name.split(/[\s-]+/).map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <main style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => router.push('/access-management/companies')} aria-label="Home" style={{ display: 'flex', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
          <HouseIcon size={14} color="var(--text-body-secondary)" weight="regular" />
        </button>
        <CaretRightIcon size={12} color="var(--neutral-300)" weight="regular" aria-hidden="true" />
        <button onClick={() => router.push('/access-management/companies')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 12, color: 'var(--text-body-secondary)' }}>
          Companies
        </button>
        <CaretRightIcon size={12} color="var(--neutral-300)" weight="regular" aria-hidden="true" />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-body-primary)' }}>{company.name}</span>
      </nav>

      {/* ── Company header ───────────────────────────────────────────────── */}
      <div style={{ padding: 24, background: 'var(--neutral-0)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--content-action-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'var(--neutral-100)', flexShrink: 0 }}>
            {initials}
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 400, lineHeight: '30px', color: 'var(--text-body-primary)' }}>{company.name}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingLeft: 40, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IdentificationCardIcon size={16} color="var(--text-body-secondary)" weight="regular" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-body-primary)' }}>ID</span>
            <span style={{ fontSize: 12, color: 'var(--text-body-secondary)' }}>{company.companyId}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserFocusIcon size={16} color="var(--text-body-secondary)" weight="regular" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-body-primary)' }}>Liaison</span>
            <Link href={`/access-management/users/${company.liaisonUserId}`} style={{ fontSize: 12, color: 'var(--content-action-primary-default)', fontWeight: 600 }}>
              {company.liaisonName}
            </Link>
          </div>
        </div>

        <CompanyTabs value={tab} onChange={setTab} />
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div style={{ padding: 16, background: 'var(--neutral-0)', borderRadius: 8 }}>
        {tab === 'instances' && (
          <CompanyInstancesTab companyName={company.name} companyId={company.companyId} initialInstances={company.instances} />
        )}
        {tab === 'users' && (
          <CompanyUsersTab initialUsers={company.users} roles={company.roles} />
        )}
        {tab === 'roles' && (
          <CompanyRolesTab initialRoles={company.roles} />
        )}
        {tab === 'modules' && (
          <CompanyModulesTab modules={company.modules} instances={company.instances} />
        )}
      </div>
    </main>
  )
}
