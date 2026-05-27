'use client'

import { Suspense }                      from 'react'
import { useSearchParams, useRouter }    from 'next/navigation'
import { useRole }                       from '../_context/RoleContext'
import { AccountTree }                   from './_components/AccountTree'
import { LevelOne }                      from './_components/LevelOne'
import { LevelTwo }                      from './_components/LevelTwo'
import { LevelGroup }                    from './_components/LevelGroup'
import { LevelThree }                    from './_components/LevelThree'

const DEFAULT_ACCOUNT_ID = 'ssa-rsc'

function AccountManagementContent() {
  const params   = useSearchParams()
  const router   = useRouter()
  const { role } = useRole()
  const isSuper  = role === 'super-admin'

  const accountId = params.get('account')
  const groupId   = params.get('group')
  const topicId   = params.get('topic')

  const effectiveAccountId = accountId ?? (isSuper ? null : DEFAULT_ACCOUNT_ID)

  let rightPanel: React.ReactNode
  if (effectiveAccountId && groupId && topicId) {
    rightPanel = <LevelThree accountId={effectiveAccountId} groupId={groupId} topicId={topicId} />
  } else if (effectiveAccountId && groupId) {
    rightPanel = <LevelGroup accountId={effectiveAccountId} groupId={groupId} />
  } else if (effectiveAccountId) {
    rightPanel = <LevelTwo accountId={effectiveAccountId} />
  } else {
    rightPanel = <LevelOne />
  }

  return (
    <div className="flex min-h-full">
      <AccountTree
        selectedAccountId={effectiveAccountId}
        selectedGroupId={groupId}
        selectedTopicId={topicId}
        onSelectAccount={id => router.push(`?account=${id}`)}
        onSelectGroup={(aId, gId) => router.push(`?account=${aId}&group=${gId}`)}
        onSelectTopic={(aId, gId, tId) => router.push(`?account=${aId}&group=${gId}&topic=${tId}`)}
        isSuper={isSuper}
      />
      <div className="flex-1 min-w-0 overflow-y-auto">
        {rightPanel}
      </div>
    </div>
  )
}

export default function AccountManagementPage() {
  return (
    <Suspense fallback={<div className="p-12 text-sm text-[var(--color-text-secondary)]">Loading…</div>}>
      <AccountManagementContent />
    </Suspense>
  )
}
