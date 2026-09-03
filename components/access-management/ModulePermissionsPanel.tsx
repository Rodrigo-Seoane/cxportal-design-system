'use client'

import { InlineContextData } from '@/components/ui/inline-context-data'
import { MessageBox } from '@/components/ui/message-box'
import { Button } from '@/components/ui/button'
import { KebabMenu } from '@/components/wfm/KebabMenu'
import type { PermissionModule } from '@/mocks/access-management/roles'
import { ModuleRow } from './ModuleRow'

export interface ModulePermissionsPanelProps {
  activeInstance: string
  modules: PermissionModule[]
  hasChanges: boolean
  onChangeModuleOption: (moduleId: string, option: string) => void
  onDiscard: () => void
  onSave: () => void
}

export function ModulePermissionsPanel({
  activeInstance,
  modules,
  hasChanges,
  onChangeModuleOption,
  onDiscard,
  onSave,
}: ModulePermissionsPanelProps) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 400, lineHeight: '28px', color: 'var(--text-body-primary)' }}>
            Module Permissions
          </p>
          <InlineContextData label="Active Instance" value={activeInstance} />
        </div>

        {hasChanges && (
          <MessageBox type="warning" size="line" message="You have unsaved changes" dismissible={false} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasChanges && (
            <button
              type="button"
              onClick={onDiscard}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600, color: 'var(--content-action-primary-default)' }}
            >
              Discard Changes
            </button>
          )}
          <Button variant="primary-central" size="sm" disabled={!hasChanges} onClick={onSave}>
            Save Changes
          </Button>
          <KebabMenu
            agentName="Module permissions"
            actions={[
              { label: 'View Permissions Key' },
              { label: 'Import Settings' },
              { label: 'Export Settings' },
              { label: 'Save as Template' },
            ]}
          />
        </div>
      </div>

      {/* ── Module rows ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {modules.map(module => (
          <ModuleRow
            key={module.id}
            module={module}
            onChange={option => onChangeModuleOption(module.id, option)}
          />
        ))}
      </div>
    </div>
  )
}
