'use client'

import { useState } from 'react'
import { SlidersIcon, CaretDownIcon } from '@phosphor-icons/react'
import { Checkbox } from '@/components/ui/checkbox'
import { Chip } from '@/components/ui/chip'
import { PERMISSION_LEVELS, type PermissionLevel } from '@/mocks/access-management/roles'

export interface UserFiltersProps {
  selectedLevels: PermissionLevel[]
  onChange: (levels: PermissionLevel[]) => void
}

const INERT_FILTERS = ['Login Method', 'User ID', 'Role']

export function UserFilters({ selectedLevels, onChange }: UserFiltersProps) {
  const [permOpen, setPermOpen] = useState(false)

  const toggleLevel = (level: PermissionLevel) => {
    onChange(
      selectedLevels.includes(level)
        ? selectedLevels.filter(l => l !== level)
        : [...selectedLevels, level],
    )
  }

  return (
    <div style={{ width: 240, flexShrink: 0, padding: '16px 16px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: '1px solid var(--content-action-primary-default)', borderRadius: 4 }}>
            <SlidersIcon size={16} color="var(--content-action-primary-default)" weight="regular" />
          </span>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 400, lineHeight: '24px', color: 'var(--text-body-primary)' }}>Filters</h3>
        </div>
        {selectedLevels.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 10, fontWeight: 600, letterSpacing: '0.2px', color: 'var(--content-action-primary-default)' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Login Method — not yet wired to a data model */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: 8, border: '1px solid var(--neutral-100)', borderRadius: 8, background: 'var(--neutral-0)' }}>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: 'var(--text-body-primary)' }}>Login Method</span>
        <CaretDownIcon size={16} color="var(--text-body-primary)" weight="regular" />
      </div>

      {/* Role permission level */}
      <div>
        <button
          type="button"
          onClick={() => setPermOpen(o => !o)}
          aria-expanded={permOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 36,
            padding: 8, border: `1px solid ${selectedLevels.length ? 'var(--content-action-primary-600)' : 'var(--neutral-100)'}`,
            borderRadius: 8, background: 'var(--neutral-0)', cursor: 'pointer',
          }}
        >
          {selectedLevels.length > 0 && (
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 18, height: 18, borderRadius: 64, background: 'var(--content-action-primary-600)',
              border: '1px solid var(--content-action-primary-600)', color: 'var(--neutral-100)', fontSize: 10, fontWeight: 600,
            }}>
              {selectedLevels.length}
            </span>
          )}
          <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: 'var(--text-body-primary)' }}>
            Permission Level
          </span>
          <CaretDownIcon size={16} color="var(--text-body-primary)" weight="regular" style={{ transform: permOpen ? 'rotate(180deg)' : undefined }} />
        </button>

        {permOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 8px 0' }}>
            {PERMISSION_LEVELS.map(level => (
              <Checkbox
                key={level}
                label={level}
                size="small"
                checked={selectedLevels.includes(level)}
                onChange={() => toggleLevel(level)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedLevels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {selectedLevels.map(level => (
            <Chip key={level} label={level} type="info" shade={200} iconLeft={false} onDismiss={() => toggleLevel(level)} style={{ background: 'var(--neutral-200)' }} />
          ))}
        </div>
      )}

      {/* User ID / Role — not yet wired to a data model */}
      {INERT_FILTERS.slice(1).map(label => (
        <div
          key={label}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: 8,
            border: '1px solid var(--neutral-100)', borderRadius: 8, background: 'var(--neutral-0)',
          }}
        >
          <span style={{ flex: 1, fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: 'var(--text-body-primary)' }}>{label}</span>
          <CaretDownIcon size={16} color="var(--text-body-primary)" weight="regular" />
        </div>
      ))}
    </div>
  )
}
