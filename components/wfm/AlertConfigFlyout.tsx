'use client'

import { useState } from 'react'
import { PlusIcon, ToggleLeftIcon, ToggleRightIcon, BellIcon } from '@phosphor-icons/react'
import { Flyout } from '@/components/wfm/Flyout'
import { useCurrentUser, INITIAL_ALERTS } from '@/mocks/wfm/store'
import type { ActiveAlert } from '@/mocks/wfm/store'

export interface AlertConfigFlyoutProps {
  open: boolean
  onClose: () => void
}

function formatTimeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m ago`
}

function AlertRow({ alert, onToggle }: { alert: ActiveAlert & { enabled: boolean }; onToggle: () => void }) {
  return (
    <div style={{
      padding:     '14px 0',
      borderBottom:'1px solid var(--neutral-100)',
      display:     'flex',
      gap:          12,
      alignItems:  'flex-start',
      fontFamily:  'var(--font-sans)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body-primary)', marginBottom: 2 }}>
          {alert.metric} {alert.operator} {alert.threshold}
          {alert.metric.includes('%') ? '%' : ''}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-body-secondary)' }}>
          {alert.scope} · Now: <strong style={{ color: 'var(--text-body-primary)' }}>{alert.currentValue}</strong>
        </div>
        <div style={{ fontSize: 11, color: 'var(--neutral-300)', marginTop: 2 }}>
          Triggered {formatTimeAgo(alert.triggeredAt)}
        </div>
      </div>
      <button
        onClick={onToggle}
        aria-label={alert.enabled ? 'Disable alert' : 'Enable alert'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
      >
        {alert.enabled
          ? <ToggleRightIcon size={24} color="var(--content-action-primary-600)" weight="fill" />
          : <ToggleLeftIcon  size={24} color="var(--neutral-300)" weight="fill" />
        }
      </button>
    </div>
  )
}

type Step = 1 | 2 | 3 | 4 | 5 | 6

const METRICS = ['Adherence %', 'Agents Available', 'Agents Out of Adherence Now', 'Non-Adherent Time', 'Queue SLA %']
const SCOPES  = ['All Groups', 'OK — Triage', 'OK — Behavioral Health', 'OK — Pharmacy', 'OK — Member Services']

export function AlertConfigFlyout({ open, onClose }: AlertConfigFlyoutProps) {
  const { role } = useCurrentUser()
  const [alerts, setAlerts] = useState(INITIAL_ALERTS.map(a => ({ ...a, enabled: true })))
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({ metric: '', operator: 'below', threshold: '', scope: SCOPES[0], recipients: '', frequency: 'immediate', enabled: true })

  const canEdit = role === 'wfm-lead' || role === 'admin'

  const toggleAlert = (id: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))

  const saveAlert = () => {
    setAlerts(prev => [...prev, {
      id:           `alert-${Date.now()}`,
      metric:       form.metric,
      operator:     form.operator as 'below' | 'above',
      threshold:    parseFloat(form.threshold) || 0,
      currentValue: 0,
      scope:        form.scope,
      triggeredAt:  new Date(),
      enabled:      form.enabled,
    } as ActiveAlert & { enabled: boolean }])
    setCreating(false)
    setStep(1)
    setForm({ metric: '', operator: 'below', threshold: '', scope: SCOPES[0], recipients: '', frequency: 'immediate', enabled: true })
  }

  return (
    <Flyout open={open} onClose={onClose} title="Alert Configuration" width={500}>
      {!creating ? (
        <>
          {canEdit && (
            <button
              onClick={() => setCreating(true)}
              style={primaryBtn}
            >
              <PlusIcon size={14} weight="bold" />
              New Alert
            </button>
          )}

          {alerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-body-secondary)', fontFamily: 'var(--font-sans)' }}>
              <BellIcon size={32} color="var(--neutral-300)" weight="thin" />
              <p style={{ marginTop: 12, fontSize: 14 }}>No alerts configured.</p>
              <p style={{ fontSize: 12 }}>Create your first alert to get notified when a metric crosses a threshold.</p>
            </div>
          )}

          {alerts.map(a => (
            <AlertRow
              key={a.id}
              alert={a as ActiveAlert & { enabled: boolean }}
              onToggle={() => canEdit && toggleAlert(a.id)}
            />
          ))}
        </>
      ) : (
        <AlertForm
          step={step}
          form={form}
          metrics={METRICS}
          scopes={SCOPES}
          onFormChange={patch => setForm(f => ({ ...f, ...patch }))}
          onNext={() => setStep(s => Math.min(s + 1, 6) as Step)}
          onBack={() => { if (step === 1) setCreating(false); else setStep(s => Math.max(s - 1, 1) as Step) }}
          onSave={saveAlert}
        />
      )}
    </Flyout>
  )
}

interface AlertFormProps {
  step: Step
  form: { metric: string; operator: string; threshold: string; scope: string; recipients: string; frequency: string; enabled: boolean }
  metrics: string[]
  scopes: string[]
  onFormChange: (patch: Partial<AlertFormProps['form']>) => void
  onNext: () => void
  onBack: () => void
  onSave: () => void
}

function AlertForm({ step, form, metrics, scopes, onFormChange, onNext, onBack, onSave }: AlertFormProps) {
  const stepLabels = ['Metric', 'Threshold', 'Scope', 'Recipients', 'Frequency', 'Enable']

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Stepper dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        {stepLabels.map((l, i) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i + 1 === step ? 'var(--content-action-primary-600)' : i + 1 < step ? 'var(--success-100)' : 'var(--neutral-100)',
              fontSize: 10, fontWeight: 700, color: i + 1 === step ? 'var(--neutral-0)' : 'var(--text-body-secondary)',
            }}>{i + 1}</div>
            {i < stepLabels.length - 1 && <div style={{ width: 16, height: 1, background: 'var(--neutral-100)' }} />}
          </div>
        ))}
      </div>

      <div style={{ minHeight: 160 }}>
        {step === 1 && (
          <div>
            <label style={formLabel}>Which metric?</label>
            {metrics.map(m => (
              <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer' }}>
                <input type="radio" name="metric" value={m} checked={form.metric === m} onChange={() => onFormChange({ metric: m })} style={{ accentColor: 'var(--content-action-primary-600)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-body-primary)' }}>{m}</span>
              </label>
            ))}
          </div>
        )}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={formLabel}>Threshold</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.operator} onChange={e => onFormChange({ operator: e.target.value })} style={selectStyle}>
                <option value="below">Below</option>
                <option value="above">Above</option>
              </select>
              <input type="number" value={form.threshold} onChange={e => onFormChange({ threshold: e.target.value })}
                placeholder="e.g. 90" style={{ ...selectStyle, width: 100 }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-body-secondary)' }}>Alert triggers when {form.metric || 'metric'} is {form.operator} {form.threshold || '—'}.</p>
          </div>
        )}
        {step === 3 && (
          <div>
            <label style={formLabel}>Scope</label>
            {scopes.map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer' }}>
                <input type="radio" name="scope" value={s} checked={form.scope === s} onChange={() => onFormChange({ scope: s })} style={{ accentColor: 'var(--content-action-primary-600)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-body-primary)' }}>{s}</span>
              </label>
            ))}
          </div>
        )}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={formLabel}>Recipients</label>
            {['Centene email', 'Slack #wfm-alerts', 'Teams'].map(ch => (
              <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--content-action-primary-600)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-body-primary)' }}>{ch}</span>
              </label>
            ))}
          </div>
        )}
        {step === 5 && (
          <div>
            <label style={formLabel}>Frequency</label>
            {['immediate', 'batched'].map(f => (
              <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer' }}>
                <input type="radio" name="freq" value={f} checked={form.frequency === f} onChange={() => onFormChange({ frequency: f })} style={{ accentColor: 'var(--content-action-primary-600)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-body-primary)' }}>{f === 'immediate' ? 'Immediate (send as triggered)' : 'Batched (hourly digest)'}</span>
              </label>
            ))}
          </div>
        )}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={formLabel}>Enable alert</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.enabled} onChange={e => onFormChange({ enabled: e.target.checked })} style={{ accentColor: 'var(--content-action-primary-600)', width: 16, height: 16 }} />
              <span style={{ fontSize: 13, color: 'var(--text-body-primary)' }}>Active — start monitoring immediately after save</span>
            </label>
            <div style={{ padding: 12, background: 'var(--surface-section-group-bg)', borderRadius: 6, fontSize: 12, color: 'var(--text-body-secondary)' }}>
              {form.metric} {form.operator} {form.threshold} · {form.scope} · {form.frequency}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
        <button onClick={onBack} style={secondaryBtn}>{step === 1 ? 'Cancel' : 'Back'}</button>
        {step < 6
          ? <button onClick={onNext} style={primaryBtn} disabled={step === 1 && !form.metric}>Next</button>
          : <button onClick={onSave} style={primaryBtn}>Save Alert</button>
        }
      </div>
    </div>
  )
}

const formLabel: React.CSSProperties = {
  display:    'block',
  fontSize:    13,
  fontWeight:  600,
  color:      'var(--text-body-primary)',
  marginBottom: 8,
}

const selectStyle: React.CSSProperties = {
  padding:    '6px 10px',
  borderRadius: 6,
  border:     '1px solid var(--neutral-200)',
  fontSize:    13,
  color:      'var(--text-body-primary)',
  background: 'var(--surface-section-bg)',
  fontFamily: 'var(--font-sans)',
  flex:        1,
}

const primaryBtn: React.CSSProperties = {
  display:     'inline-flex',
  alignItems:  'center',
  gap:          6,
  padding:     '8px 16px',
  borderRadius: 6,
  border:      'none',
  background:  'var(--content-action-primary-600)',
  color:       'var(--neutral-0)',
  fontSize:     13,
  fontWeight:   600,
  cursor:      'pointer',
  fontFamily:  'var(--font-sans)',
}

const secondaryBtn: React.CSSProperties = {
  padding:     '8px 16px',
  borderRadius: 6,
  border:      '1px solid var(--neutral-200)',
  background:  'var(--surface-section-bg)',
  color:       'var(--text-body-primary)',
  fontSize:     13,
  fontWeight:   500,
  cursor:      'pointer',
  fontFamily:  'var(--font-sans)',
}
