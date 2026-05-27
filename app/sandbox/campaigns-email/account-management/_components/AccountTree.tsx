'use client'

import { useState, useEffect }             from 'react'
import { motion, AnimatePresence }          from 'framer-motion'
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react'
import { cn }                               from '@/lib/utils'
import type { MouseEvent }                  from 'react'
import { ACCOUNTS }                         from '../../_mock/accounts'
import { CAMPAIGN_GROUPS }                  from '../../_mock/groups'
import { TOPICS }                           from '../../_mock/topics'

const DEFAULT_ACCOUNT_ID = 'ssa-rsc'

// ── Node row ──────────────────────────────────────────────────────────────────

interface NodeRowProps {
  label:            string
  isFolder:         boolean
  isExpanded?:      boolean
  isSelected:       boolean
  bold?:            boolean
  onClick:          () => void
  onChevronClick?:  (e: MouseEvent) => void
}

function NodeRow({ label, isFolder, isExpanded, isSelected, bold, onClick, onChevronClick }: NodeRowProps) {
  return (
    <div
      role="treeitem"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className={cn(
        'flex items-center gap-1.5 w-full cursor-pointer select-none outline-none',
        'px-2 py-1 rounded-md text-[13px] transition-colors',
        bold && 'font-semibold',
        isSelected
          ? 'bg-[var(--color-surface-display)] text-[var(--color-text-primary)] border-l-2 border-[var(--color-primary)]'
          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-display)]',
      )}
    >
      <span
        className="shrink-0 w-3.5 h-3.5 flex items-center justify-center text-[var(--color-text-secondary)]"
        onClick={onChevronClick}
      >
        {isFolder && (
          isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
        )}
      </span>
      <span className="shrink-0 text-[var(--color-text-secondary)]">
        {isFolder ? <Folder size={14} /> : <File size={13} />}
      </span>
      <span className="truncate leading-tight">{label}</span>
    </div>
  )
}

// ── Animation config ──────────────────────────────────────────────────────────

const EXPAND = {
  initial:    { height: 0, opacity: 0 },
  animate:    { height: 'auto', opacity: 1 },
  exit:       { height: 0, opacity: 0 },
  transition: { duration: 0.2, ease: 'easeInOut' as const },
}

// ── AccountTree ───────────────────────────────────────────────────────────────

interface AccountTreeProps {
  selectedAccountId: string | null
  selectedGroupId:   string | null
  selectedTopicId:   string | null
  onSelectAccount:   (accountId: string) => void
  onSelectGroup:     (accountId: string, groupId: string) => void
  onSelectTopic:     (accountId: string, groupId: string, topicId: string) => void
  isSuper:           boolean
}

export function AccountTree({
  selectedAccountId, selectedGroupId, selectedTopicId,
  onSelectAccount, onSelectGroup, onSelectTopic, isSuper,
}: AccountTreeProps) {
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(() => {
    const initial = selectedAccountId ?? (isSuper ? null : DEFAULT_ACCOUNT_ID)
    return new Set(initial ? [initial] : [])
  })
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(selectedGroupId ? [selectedGroupId] : [])
  )

  useEffect(() => {
    if (selectedAccountId) setExpandedAccounts(prev => new Set([...prev, selectedAccountId]))
  }, [selectedAccountId])

  useEffect(() => {
    if (selectedGroupId) setExpandedGroups(prev => new Set([...prev, selectedGroupId]))
  }, [selectedGroupId])

  const accounts = isSuper ? ACCOUNTS : ACCOUNTS.filter(a => a.id === DEFAULT_ACCOUNT_ID)

  function toggleAccount(id: string, e: MouseEvent) {
    e.stopPropagation()
    setExpandedAccounts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleGroup(id: string, e: MouseEvent) {
    e.stopPropagation()
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <nav
      role="tree"
      aria-label="Account navigation"
      className="w-56 shrink-0 border-r border-[var(--color-border)] overflow-y-auto py-3 px-2 self-stretch"
    >
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Accounts
      </p>

      <div className="space-y-0.5">
        {accounts.map(account => {
          const groups            = CAMPAIGN_GROUPS.filter(g => account.campaignGroupIds.includes(g.id))
          const isAccountExpanded = expandedAccounts.has(account.id)
          const isAccountSelected = selectedAccountId === account.id && !selectedTopicId

          return (
            <div key={account.id}>
              <NodeRow
                label={account.name}
                isFolder
                isExpanded={isAccountExpanded}
                isSelected={isAccountSelected}
                bold
                onClick={() => onSelectAccount(account.id)}
                onChevronClick={e => toggleAccount(account.id, e)}
              />

              <AnimatePresence initial={false}>
                {isAccountExpanded && groups.length > 0 && (
                  <motion.div
                    key="groups"
                    {...EXPAND}
                    className="overflow-hidden pl-3 border-l border-[var(--color-border)]"
                  >
                    <div className="space-y-0.5 pt-0.5">
                      {groups.map(group => {
                        const topics          = TOPICS.filter(t => t.groupId === group.id)
                        const isGroupExpanded = expandedGroups.has(group.id)

                        return (
                          <div key={group.id}>
                            <NodeRow
                              label={group.name}
                              isFolder={topics.length > 0}
                              isExpanded={isGroupExpanded}
                              isSelected={selectedGroupId === group.id && !selectedTopicId}
                              onClick={() => {
                                onSelectGroup(account.id, group.id)
                                setExpandedGroups(prev => new Set([...prev, group.id]))
                              }}
                              onChevronClick={e => toggleGroup(group.id, e)}
                            />

                            <AnimatePresence initial={false}>
                              {isGroupExpanded && topics.length > 0 && (
                                <motion.div
                                  key="topics"
                                  {...EXPAND}
                                  className="overflow-hidden pl-3 border-l border-[var(--color-border)]"
                                >
                                  <div className="space-y-0.5 pt-0.5">
                                    {topics.map(topic => (
                                      <NodeRow
                                        key={topic.id}
                                        label={topic.name}
                                        isFolder={false}
                                        isSelected={selectedTopicId === topic.id}
                                        onClick={() => onSelectTopic(account.id, group.id, topic.id)}
                                      />
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
