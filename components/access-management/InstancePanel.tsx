'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import type { InstanceGroup } from '@/mocks/access-management/roles'
import { VerticalTabV2 } from './VerticalTabV2'

export interface InstancePanelProps {
  groups: InstanceGroup[]
  ungrouped: string[]
  activeInstance: string
  onSelectInstance: (name: string) => void
}

export function InstancePanel({ groups, ungrouped, activeInstance, onSelectInstance }: InstancePanelProps) {
  const [search, setSearch] = useState('')

  const matches = (name: string) => name.toLowerCase().includes(search.toLowerCase())
  const total = groups.reduce((sum, g) => sum + g.instances.length, 0) + ungrouped.length

  return (
    <div style={{ width: 272, flexShrink: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 400, lineHeight: '28px', color: '#021920' }}>
          Instances ({total})
        </h3>
        <button
          type="button"
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600, lineHeight: '20px', letterSpacing: '0.24px', color: '#0b8286' }}
        >
          Add Group
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 24, padding: '0 8px', border: '1px solid #d9dce0', borderRadius: 4, background: '#ffffff' }}>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Instance Name"
          aria-label="Search instances"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: '#021920', fontFamily: 'var(--font-sans)' }}
        />
        <MagnifyingGlassIcon size={16} color="#7a828c" weight="regular" aria-hidden="true" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        {groups.map(group => {
          const visible = group.instances.filter(matches)
          if (search && visible.length === 0) return null
          return (
            <div key={group.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, lineHeight: '16px', letterSpacing: '0.48px', textTransform: 'uppercase', color: '#021920' }}>
                {group.name}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 16, width: 240 }}>
                {visible.map(name => (
                  <VerticalTabV2
                    key={name}
                    title={name}
                    active={name === activeInstance}
                    inGroup
                    onClick={() => onSelectInstance(name)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {ungrouped.filter(matches).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, lineHeight: '16px', letterSpacing: '0.48px', textTransform: 'uppercase', color: '#021920' }}>
              Ungroup
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
              {ungrouped.filter(matches).map(name => (
                <VerticalTabV2
                  key={name}
                  title={name}
                  active={name === activeInstance}
                  inGroup={false}
                  onClick={() => onSelectInstance(name)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
