import { PageTitle } from '@/components/ui/page-title'
import { COMPANY_SUMMARIES } from '@/mocks/access-management/companies'

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageTitle
        title="Company Management"
        subtitle={`Manage companies and instances (${COMPANY_SUMMARIES.length} companies)`}
      />
      {children}
    </>
  )
}
