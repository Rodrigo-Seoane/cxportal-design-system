import { TopBar } from '@/components/layout/TopBar'

// ── Shared primitives ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, lineHeight: '22px', color: 'var(--color-text-secondary)', maxWidth: 680, margin: '0 0 12px' }}>
      {children}
    </p>
  )
}

function Code({ children }: { children: string }) {
  return (
    <code style={{
      fontFamily: 'ui-monospace, monospace',
      fontSize: 12,
      padding: '1px 5px',
      borderRadius: 4,
      background: '#eff1f3',
      color: '#3a4a5a',
    }}>
      {children}
    </code>
  )
}

// ── Lifecycle stepper ─────────────────────────────────────────────────────────

const LIFECYCLE = [
  {
    label: 'Draft',
    color: '#7a4a00',
    bg: 'var(--color-warning-100)',
    description: 'A new experiment lives in the Sandbox. It\'s rough — not all states handled, no MDX doc, design may still be in flux.',
  },
  {
    label: 'In Review',
    color: '#1a3e6b',
    bg: 'var(--color-info-100)',
    description: 'The experiment is complete enough for stakeholder review. Core flows work, edge cases are handled, the design is confirmed.',
  },
  {
    label: 'Validated',
    color: '#0e4d0e',
    bg: 'var(--color-success-200)',
    description: 'Stakeholders have signed off. The component is ready to graduate into the documented design system.',
  },
  {
    label: 'Stable',
    color: '#1a6b1a',
    bg: 'var(--color-success-100)',
    description: 'The component has a MDX doc page, a playground entry in the registry, and a sidebar link. It\'s part of the canonical system.',
  },
]

function LifecycleStep({ step, index, total }: { step: typeof LIFECYCLE[0]; index: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: step.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: step.color,
        }}>
          {index + 1}
        </div>
        {index < total - 1 && (
          <div style={{ width: 2, height: 32, background: '#e2e5e9', marginTop: 4 }} />
        )}
      </div>
      <div style={{ paddingTop: 6, paddingBottom: index < total - 1 ? 28 : 0 }}>
        <span style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 600,
          padding: '2px 7px', borderRadius: 4, marginBottom: 6,
          background: step.bg, color: step.color,
        }}>
          {step.label}
        </span>
        <p style={{ fontSize: 14, lineHeight: '22px', color: 'var(--color-text-secondary)', margin: 0, maxWidth: 560 }}>
          {step.description}
        </p>
      </div>
    </div>
  )
}

// ── Checklist ─────────────────────────────────────────────────────────────────

function CheckList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: '22px', color: 'var(--color-text-secondary)', alignItems: 'flex-start' }}>
          <span style={{ color: '#1a6b1a', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

// ── Callout ───────────────────────────────────────────────────────────────────

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      borderLeft: '3px solid var(--color-primary)',
      paddingLeft: 16, paddingTop: 10, paddingBottom: 10, paddingRight: 16,
      background: 'var(--color-info-100, #d6e2f5)',
      borderRadius: '0 6px 6px 0',
      marginBottom: 20,
      fontSize: 14, lineHeight: '22px',
      color: 'var(--color-text-primary)',
      maxWidth: 680,
    }}>
      {children}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContributingPage() {
  return (
    <>
      <TopBar title="Contributing" figmaUpdated="Apr 14, 2026" />
      <main className="flex-1 px-8 py-10" style={{ maxWidth: 800 }}>

        <Prose>
          This design system is a living system — it grows as CxPortal grows. This page explains how new
          components move from an idea in the Sandbox to a documented, stable part of the system.
        </Prose>

        {/* ── Lifecycle ── */}
        <Section title="Component lifecycle">
          <Prose>
            Every component goes through four stages. The Sandbox is where all new work begins — no component
            goes straight to Stable.
          </Prose>
          <div style={{ marginTop: 24 }}>
            {LIFECYCLE.map((step, i) => (
              <LifecycleStep key={step.label} step={step} index={i} total={LIFECYCLE.length} />
            ))}
          </div>
        </Section>

        {/* ── Starting an experiment ── */}
        <Section title="Starting an experiment">
          <Prose>
            Before writing code, check that the component doesn&apos;t already exist in <Code>/components</Code> or
            the Sandbox. If it does, update it there.
          </Prose>
          <CheckList items={[
            <>Add an entry to <Code>lib/sandbox-registry.ts</Code> — slug, title, description, author, status <Code>Draft</Code>.</>,
            <>Add the experiment route: <Code>app/sandbox/[slug]/page.tsx</Code>.</>,
            <>Add a sidebar link in <Code>components/layout/Sidebar.tsx</Code> under the Sandbox group with a <Code>wip</Code> badge.</>,
            <>Use only design system tokens and existing components. No one-off styles — everything in <Code>globals.css</Code>.</>,
          ]} />
          <Callout>
            The Sandbox scope exposes all design tokens and Shadcn components. If you need a new token, propose
            it first — run <Code>figma-sync</Code> to pull from Figma before adding manually.
          </Callout>
        </Section>

        {/* ── Promoting to In Review ── */}
        <Section title="Promoting to In Review">
          <Prose>
            When the experiment is complete enough for feedback, change its status to <Code>In Review</Code>.
          </Prose>
          <CheckList items={[
            <>Update status in <Code>sandbox-registry.ts</Code> to <Code>In Review</Code>.</>,
            <>All primary flows work end-to-end with no placeholder content.</>,
            <>Edge cases handled: empty state, loading, error, long text, small viewport.</>,
            <>Share the experiment URL with the team for review.</>,
          ]} />
        </Section>

        {/* ── Graduating to Stable ── */}
        <Section title="Graduating to Stable">
          <Prose>
            Once validated, a component graduates into the documented system. This is the full checklist:
          </Prose>
          <CheckList items={[
            <>Extract the component file to <Code>components/ui/[name].tsx</Code>.</>,
            <>Add an entry to <Code>lib/component-registry.ts</Code>: propSchema, generateCode, scope, status <Code>stable</Code>.</>,
            <>Write the MDX doc file at <Code>content/components/[slug].mdx</Code> — use <Code>content/components/button.mdx</Code> as the reference template.</>,
            <>Add a sidebar link in the Components group with a <Code>stable</Code> badge.</>,
            <>Remove or archive the sandbox entry (delete from <Code>sandbox-registry.ts</Code> and the sidebar).</>,
            <>Add a Changelog entry at <Code>/system/changelog</Code>.</>,
          ]} />
          <Callout>
            Graduation = commitment. Stable components must stay backwards-compatible. If you need to break
            an API, deprecate first — mark it <Code>deprecated</Code> in the registry and add a migration note
            to the Changelog.
          </Callout>
        </Section>

        {/* ── Tokens ── */}
        <Section title="Adding or updating tokens">
          <Prose>
            Tokens are the single source of truth. They live in <Code>lib/tokens.ts</Code> and are mapped to
            CSS variables in <Code>styles/globals.css</Code>. Follow the Figma Sync workflow to pull the
            latest token values before adding anything manually.
          </Prose>
          <CheckList items={[
            <>Run the Figma sync to get current variable definitions — see the Figma Sync page.</>,
            <>Update <Code>lib/tokens.ts</Code> with the new token (typed, as const).</>,
            <>Map the token to a CSS variable in the <Code>@theme</Code> block in <Code>styles/globals.css</Code>.</>,
            <>Reference only via the CSS variable, never hardcode a hex value in a component.</>,
          ]} />
        </Section>

        {/* ── Archiving ── */}
        <Section title="Archiving and deprecation">
          <Prose>
            Experiments that stall should be removed — the Sandbox is not a graveyard. If a stable component
            is superseded, mark it <Code>deprecated</Code> in the registry and note the replacement in the
            Changelog. Deprecated components stay in the sidebar for one major release cycle, then are removed.
          </Prose>
        </Section>

      </main>
    </>
  )
}
