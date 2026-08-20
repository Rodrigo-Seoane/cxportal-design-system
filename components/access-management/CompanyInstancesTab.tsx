'use client'

import { Fragment, useMemo, useState } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCheckboxHead, TableCheckboxCell } from '@/components/ui/table'
import { KebabMenu } from '@/components/wfm/KebabMenu'
import { BulkActionBar } from './BulkActionBar'
import { MoveToGroupModal } from './MoveToGroupModal'
import { RemoveFromGroupModal } from './RemoveFromGroupModal'
import { AddInstanceModal, type NewInstanceInput } from './AddInstanceModal'
import { ConfirmActionModal } from './ConfirmActionModal'
import type { CompanyInstance } from '@/mocks/access-management/companies'

const SEARCH_FIELDS = ['Group Name', 'Instance Alias', 'Instance ID', 'Region'] as const
type SearchField = (typeof SEARCH_FIELDS)[number]

export function CompanyInstancesTab({ companyName, companyId, initialInstances }: { companyName: string; companyId: string; initialInstances: CompanyInstance[] }) {
  const [instances, setInstances] = useState(initialInstances)
  const [searchField, setSearchField] = useState<SearchField>('Group Name')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [toDelete, setToDelete] = useState<CompanyInstance | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return instances
    const q = search.toLowerCase()
    return instances.filter(i => {
      const field = { 'Group Name': i.group ?? '', 'Instance Alias': i.alias, 'Instance ID': i.instanceId, Region: i.region }[searchField]
      return field.toLowerCase().includes(q)
    })
  }, [instances, search, searchField])

  const groups = useMemo(() => {
    const names = Array.from(new Set(instances.map(i => i.group).filter((g): g is string => g !== null)))
    return names
  }, [instances])

  const grouped = useMemo(() => {
    const byGroup = new Map<string, CompanyInstance[]>()
    const ungrouped: CompanyInstance[] = []
    for (const i of filtered) {
      if (i.group) {
        if (!byGroup.has(i.group)) byGroup.set(i.group, [])
        byGroup.get(i.group)!.push(i)
      } else {
        ungrouped.push(i)
      }
    }
    return { byGroup, ungrouped }
  }, [filtered])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectedInstances = instances.filter(i => selected.has(i.id))
  const selectedGroups = Array.from(new Set(selectedInstances.map(i => i.group).filter((g): g is string => g !== null)))

  const handleMoveToGroup = (groupName: string) => {
    setInstances(prev => prev.map(i => selected.has(i.id) ? { ...i, group: groupName } : i))
    setSelected(new Set()); setMoveOpen(false)
  }

  const handleRemoveFromGroup = () => {
    setInstances(prev => prev.map(i => selected.has(i.id) ? { ...i, group: null } : i))
    setSelected(new Set()); setRemoveOpen(false)
  }

  const handleBulkDelete = () => {
    setInstances(prev => prev.filter(i => !selected.has(i.id)))
    setSelected(new Set()); setBulkDeleteOpen(false)
  }

  const handleCreateInstance = (input: NewInstanceInput) => {
    setInstances(prev => [{ id: `i-${prev.length + 1}`, alias: input.alias, instanceId: input.instanceId, region: input.region, awsAccountId: input.awsAccountId, arn: input.arn, group: null }, ...prev])
    setAddOpen(false)
  }

  const renderRow = (instance: CompanyInstance) => (
    <TableRow key={instance.id}>
      <TableCheckboxCell checked={selected.has(instance.id)} onChange={() => toggleSelect(instance.id)} ariaLabel={`Select ${instance.alias}`} />
      <TableCell variant="link" style={{ cursor: 'pointer', color: '#0ea2a7' }}>{instance.alias}</TableCell>
      <TableCell variant="secondary">{instance.instanceId}</TableCell>
      <TableCell>{instance.region}</TableCell>
      <TableCell variant="secondary">{instance.awsAccountId}</TableCell>
      <TableCell variant="secondary">{instance.arn}</TableCell>
      <TableCell align="center">
        <KebabMenu agentName={instance.alias} actions={[{ label: 'Edit Instance' }, { label: 'Delete Instance', onClick: () => setToDelete(instance) }]} />
      </TableCell>
    </TableRow>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: '#021920' }}>Instances ({instances.length})</h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button variant="secondary-central" size="xs" onClick={() => setAddOpen(true)}>
            <PlusIcon size={14} weight="bold" aria-hidden="true" /> Add New Instance
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
            <TableCheckboxHead onChange={checked => setSelected(checked ? new Set(filtered.map(i => i.id)) : new Set())} />
            <TableHead>Instance Alias</TableHead>
            <TableHead>Instance ID</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>AWS Account ID</TableHead>
            <TableHead>ARN</TableHead>
            <TableHead aria-label="Actions" />
          </tr>
        </TableHeader>
        <TableBody>
          {Array.from(grouped.byGroup.entries()).map(([groupName, rows]) => (
            <Fragment key={groupName}>
              <tr>
                <td colSpan={7} style={{ padding: '6px 8px', background: '#eff1f3', fontSize: 11, fontWeight: 700, color: '#7a828c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {groupName}
                </td>
              </tr>
              {rows.map(renderRow)}
            </Fragment>
          ))}
          {grouped.ungrouped.length > 0 && (
            <Fragment>
              <tr>
                <td colSpan={7} style={{ padding: '6px 8px', background: '#eff1f3', fontSize: 11, fontWeight: 700, color: '#7a828c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Ungroup
                </td>
              </tr>
              {grouped.ungrouped.map(renderRow)}
            </Fragment>
          )}
        </TableBody>
      </Table>

      <AddInstanceModal open={addOpen} companyName={companyName} companyId={companyId} onClose={() => setAddOpen(false)} onCreate={handleCreateInstance} />

      <MoveToGroupModal open={moveOpen} entityLabel="instances" selectedCount={selected.size} existingGroups={groups} onClose={() => setMoveOpen(false)} onMove={handleMoveToGroup} />
      <RemoveFromGroupModal open={removeOpen} entityLabel="instances" selectedCount={selected.size} currentGroups={selectedGroups} onClose={() => setRemoveOpen(false)} onRemove={handleRemoveFromGroup} />

      <ConfirmActionModal
        open={toDelete !== null}
        title="Delete Instance"
        message={`Are you sure you want to delete ${toDelete?.alias ?? 'this instance'}?`}
        confirmLabel="Delete Instance"
        destructive
        onClose={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) setInstances(prev => prev.filter(i => i.id !== toDelete.id)); setToDelete(null) }}
      />

      <ConfirmActionModal
        open={bulkDeleteOpen}
        title="Delete Instances"
        message={`Are you sure you want to delete ${selected.size} selected instance(s)?`}
        confirmLabel="Delete Instances"
        destructive
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}
