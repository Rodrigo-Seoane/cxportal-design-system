'use client'

import { Radio } from '@/components/ui/checkbox'
import { MessageBox } from '@/components/ui/message-box'
import type { PermissionModule } from '@/mocks/access-management/roles'

export interface ModuleRowProps {
  module: PermissionModule
  onChange: (option: string) => void
}

export function ModuleRow({ module, onChange }: ModuleRowProps) {
  const isGrid = module.layout === 'grid'

  return (
    <div style={{ display: 'flex', gap: 32, padding: '20px 0', borderBottom: '1px solid var(--neutral-100)' }}>
      <div style={{ width: 262, flexShrink: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 400, lineHeight: '24px', color: 'var(--text-body-primary)' }}>
          {module.name}
        </p>
        <p style={{ margin: 0, fontSize: 12, lineHeight: '16px', color: 'var(--text-body-secondary)' }}>
          {module.description}
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isGrid ? 'repeat(3, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(120px, auto))',
            gap: isGrid ? '16px 24px' : 24,
          }}
        >
          {module.options.map(option => (
            <Radio
              key={option}
              label={option}
              name={module.id}
              value={option}
              checked={module.selected === option}
              onChange={() => onChange(option)}
              accentColor="var(--content-action-primary-default)"
            />
          ))}
        </div>

        {module.infoAlert && (
          <MessageBox type="info" dismissible={false}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: '20px', color: 'var(--text-body-primary)' }}>
              {module.infoAlert.message}{' '}
              <a href="#" style={{ color: 'var(--text-info)', fontWeight: 600 }}>{module.infoAlert.linkLabel}</a>
            </p>
          </MessageBox>
        )}
      </div>
    </div>
  )
}
