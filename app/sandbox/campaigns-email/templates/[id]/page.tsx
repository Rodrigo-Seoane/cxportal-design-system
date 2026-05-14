'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeftIcon, CodeIcon, XIcon,
  CheckCircleIcon, FloppyDiskIcon, LockSimpleIcon,
} from '@phosphor-icons/react'
import { Button }  from '@/components/ui/button'
import { Select }  from '@/components/ui/select'
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal'
import { TEMPLATES, TEMPLATE_VARIABLES } from '../../_mock/templates'
import { TOPICS }   from '../../_mock/topics'
import { useRole, canEdit } from '../../_context/RoleContext'
import type { TemplateVersion } from '../../_mock/templates'

// ── Variable substitution ─────────────────────────────────────────────────────

const MOCK_VARS: Record<string, string> = {
  '{{recipient.firstName}}':   'Jane',
  '{{recipient.lastName}}':    'Smith',
  '{{recipient.email}}':       'jane.smith@example.gov',
  '{{topic.name}}':            'Annual COLA Notification',
  '{{campaign.name}}':         '2026 COLA Notification',
  '{{unsubscribe.url}}':       'https://ssa.gov/unsubscribe',
  '{{sender.displayName}}':    'Social Security Administration',
  '{{benefit.amount}}':        '$1,847.00',
  '{{benefit.effectiveDate}}': 'January 2026',
  '{{office.name}}':           'SSA Atlanta Field Office',
  '{{office.phone}}':          '(404) 555-0182',
}

function substituteVars(html: string): string {
  return Object.entries(MOCK_VARS).reduce(
    (acc, [key, val]) => acc.replaceAll(key, val),
    html,
  )
}

function buildPreviewDoc(subject: string, body: string): string {
  return `<!DOCTYPE html><html><head><style>
    body{font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6;padding:24px;color:#021920;margin:0}
    a{color:#4285f4} p{margin:0 0 12px} strong{font-weight:600}
  </style></head><body>
    <div style="font-size:11px;color:#7a828c;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #eff1f3">
      <strong style="color:#021920">Subject:</strong> ${substituteVars(subject)}
    </div>
    ${substituteVars(body)}
  </body></html>`
}

// ── Variables panel ───────────────────────────────────────────────────────────

function VariablesPanel({ onInsert, onClose }: {
  onInsert: (key: string) => void
  onClose:  () => void
}) {
  return (
    <div style={{
      position: 'fixed', right: 0, top: 56, bottom: 0, width: 272, zIndex: 30,
      background: 'var(--color-surface-section)', borderLeft: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Variables</span>
        <button onClick={onClose} aria-label="Close variables panel"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <XIcon size={16} color="var(--color-text-secondary)" />
        </button>
      </div>
      <p style={{ margin: 0, padding: '8px 14px', fontSize: 11, color: 'var(--color-text-secondary)',
        lineHeight: '17px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        Click a variable to insert at cursor. List pending from Connect integration.
      </p>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {TEMPLATE_VARIABLES.map(({ key, label }) => (
          <button key={key} onClick={() => onInsert(key)} style={{
            width: '100%', textAlign: 'left', padding: '7px 14px',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: '1px solid var(--color-border)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-display)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
          >
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-primary)', marginBottom: 1 }}>{key}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TemplateEditorPage() {
  const { role } = useRole()
  const editable = canEdit(role)
  const { id } = useParams<{ id: string }>()
  const template = TEMPLATES.find(t => t.id === id)

  const [body,          setBody]          = useState(template?.bodyHtml ?? '')
  const [versions,      setVersions]      = useState<TemplateVersion[]>(template?.versions ?? [])
  const [latestVersion, setLatestVersion] = useState(template?.latestVersion ?? 1)
  const [currentVer,    setCurrentVer]    = useState(String(template?.latestVersion ?? 1))
  const [showVars,      setShowVars]      = useState(false)
  const [showDiff,      setShowDiff]      = useState(false)
  const [flash,         setFlash]         = useState<'saved' | 'published' | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const topic = template?.topicId ? TOPICS.find(t => t.id === template.topicId) : null

  const versionOptions = versions.map(v => ({
    value: String(v.version),
    label: `v${v.version} — ${v.status}`,
  }))

  function showFlash(type: 'saved' | 'published') {
    setFlash(type)
    setTimeout(() => setFlash(null), 2500)
  }

  function handlePublish() {
    const next = latestVersion + 1
    const newVer: TemplateVersion = {
      version:   next,
      status:    'published',
      createdAt: new Date().toISOString(),
      createdBy: 'You',
    }
    setVersions(prev => [...prev, newVer])
    setLatestVersion(next)
    setCurrentVer(String(next))
    showFlash('published')
  }

  const insertVariable = useCallback((key: string) => {
    const ta = textareaRef.current
    if (!ta) { setBody(b => b + key); return }
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    setBody(b => b.substring(0, start) + key + b.substring(end))
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + key.length
      ta.focus()
    })
  }, [])

  if (!template) return (
    <div style={{ padding: '48px 36px', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Template not found.</p>
      <Link href="/sandbox/campaigns-email/templates" style={{ color: 'var(--color-primary)', fontSize: 13 }}>
        ← Back to templates
      </Link>
    </div>
  )

  const previewDoc = buildPreviewDoc(template.subjectLine, body)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>

      {/* ── Header bar ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        padding: '10px 20px', borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface-section)',
      }}>
        <Link href="/sandbox/campaigns-email/templates"
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)',
            textDecoration: 'none', fontSize: 12, flexShrink: 0 }}>
          <ArrowLeftIcon size={12} /> Templates
        </Link>
        <span style={{ color: 'var(--color-border)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)',
          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {template.name}
        </span>
        {topic && (
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flexShrink: 0 }}>
            {topic.name}
          </span>
        )}

        {/* Version picker */}
        <div style={{ flexShrink: 0 }}>
          <Select
            options={versionOptions}
            value={currentVer}
            onChange={v => setCurrentVer(v as string)}
            size="small"
          />
        </div>
        <button onClick={() => setShowDiff(true)} style={{
          fontSize: 12, color: 'var(--color-primary)', background: 'none',
          border: 'none', cursor: 'pointer', flexShrink: 0, padding: '0 4px',
        }}>
          View diff
        </button>

        {/* Flash feedback */}
        {flash && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
            color: '#1a6b1a', flexShrink: 0 }}>
            <CheckCircleIcon size={13} weight="fill" color="#1a6b1a" />
            {flash === 'published' ? `Published as v${latestVersion}` : 'Draft saved'}
          </span>
        )}

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {editable && (
            <>
              <Button variant="secondary"  size="sm" onClick={() => showFlash('saved')}>
                <FloppyDiskIcon size={14} /> Save draft
              </Button>
              <Button variant="secondary"  size="sm" onClick={handlePublish}>
                Publish v{latestVersion + 1}
              </Button>
              <Button variant="primary"    size="sm" onClick={() => showFlash('saved')}>
                Set as default
              </Button>
            </>
          )}
          <Button variant="form-controls" size="sm" onClick={() => setShowVars(v => !v)}>
            <CodeIcon size={14} /> Variables
          </Button>
        </div>
      </div>

      {/* ── Read-only banner ────────────────────────────────────────── */}
      {!editable && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          padding: '10px 20px', borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-display)',
        }}>
          <LockSimpleIcon size={13} color="var(--color-text-secondary)" />
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Read-only view. Contact your Supervisor to request changes.
          </span>
        </div>
      )}

      {/* ── Editor + preview split ───────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* Left: HTML editor */}
        <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--color-border)', minWidth: 0 }}>
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--color-border)',
            fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0,
            background: 'var(--color-surface-display)' }}>
            HTML Source
          </div>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => editable && setBody(e.target.value)}
            readOnly={!editable}
            spellCheck={false}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none',
              padding: '16px', fontFamily: 'monospace', fontSize: 12,
              lineHeight: '20px', color: 'var(--color-text-primary)',
              background: editable ? 'var(--color-surface-section)' : 'var(--color-surface-display)',
              cursor: editable ? 'text' : 'default',
            }}
          />
        </div>

        {/* Right: live preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
          marginRight: showVars ? 272 : 0, transition: 'margin-right 150ms ease' }}>
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--color-border)',
            fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0,
            background: 'var(--color-surface-display)' }}>
            Preview — mock variables applied
          </div>
          <iframe
            srcDoc={previewDoc}
            title="Template preview"
            sandbox="allow-same-origin"
            style={{ flex: 1, border: 'none', background: '#fff' }}
          />
        </div>
      </div>

      {/* ── Variables panel ──────────────────────────────────────────── */}
      {showVars && (
        <VariablesPanel onInsert={insertVariable} onClose={() => setShowVars(false)} />
      )}

      {/* ── Diff modal (stub) ────────────────────────────────────────── */}
      <Modal open={showDiff} onClose={() => setShowDiff(false)} size="medium">
        <ModalHeader onClose={() => setShowDiff(false)}>Diff view</ModalHeader>
        <ModalBody>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            Diff view — coming. This will show a side-by-side comparison of any two template
            versions, highlighting added and removed lines.
          </p>
        </ModalBody>
      </Modal>

    </div>
  )
}
