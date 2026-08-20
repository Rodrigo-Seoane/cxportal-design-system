import { PageTitle } from '@/components/ui/page-title'
import { ROLE_SUMMARIES } from '@/mocks/access-management/roles'

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageTitle
        title="Access Management"
        subtitle={`Manage user roles and permissions (${ROLE_SUMMARIES.length} roles)`}
      />
      {children}
    </>
  )
}
