'use client'

import { useState } from 'react'
import { UploadSimpleIcon, CheckCircleIcon } from '@phosphor-icons/react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Stepper }     from '@/components/ui/stepper'
import { Button }      from '@/components/ui/button'
import { MessageBox }  from '@/components/ui/message-box'
import type { ContactList, ListChannel } from '../../_mock/lists'

// ── Types ─────────────────────────────────────────────────────────────────────

type SourceFormat = 'single-csv' | 'govdelivery-csv' | 'rich'
type WizardStep   = 'source' | 'upload' | 'channel' | 'mapping' | 'review'

function getStepOrder(source: SourceFormat | null): WizardStep[] {
  if (source === 'rich') return ['source', 'upload', 'channel', 'mapping', 'review']
  return ['source', 'upload', 'channel', 'review']
}

const STEP_META: Record<WizardStep, { title: string; description: string }> = {
  source:  { title: 'Source',  description: 'Choose import format'      },
  upload:  { title: 'Upload',  description: 'Drag or select your file'  },
  channel: { title: 'Channel', description: 'Email, phone, or both'     },
  mapping: { title: 'Mapping', description: 'Map CSV columns to fields' },
  review:  { title: 'Review',  description: 'Confirm and import'        },
}

const SOURCE_LABEL: Record<SourceFormat, string> = {
  'single-csv':      'Single-column CSV',
  'govdelivery-csv': 'GovDelivery export CSV',
  'rich':            'Rich-format CSV',
}

const CHANNEL_LABEL: Record<ListChannel, string> = {
  email: 'Email only',
  phone: 'Phone only',
  both:  'Email + Phone',
}

// ── Option card ───────────────────────────────────────────────────────────────

function OptionCard({ label, description, selected, onSelect }: {
  label: string; description: string; selected: boolean; onSelect: () => void
}) {
  return (
    <button onClick={onSelect} style={{
      width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 8, marginBottom: 8,
      border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: selected ? 'var(--color-info-100)' : 'var(--color-surface-section)',
      cursor: 'pointer',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2,
        color: selected ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{description}</div>
    </button>
  )
}

// ── Step panels ───────────────────────────────────────────────────────────────

function StepSource({ source, onSelect }: { source: SourceFormat | null; onSelect: (v: SourceFormat) => void }) {
  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Choose the format that matches your file. The correct choice ensures accurate column detection.
      </p>
      <OptionCard label="Single-column CSV"
        description="One email or phone number per row. Fastest to import."
        selected={source === 'single-csv'} onSelect={() => onSelect('single-csv')} />
      <OptionCard label="GovDelivery export CSV"
        description="Standard subscriber export from GovDelivery. Columns are auto-detected."
        selected={source === 'govdelivery-csv'} onSelect={() => onSelect('govdelivery-csv')} />
      <OptionCard label="Rich-format CSV"
        description="Multiple columns (email, name, custom fields). Column mapping required on the next step."
        selected={source === 'rich'} onSelect={() => onSelect('rich')} />
    </div>
  )
}

function StepUpload({ dropped, onDrop, source }: { dropped: boolean; onDrop: () => void; source: SourceFormat }) {
  if (dropped) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 8,
          border: '1px solid var(--color-border)', background: 'var(--color-success-100)',
        }}>
          <CheckCircleIcon size={18} color="#1a6b1a" weight="fill" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a6b1a' }}>subscribers_export.csv</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>42,180 rows detected</div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: '18px' }}>
          {source === 'govdelivery-csv'
            ? 'GovDelivery columns auto-detected: email, first_name, last_name, topic_ids.'
            : source === 'rich'
            ? 'Column mapping required on the next step.'
            : 'Email addresses extracted from column A.'}
        </p>
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
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Drop a CSV file here
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
        or click to browse — max 50 MB
      </div>
    </button>
  )
}

function StepChannel({ channel, onChange }: { channel: ListChannel; onChange: (v: ListChannel) => void }) {
  const options: { value: ListChannel; description: string }[] = [
    { value: 'email', description: 'Recipients receive email notifications only.'  },
    { value: 'phone', description: 'Recipients receive SMS text messages only.'    },
    { value: 'both',  description: 'Recipients may receive both email and SMS.'    },
  ]
  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Select the contact channel this recipient list supports. This determines which campaign types the list can be used with.
      </p>
      {options.map(o => (
        <OptionCard key={o.value} label={CHANNEL_LABEL[o.value]} description={o.description}
          selected={channel === o.value} onSelect={() => onChange(o.value)} />
      ))}
    </div>
  )
}

const CSV_FIELDS = [
  { label: 'Email address', key: 'email',     csvCol: 'email'      },
  { label: 'First name',    key: 'firstName',  csvCol: 'first_name' },
  { label: 'Last name',     key: 'lastName',   csvCol: 'last_name'  },
]

function StepMapping({ mapping, onChange }: {
  mapping: Record<string, string>; onChange: (m: Record<string, string>) => void
}) {
  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Match your CSV column headers to the required fields. Auto-detected from the first row.
      </p>
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '8px 14px',
          background: 'var(--color-surface-display)', borderBottom: '1px solid var(--color-border)',
          fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.4px',
        }}>
          <span>System field</span>
          <span>CSV column</span>
        </div>
        {CSV_FIELDS.map(({ label, key, csvCol }, i) => (
          <div key={key} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '10px 14px', alignItems: 'center',
            borderBottom: i < CSV_FIELDS.length - 1 ? '1px solid var(--color-border)' : 'none',
            background: i % 2 === 0 ? 'var(--color-surface-section)' : 'var(--color-surface-zebra)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{label}</span>
            <input
              value={mapping[key] ?? csvCol}
              onChange={e => onChange({ ...mapping, [key]: e.target.value })}
              style={{
                fontSize: 12, fontFamily: 'monospace', padding: '4px 8px', borderRadius: 5,
                border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
                color: 'var(--color-text-primary)', width: '100%',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function StepReview({ source, channel, editList }: {
  source: SourceFormat; channel: ListChannel; editList?: ContactList | null
}) {
  const rows = [
    { label: 'Import format', value: SOURCE_LABEL[source]   },
    { label: 'Channel',       value: CHANNEL_LABEL[channel] },
    { label: 'Recipients',    value: '42,180'               },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {editList?.inActiveCampaign && (
        <MessageBox
          type="warning"
          size="block"
          title="This recipient list is used in an active campaign"
          message="Updating the recipient list while a campaign is in progress may affect delivery. The new version will apply to future sends only."
          dismissible={false}
        />
      )}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
        {rows.map(({ label, value }, i) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
            borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none',
            background: i % 2 === 0 ? 'var(--color-surface-section)' : 'var(--color-surface-zebra)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: '18px' }}>
        Imports are processed in the background. You'll receive a confirmation once the list is ready.
      </p>
    </div>
  )
}

// ── UploadWizard ──────────────────────────────────────────────────────────────

export interface UploadWizardProps {
  open:        boolean
  onClose:     () => void
  editList?:   ContactList | null
  onComplete?: () => void
}

export function UploadWizard({ open, onClose, editList, onComplete }: UploadWizardProps) {
  const [step,       setStep]       = useState<WizardStep>('source')
  const [source,     setSource]     = useState<SourceFormat | null>(null)
  const [dropped,    setDropped]    = useState(false)
  const [channel,    setChannel]    = useState<ListChannel>('email')
  const [colMapping, setColMapping] = useState<Record<string, string>>({
    email: 'email', firstName: 'first_name', lastName: 'last_name',
  })

  const order     = getStepOrder(source)
  const stepIndex = order.indexOf(step)
  const isLast    = stepIndex === order.length - 1

  const canAdvance =
    step === 'source' ? source !== null :
    step === 'upload' ? dropped : true

  function getTag(s: WizardStep, i: number): string | undefined {
    if (i >= stepIndex) return undefined
    if (s === 'source')  return source === 'single-csv' ? 'Single CSV' : source === 'govdelivery-csv' ? 'GovDelivery' : 'Rich format'
    if (s === 'upload')  return '42K rows'
    if (s === 'channel') return CHANNEL_LABEL[channel]
    if (s === 'mapping') return 'Mapped'
    return undefined
  }

  function goNext() {
    if (isLast) { onComplete?.(); handleClose(); return }
    setStep(order[stepIndex + 1])
  }

  function handleClose() {
    setStep('source'); setSource(null); setDropped(false); setChannel('email')
    setColMapping({ email: 'email', firstName: 'first_name', lastName: 'last_name' })
    onClose()
  }

  const title = editList ? `Update: ${editList.name}` : 'Import contacts'
  const steps = order.map((s, i) => ({ ...STEP_META[s], tag: getTag(s, i) }))

  return (
    <Modal open={open} onClose={handleClose} size="xlarge" aria-label={title}>
      <ModalHeader onClose={handleClose}>{title}</ModalHeader>
      <ModalBody style={{ display: 'flex', gap: 0, padding: 0, flex: '1 1 auto' }}>
        <div style={{
          width: 176, flexShrink: 0, padding: '20px 8px 20px 12px',
          borderRight: '1px solid var(--color-border)', background: 'var(--color-surface-display)',
        }}>
          <Stepper steps={steps} currentStep={stepIndex} />
        </div>
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {step === 'source'  && <StepSource  source={source}   onSelect={setSource} />}
          {step === 'upload'  && <StepUpload  dropped={dropped} onDrop={() => setDropped(true)} source={source!} />}
          {step === 'channel' && <StepChannel channel={channel} onChange={setChannel} />}
          {step === 'mapping' && <StepMapping mapping={colMapping} onChange={setColMapping} />}
          {step === 'review'  && <StepReview  source={source!}  channel={channel} editList={editList} />}
        </div>
      </ModalBody>
      <ModalFooter style={{ justifyContent: 'flex-end', gap: 8 }}>
        {stepIndex > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setStep(order[stepIndex - 1])}>Back</Button>
        )}
        <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={goNext} disabled={!canAdvance}>
          {isLast ? (editList ? 'Update list' : 'Import list') : 'Next'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
