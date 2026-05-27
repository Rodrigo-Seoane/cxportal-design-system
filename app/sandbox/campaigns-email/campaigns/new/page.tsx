'use client'

import { useState, useEffect }    from 'react'
import { useRouter }              from 'next/navigation'
import { Stepper }                from '@/components/ui/stepper'
import { Button }                 from '@/components/ui/button'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Toaster, toast }         from '@/components/ui/toast'
import { useSideNav }             from '../../_context/SideNavContext'
import { addCampaign }            from '../../_store/campaigns-store'
import { CAMPAIGN_GROUPS }        from '../../_mock/groups'
import { StepType }               from './_components/steps/StepType'
import { StepMessage }            from './_components/steps/StepMessage'
import { StepSchedule }           from './_components/steps/StepSchedule'
import { StepReview }             from './_components/steps/StepReview'
import { DRAFT_INIT, canProceed } from './_draft'
import type { Draft }             from './_draft'
import type { CampaignType }      from '../../_mock/campaigns'

const STEPS = [
  { title: 'Select Type',       description: 'Campaign group + type'  },
  { title: 'Message Content',   description: 'Name, sender, content'  },
  { title: 'Schedule',          description: 'When to send'           },
  { title: 'Review & Launch',   description: 'Confirm and launch'     },
]

export default function NewCampaignPage() {
  const router               = useRouter()
  const { setHideSideNav }   = useSideNav()
  const [step,  setStep]     = useState(0)
  const [draft, setDraft]    = useState<Draft>(DRAFT_INIT)
  const [showCancel, setShowCancel] = useState(false)

  useEffect(() => {
    setHideSideNav(true)
    return () => setHideSideNav(false)
  }, [setHideSideNav])

  const update   = (patch: Partial<Draft>) => setDraft(d => ({ ...d, ...patch }))
  const isDirty  = draft.groupId !== '' || draft.name.trim() !== ''

  function buildCampaign(status: 'draft' | 'initialized') {
    const group = CAMPAIGN_GROUPS.find(g => g.id === draft.groupId)
    return {
      id:             `camp-${status === 'draft' ? 'draft' : 'new'}-${Date.now()}`,
      name:           draft.name || 'Untitled Draft',
      componentId:    group?.componentId ?? '',
      groupId:        draft.groupId,
      channel:        'email' as const,
      type:           (draft.type || undefined) as CampaignType | undefined,
      status,
      senderId:       draft.senderId,
      templateId:     draft.templateId,
      listIds:        draft.listId ? [draft.listId] : [],
      topicId:        null,
      recipientCount: 0,
      scheduledAt:    draft.scheduleMode === 'scheduled' && draft.scheduleDate && draft.scheduleTime
        ? `${draft.scheduleDate}T${draft.scheduleTime}:00Z`
        : null,
      sentAt:         null,
      createdAt:      new Date().toISOString(),
      createdBy:      'You',
    }
  }

  function handleSaveDraft() {
    addCampaign(buildCampaign('draft'))
    toast.success('Draft saved')
    router.push('/sandbox/campaigns-email')
  }

  function handleLaunch() {
    addCampaign(buildCampaign('initialized'))
    toast.success('Campaign created successfully')
    router.push('/sandbox/campaigns-email')
  }

  const stepItems = STEPS.map((s, i) => ({
    ...s,
    tag: i < step
      ? [draft.type?.replace(/-/g, ' '), draft.name, draft.scheduleMode === 'now' ? 'Send now' : 'Scheduled', undefined][i] ?? undefined
      : undefined,
  }))

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col h-[calc(100vh-56px)]">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-section)] shrink-0">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">New Campaign</h2>
          <Button variant="secondary" size="sm"
            onClick={() => isDirty ? setShowCancel(true) : router.push('/sandbox/campaigns-email')}>
            Cancel
          </Button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* Stepper sidebar */}
          <div className="w-[280px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-display)] overflow-y-auto px-5 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-4">
              New Campaign
            </p>
            <Stepper steps={stepItems} currentStep={step} />
          </div>

          {/* Step content */}
          <div className="flex-1 min-w-0 overflow-y-auto px-9 py-7">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
              {STEPS[step].title}
            </h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
              {STEPS[step].description}
            </p>

            {step === 0 && <StepType     draft={draft} update={update} />}
            {step === 1 && <StepMessage  draft={draft} update={update} />}
            {step === 2 && <StepSchedule draft={draft} update={update} />}
            {step === 3 && <StepReview   draft={draft} onGoTo={setStep} />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-[var(--color-border)] bg-[var(--color-surface-section)] shrink-0">
          {step > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setStep(s => s - 1)}>Back</Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleSaveDraft}>Save Draft</Button>
          {step < 3 ? (
            <Button variant="primary" size="sm" disabled={!canProceed(step, draft)}
              onClick={() => setStep(s => s + 1)}>
              Next
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleLaunch}>Launch Campaign</Button>
          )}
        </div>
      </div>

      {/* Cancel confirm */}
      <Modal open={showCancel} onClose={() => setShowCancel(false)} size="medium">
        <ModalHeader onClose={() => setShowCancel(false)}>Discard this campaign?</ModalHeader>
        <ModalBody>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            Your progress will be lost.
          </p>
        </ModalBody>
        <ModalFooter style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => setShowCancel(false)}>Keep editing</Button>
          <Button variant="primary"   size="sm" onClick={() => router.push('/sandbox/campaigns-email')}>
            Discard
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
