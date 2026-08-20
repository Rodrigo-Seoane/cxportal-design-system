'use client'

import { useMemo, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Radio } from '@/components/ui/checkbox'
import { Chip } from '@/components/ui/chip'
import { Button } from '@/components/ui/button'
import { MessageBox } from '@/components/ui/message-box'
import { Tooltip } from '@/components/ui/tooltip'
import { TableSectionHeader, type FilterChip } from './TableSectionHeader'
import { TASK_STATUS_CHIP, tasksForQueue, type Queue, type Task, type TaskStatus } from '@/app/open-inventory/task-queue-visibility/assign/_data'

type SortField = 'tat' | 'sla'

// "H:MM" duration strings sort correctly as text ("10:05" < "2:22" lexically),
// so compare on total minutes instead.
function durationMinutes(v: string): number {
  const [h, m] = v.split(':').map(Number)
  return h * 60 + m
}

export interface TaskTableProps {
  queue: Queue
  selectedTaskId?: string
  statusFilter: TaskStatus[]
  onStatusFilterChange: (v: TaskStatus[]) => void
  onSelect: (task: Task) => void
  onPickDifferentQueue: () => void
}

export function TaskTable({ queue, selectedTaskId, statusFilter, onStatusFilterChange, onSelect, onPickDifferentQueue }: TaskTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('tat')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const queueTasks = useMemo(() => tasksForQueue(queue.id), [queue.id])

  const filtered = useMemo(() => {
    return queueTasks.filter(t => {
      if (statusFilter.length && !statusFilter.includes(t.status)) return false
      const q = search.toLowerCase()
      if (q && !t.id.toLowerCase().includes(q) && !t.taskName.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false
      return true
    })
  }, [queueTasks, statusFilter, search])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const cmp = durationMinutes(a[sortField]) - durationMinutes(b[sortField])
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const chips: FilterChip[] = statusFilter.map(s => ({
    key: s, label: s, onRemove: () => onStatusFilterChange(statusFilter.filter(v => v !== s)),
  }))

  if (queueTasks.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <TableSectionHeader title={`Tasks in ${queue.name}`} count={0} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search tasks…" />
        <div className="px-4 pb-4">
          <MessageBox type="info" size="block" title={`No open tasks in ${queue.name} right now`} dismissible={false}>
            <Button variant="secondary" size="sm" onClick={onPickDifferentQueue}>Pick a different queue</Button>
          </MessageBox>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <TableSectionHeader
        title={`Tasks in ${queue.name}`}
        count={sorted.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tasks…"
        chips={chips}
      />

      {sorted.length === 0 ? (
        <div className="px-4 pb-4">
          <MessageBox type="info" size="block" title="No tasks match your filters" dismissible={false}>
            <p className="m-0 text-sm text-[var(--text-body-primary)]">Try widening your status filter or clearing your search.</p>
            <Button variant="secondary" size="sm" onClick={() => { setSearch(''); onStatusFilterChange([]) }}>Clear filters</Button>
          </MessageBox>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <Table size="compact">
            <TableHeader>
              <TableRow>
                <TableHead align="center" style={{ width: 32 }} />
                <TableHead>Auth</TableHead>
                <TableHead>Task Name</TableHead>
                <TableHead align="right">Line</TableHead>
                <TableHead>Status</TableHead>
                <TableHead sortDirection={sortField === 'tat' ? sortDir : 'none'} onSort={() => handleSort('tat')}>TAT</TableHead>
                <TableHead sortDirection={sortField === 'sla' ? sortDir : 'none'} onSort={() => handleSort('sla')}>SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(task => (
                <TableRow key={task.id} selected={task.id === selectedTaskId} onClick={() => onSelect(task)} style={{ cursor: 'pointer' }}>
                  <TableCell align="center">
                    <Radio name="task" value={task.id} checked={task.id === selectedTaskId} onChange={() => onSelect(task)} />
                  </TableCell>
                  <TableCell>{task.id}</TableCell>
                  <TableCell>
                    <span title={task.description}>{task.taskName}</span>
                  </TableCell>
                  <TableCell align="right">{task.lineCount}</TableCell>
                  <TableCell>
                    {task.status === 'Pended' && task.pendedReason ? (
                      <Tooltip content={task.pendedReason}>
                        <Chip label={task.status} type={TASK_STATUS_CHIP[task.status]} shade={100} iconLeft={false} iconRight={false} />
                      </Tooltip>
                    ) : (
                      <Chip label={task.status} type={TASK_STATUS_CHIP[task.status]} shade={100} iconLeft={false} iconRight={false} />
                    )}
                  </TableCell>
                  <TableCell variant="secondary">{task.tat}</TableCell>
                  <TableCell variant="secondary">{task.sla}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
