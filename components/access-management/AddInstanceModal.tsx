'use client'

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Figma: node 3817-48558 (Modal/Add New Instance)

export interface NewInstanceInput {
  instanceId: string
  awsAccountId: string
  alias: string
  region: string
  arn: string
  assistantId: string
  domainId: string
  status: string
}

export interface AddInstanceModalProps {
  open: boolean
  companyName: string
  companyId: string
  onClose: () => void
  onCreate: (input: NewInstanceInput) => void
}

const REGIONS = ['us-east-1', 'us-west-2', 'us-west-1', 'eu-west-1']

export function AddInstanceModal({ open, companyName, companyId, onClose, onCreate }: AddInstanceModalProps) {
  const [instanceId, setInstanceId] = useState('')
  const [awsAccountId, setAwsAccountId] = useState('')
  const [alias, setAlias] = useState('')
  const [region, setRegion] = useState('')
  const [arn, setArn] = useState('')
  const [assistantId, setAssistantId] = useState('')
  const [domainId, setDomainId] = useState('')
  const [status, setStatus] = useState('')

  const canSave = instanceId.trim() && awsAccountId.trim() && alias.trim() && region

  const reset = () => {
    setInstanceId(''); setAwsAccountId(''); setAlias(''); setRegion('')
    setArn(''); setAssistantId(''); setDomainId(''); setStatus('')
  }

  const handleCreate = () => {
    if (!canSave) return
    onCreate({ instanceId: instanceId.trim(), awsAccountId: awsAccountId.trim(), alias: alias.trim(), region, arn: arn.trim(), assistantId: assistantId.trim(), domainId: domainId.trim(), status })
    reset()
  }

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="add-instance-title">
      <ModalHeader onClose={onClose}>
        <span id="add-instance-title">Add New Instance</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Company Name" size="small" value={companyName} disabled onChange={() => {}} />
          <Input label="Company ID" size="small" value={companyId} disabled onChange={() => {}} />
          <Input label="Instance ID" size="small" required placeholder="Enter instance ID" value={instanceId} onChange={setInstanceId} />
          <Input label="AWS Account ID" size="small" required placeholder="Enter AWS account ID" value={awsAccountId} onChange={setAwsAccountId} />
          <Input label="Instance Alias" size="small" required placeholder="Enter instance alias" value={alias} onChange={setAlias} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-body-primary)' }}>Region *</span>
            <select value={region} onChange={e => setRegion(e.target.value)} style={selectStyle}>
              <option value="" disabled>Select a region</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <Input label="Instance ARN" size="small" placeholder="Enter instance ARN ID (optional)" value={arn} onChange={setArn} />
          <Input label="Assistant ID" size="small" placeholder="Enter assistant ID (optional)" value={assistantId} onChange={setAssistantId} />
          <Input label="Domain ID" size="small" placeholder="Enter domain ID (optional)" value={domainId} onChange={setDomainId} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-body-primary)' }}>Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
              <option value="">Select status (optional)</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="xs" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="xs" disabled={!canSave} onClick={handleCreate}>Save Instance</Button>
      </ModalFooter>
    </Modal>
  )
}

const selectStyle: React.CSSProperties = {
  height: 24, padding: '0 8px', border: '1px solid var(--neutral-200)', borderRadius: 4,
  fontSize: 12, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)', background: 'var(--neutral-0)',
}
