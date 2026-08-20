'use client'

import { useMemo, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Radio } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { MessageBox } from '@/components/ui/message-box'
import { TableSectionHeader, type FilterChip } from './TableSectionHeader'
import { StatusDot } from './StatusDot'
import { WORKER_STATUS_COLOR, WORKERS, isEligible, type Task, type Worker, type WorkerStatus } from '@/app/open-inventory/task-queue-visibility/assign/_data'

export interface WorkerTableProps {
  task: Task
  queueName: string
  selectedWorkerId?: string
  statusFilter: WorkerStatus[]
  onStatusFilterChange: (v: WorkerStatus[]) => void
  onSelect: (worker: Worker) => void
  onPickDifferentTask: () => void
}

export function WorkerTable({
  task, queueName, selectedWorkerId, statusFilter, onStatusFilterChange, onSelect, onPickDifferentTask,
}: WorkerTableProps) {
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const eligibleWorkers = useMemo(() => WORKERS.filter(w => isEligible(w, queueName)), [queueName])
  const noEligibleWorkers = eligibleWorkers.length === 0

  const candidates = showAll ? WORKERS : eligibleWorkers

  const filtered = useMemo(() => {
    return candidates.filter(w => {
      if (statusFilter.length && !statusFilter.includes(w.status)) return false
      if (search && !w.id.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [candidates, statusFilter, search])

  // Eligible rows first so the operator's realistic choices stay near the top
  // even when "Show all workers" surfaces disabled, ineligible rows below.
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => Number(isEligible(b, queueName)) - Number(isEligible(a, queueName)))
  }, [filtered, queueName])

  const chips: FilterChip[] = statusFilter.map(s => ({
    key: s, label: s, onRemove: () => onStatusFilterChange(statusFilter.filter(v => v !== s)),
  }))

  if (noEligibleWorkers && !showAll) {
    return (
      <div className="flex h-full flex-col">
        <TableSectionHeader title={`Eligible workers for ${task.taskName}`} count={0} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search workers…" />
        <div className="px-4 pb-4">
          <MessageBox type="info" size="block" title="No eligible workers available right now" dismissible={false}>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAll(true)}>Show all workers</Button>
              <Button variant="secondary" size="sm" onClick={onPickDifferentTask}>Pick a different task</Button>
            </div>
          </MessageBox>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <TableSectionHeader
        title={`Eligible workers for ${task.taskName}`}
        count={sorted.length}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search workers…"
        chips={chips}
        chipRowExtra={
          <Switch label="Eligible only" checked={!showAll} onChange={v => setShowAll(!v)} size="small" showLabel />
        }
      />

      {sorted.length === 0 ? (
        <div className="px-4 pb-4">
          <MessageBox type="info" size="block" title="No workers match your filters" dismissible={false}>
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
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next</TableHead>
                <TableHead>Sched</TableHead>
                <TableHead align="right">In-Proc</TableHead>
                <TableHead align="right">Pending</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(worker => {
                const eligible = isEligible(worker, queueName)
                const disabled = !eligible
                return (
                  // Native `title` (not the Tooltip component) — Tooltip wraps
                  // children in a <div>, which is invalid directly inside <tbody>.
                  <TableRow
                    key={worker.id}
                    selected={worker.id === selectedWorkerId}
                    disabled={disabled}
                    onClick={disabled ? undefined : () => onSelect(worker)}
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                    title={disabled ? `Not proficient for ${task.taskName}` : undefined}
                  >
                    <TableCell align="center">
                      <Radio name="worker" value={worker.id} disabled={disabled} checked={worker.id === selectedWorkerId} onChange={() => !disabled && onSelect(worker)} />
                    </TableCell>
                    <TableCell>{worker.id}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <StatusDot color={WORKER_STATUS_COLOR[worker.status]} />
                        {worker.status}
                      </span>
                    </TableCell>
                    <TableCell variant="secondary">{worker.nextStatusAt}</TableCell>
                    <TableCell variant="secondary">{worker.scheduledActivity}</TableCell>
                    <TableCell align="right">{worker.inProcessCount}</TableCell>
                    <TableCell align="right">{worker.pendingCount}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
