'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, UploadSimpleIcon } from '@phosphor-icons/react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StepMapping, DEFAULT_MAPPINGS } from './StepMapping'
import { StepPreview } from './StepPreview'
import type { MappingState } from './StepMapping'
import type { ContactList } from '../../_mock/lists'
import { CAMPAIGN_GROUPS } from '../../_mock/groups'

type UploadStep = 1 | 2 | 3 | 4

const STEP_LABELS: Record<UploadStep, string> = {
  1: 'Name',
  2: 'Upload',
  3: 'Column Mapping',
  4: 'Preview',
}

interface UploadModalProps {
  open:     boolean
  onClose:  () => void
  editList: ContactList | null
  onAdd:    (list: ContactList) => void
}

// ── Local step indicator ──────────────────────────────────────────────────────

function StepIndicator({ current }: { current: UploadStep }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {([1, 2, 3, 4] as UploadStep[]).map(s => {
        const done    = s < current
        const active  = s === current
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7,
            background: active ? 'var(--color-info-100)' : 'transparent' }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              background: done ? 'var(--color-primary)' : active ? 'var(--color-primary)' : 'var(--color-surface-display)',
              color:      done ? '#fff'                 : active ? '#fff'                 : 'var(--color-text-secondary)',
              border:     done || active ? 'none' : '1px solid var(--color-border)',
            }}>
              {done ? '✓' : s}
            </span>
            <span style={{ fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? 'var(--color-primary)' : done ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
              {STEP_LABELS[s]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Upload drop zone ──────────────────────────────────────────────────────────

function StepUpload({ dropped, onDrop }: { dropped: boolean; onDrop: () => void }) {
  if (dropped) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 8,
        background: 'var(--color-success-100)', border: '1px solid var(--color-border)' }}>
        <CheckCircleIcon size={18} color="#1a6b1a" weight="fill" style={{ flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1a6b1a' }}>subscribers_export.csv</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>42,180 rows detected</p>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onDrop}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onDrop() }}
      style={{
        width: '100%', padding: '48px 24px', borderRadius: 10, cursor: 'pointer',
        border: '2px dashed var(--color-border)', background: 'var(--color-surface-display)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}
    >
      <UploadSimpleIcon size={28} color="var(--color-text-secondary)" />
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Drop a CSV file here, or click to browse
      </p>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
        Max 50 MB — email, phone, or rich-format CSV
      </p>
    </button>
  )
}

// ── UploadModal ───────────────────────────────────────────────────────────────

export function UploadModal({ open, onClose, editList, onAdd }: UploadModalProps) {
  const [step, setStep]         = useState<UploadStep>(1)
  const [listName, setListName] = useState('')
  const [nameError, setNameError] = useState('')
  const [dropped, setDropped]   = useState(false)
  const [mappings, setMappings] = useState<MappingState>(DEFAULT_MAPPINGS)

  useEffect(() => {
    if (open && editList) setListName(editList.name)
  }, [open, editList])

  function reset() {
    setStep(1); setListName(''); setNameError(''); setDropped(false); setMappings(DEFAULT_MAPPINGS)
  }

  function handleClose() { reset(); onClose() }

  const hasMappedContact = Object.values(mappings).some(m => m.attr === 'email' || m.attr === 'phone')
  const mappingError = step === 3 && !hasMappedContact
    ? 'Map at least one Email or Phone column before proceeding.'
    : ''

  function handleNext() {
    if (step === 1) {
      if (!listName.trim()) { setNameError('List name is required'); return }
      setNameError('')
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      if (!hasMappedContact) return
      setStep(4)
    } else {
      const newList: ContactList = {
        id:               `list-new-${Date.now()}`,
        name:             listName.trim(),
        componentId:      CAMPAIGN_GROUPS[0].componentId,
        groupId:          CAMPAIGN_GROUPS[0].id,
        channel:          'email',
        recipientCount:   42_180,
        topicIds:         [],
        status:           'active',
        lastUpdated:      new Date().toISOString(),
        createdAt:        new Date().toISOString(),
        inActiveCampaign: false,
      }
      onAdd(newList)
      reset()
      onClose()
    }
  }

  function handleFileDrop() {
    setDropped(true)
    setStep(3)
  }

  const canAdvance =
    step === 1 ? listName.trim().length > 0 :
    step === 2 ? dropped :
    step === 3 ? hasMappedContact : true

  return (
    <Modal open={open} onClose={handleClose} size="xlarge"
      aria-labelledby="upload-modal-title">

      <ModalHeader onClose={handleClose}>
        <span id="upload-modal-title">
          {editList ? `Update: ${editList.name}` : 'Import Recipient List'}
        </span>
      </ModalHeader>

      <ModalBody style={{ display: 'flex', gap: 0, padding: 0, flex: '1 1 auto' }}>
        <div style={{
          width: 190, flexShrink: 0, padding: '20px 12px',
          borderRight: '1px solid var(--color-border)', background: 'var(--color-surface-display)',
        }}>
          <StepIndicator current={step} />
        </div>

        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {step === 1 && (
            <div style={{ maxWidth: 400 }}>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
                Give this list a clear name so you can find it later.
              </p>
              <Input
                label="List name"
                required
                placeholder="e.g. Medicare Beneficiaries — Q3 2026"
                value={listName}
                onChange={setListName}
                error={nameError}
              />
            </div>
          )}

          {step === 2 && (
            <StepUpload dropped={dropped} onDrop={handleFileDrop} />
          )}

          {step === 3 && (
            <StepMapping mappings={mappings} onChange={setMappings} error={mappingError} />
          )}

          {step === 4 && (
            <StepPreview mappings={mappings} />
          )}
        </div>
      </ModalBody>

      <ModalFooter style={{ justifyContent: 'flex-end', gap: 8 }}>
        {step > 1 && step !== 2 && (
          <Button variant="secondary" size="sm" onClick={() => setStep((step - 1) as UploadStep)}>Back</Button>
        )}
        <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
        {step !== 2 && (
          <Button variant="primary" size="sm" onClick={handleNext} disabled={!canAdvance}>
            {step === 4 ? 'Import' : 'Next'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}
