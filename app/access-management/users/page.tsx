'use client'

import { useMemo, useState } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Tabs, TabList, Tab } from '@/components/ui/tabs'
import { UserFilters } from '@/components/access-management/UserFilters'
import { UsersTable } from '@/components/access-management/UsersTable'
import { AddUserModal, type NewUserInput } from '@/components/access-management/AddUserModal'
import { ConfirmActionModal } from '@/components/access-management/ConfirmActionModal'
import { USER_SUMMARIES, LOGIN_STATUS_LABEL, getRoleNameForUser, type UserSummary } from '@/mocks/access-management/users'
import { PERMISSION_LEVELS, getRoleSummary, type PermissionLevel } from '@/mocks/access-management/roles'

const QUICK_FILTERS = ['All', ...PERMISSION_LEVELS] as const
const SEARCH_FIELDS = ['Roles', 'User Name', 'Email', 'Login Status'] as const
type SearchField = (typeof SEARCH_FIELDS)[number]

export default function UsersIndexPage() {
  const [users, setUsers] = useState<UserSummary[]>(USER_SUMMARIES)
  const [searchField, setSearchField] = useState<SearchField>('Roles')
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<string>('All')
  const [selectedLevels, setSelectedLevels] = useState<PermissionLevel[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState<UserSummary | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserSummary | null>(null)

  const handleQuickFilter = (value: string) => {
    setQuickFilter(value)
    setSelectedLevels(value === 'All' ? [] : [value as PermissionLevel])
  }

  const handleLevelsChange = (levels: PermissionLevel[]) => {
    setSelectedLevels(levels)
    setQuickFilter(levels.length === 1 ? levels[0] : 'All')
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (selectedLevels.length) {
        const level = getRoleSummary(user.roleId)?.permissionLevel
        if (!level || !selectedLevels.includes(level)) return false
      }
      if (search) {
        const q = search.toLowerCase()
        const field = {
          Roles:      getRoleNameForUser(user),
          'User Name': user.name,
          Email:       user.email,
          'Login Status': LOGIN_STATUS_LABEL[user.loginStatus],
        }[searchField]
        if (!field.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [users, search, searchField, selectedLevels])

  const handleCreateUser = (input: NewUserInput) => {
    const id = input.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-')
    setUsers(prev => [
      {
        id: id || `user-${prev.length + 1}`,
        name: input.fullName || input.email,
        email: input.email,
        userId: input.userId || null,
        loginMethod: input.loginMethod,
        loginStatus: input.loginMethod === 'sso' ? 'active' : 'not-configured',
        roleId: input.roleId,
      },
      ...prev,
    ])
    setAddOpen(false)
  }

  return (
    <main style={{ display: 'flex', padding: '16px 16px 16px 0', gap: 0 }}>
      <UserFilters selectedLevels={selectedLevels} onChange={handleLevelsChange} />

      <div style={{ flex: 1, minWidth: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400, lineHeight: '30px', color: 'var(--text-body-primary)' }}>
            Users ({filteredUsers.length})
          </h2>
          <Button variant="primary-central" size="xs" onClick={() => setAddOpen(true)}>
            <PlusIcon size={14} weight="bold" aria-hidden="true" />
            Add New User
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-body-primary)' }}>Search</span>
            <div style={{ display: 'flex' }}>
              <select
                value={searchField}
                onChange={e => setSearchField(e.target.value as SearchField)}
                style={{
                  height: 39, padding: '0 8px', border: '1px solid var(--neutral-200)', borderRight: 'none',
                  borderRadius: '8px 0 0 8px', fontSize: 12, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)', background: 'var(--neutral-0)',
                }}
              >
                {SEARCH_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 200, height: 39, padding: '0 8px', border: '1px solid var(--neutral-200)', borderRadius: '0 8px 8px 0', background: 'var(--neutral-0)' }}>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${searchField.toLowerCase()}`}
                  aria-label={`Search users by ${searchField}`}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)' }}
                />
                <MagnifyingGlassIcon size={16} color="var(--text-body-secondary)" weight="regular" aria-hidden="true" />
              </div>
            </div>
          </div>

          <Tabs value={quickFilter} onChange={handleQuickFilter} type="minimal">
            <TabList aria-label="Filter users by role permission level" style={{ marginTop: 20 }}>
              {QUICK_FILTERS.map(f => (
                <Tab key={f} value={f}>{f}</Tab>
              ))}
            </TabList>
          </Tabs>
        </div>

        <UsersTable
          users={filteredUsers}
          onDeactivateUser={setUserToDeactivate}
          onDeleteUser={setUserToDelete}
        />
      </div>

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreateUser} />

      <ConfirmActionModal
        open={userToDeactivate !== null}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${userToDeactivate?.name ?? 'this user'}? They will no longer be able to log in until reactivated.`}
        confirmLabel="Deactivate User"
        destructive
        onClose={() => setUserToDeactivate(null)}
        onConfirm={() => setUserToDeactivate(null)}
      />

      <ConfirmActionModal
        open={userToDelete !== null}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name ?? 'this user'}? This cannot be undone.`}
        confirmLabel="Delete User"
        destructive
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
          setUserToDelete(null)
        }}
      />
    </main>
  )
}
