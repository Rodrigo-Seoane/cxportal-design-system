'use client'

import { useRouter } from 'next/navigation'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { KebabMenu } from '@/components/wfm/KebabMenu'
import type { RoleSummary } from '@/mocks/access-management/roles'

export interface RolesTableProps {
  roles: RoleSummary[]
  onDeleteRole: (role: RoleSummary) => void
}

export function RolesTable({ roles, onDeleteRole }: RolesTableProps) {
  const router = useRouter()

  if (roles.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--neutral-200)', borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-body-secondary)' }}>No roles match this filter.</p>
      </div>
    )
  }

  return (
    <Table size="compact">
      <TableHeader style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <tr>
          <TableHead>Role Name</TableHead>
          <TableHead>Entities</TableHead>
          <TableHead>Instances</TableHead>
          <TableHead>Users</TableHead>
          <TableHead aria-label="Actions" />
        </tr>
      </TableHeader>
      <TableBody>
        {roles.map((role, i) => (
          <TableRow key={role.id} striped={i % 2 === 1}>
            <TableCell
              variant="link"
              onClick={() => router.push(`/access-management/roles/${role.id}`)}
              style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--content-action-primary-default)' }}
            >
              {role.name}
            </TableCell>
            <TableCell>{role.entities.toLocaleString()}</TableCell>
            <TableCell>{role.instances.toLocaleString()}</TableCell>
            <TableCell>{role.users.toLocaleString()}</TableCell>
            <TableCell align="center">
              <KebabMenu
                agentName={role.name}
                actions={[
                  { label: 'Edit Role', onClick: () => router.push(`/access-management/roles/${role.id}`) },
                  { label: 'Duplicate Role' },
                  { label: 'Delete Role', onClick: () => onDeleteRole(role) },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
