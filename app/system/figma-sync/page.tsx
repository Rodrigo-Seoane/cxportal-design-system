import { TopBar } from '@/components/layout/TopBar'

// ── Primitives ────────────────────────────────────────────────────────────────

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
      padding: '1px 5px', borderRadius: 4,
      background: '#eff1f3', color: '#3a4a5a',
    }}>
      {children}
    </code>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: 'ui-monospace, monospace',
      fontSize: 12, lineHeight: '20px',
      padding: '14px 18px', borderRadius: 8,
      background: '#021920', color: '#eff1f3',
      overflowX: 'auto', margin: '12px 0 20px',
      maxWidth: 680,
    }}>
      <code>{children}</code>
    </pre>
  )
}

function Callout({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderLeft: '3px solid var(--color-primary)',
      paddingLeft: 16, paddingTop: 10, paddingBottom: 10, paddingRight: 16,
      background: 'var(--color-info-100, #d6e2f5)',
      borderRadius: '0 6px 6px 0',
      marginBottom: 20, maxWidth: 680,
    }}>
      {title && <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</p>}
      <p style={{ fontSize: 14, lineHeight: '22px', color: 'var(--color-text-primary)', margin: 0 }}>{children}</p>
    </div>
  )
}

// ── Numbered step ─────────────────────────────────────────────────────────────

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 20, marginBottom: 36 }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
        }}>
          {n}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FigmaSyncPage() {
  return (
    <>
      <TopBar title="Figma Sync" figmaUpdated="Apr 14, 2026" />
      <main className="flex-1 px-8 py-10" style={{ maxWidth: 800 }}>

        <Prose>
          The Figma file is the source of truth for all design tokens — colors, typography, spacing, and
          border radius. This page documents the deliberate, PR-based process for keeping{' '}
          <Code>lib/tokens.ts</Code> in sync when Figma variables change.
        </Prose>

        <Callout title="When to sync">
          Only sync when the design team confirms that token changes in Figma are stable and reviewed.
          Do not sync mid-iteration — wait for the Figma file to be in a clean state.
        </Callout>

        {/* ── Overview ── */}
        <Section title="Overview">
          <Prose>
            Token sync is never automated at build time. Instead, it&apos;s a deliberate action triggered
            by a human via the Claude Code MCP toolchain. This avoids build fragility, Figma API rate
            limits, and accidental token regressions.
          </Prose>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginTop: 16, marginBottom: 20,
            maxWidth: 680,
          }}>
            {[
              { label: 'Figma file key', value: 'exoHhvasbJSziVGakV8Y0r' },
              { label: 'Token source',   value: 'Figma Variables API' },
              { label: 'Target file',    value: 'lib/tokens.ts' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'var(--color-surface-section)',
                border: '1px solid var(--color-border, #e2e5e9)',
                borderRadius: 8, padding: '12px 14px',
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--color-text-primary)', margin: 0 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Steps ── */}
        <Section title="Step-by-step process">

          <Step n={1} title="Pull variable definitions from Figma">
            <Prose>
              In a Claude Code session, use the Figma MCP tool to fetch the current variable definitions
              from the Figma file. This returns all design variables — colors, typography values, spacing,
              border radii — in a structured format.
            </Prose>
            <CodeBlock>{`// In a Claude Code session:
// Use the Figma MCP tool with the file key
mcp__Figma__get_variable_defs({ fileKey: "exoHhvasbJSziVGakV8Y0r" })`}</CodeBlock>
            <Prose>
              Review the output. The tool returns all variable collections — check for any new collections
              or renamed variables that don&apos;t exist in <Code>lib/tokens.ts</Code> yet.
            </Prose>
          </Step>

          <Step n={2} title="Diff against the current tokens file">
            <Prose>
              Open <Code>lib/tokens.ts</Code> and compare it against the Figma output. Look for:
            </Prose>
            <ul style={{ paddingLeft: 20, margin: '8px 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'New variables not yet in tokens.ts',
                'Renamed variables (old name should be removed)',
                'Value changes (hex, size, weight)',
                'Deleted variables still present in tokens.ts',
              ].map(item => (
                <li key={item} style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: '22px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </Step>

          <Step n={3} title="Update lib/tokens.ts">
            <Prose>
              Apply only the confirmed changes. Keep the file typed, immutable (<Code>as const</Code>), and
              organized by token category. Do not remove a token without checking that nothing references it.
            </Prose>
            <CodeBlock>{`// Example: updating a color token
export const colors = {
  primary: '#4285f4',          // unchanged
  text: {
    primary:   '#021920',
    secondary: '#7a828c',      // updated from previous value
    onDark:    '#eff1f3',
  },
  // ...
} as const`}</CodeBlock>
          </Step>

          <Step n={4} title="Update styles/globals.css">
            <Prose>
              For any new or renamed tokens, add or update the corresponding CSS variable in the{' '}
              <Code>@theme</Code> block. Existing components reference these variables — renaming a
              CSS variable is a breaking change; alias the old name if needed.
            </Prose>
            <CodeBlock>{`/* styles/globals.css */
@theme {
  --color-primary:         #4285f4;
  --color-text-primary:    #021920;
  --color-text-secondary:  #7a828c;
  /* new token: */
  --color-surface-overlay: rgba(0, 0, 0, 0.4);
}`}</CodeBlock>
          </Step>

          <Step n={5} title="Verify visually">
            <Prose>
              Run the dev server and spot-check the pages most affected by the changed tokens:
            </Prose>
            <ul style={{ paddingLeft: 20, margin: '8px 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                '/foundations/colors — confirm swatches match Figma',
                '/foundations/typography — confirm type scale',
                '/components/button — confirm all variant colors',
                'Any component that uses a changed token directly',
              ].map(item => (
                <li key={item} style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontFamily: 'ui-monospace, monospace', lineHeight: '22px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </Step>

          <Step n={6} title="Commit and log the change">
            <Prose>
              Commit only <Code>lib/tokens.ts</Code> and <Code>styles/globals.css</Code> in the token
              sync commit. Add a Changelog entry under the sync date.
            </Prose>
            <CodeBlock>{`git add lib/tokens.ts styles/globals.css
git commit -m "sync: pull Figma token updates — <date>"`}</CodeBlock>
          </Step>

        </Section>

        {/* ── Component screenshots ── */}
        <Section title="Updating component screenshots">
          <Prose>
            Static screenshots live in <Code>public/figma-screenshots/</Code>. They are used on component
            doc pages for anatomy diagrams and usage examples. Re-capture them when a component&apos;s
            Figma spec changes.
          </Prose>
          <CodeBlock>{`// In a Claude Code session, per component:
mcp__Figma__get_screenshot({
  fileKey: "exoHhvasbJSziVGakV8Y0r",
  nodeId:  "<component-frame-node-id>",
})`}</CodeBlock>
          <Prose>
            Save the result to <Code>public/figma-screenshots/[slug].png</Code> and reference it in the
            component&apos;s MDX file.
          </Prose>
        </Section>

        {/* ── Troubleshooting ── */}
        <Section title="Troubleshooting">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 680 }}>
            {[
              {
                problem: 'get_variable_defs returns an empty array',
                fix: 'Confirm the file key is correct and that the Figma MCP server is authenticated. Check that the Figma file has a published variable collection.',
              },
              {
                problem: 'A CSS variable name conflict after rename',
                fix: 'Keep the old CSS variable as an alias pointing to the new one, then update all component references in a follow-up PR.',
              },
              {
                problem: 'Colors look off after sync',
                fix: 'Check that globals.css @theme block was saved and the dev server was restarted. Tailwind v4 reads @theme at build/dev time.',
              },
            ].map(item => (
              <div key={item.problem} style={{
                background: 'var(--color-surface-section)',
                border: '1px solid var(--color-border, #e2e5e9)',
                borderRadius: 8, padding: '14px 16px',
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
                  {item.problem}
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: '20px' }}>
                  {item.fix}
                </p>
              </div>
            ))}
          </div>
        </Section>

      </main>
    </>
  )
}
