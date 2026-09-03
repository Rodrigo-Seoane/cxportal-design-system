'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeftIcon, CodeIcon, XIcon, CheckCircleIcon,
} from '@phosphor-icons/react'
import { Button }  from '@/components/ui/button'
import { Switch }  from '@/components/ui/switch'
import { Select }  from '@/components/ui/select'
import { TEMPLATES, TEMPLATE_VARIABLES } from '../../_mock/templates'
import { TOPICS }  from '../../_mock/topics'
import type { TemplateVersion } from '../../_mock/templates'
import { useRole } from '../../_context/RoleContext'
import { useSideNav } from '../../_context/SideNavContext'

// ── Variable substitution ─────────────────────────────────────────────────────

const MOCK_VARS: Record<string, string> = {
  '{{recipient.firstName}}':   'Jane',
  '{{recipient.lastName}}':    'Smith',
  '{{recipient.email}}':       'jane.smith@example.gov',
  '{{topic.name}}':            'Medicare IEP Reminders',
  '{{campaign.name}}':         'Medicare IEP Reminder — Jan 2026',
  '{{unsubscribe.url}}':       '#',
  '{{sender.displayName}}':    'SSA Medicare Coordination',
  '{{benefit.amount}}':        '$1,847.00',
  '{{benefit.effectiveDate}}': 'January 2026',
  '{{office.name}}':           'Baltimore Field Office',
  '{{office.phone}}':          '410-965-2900',
}

function substituteVars(html: string): string {
  return Object.entries(MOCK_VARS).reduce((acc, [k, v]) => acc.replaceAll(k, v), html)
}

function buildPreviewDoc(subject: string, body: string): string {
  return `<!DOCTYPE html><html><head><style>
    body{font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6;padding:24px;color:var(--text-body-primary);margin:0}
    a{color:var(--content-action-primary-600)} p{margin:0 0 12px} strong{font-weight:600}
  </style></head><body>
    <div style="font-size:11px;color:var(--text-body-secondary);margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--neutral-100)">
      <strong style="color:var(--text-body-primary)">Subject:</strong> ${substituteVars(subject)}
    </div>
    ${substituteVars(body)}
  </body></html>`
}

// ── Variables drawer ──────────────────────────────────────────────────────────

function VariablesDrawer({ onInsert, onClose }: {
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
        <button onClick={onClose} aria-label="Close variables drawer"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <XIcon size={16} color="var(--color-text-secondary)" />
        </button>
      </div>
      <p style={{ margin: 0, padding: '8px 14px', fontSize: 11, color: 'var(--color-text-secondary)',
        lineHeight: '17px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        Click a variable to insert at cursor. List pending from Connect integration.
      </p>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {TEMPLATE_VARIABLES.map(({ key, label }) => (
          <button key={key} onClick={() => onInsert(key)} style={{
            width: '100%', textAlign: 'left', padding: '8px 14px',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: '1px solid var(--color-border)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-display)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
          >
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-primary)', marginBottom: 2 }}>{key}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TOPIC_OPTIONS = [
  { value: '', label: 'No topic' },
  ...TOPICS.map(t => ({ value: t.id, label: t.name })),
]

export default function TemplateEditorPage() {
  const { id }            = useParams<{ id: string }>()
  const { role }          = useRole()
  const { setHideSideNav} = useSideNav()
  const isViewer          = role === 'viewer'

  const template = TEMPLATES.find(t => t.id === id)

  const [name,          setName]          = useState(template?.name ?? '')
  const [subject,       setSubject]       = useState(template?.subjectLine ?? '')
  const [topicId,       setTopicId]       = useState(template?.topicId ?? '')
  const [body,          setBody]          = useState(template?.bodyHtml ?? '')
  const [versions,      setVersions]      = useState<TemplateVersion[]>(template?.versions ?? [])
  const [latestVersion, setLatestVersion] = useState(template?.latestVersion ?? 1)
  const [currentVer,    setCurrentVer]    = useState(String(template?.latestVersion ?? 1))
  const [isDefault,     setIsDefault]     = useState(false)
  const [showVars,      setShowVars]      = useState(false)
  const [flash,         setFlash]         = useState<'saved' | 'published' | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setHideSideNav(true)
    return () => setHideSideNav(false)
  }, [setHideSideNav])

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
    setVersions(prev => [...prev, { version: next, status: 'published', createdAt: new Date().toISOString(), createdBy: 'You' }])
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

  const inputStyle: React.CSSProperties = {
    height: 36, padding: '0 10px', borderRadius: 7, fontSize: 13,
    border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
    color: 'var(--color-text-primary)', outline: 'none',
  }

  const readonlyStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>

      {/* ── Form/action row (90px) ──────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        padding: '0 20px', height: 90,
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface-section)',
      }}>
        {/* Left: back + editable fields */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <Link href="/sandbox/campaigns-email/templates"
            style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)',
              textDecoration: 'none', fontSize: 12, flexShrink: 0 }}>
            <ArrowLeftIcon size={12} /> Templates
          </Link>
          <span style={{ color: 'var(--color-border)', flexShrink: 0 }}>/</span>

          {isViewer ? (
            <span style={{ ...readonlyStyle, width: 240, flexShrink: 0 }}>{name}</span>
          ) : (
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Template name"
              style={{ ...inputStyle, width: 240, flexShrink: 0 }}
            />
          )}

          {isViewer ? (
            <span style={{ ...readonlyStyle, flex: '0 0 382px', maxWidth: 382 }}>{subject}</span>
          ) : (
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Subject line"
              style={{ ...inputStyle, width: 382, flexShrink: 0 }}
            />
          )}

          {isViewer ? (
            <span style={{ ...readonlyStyle, width: 200, flexShrink: 0 }}>
              {TOPICS.find(t => t.id === topicId)?.name ?? 'No topic'}
            </span>
          ) : (
            <div style={{ width: 240, flexShrink: 0 }}>
              <Select
                options={TOPIC_OPTIONS}
                value={topicId}
                onChange={v => setTopicId(v as string)}
                size="small"
              />
            </div>
          )}
        </div>

        {/* Right: version picker + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Select
            options={versionOptions}
            value={currentVer}
            onChange={v => setCurrentVer(v as string)}
            size="small"
          />

          {flash && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-success)' }}>
              <CheckCircleIcon size={13} weight="fill" color="var(--text-success)" />
              {flash === 'published' ? `Published v${latestVersion}` : 'Draft saved'}
            </span>
          )}

          {isViewer ? (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '0 4px' }}>
              View only
            </span>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => showFlash('saved')}>
                Save Draft
              </Button>
              <Button variant="secondary" size="sm" onClick={handlePublish}>
                Publish v{latestVersion + 1}
              </Button>
              <Switch
                label="Set default"
                checked={isDefault}
                onChange={setIsDefault}
                labelPosition="right"
              />
            </>
          )}

          <Button variant="form-controls" size="sm" onClick={() => setShowVars(v => !v)}>
            <CodeIcon size={14} /> Variables
          </Button>
        </div>
      </div>

      {/* ── Split pane ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* HTML editor */}
        <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--color-border)', minWidth: 0 }}>
          <div style={{
            padding: '8px 14px', borderBottom: '1px solid var(--color-border)',
            fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0,
            background: 'var(--color-surface-display)',
          }}>
            HTML Source
          </div>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            readOnly={isViewer}
            spellCheck={false}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none',
              padding: '16px', fontFamily: 'monospace', fontSize: 12,
              lineHeight: '20px', color: 'var(--color-text-primary)',
              background: 'var(--color-surface-section)',
            }}
          />
        </div>

        {/* Preview */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
          marginRight: showVars ? 272 : 0, transition: 'margin-right 150ms ease',
        }}>
          <div style={{
            padding: '8px 14px', borderBottom: '1px solid var(--color-border)',
            fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0,
            background: 'var(--color-surface-display)',
          }}>
            Preview — mock variables applied
          </div>
          <iframe
            srcDoc={buildPreviewDoc(subject, body)}
            title="Template preview"
            sandbox="allow-same-origin"
            style={{ flex: 1, border: 'none', background: 'var(--neutral-0)' }}
          />
        </div>
      </div>

      {/* ── Variables drawer (overlay) ───────────────────────────────── */}
      {showVars && (
        <VariablesDrawer onInsert={insertVariable} onClose={() => setShowVars(false)} />
      )}
    </div>
  )
}
