'use client'

import { useMemo, useState } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCheckboxHead, TableCheckboxCell } from '@/components/ui/table'
import { KebabMenu } from '@/components/wfm/KebabMenu'
import { BulkActionBar } from './BulkActionBar'
import { MoveToGroupModal } from './MoveToGroupModal'
import { RemoveFromGroupModal } from './RemoveFromGroupModal'
import { AddCompanyRoleModal, type NewCompanyRoleInput } from './AddCompanyRoleModal'
import { ConfirmActionModal } from './ConfirmActionModal'
import type { CompanyRole } from '@/mocks/access-management/companies'

const SEARCH_FIELDS = ['Group Name', 'Role Name'] as const
type SearchField = (typeof SEARCH_FIELDS)[number]

export function CompanyRolesTab({ initialRoles }: { initialRoles: CompanyRole[] }) {
  const [roles, setRoles] = useState(initialRoles)
  const [searchField, setSearchField] = useState<SearchField>('Group Name')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [toDelete, setToDelete] = useState<CompanyRole | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return roles
    const q = search.toLowerCase()
    return roles.filter(r => {
      const field = { 'Group Name': r.group ?? '', 'Role Name': r.name }[searchField]
      return field.toLowerCase().includes(q)
    })
  }, [roles, search, searchField])

  const groups = Array.from(new Set(roles.map(r => r.group).filter((g): g is string => g !== null)))
  const selectedRoles = roles.filter(r => selected.has(r.id))
  const selectedGroups = Array.from(new Set(selectedRoles.map(r => r.group).filter((g): g is string => g !== null)))

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleCreateRole = (input: NewCompanyRoleInput) => {
    setRoles(prev => [{ id: `r-${prev.length + 1}`, name: input.name, description: input.description, group: null }, ...prev])
    setAddOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: '#021920' }}>Roles ({roles.length})</h3>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button variant="secondary-central" size="xs" onClick={() => setAddOpen(true)}>
            <PlusIcon size={14} weight="bold" aria-hidden="true" /> Add New Role
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#021920' }}>Search</span>
            <select value={searchField} onChange={e => setSearchField(e.target.value as SearchField)} style={{ height: 24, padding: '0 6px', border: '1px solid #d9dce0', borderRight: 'none', borderRadius: '4px 0 0 4px', fontSize: 12, background: '#fff', fontFamily: 'var(--font-sans)' }}>
              {SEARCH_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 240, height: 24, padding: '0 8px', border: '1px solid #d9dce0', borderRadius: '0 4px 4px 0', background: '#fff' }}>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${searchField.toLowerCase()}`} style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, fontFamily: 'var(--font-sans)' }} />
              <MagnifyingGlassIcon size={14} color="#7a828c" weight="regular" aria-hidden="true" />
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
            <TableCheckboxHead onChange={checked => setSelected(checked ? new Set(filtered.map(r => r.id)) : new Set())} />
            <TableHead>Role Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead aria-label="Actions" />
          </tr>
        </TableHeader>
        <TableBody>
          {filtered.map(role => (
            <TableRow key={role.id}>
              <TableCheckboxCell checked={selected.has(role.id)} onChange={() => toggleSelect(role.id)} ariaLabel={`Select ${role.name}`} />
              <TableCell variant="link" style={{ cursor: 'pointer', color: '#0ea2a7' }}>{role.name}</TableCell>
              <TableCell variant="secondary">{role.description}</TableCell>
              <TableCell align="center">
                <KebabMenu agentName={role.name} actions={[{ label: 'Edit Role' }, { label: 'Delete Role', onClick: () => setToDelete(role) }]} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddCompanyRoleModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreateRole} />

      <MoveToGroupModal open={moveOpen} entityLabel="roles" selectedCount={selected.size} existingGroups={groups} onClose={() => setMoveOpen(false)}
        onMove={groupName => { setRoles(prev => prev.map(r => selected.has(r.id) ? { ...r, group: groupName } : r)); setSelected(new Set()); setMoveOpen(false) }} />
      <RemoveFromGroupModal open={removeOpen} entityLabel="roles" selectedCount={selected.size} currentGroups={selectedGroups} onClose={() => setRemoveOpen(false)}
        onRemove={() => { setRoles(prev => prev.map(r => selected.has(r.id) ? { ...r, group: null } : r)); setSelected(new Set()); setRemoveOpen(false) }} />

      <ConfirmActionModal
        open={toDelete !== null}
        title="Delete Role"
        message={`Are you sure you want to delete ${toDelete?.name ?? 'this role'}?`}
        confirmLabel="Delete Role"
        destructive
        onClose={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) setRoles(prev => prev.filter(r => r.id !== toDelete.id)); setToDelete(null) }}
      />

      <ConfirmActionModal
        open={bulkDeleteOpen}
        title="Delete Roles"
        message={`Are you sure you want to delete ${selected.size} selected role(s)?`}
        confirmLabel="Delete Roles"
        destructive
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => { setRoles(prev => prev.filter(r => !selected.has(r.id))); setSelected(new Set()); setBulkDeleteOpen(false) }}
      />
    </div>
  )
}
