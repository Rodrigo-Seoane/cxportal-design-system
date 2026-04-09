import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ComponentPlayground } from '@/components/ds/ComponentPlayground'
import { getEntryMeta } from '@/lib/component-registry'
import { getComponentDoc } from '@/lib/mdx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox, Radio } from '@/components/ui/checkbox'
import { Plus } from 'lucide-react'

// ─── Shared types ────────────────────────────────────────────────────────────

const VARIANTS = [
  { key: 'primary',       label: 'Primary',       usage: 'Primary CTA · max 1 per page' },
  { key: 'secondary',     label: 'Secondary',     usage: 'Cancel / secondary actions' },
  { key: 'form-controls', label: 'Form Controls', usage: 'Settings, config, async actions' },
  { key: 'text',          label: 'Text',          usage: 'Minimal prominence' },
] as const

type BtnVariant = typeof VARIANTS[number]['key']

// ─── Showcase header ─────────────────────────────────────────────────────────

function ShowcaseHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-12 mb-4">
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>
    </div>
  )
}

// ─── Text + label showcase ───────────────────────────────────────────────────

function TextButtonShowcase() {
  const cols = [
    { key: 'regular', label: 'Regular · 48px' },
    { key: 'sm',      label: 'Small · 36px' },
    { key: 'xs',      label: 'XS · 24px' },
    { key: 'disabled', label: 'Disabled' },
  ] as const

  return (
    <>
      <ShowcaseHeader
        title="Text buttons"
        description="4 variants × 3 sizes × disabled state"
      />
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {/* Header */}
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: '160px repeat(4, 1fr)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-display)',
          }}
        >
          <div className="px-4 py-3" />
          {cols.map((col) => (
            <div
              key={col.key}
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {VARIANTS.map(({ key: variant, label, usage }, i) => (
          <div
            key={variant}
            className="grid items-center"
            style={{
              gridTemplateColumns: '160px repeat(4, 1fr)',
              borderBottom: i < VARIANTS.length - 1 ? '1px solid var(--color-border)' : undefined,
              backgroundColor: i % 2 === 1 ? 'var(--color-surface-zebra)' : 'var(--color-surface-section)',
            }}
          >
            <div className="px-4 py-5">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{usage}</p>
            </div>
            <div className="px-4 py-5"><Button variant={variant as BtnVariant} size="regular">Label</Button></div>
            <div className="px-4 py-5"><Button variant={variant as BtnVariant} size="sm">Label</Button></div>
            <div className="px-4 py-5"><Button variant={variant as BtnVariant} size="xs">Label</Button></div>
            <div className="px-4 py-5"><Button variant={variant as BtnVariant} size="regular" disabled>Label</Button></div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Icon + label showcase ───────────────────────────────────────────────────

function IconLabelShowcase() {
  const cols = [
    { label: 'Icon left · Regular' },
    { label: 'Icon left · Small' },
    { label: 'Icon right · Regular' },
    { label: 'Disabled' },
  ] as const

  return (
    <>
      <ShowcaseHeader
        title="Buttons with icon"
        description="Icon can be placed left or right of the label. Use one icon per button."
      />
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {/* Header */}
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: '160px repeat(4, 1fr)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-display)',
          }}
        >
          <div className="px-4 py-3" />
          {cols.map((col) => (
            <div
              key={col.label}
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {VARIANTS.map(({ key: variant, label }, i) => (
          <div
            key={variant}
            className="grid items-center"
            style={{
              gridTemplateColumns: '160px repeat(4, 1fr)',
              borderBottom: i < VARIANTS.length - 1 ? '1px solid var(--color-border)' : undefined,
              backgroundColor: i % 2 === 1 ? 'var(--color-surface-zebra)' : 'var(--color-surface-section)',
            }}
          >
            <div className="px-4 py-5">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
            </div>
            <div className="px-4 py-5">
              <Button variant={variant as BtnVariant} size="regular"><Plus />Label</Button>
            </div>
            <div className="px-4 py-5">
              <Button variant={variant as BtnVariant} size="sm"><Plus />Label</Button>
            </div>
            <div className="px-4 py-5">
              <Button variant={variant as BtnVariant} size="regular">Label<Plus /></Button>
            </div>
            <div className="px-4 py-5">
              <Button variant={variant as BtnVariant} size="regular" disabled><Plus />Label</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Icon-only showcase ──────────────────────────────────────────────────────

function IconOnlyShowcase() {
  const cols = [
    { label: 'Regular · 48×48' },
    { label: 'Small · 36×36' },
    { label: 'XS · 24×24' },
    { label: 'Disabled' },
  ] as const

  return (
    <>
      <ShowcaseHeader
        title="Icon-only buttons"
        description="Square buttons for toolbar actions. Always provide an aria-label for accessibility."
      />
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {/* Header */}
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: '160px repeat(4, 1fr)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-display)',
          }}
        >
          <div className="px-4 py-3" />
          {cols.map((col) => (
            <div
              key={col.label}
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {VARIANTS.map(({ key: variant, label }, i) => (
          <div
            key={variant}
            className="grid items-center"
            style={{
              gridTemplateColumns: '160px repeat(4, 1fr)',
              borderBottom: i < VARIANTS.length - 1 ? '1px solid var(--color-border)' : undefined,
              backgroundColor: i % 2 === 1 ? 'var(--color-surface-zebra)' : 'var(--color-surface-section)',
            }}
          >
            <div className="px-4 py-5">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
            </div>
            <div className="px-4 py-5">
              <Button variant={variant as BtnVariant} size="icon-regular" aria-label="Action"><Plus /></Button>
            </div>
            <div className="px-4 py-5">
              <Button variant={variant as BtnVariant} size="icon-sm" aria-label="Action"><Plus /></Button>
            </div>
            <div className="px-4 py-5">
              <Button variant={variant as BtnVariant} size="icon-xs" aria-label="Action"><Plus /></Button>
            </div>
            <div className="px-4 py-5">
              <Button variant={variant as BtnVariant} size="icon-regular" disabled aria-label="Action"><Plus /></Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Input showcase ──────────────────────────────────────────────────────────

function InputShowcase() {
  const VARIANTS = [
    { key: 'text',     label: 'Text',     desc: 'Default single-line entry' },
    { key: 'email',    label: 'Email',    desc: 'With envelope icon' },
    { key: 'number',   label: 'Number',   desc: 'With up/down caret' },
    { key: 'date',     label: 'Date',     desc: 'With calendar icon' },
    { key: 'password', label: 'Password', desc: 'Show/hide toggle' },
    { key: 'textarea', label: 'Textarea', desc: 'Multi-line with char count' },
  ] as const

  return (
    <>
      {/* All variants × states */}
      <ShowcaseHeader
        title="Variants & States"
        description="All six variants across Default, Error, and Disabled states."
      />
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {/* Header row */}
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: '160px repeat(3, 1fr)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-display)',
          }}
        >
          <div className="px-4 py-3" />
          {(['Default', 'Error', 'Disabled'] as const).map((col) => (
            <div
              key={col}
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {VARIANTS.map(({ key, label, desc }, i) => (
          <div
            key={key}
            className="grid items-start"
            style={{
              gridTemplateColumns: '160px repeat(3, 1fr)',
              borderBottom: i < VARIANTS.length - 1 ? '1px solid var(--color-border)' : undefined,
              backgroundColor: i % 2 === 1 ? 'var(--color-surface-zebra)' : 'var(--color-surface-section)',
            }}
          >
            <div className="px-4 py-5">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
            </div>
            {/* Default */}
            <div className="px-4 py-5">
              <Input variant={key} label={label} />
            </div>
            {/* Error */}
            <div className="px-4 py-5">
              <Input variant={key} label={label} error="This field is required." />
            </div>
            {/* Disabled */}
            <div className="px-4 py-5">
              <Input variant={key} label={label} disabled />
            </div>
          </div>
        ))}
      </div>

      {/* Label + hint combos */}
      <ShowcaseHeader
        title="Label & hint combinations"
        description="Label visibility and hint text can be combined independently."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Input variant="text" label="Full Name" hint="As it appears on your ID." />
        <Input variant="text" label="Full Name" required hint="Required field." />
        <Input variant="email" label="Email" labelVisible={false} hint="name@example.com" />
        <Input variant="text" label="Hidden label, no hint" labelVisible={false} />
      </div>
    </>
  )
}

// ─── Navigation showcase ─────────────────────────────────────────────────────

const NAV_BG      = '#050326'
const NAV_HOVER   = '#4285f4'
const NAV_ACTIVE  = '#3264b8'
const NAV_TEXT    = '#eff1f3'
const NAV_MUTED   = 'rgba(239,241,243,0.45)'
const NAV_SUB     = 'rgba(239,241,243,0.75)'

function NavItemRow({ label, state, type }: { label: string; state: 'Default' | 'Hover' | 'Active' | 'Disabled'; type: 'menu' | 'sub' }) {
  const isMenu   = type === 'menu'
  const isActive = state === 'Active'
  const isHover  = state === 'Hover'
  const isDisabled = state === 'Disabled'
  const bg = isActive ? NAV_ACTIVE : isHover ? NAV_HOVER : 'transparent'
  const color = isDisabled ? '#808080' : isActive || isHover ? NAV_TEXT : isMenu ? NAV_MUTED : NAV_SUB
  const fw = isActive && !isMenu ? 600 : 300

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: isMenu ? 48 : 40,
        paddingLeft: isMenu ? 12 : 48,
        paddingRight: isMenu ? 12 : 24,
        gap: 8,
        background: bg,
        borderRadius: 0,
        transition: 'background 100ms ease',
      }}
    >
      {isMenu && (
        <div style={{ width: 20, height: 20, background: 'rgba(239,241,243,0.2)', borderRadius: 3, flexShrink: 0 }} />
      )}
      <span style={{ flex: 1, fontSize: 14, fontWeight: fw, lineHeight: '20px', color }}>{label}</span>
      {isMenu && (
        <div style={{ width: 16, height: 16, opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, color: NAV_TEXT }}>›</span>
        </div>
      )}
    </div>
  )
}

function NavigationShowcase() {
  const states = ['Default', 'Hover', 'Active', 'Disabled'] as const
  const cols = states.map((s) => ({ key: s, label: `State: ${s}` }))

  return (
    <>
      {/* Menu Items */}
      <ShowcaseHeader title="Menu Item (Group Header)" description="48px height · Icon + Label + Caret · 4 states" />
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: '140px repeat(4, 1fr)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-display)',
          }}
        >
          <div className="px-4 py-3" />
          {cols.map((c) => (
            <div key={c.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              {c.label}
            </div>
          ))}
        </div>
        <div
          className="grid items-stretch"
          style={{ gridTemplateColumns: '140px repeat(4, 1fr)' }}
        >
          <div className="px-4 flex items-center">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>dark bg</p>
          </div>
          {states.map((state) => (
            <div key={state} style={{ background: NAV_BG, padding: '4px 0' }}>
              <NavItemRow label="Group Label" state={state} type="menu" />
            </div>
          ))}
        </div>
      </div>

      {/* Sub Menu Items */}
      <ShowcaseHeader title="Sub Menu Item" description="40px height · Indented 48px · Active uses SemiBold (600)" />
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: '140px repeat(4, 1fr)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-display)',
          }}
        >
          <div className="px-4 py-3" />
          {cols.map((c) => (
            <div key={c.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              {c.label}
            </div>
          ))}
        </div>
        <div
          className="grid items-stretch"
          style={{ gridTemplateColumns: '140px repeat(4, 1fr)' }}
        >
          <div className="px-4 flex items-center">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>dark bg</p>
          </div>
          {states.map((state) => (
            <div key={state} style={{ background: NAV_BG, padding: '4px 0' }}>
              <NavItemRow label="Sub Item Label" state={state} type="sub" />
            </div>
          ))}
        </div>
      </div>

      {/* Full panel preview */}
      <ShowcaseHeader title="Panel preview" description="Collapsed group / Open group / Active sub-item selected" />
      <div className="flex gap-6">
        {/* Collapsed */}
        <div style={{ width: 240, background: NAV_BG, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(239,241,243,0.08)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: NAV_MUTED, margin: 0 }}>ALL COLLAPSED</p>
          </div>
          <NavItemRow label="Foundations" state="Default" type="menu" />
          <NavItemRow label="Components" state="Default" type="menu" />
          <NavItemRow label="Sandbox" state="Default" type="menu" />
        </div>

        {/* Open group, no active */}
        <div style={{ width: 240, background: NAV_BG, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(239,241,243,0.08)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: NAV_MUTED, margin: 0 }}>GROUP OPEN</p>
          </div>
          <NavItemRow label="Foundations" state="Default" type="menu" />
          <NavItemRow label="Components" state="Hover" type="menu" />
          <NavItemRow label="Button" state="Default" type="sub" />
          <NavItemRow label="Input" state="Default" type="sub" />
          <NavItemRow label="Select" state="Default" type="sub" />
          <NavItemRow label="Sandbox" state="Default" type="menu" />
        </div>

        {/* Active sub-item */}
        <div style={{ width: 240, background: NAV_BG, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(239,241,243,0.08)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: NAV_MUTED, margin: 0 }}>ACTIVE PAGE</p>
          </div>
          <NavItemRow label="Foundations" state="Default" type="menu" />
          <NavItemRow label="Components" state="Default" type="menu" />
          <NavItemRow label="Button" state="Default" type="sub" />
          <NavItemRow label="Input" state="Active" type="sub" />
          <NavItemRow label="Select" state="Default" type="sub" />
          <NavItemRow label="Sandbox" state="Default" type="menu" />
        </div>
      </div>
    </>
  )
}

// ─── Checkbox & Radio showcase ───────────────────────────────────────────────

function CheckboxShowcase() {
  const states = [
    { key: 'default',  label: 'Default' },
    { key: 'checked',  label: 'Checked' },
    { key: 'disabled', label: 'Disabled' },
  ] as const

  const sizes = [
    { key: 'regular' as const, label: 'Regular · 18px' },
    { key: 'small'   as const, label: 'Small · 12px' },
  ]

  return (
    <>
      {/* Checkboxes */}
      <ShowcaseHeader
        title="Checkbox"
        description="3 states × 2 sizes"
      />
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: '160px repeat(3, 1fr)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-display)',
          }}
        >
          <div className="px-4 py-3" />
          {states.map((s) => (
            <div key={s.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              {s.label}
            </div>
          ))}
        </div>
        {sizes.map(({ key: size, label }, i) => (
          <div
            key={size}
            className="grid items-center"
            style={{
              gridTemplateColumns: '160px repeat(3, 1fr)',
              borderBottom: i < sizes.length - 1 ? '1px solid var(--color-border)' : undefined,
              backgroundColor: i % 2 === 1 ? 'var(--color-surface-zebra)' : 'var(--color-surface-section)',
            }}
          >
            <div className="px-4 py-5">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
            </div>
            <div className="px-4 py-5"><Checkbox label="Option label" size={size} /></div>
            <div className="px-4 py-5"><Checkbox label="Option label" size={size} defaultChecked /></div>
            <div className="px-4 py-5"><Checkbox label="Option label" size={size} disabled /></div>
          </div>
        ))}
      </div>

      {/* Radios */}
      <ShowcaseHeader
        title="Radio Button"
        description="3 states × 2 sizes"
      />
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: '160px repeat(3, 1fr)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-display)',
          }}
        >
          <div className="px-4 py-3" />
          {states.map((s) => (
            <div key={s.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              {s.label}
            </div>
          ))}
        </div>
        {sizes.map(({ key: size, label }, i) => (
          <div
            key={size}
            className="grid items-center"
            style={{
              gridTemplateColumns: '160px repeat(3, 1fr)',
              borderBottom: i < sizes.length - 1 ? '1px solid var(--color-border)' : undefined,
              backgroundColor: i % 2 === 1 ? 'var(--color-surface-zebra)' : 'var(--color-surface-section)',
            }}
          >
            <div className="px-4 py-5">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
            </div>
            <div className="px-4 py-5"><Radio label="Option label" size={size} /></div>
            <div className="px-4 py-5"><Radio label="Option label" size={size} checked /></div>
            <div className="px-4 py-5"><Radio label="Option label" size={size} disabled /></div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ComponentPage(props: PageProps<'/components/[slug]'>) {
  const { slug } = await props.params
  const meta = getEntryMeta(slug)
  if (!meta) notFound()

  const doc = await getComponentDoc(slug)

  const statusColors: Record<string, { bg: string; text: string }> = {
    stable: { bg: 'var(--color-success-100)', text: '#1a6b1a' },
    wip:    { bg: 'var(--color-warning-100)', text: '#7a4a00' },
    deprecated: { bg: 'var(--color-error-100)', text: '#8b1a2a' },
  }
  const badge = statusColors[meta.status]

  return (
    <>
      <TopBar title={meta.title} />
      <main className="flex-1 px-8 py-10 max-w-5xl">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-2">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {meta.title}
          </h2>
          <span
            className="mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {meta.status}
          </span>
        </div>
        <p className="mb-8 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          {meta.description}
        </p>

        {/* ── Playground ──────────────────────────────────────────────── */}
        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Playground
        </h3>
        <ComponentPlayground slug={slug} />

        {/* ── Button showcases ────────────────────────────────────────── */}
        {slug === 'button' && (
          <>
            <TextButtonShowcase />
            <IconLabelShowcase />
            <IconOnlyShowcase />
          </>
        )}

        {/* ── Input showcase ──────────────────────────────────────────── */}
        {slug === 'input' && <InputShowcase />}

        {/* ── Checkbox & Radio showcase ────────────────────────────────── */}
        {slug === 'checkbox' && <CheckboxShowcase />}

        {/* ── Navigation showcase ──────────────────────────────────────── */}
        {slug === 'navigation' && <NavigationShowcase />}

        {/* ── MDX documentation ───────────────────────────────────────── */}
        {doc && (
          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {doc.content}
          </div>
        )}
      </main>
    </>
  )
}
