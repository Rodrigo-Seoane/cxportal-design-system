'use client'

import { useMemo, useState } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCheckboxHead, TableCheckboxCell } from '@/components/ui/table'
import { KebabMenu } from '@/components/wfm/KebabMenu'
import { StatusPill } from './StatusPill'
import { BulkActionBar } from './BulkActionBar'
import { MoveToGroupModal } from './MoveToGroupModal'
import { RemoveFromGroupModal } from './RemoveFromGroupModal'
import { AddCompanyUserModal, type NewCompanyUserInput } from './AddCompanyUserModal'
import { ConfirmActionModal } from './ConfirmActionModal'
import type { CompanyUser, CompanyRole, CompanyUserStatus } from '@/mocks/access-management/companies'

const STATUS_CONFIG: Record<CompanyUserStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  confirmed:       { label: 'Confirmed',      tone: 'success' },
  'invite-expired':{ label: 'Invite Expired', tone: 'warning' },
  disabled:        { label: 'Disabled',       tone: 'neutral' },
}

const SEARCH_FIELDS = ['Group Name', 'User Name', 'Email', 'Role'] as const
type SearchField = (typeof SEARCH_FIELDS)[number]

export function CompanyUsersTab({ initialUsers, roles }: { initialUsers: CompanyUser[]; roles: CompanyRole[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [searchField, setSearchField] = useState<SearchField>('Group Name')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [toDelete, setToDelete] = useState<CompanyUser | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(u => {
      const field = { 'Group Name': u.group ?? '', 'User Name': u.name, Email: u.email, Role: u.roleName }[searchField]
      return field.toLowerCase().includes(q)
    })
  }, [users, search, searchField])

  const groups = Array.from(new Set(users.map(u => u.group).filter((g): g is string => g !== null)))
  const selectedUsers = users.filter(u => selected.has(u.id))
  const selectedGroups = Array.from(new Set(selectedUsers.map(u => u.group).filter((g): g is string => g !== null)))

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleCreateUser = (input: NewCompanyUserInput) => {
    const roleName = roles.find(r => r.id === input.roleId)?.name ?? 'Unassigned'
    setUsers(prev => [{ id: `u-${prev.length + 1}`, name: input.name || input.email, email: input.email, status: 'invite-expired', roleName, group: null }, ...prev])
    setAddOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: 'var(--text-body-primary)' }}>Users ({users.length})</h3>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button variant="secondary-central" size="xs" onClick={() => setAddOpen(true)}>
            <PlusIcon size={14} weight="bold" aria-hidden="true" /> Add New User
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-body-primary)' }}>Search</span>
            <select value={searchField} onChange={e => setSearchField(e.target.value as SearchField)} style={{ height: 24, padding: '0 6px', border: '1px solid var(--neutral-200)', borderRight: 'none', borderRadius: '4px 0 0 4px', fontSize: 12, background: 'var(--neutral-0)', fontFamily: 'var(--font-sans)' }}>
              {SEARCH_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 240, height: 24, padding: '0 8px', border: '1px solid var(--neutral-200)', borderRadius: '0 4px 4px 0', background: 'var(--neutral-0)' }}>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${searchField.toLowerCase()}`} style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, fontFamily: 'var(--font-sans)' }} />
              <MagnifyingGlassIcon size={14} color="var(--text-body-secondary)" weight="regular" aria-hidden="true" />
            </div>
          </div>
        </div>

        <BulkActionBar
          count={selected.size}
          onMoveToGroup={() => setMoveOpen(true)}
          onRemoveFromGroup={() => setRemoveOpen(true)}
          onDelete={() => setBulkDeleteOpen(true)}
          onClear={() => setSelected(new Set())}
        />
      </div>

      <Table size="compact">
        <TableHeader>
          <tr>
            <TableCheckboxHead onChange={checked => setSelected(checked ? new Set(filtered.map(u => u.id)) : new Set())} />
            <TableHead>User Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead aria-label="Actions" />
          </tr>
        </TableHeader>
        <TableBody>
          {filtered.map(user => {
            const status = STATUS_CONFIG[user.status]
            return (
              <TableRow key={user.id}>
                <TableCheckboxCell checked={selected.has(user.id)} onChange={() => toggleSelect(user.id)} ariaLabel={`Select ${user.name}`} />
                <TableCell variant="link" style={{ cursor: 'pointer', color: 'var(--content-action-primary-default)' }}>{user.name}</TableCell>
                <TableCell variant="secondary">{user.email}</TableCell>
                <TableCell><StatusPill label={status.label} tone={status.tone} /></TableCell>
                <TableCell>{user.roleName}</TableCell>
                <TableCell align="center">
                  <KebabMenu
                    agentName={user.name}
                    actions={[
                      { label: 'Reset Password' },
                      { label: 'Deactivate User' },
                      { label: 'Delete User', onClick: () => setToDelete(user) },
                    ]}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <AddCompanyUserModal open={addOpen} roles={roles} onClose={() => setAddOpen(false)} onCreate={handleCreateUser} />

      <MoveToGroupModal open={moveOpen} entityLabel="users" selectedCount={selected.size} existingGroups={groups} onClose={() => setMoveOpen(false)}
        onMove={groupName => { setUsers(prev => prev.map(u => selected.has(u.id) ? { ...u, group: groupName } : u)); setSelected(new Set()); setMoveOpen(false) }} />
      <RemoveFromGroupModal open={removeOpen} entityLabel="users" selectedCount={selected.size} currentGroups={selectedGroups} onClose={() => setRemoveOpen(false)}
        onRemove={() => { setUsers(prev => prev.map(u => selected.has(u.id) ? { ...u, group: null } : u)); setSelected(new Set()); setRemoveOpen(false) }} />

      <ConfirmActionModal
        open={toDelete !== null}
        title="Delete User"
        message={`Are you sure you want to delete ${toDelete?.name ?? 'this user'}?`}
        confirmLabel="Delete User"
        destructive
        onClose={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) setUsers(prev => prev.filter(u => u.id !== toDelete.id)); setToDelete(null) }}
      />

      <ConfirmActionModal
        open={bulkDeleteOpen}
        title="Delete Users"
        message={`Are you sure you want to delete ${selected.size} selected user(s)?`}
        confirmLabel="Delete Users"
        destructive
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => { setUsers(prev => prev.filter(u => !selected.has(u.id))); setSelected(new Set()); setBulkDeleteOpen(false) }}
      />
    </div>
  )
}
