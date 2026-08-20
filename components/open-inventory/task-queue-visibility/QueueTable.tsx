'use client'

import { useMemo, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { MessageBox } from '@/components/ui/message-box'
import { TableSectionHeader, type FilterChip } from './TableSectionHeader'
import { StatusDot } from './StatusDot'
import { PRIORITY_COLOR, QUEUES, type Queue, type Priority } from '@/app/open-inventory/task-queue-visibility/assign/_data'

type SortField = 'name' | 'openTasks'

const PRIORITY_LABEL: Record<Priority, string> = { red: 'High', yellow: 'Medium', green: 'Low' }

export interface QueueTableProps {
  selectedQueueId?: string
  priorityFilter: Priority[]
  onPriorityFilterChange: (v: Priority[]) => void
  onSelect: (queue: Queue) => void
}

export function QueueTable({ selectedQueueId, priorityFilter, onPriorityFilterChange, onSelect }: QueueTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    return QUEUES.filter(q => {
      if (priorityFilter.length && !priorityFilter.includes(q.priority)) return false
      if (search && !q.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, priorityFilter])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const cmp = sortField === 'name' ? a.name.localeCompare(b.name) : a.openTasks - b.openTasks
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const chips: FilterChip[] = priorityFilter.map(p => ({
    key: p, label: PRIORITY_LABEL[p], onRemove: () => onPriorityFilterChange(priorityFilter.filter(v => v !== p)),
  }))

  return (
    <div className="flex h-full flex-col">
      <TableSectionHeader
        title="Queues"
        count={sorted.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search queues…"
        chips={chips}
      />

      {sorted.length === 0 ? (
        <div className="px-4 pb-4">
          <MessageBox type="info" size="block" title="No queues match your filters" dismissible={false}>
            <p className="m-0 text-sm text-[var(--text-body-primary)]">Try widening your priority filter or clearing your search.</p>
            <Button variant="secondary" size="sm" onClick={() => { setSearch(''); onPriorityFilterChange([]) }}>
              Clear filters
            </Button>
          </MessageBox>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <Table size="compact">
            <TableHeader>
              <TableRow>
                <TableHead sortDirection={sortField === 'name' ? sortDir : 'none'} onSort={() => handleSort('name')}>
                  Name
                </TableHead>
                <TableHead sortDirection={sortField === 'openTasks' ? sortDir : 'none'} onSort={() => handleSort('openTasks')}>
                  Tasks
                </TableHead>
                <TableHead align="center">PRI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(queue => (
                <TableRow
                  key={queue.id}
                  selected={queue.id === selectedQueueId}
                  onClick={() => onSelect(queue)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{queue.name}</TableCell>
                  <TableCell>{queue.openTasks}/{queue.totalTasks}</TableCell>
                  <TableCell align="center">
                    <span className="inline-flex items-center justify-center">
                      <StatusDot color={PRIORITY_COLOR[queue.priority]} />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
