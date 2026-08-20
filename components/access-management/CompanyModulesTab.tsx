'use client'

import { useMemo, useState } from 'react'
import { GearIcon, CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { KebabMenu } from '@/components/wfm/KebabMenu'
import { StatusPill } from './StatusPill'
import { EnableModuleModal, SetManualDeployModal, DownloadCfTemplateModal } from './ModuleActionModals'
import { getModuleEnablement, type CompanyInstance, type CompanyModule } from '@/mocks/access-management/companies'

export function CompanyModulesTab({ modules, instances }: { modules: CompanyModule[]; instances: CompanyInstance[] }) {
  const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [modal, setModal] = useState<null | { type: 'enable' | 'deploy' | 'download'; instance: CompanyInstance }>(null)

  const selectedModule = modules.find(m => m.id === selectedModuleId) ?? modules[0]

  const filteredInstances = useMemo(() => {
    if (!search) return instances
    const q = search.toLowerCase()
    return instances.filter(i => i.alias.toLowerCase().includes(q) || i.instanceId.toLowerCase().includes(q))
  }, [instances, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: '#021920' }}>Modules ({modules.length})</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setPickerOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: 327, padding: '8px 12px', border: '1px solid #d9dce0', borderRadius: 8, background: '#fff', cursor: 'pointer' }}
          >
            <GearIcon size={18} color="#0ea2a7" weight="regular" aria-hidden="true" />
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#021920' }}>{selectedModule?.name}</span>
            <CaretDownIcon size={20} color="#021920" weight="regular" />
          </button>
          {pickerOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e5e8', borderRadius: 8, boxShadow: '0 4px 16px rgba(2,25,32,0.14)', zIndex: 10, overflow: 'hidden' }}>
              {modules.map(m => (
                <button key={m.id} onClick={() => { setSelectedModuleId(m.id); setPickerOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: m.id === selectedModuleId ? '#f0f4fb' : 'transparent', cursor: 'pointer', fontSize: 13, color: '#021920' }}>
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#021920' }}>Search</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 292, height: 39, padding: '0 8px', border: '1px solid #d9dce0', borderRadius: 8, background: '#fff' }}>
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Modules" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: 'var(--font-sans)' }} />
            <MagnifyingGlassIcon size={16} color="#7a828c" weight="regular" aria-hidden="true" />
          </div>
        </div>
      </div>

      <Table size="compact">
        <TableHeader>
          <tr>
            <TableHead>Instance Alias</TableHead>
            <TableHead>Instance ID</TableHead>
            <TableHead>Enablement</TableHead>
            <TableHead>Region</TableHead>
            <TableHead aria-label="Actions" />
          </tr>
        </TableHeader>
        <TableBody>
          {filteredInstances.map(instance => {
            const status = getModuleEnablement(selectedModuleId, instance.id)
            return (
              <TableRow key={instance.id}>
                <TableCell variant="link" style={{ cursor: 'pointer', color: '#0ea2a7' }}>{instance.alias}</TableCell>
                <TableCell variant="secondary">{instance.instanceId}</TableCell>
                <TableCell>
                  <StatusPill label={status === 'verified' ? 'Verified' : 'Not Enabled'} tone={status === 'verified' ? 'success' : 'neutral'} />
                </TableCell>
                <TableCell>{instance.region}</TableCell>
                <TableCell align="center">
                  <KebabMenu
                    agentName={instance.alias}
                    actions={[
                      { label: 'Enable Module', onClick: () => setModal({ type: 'enable', instance }) },
                      { label: 'Set Manual Deployment', onClick: () => setModal({ type: 'deploy', instance }) },
                      { label: 'Download CloudFormation Template', onClick: () => setModal({ type: 'download', instance }) },
                    ]}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {selectedModule && (
        <>
          <EnableModuleModal
            open={modal?.type === 'enable'}
            moduleName={selectedModule.name}
            instanceAlias={modal?.instance.alias ?? ''}
            onClose={() => setModal(null)}
            onConfirm={() => setModal(null)}
          />
          <SetManualDeployModal
            open={modal?.type === 'deploy'}
            moduleName={selectedModule.name}
            instanceAlias={modal?.instance.alias ?? ''}
            onClose={() => setModal(null)}
            onConfirm={() => setModal(null)}
          />
          <DownloadCfTemplateModal
            open={modal?.type === 'download'}
            moduleName={selectedModule.name}
            instanceAlias={modal?.instance.alias ?? ''}
            onClose={() => setModal(null)}
            onConfirm={() => setModal(null)}
          />
        </>
      )}
    </div>
  )
}
