'use client'

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { MessageBox } from '@/components/ui/message-box'

// Figma: nodes 3817-50558/50568/50579 (Modal/Enable Module, Set Manual Deploy,
// Download CF Template) — field labels weren't captured from the design context
// fetch (fell outside this session's budget); fields below are inferred from
// each modal's alert+input+toggle shape and the row kebab's 3 actions.

export interface ModuleModalProps {
  open: boolean
  moduleName: string
  instanceAlias: string
  onClose: () => void
  onConfirm: () => void
}

export function EnableModuleModal({ open, moduleName, instanceAlias, onClose, onConfirm }: ModuleModalProps) {
  const [notes, setNotes] = useState('')
  const [notify, setNotify] = useState(true)

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="enable-module-title">
      <ModalHeader onClose={onClose}><span id="enable-module-title">Enable Module</span></ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MessageBox type="info" dismissible={false} message={`Enabling ${moduleName} will deploy it to ${instanceAlias}.`} />
          <Input label="Deployment Notes" size="small" placeholder="Optional notes for this deployment" value={notes} onChange={setNotes} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-body-primary)' }}>Notify Team on Completion</span>
            <Switch checked={notify} onChange={setNotify} size="small" showLabel={false} onSurface="light" />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="xs" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="xs" onClick={onConfirm}>Enable Module</Button>
      </ModalFooter>
    </Modal>
  )
}

export function SetManualDeployModal({ open, moduleName, instanceAlias, onClose, onConfirm }: ModuleModalProps) {
  const [version, setVersion] = useState('')
  const [approver, setApprover] = useState('')
  const [requireApproval, setRequireApproval] = useState(true)

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="manual-deploy-title">
      <ModalHeader onClose={onClose}><span id="manual-deploy-title">Set Manual Deployment</span></ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MessageBox type="warning" dismissible={false} message={`Setting manual deployment disables automatic updates for ${moduleName} on ${instanceAlias}.`} />
          <Input label="Deployment Version" size="small" placeholder="e.g. 2026.07.1" value={version} onChange={setVersion} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-body-primary)' }}>Require Approval</span>
            <Switch checked={requireApproval} onChange={setRequireApproval} size="small" showLabel={false} onSurface="light" />
          </div>
          <Input label="Approver Email" size="small" placeholder="Enter approver email (optional)" value={approver} onChange={setApprover} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="xs" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="xs" onClick={onConfirm}>Set Manual Deployment</Button>
      </ModalFooter>
    </Modal>
  )
}

export function DownloadCfTemplateModal({ open, moduleName, instanceAlias, onClose, onConfirm }: ModuleModalProps) {
  const [includeParams, setIncludeParams] = useState(true)

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="download-cf-title">
      <ModalHeader onClose={onClose}><span id="download-cf-title">Download CloudFormation Template</span></ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MessageBox type="info" dismissible={false} message={`Download the CloudFormation template for ${moduleName} on ${instanceAlias}.`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-body-primary)' }}>Include Current Parameters</span>
            <Switch checked={includeParams} onChange={setIncludeParams} size="small" showLabel={false} onSurface="light" />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="xs" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="xs" onClick={onConfirm}>Download Template</Button>
      </ModalFooter>
    </Modal>
  )
}
