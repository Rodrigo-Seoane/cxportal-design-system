'use client'

import { useRouter } from 'next/navigation'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { KebabMenu } from '@/components/wfm/KebabMenu'
import { LoginStatusPill } from './LoginStatusPill'
import { LOGIN_METHOD_LABEL, getRoleNameForUser, type UserSummary } from '@/mocks/access-management/users'

export interface UsersTableProps {
  users: UserSummary[]
  onDeactivateUser: (user: UserSummary) => void
  onDeleteUser: (user: UserSummary) => void
}

export function UsersTable({ users, onDeactivateUser, onDeleteUser }: UsersTableProps) {
  const router = useRouter()

  if (users.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed #d9dce0', borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#7a828c' }}>No users match this filter.</p>
      </div>
    )
  }

  return (
    <Table size="compact">
      <TableHeader style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <tr>
          <TableHead>User Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Login Method</TableHead>
          <TableHead>Login Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead aria-label="Actions" />
        </tr>
      </TableHeader>
      <TableBody>
        {users.map((user, i) => (
          <TableRow key={user.id} striped={i % 2 === 1}>
            <TableCell
              variant="link"
              onClick={() => router.push(`/access-management/users/${user.id}`)}
              style={{ cursor: 'pointer', fontWeight: 600, color: '#0ea2a7' }}
            >
              {user.name}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{LOGIN_METHOD_LABEL[user.loginMethod]}</TableCell>
            <TableCell><LoginStatusPill status={user.loginStatus} /></TableCell>
            <TableCell variant="link" onClick={() => router.push(`/access-management/roles/${user.roleId}`)} style={{ cursor: 'pointer', color: '#0ea2a7' }}>
              {getRoleNameForUser(user)}
            </TableCell>
            <TableCell align="center">
              <KebabMenu
                agentName={user.name}
                actions={[
                  { label: 'Edit Profile', onClick: () => router.push(`/access-management/users/${user.id}`) },
                  { label: 'Change Role', onClick: () => router.push(`/access-management/users/${user.id}`) },
                  { label: 'Reset Password' },
                  { label: 'Deactivate User', onClick: () => onDeactivateUser(user) },
                  { label: 'Delete User', onClick: () => onDeleteUser(user) },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
