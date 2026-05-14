'use client'

import { useState } from 'react'
import {
  PaperPlaneTiltIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlaskIcon,
} from '@phosphor-icons/react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { COMPONENTS } from '../_mock/groups'
import type { SenderIdentity } from '../_mock/senders'

type ModalStep = 'form' | 'sent'

interface AddSenderModalProps {
  open:    boolean
  onClose: () => void
  onAdd:   (sender: SenderIdentity) => void
}

const COMPONENT_OPTIONS = COMPONENTS.map(c => ({ value: c.id, label: `${c.shortCode} — ${c.name}` }))

export function AddSenderModal({ open, onClose, onAdd }: AddSenderModalProps) {
  const [step, setStep]               = useState<ModalStep>('form')
  const [email, setEmail]             = useState('')
  const [displayName, setDisplayName] = useState('')
  const [componentId, setComponentId] = useState('')
  const [emailError, setEmailError]   = useState('')

  function reset() {
    setStep('form'); setEmail(''); setDisplayName(''); setComponentId(''); setEmailError('')
  }

  function handleClose() { reset(); onClose() }

  function handleSubmit() {
    if (!email.includes('@')) { setEmailError('Enter a valid email address'); return }
    if (!email.endsWith('.gov')) { setEmailError('SSA senders must use a .gov address'); return }
    setEmailError('')
    setStep('sent')
  }

  function simulate(status: 'verified' | 'failed') {
    onAdd({
      id:           `sender-new-${Date.now()}`,
      email,
      displayName:  displayName || email,
      componentId:  componentId || 'rsc',
      groupId:      '',
      status,
      lastVerified: status === 'verified' ? new Date().toISOString() : null,
      addedAt:      new Date().toISOString(),
    })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="medium" aria-labelledby="add-sender-title">

      <ModalHeader onClose={handleClose}>
        <span id="add-sender-title">
          {step === 'form' ? 'Add Sender Identity' : 'Verification Link Sent'}
        </span>
      </ModalHeader>

      <ModalBody>
        {step === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input
              variant="email"
              label="Sender email"
              required
              placeholder="noreply@agency.ssa.gov"
              hint="Must be a verified .gov address. A confirmation link will be sent to this address."
              value={email}
              onChange={setEmail}
              error={emailError}
            />
            <Input
              label="Display name"
              placeholder="Social Security Administration"
              hint="Shown in the From field — e.g. 'SSA Retirement Services'."
              value={displayName}
              onChange={setDisplayName}
            />
            <Select
              label="Component"
              placeholder="Select a component"
              options={COMPONENT_OPTIONS}
              value={componentId}
              onChange={v => setComponentId(v as string)}
            />
          </div>
        )}

        {step === 'sent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '14px 16px', borderRadius: 8,
              background: 'var(--color-success-100)', border: '1px solid var(--color-success-200)' }}>
              <CheckCircleIcon size={18} color="#1a6b1a" weight="fill" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a6b1a' }}>
                  Verification link sent
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#1a6b1a', lineHeight: '20px' }}>
                  An email was sent to <strong>{email}</strong>. The sender identity will
                  become active once the link is clicked. This may take a few minutes.
                </p>
              </div>
            </div>

            {/* Dev-only simulate block */}
            <div style={{ padding: '12px 14px', borderRadius: 8,
              background: 'var(--color-surface-display)', border: '1px dashed var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <FlaskIcon size={13} color="var(--color-text-secondary)" />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.4px' }}>
                  DEV TOOLS — not shown in production
                </span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: '18px' }}>
                Simulate the outcome of clicking the verification link:
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={() => simulate('verified')}>
                  <CheckCircleIcon size={14} /> Simulate verified
                </Button>
                <Button variant="form-controls" size="sm" onClick={() => simulate('failed')}>
                  <XCircleIcon size={14} /> Simulate failed
                </Button>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter style={{ justifyContent: 'flex-end' }}>
        {step === 'form' ? (
          <>
            <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}
              disabled={!email}>
              <PaperPlaneTiltIcon size={14} /> Send verification link
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" onClick={handleClose}>Done</Button>
        )}
      </ModalFooter>

    </Modal>
  )
}
