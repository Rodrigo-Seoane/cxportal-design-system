'use client'

import { useRouter } from 'next/navigation'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ACCOUNTS } from '../../_mock/accounts'
import { CAMPAIGN_GROUPS } from '../../_mock/groups'
import { TOPICS }    from '../../_mock/topics'
import { LISTS }     from '../../_mock/lists'
import { CAMPAIGNS } from '../../_mock/campaigns'

const ACTIVE_STATUSES = new Set(['running', 'scheduled', 'initialized'])

export function LevelOne() {
  const router = useRouter()

  const rows = ACCOUNTS.map(account => {
    const gids    = new Set(account.campaignGroupIds)
    const groups  = CAMPAIGN_GROUPS.filter(g => gids.has(g.id))
    const topics  = TOPICS.filter(t => gids.has(t.groupId))
    const lists   = LISTS.filter(l => gids.has(l.groupId))
    const active  = CAMPAIGNS.filter(c => gids.has(c.groupId) && ACTIVE_STATUSES.has(c.status))
    return { account, groups, topics, lists, active }
  })

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: '32px' }}>
        Account Management
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Manage SSA accounts, campaign groups, topics, and recipient lists.
      </p>

      <Table size="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead align="right">Campaign Groups</TableHead>
            <TableHead align="right">Topics</TableHead>
            <TableHead align="right">Lists</TableHead>
            <TableHead align="right">Active Campaigns</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ account, groups, topics, lists, active }) => (
            <TableRow
              key={account.id}
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`?account=${account.id}`)}
            >
              <TableCell>
                <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-primary)' }}>
                  {account.name}
                </span>
              </TableCell>
              <TableCell align="right" variant="secondary">{groups.length}</TableCell>
              <TableCell align="right" variant="secondary">{topics.length}</TableCell>
              <TableCell align="right" variant="secondary">{lists.length}</TableCell>
              <TableCell align="right" variant="secondary">{active.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
