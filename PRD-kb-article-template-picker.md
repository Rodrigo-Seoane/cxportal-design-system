# PRD: KB Article Template Picker
## "Use Template" Flow — Knowledge Management Sandbox

**Status:** Draft  
**Figma Reference:** https://www.figma.com/design/QJU6GQyFjpurCmJ1vKvrb3/Knowledge-Management---Phase-2?node-id=4414-131122  
**Project Root:** `/Users/rodrigo.seoane/local-sites/pronetx/project_portal/`

---

## 1. Executive Summary

When a user clicks "Add New Article" in the Knowledge Management sandbox, the DocumentView opens in a "new article" state and presents two starting choices inside the editor pane: **Blank** and **Use Template**. This PRD defines the complete UX flow for what happens when the user clicks **Use Template** — from the trigger button through a full-screen template gallery overlay, live markdown preview, category filtering, search, template selection, and final editor population. The feature reduces time-to-first-word for authors by giving them structured, role-appropriate scaffolding instead of an empty textarea, directly improving KB content quality and authoring velocity in B2B customer support and product documentation contexts.

---

## 2. Research Metadata

| Field | Value |
|---|---|
| Date | 2026-04-17 |
| Scope | KB Article Template Picker — "Use Template" trigger to editor populated |
| Figma node | `4414:131122` (Knowledge Management Phase 2 — Add New Article screen) |
| Codebase snapshot | Branch `main`, commit `31e0bf6` |

**Files researched:**

- `app/sandbox/collapsible-filter/DocumentView.tsx` — full read
- `app/sandbox/collapsible-filter/MarkdownEditor.tsx` — full read
- `app/sandbox/collapsible-filter/page.tsx` — full read (35k tokens, read in slices)
- `app/sandbox/collapsible-filter/TagPanel.tsx` — full read
- `app/sandbox/collapsible-filter/BulkMoveModal.tsx` — full read
- `components/sandbox/SandboxShell.tsx` — full read
- `components/ui/modal.tsx` — full read
- `components/ui/clickable-card.tsx` — full read
- `app/globals.css` — first 100 lines (CSS token block)
- `lib/tokens.ts` — full read

**External sources consulted:**

- Figma node screenshot (node 4414:131122) — retrieved via MCP
- Notion template gallery UX blog posts (notion.com)
- B2B SaaS KB template categories — usepylon.com, zendesk.com, swifteq.com
- React Aria accessibility — react-aria.adobe.com, react-spectrum.adobe.com
- PatternFly Card accessibility — patternfly.org
- Modal pattern reference — uxpatterns.dev

---

## 3. Affected Codebase Files

### Critical — must be modified

| File | Change Required |
|---|---|
| `app/sandbox/collapsible-filter/DocumentView.tsx` | Add `isNew?: boolean` prop; render "Blank / Use Template" choice UI when `isNew === true`; wire "Use Template" button to open the template picker overlay; accept selected template markdown and populate `markdown` state |
| `app/sandbox/collapsible-filter/page.tsx` | Pass `isNew={true}` when opening DocumentView from "Add New Article"; add `onClick` to the "Add New Article" action item (line 2253, currently no handler) |

### New — must be created

| File | Purpose |
|---|---|
| `app/sandbox/collapsible-filter/TemplatePicker.tsx` | Full-screen overlay component: category filter sidebar, searchable card grid, live markdown preview pane, confirm/cancel footer |
| `app/sandbox/collapsible-filter/template-data.ts` | Hardcoded registry: `KBTemplate[]` constant array with id, name, category, description, and markdown body for each template |

### Supporting — read for patterns, no changes needed

| File | Notes |
|---|---|
| `app/sandbox/collapsible-filter/MarkdownEditor.tsx` | Provides `value` / `onChange` props — no change; template content is injected via `onChange` |
| `app/sandbox/collapsible-filter/TagPanel.tsx` | Reference for inline floating panel + search pattern |
| `app/sandbox/collapsible-filter/BulkMoveModal.tsx` | Reference for full-screen overlay layout pattern (page-header + sidebar + main + footer) |
| `components/ui/modal.tsx` | Available but **not recommended** for this use-case (see Section 9) |
| `components/ui/clickable-card.tsx` | Card selection pattern with radio indicator — can be referenced for visual style |

### Untouched

All other files in the project, including `TagPanel.tsx`, `SandboxShell.tsx`, other `components/ui/*` files, styles, `lib/`, and `app/` routes outside `collapsible-filter/`.

---

## 4. Existing Implementation Patterns

### 4.1 Full-screen overlay pattern (BulkMoveModal.tsx)

`BulkMoveModal.tsx` (lines 110–306) establishes the canonical full-screen overlay used across this sandbox:

```
position: fixed, inset: 0, zIndex: 1001
background: #f8f9fb
display: flex, flexDirection: column
```

It uses a **three-zone layout**: a page-header bar (white, `borderBottom: 1px solid #eff1f3`), a content area (`flex: 1, overflow: hidden, padding: 16px 24px, gap: 16`), and an implied footer inside the right panel. The template picker should follow this exact structure.

### 4.2 Portal dropdown pattern (page.tsx, lines 128–235)

`PortalDropdown` in `page.tsx` uses `createPortal(…, document.body)` and positions via `getBoundingClientRect()`. The same escape-key and outside-click dismissal pattern is used for all dropdowns. This is the model for any auxiliary overlay.

### 4.3 Modal primitive (components/ui/modal.tsx)

`Modal` / `ModalHeader` / `ModalBody` / `ModalFooter` are the DS-level modal components. They support `size: 'large' | 'medium'` (max-widths 701px and 453px), a `createPortal` backdrop with `rgba(5, 3, 38, 0.60)` overlay, Escape-key dismissal (line 83), focus-trap with Tab cycle (lines 100–110), and body-scroll-lock (lines 115–120). These accessibility features are already implemented and must be replicated if building a custom overlay.

### 4.4 ClickableCard selection pattern (components/ui/clickable-card.tsx)

`ClickableCard` implements a radio-style card with `border-[#689df6]` highlight on selected state, hover with `hover:border-[#689df6]`, and a `RadioDot` indicator. Template cards should follow this visual language for consistency.

### 4.5 Search + filter inline pattern (DocumentView.tsx, lines 473–525)

The existing tag search uses a `ref`-anchored input that opens a floating `TagPanel` dropdown. The template picker's search input can reuse the same input styling: `border: 1px solid #d9dce0`, `borderRadius: 8`, active border `#4285f4`.

### 4.6 DocumentView state architecture

`DocumentView` currently holds `markdown` state at line 133 and passes it to `MarkdownEditor` via `value={markdown}` at line 365. Populating a template simply requires calling `setMarkdown(template.markdown)`. No changes to `MarkdownEditor` are needed.

### 4.7 Design tokens in use (lib/tokens.ts, app/globals.css)

The following tokens are directly relevant to the template picker UI:

| Token | Value | Use |
|---|---|---|
| `--color-text-primary` | `#021920` | Body text, card titles |
| `--color-text-secondary` | `#7a828c` | Descriptions, metadata |
| `--color-surface-section` | `#ffffff` | Card backgrounds, panels |
| `--color-surface-display` / `--color-surface-panel` | `#eff1f3` | Page background, form row |
| `--color-primary` | `#4285f4` | Primary button, active state, search border focus |
| `--color-interactive-primary-dark` | `#3264b8` | Secondary links, hover |
| `--color-interactive-border-disabled` | `#d9dce0` | Default input border |
| `--radius-md` | `8px` | Cards, inputs, buttons |
| `boxShadow` (modal) | `0 8px 48px rgba(2, 25, 32, 0.22)` | Panel shadow |

---

## 5. Technology Documentation Excerpts

### 5.1 Focus trap (from modal.tsx, lines 100–110)

The existing `Modal` focus-trap cycles Tab through all `button, [href], input, select, textarea, [tabindex]` elements. The template picker overlay must implement equivalent focus management because it mounts over a full-screen DocumentView.

### 5.2 Card grid keyboard navigation (WAI-ARIA Authoring Practices)

For a template card grid, the recommended ARIA pattern is `role="listbox"` on the container and `role="option"` on each card. Keyboard behaviour:
- Arrow keys: move selection between cards
- Enter / Space: confirm selection
- Escape: dismiss overlay without selecting

PatternFly recommends placing cards inside `<ul role="listbox">` / `<li role="option">` elements and wiring `aria-selected` on the active card.

### 5.3 Body scroll lock (already solved)

`Modal` at line 115–120 sets `document.body.style.overflow = 'hidden'` on open and restores on close. The template picker must do the same since DocumentView itself is `position: fixed, inset: 0`.

### 5.4 React createPortal

All existing overlays in this sandbox (`BulkMoveModal`, `PortalDropdown`, `TableFilter`) mount via `createPortal(…, document.body)`. The template picker should follow the same pattern so it layers above the DocumentView (which is `zIndex: 1000`). Use `zIndex: 1100` for the picker.

---

## 6. External Implementation Patterns

### 6.1 Notion — Inline template cards below editor toolbar

When a user creates a new Notion page, the empty body shows inline prompt cards: "Empty page", "Templates", and a set of content-type cards. Clicking "Templates" opens a **right-side sliding panel** (not a full modal) with categorised template previews. Selection immediately populates the page. Key learnings:
- Templates surface inside the editor zone, not as a separate route
- Category navigation is left-column with inline selection highlighting
- Preview is read-only rendered HTML, not a live editor

### 6.2 Confluence — Template gallery modal

Confluence uses a **centred modal dialog** (~80% viewport width) with: category tabs at the top, a 3-column card grid with thumbnail previews, a right-side preview panel for the selected template, and "Use template" / "Cancel" buttons in the footer. Key learnings:
- Thumbnail preview on hover reduces modal switching
- Category tabs are horizontal at the top, not a sidebar
- "Blank page" is always the first card in the grid, before any templates

### 6.3 GitBook — Inline creation picker

GitBook shows a simple inline block: an empty editor area with a small tip "Start writing or press '/' for commands". Templates are accessible via a command palette (`/`) rather than a separate modal. Key learning: power-users prefer command palette; new users prefer visual gallery.

### 6.4 Intercom Articles — Minimal choice prompt

Intercom shows a two-card inline picker inside the new article body: "Start from scratch" and "Use a template". Clicking a template opens a **full-screen overlay** with a scrollable list on the left and a live preview on the right. Key learnings:
- Two-step flow (choice prompt → gallery) reduces cognitive load at the initial step
- Full-screen overlay works well for KB authoring tools because article context is preserved in the left sidebar

### 6.5 Template content injection pattern

The standard React pattern for replacing editor content with a template is a direct state update:

```typescript
// TemplatePicker returns selected markdown string to parent
function handleConfirm(templateMarkdown: string) {
  setMarkdown(templateMarkdown)   // replaces current (empty) value
  setShowTemplatePicker(false)
}
```

No append logic is needed — on a brand new article the editor is always empty before a template is applied. A confirmation dialog before replacing is not warranted at this stage because the article is new and has no user-authored content at risk.

---

## 7. Recommended Template Categories & Content

Templates are hardcoded in `app/sandbox/collapsible-filter/template-data.ts` as `KBTemplate[]`. The following 8 templates cover the core B2B SaaS KB use cases (confirmed by Pylon, Zendesk, and Swifteq research).

### Template 1 — How-To Guide

**Category:** Procedures  
**Description:** Step-by-step instructions for completing a specific product action.

```markdown
# How To: [Task Name]

## Overview
Brief one-sentence description of what this guide helps the user accomplish.

## Prerequisites
- [ ] Prerequisite 1
- [ ] Prerequisite 2

## Steps

### Step 1 — [Action]
Description of the step.

### Step 2 — [Action]
Description of the step.

### Step 3 — [Action]
Description of the step.

## What to Expect Next
Describe the outcome or next recommended action.

## Related Articles
- [Link to related article]
```

---

### Template 2 — Troubleshooting Guide

**Category:** Support  
**Description:** Diagnostic steps for resolving a known product issue.

```markdown
# Troubleshooting: [Issue Name]

## Symptom
Describe what the user sees or experiences.

## Cause
Explain the root cause (if known).

## Solution

### Option A — [Most common fix]
Step 1...
Step 2...

### Option B — [Alternative fix]
Step 1...

## Still Having Issues?
Contact support at [email] or open a ticket at [link].
```

---

### Template 3 — Feature Overview

**Category:** Product  
**Description:** Explain what a product feature does, who it's for, and how to use it.

```markdown
# [Feature Name] — Overview

## What Is It?
One paragraph describing the feature and its purpose.

## Who Is It For?
Describe the target audience or use case.

## Key Capabilities
- Capability 1
- Capability 2
- Capability 3

## How to Access
Navigation path: **Settings → [Section] → [Feature]**

## Quick Start
1. Step one
2. Step two
3. Step three

## Limitations
- Known limitation 1

## Related Documentation
- [Link]
```

---

### Template 4 — FAQ Article

**Category:** Support  
**Description:** Answers to common, repetitive questions about a topic or feature.

```markdown
# FAQ: [Topic Name]

## General Questions

### Q: [Question 1]
**A:** Answer here.

### Q: [Question 2]
**A:** Answer here.

## Billing & Account

### Q: [Question 3]
**A:** Answer here.

## Technical

### Q: [Question 4]
**A:** Answer here.

---

*Last updated: [Date] — [Author]*
```

---

### Template 5 — Getting Started Guide

**Category:** Onboarding  
**Description:** First-time setup guide for new users or newly provisioned instances.

```markdown
# Getting Started with [Product / Feature]

## Welcome
Brief welcome message explaining what this guide covers.

## What You'll Need
- Account type: [e.g. Admin]
- Access to: [e.g. Settings panel]
- Estimated time: X minutes

## Step 1 — Set Up Your Account
Instructions...

## Step 2 — Configure [Key Setting]
Instructions...

## Step 3 — Run Your First [Action]
Instructions...

## You're Ready
Summary of what was accomplished and suggested next steps.

## Resources
- [Link to API docs]
- [Link to video tutorial]
```

---

### Template 6 — Release Notes

**Category:** Product  
**Description:** Changelog-style article documenting new features, fixes, and known issues for a release.

```markdown
# Release Notes — v[X.Y.Z] ([Date])

## What's New
- **[Feature name]:** Description of the new feature.
- **[Improvement]:** Description of the improvement.

## Bug Fixes
- Fixed: [Description of bug and resolution].
- Fixed: [Description of bug and resolution].

## Known Issues
- [Issue description] — workaround: [workaround].

## Deprecated
- [Deprecated item] will be removed in v[X.Y.Z].

---

*See the full changelog at [link].*
```

---

### Template 7 — Policy & Compliance Article

**Category:** Compliance  
**Description:** Internal or external policy document with defined scope, rules, and references.

```markdown
# [Policy Name]

**Effective Date:** [Date]  
**Owner:** [Department / Team]  
**Classification:** [Public / Confidential / Internal]

## Purpose
Explain the goal and scope of this policy.

## Scope
Who this policy applies to.

## Policy Statement

### [Section 1]
Policy text here.

### [Section 2]
Policy text here.

## Responsibilities
| Role | Responsibility |
| --- | --- |
| [Role A] | [Responsibility] |
| [Role B] | [Responsibility] |

## References
- [Regulation / Standard name]

## Revision History
| Version | Date | Author | Summary |
| --- | --- | --- | --- |
| 1.0 | [Date] | [Author] | Initial draft |
```

---

### Template 8 — API Reference Article

**Category:** Engineering  
**Description:** Developer-facing reference for a single API endpoint or SDK method.

```markdown
# [Endpoint Name] — API Reference

**Method:** `[GET / POST / PUT / DELETE]`  
**Endpoint:** `/api/v1/[path]`  
**Auth required:** Yes — Bearer token

## Description
What this endpoint does and when to use it.

## Request Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `param1` | string | Yes | Description |
| `param2` | integer | No | Description |

## Request Body (JSON)

```json
{
  "key": "value"
}
```

## Response (200 OK)

```json
{
  "id": "abc123",
  "status": "success"
}
```

## Error Codes

| Code | Meaning |
| --- | --- |
| 400 | Bad request — missing required field |
| 401 | Unauthorized — invalid token |
| 404 | Resource not found |

## Example (cURL)

```bash
curl -X POST https://api.example.com/api/v1/[path] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"key":"value"}'
```
```

---

## 8. Recommended UX Flow

### 8.1 Visual context from Figma (node 4414:131122)

The Figma screenshot confirms the following "Add New Article" layout:
- Header: "Add New Article" title + "Download Article" / "Delete Article" actions
- Left panel: "Back to Article List" breadcrumb → Document Name + Knowledge Base form row → **Markdown / Upload File** tab bar → Editor toolbar → **Two ghost buttons: `Blank` and `Use Template`** positioned inside the editor content area, just below the toolbar → Cancel / Save Changes footer
- Right sidebar: Document Details card + Tags card (no Versions card in the new-article state)

The "Blank" and "Use Template" choice buttons are rendered inside the editor pane as a starting-state prompt — they disappear once content is entered (Blank path) or a template is selected (Use Template path).

---

### 8.2 Full interaction flow

#### Step 1 — Trigger: "Add New Article"

**Where:** `page.tsx`, line 2253 — the "Add New Article" item in the `actionSections` array.

**Current state:** The `onClick` handler is missing. The item renders but does nothing.

**Required change:**

```typescript
{ 
  label: 'Add New Article', 
  icon: <PlusCircleIcon size={14} />,
  onClick: () => {
    // Create a blank Article shell with a temporary id
    const newArticle: Article = {
      id:         `new-${Date.now()}`,
      title:      '',
      kb:         '',
      folder:     '',
      tags:       [],
      modified:   new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      modifiedBy: 'Current User',
    }
    setActiveArticle(newArticle)
    setIsNewArticle(true)   // new state flag
  }
}
```

**New state in page.tsx:**

```typescript
const [isNewArticle, setIsNewArticle] = useState(false)
```

Update the DocumentView render at line 2610–2611:

```typescript
{activeArticle && (
  <DocumentView
    article={activeArticle}
    isNew={isNewArticle}
    onBack={() => { setActiveArticle(null); setIsNewArticle(false) }}
  />
)}
```

---

#### Step 2 — "New Article" state in DocumentView

**Where:** `DocumentView.tsx`

The `isNew` prop gates the initial editor body rendering. When `isNew === true` and `markdown === ''`, the editor pane renders a **starting-choice prompt** instead of the `MarkdownEditor`:

```
┌─────────────────────────────────────────────────┐
│  [FileDashed icon]  Start your article           │
│  Choose how you'd like to begin                  │
│                                                   │
│   ┌──────────────┐   ┌──────────────┐            │
│   │ FileDashed   │   │ Layout icon  │            │
│   │  Blank       │   │ Use Template │            │
│   │ Start from   │   │ Choose from  │            │
│   │ scratch      │   │ pre-built    │            │
│   │              │   │ templates    │            │
│   └──────────────┘   └──────────────┘            │
└─────────────────────────────────────────────────┘
```

Cards follow the `ClickableCard` visual language: white background, `border: 1px solid #eff1f3`, `borderRadius: 8`, hover `border-color: #689df6`. Icon uses `@phosphor-icons/react` — `FileDashedIcon` for Blank, `LayoutIcon` for Use Template (both already available in the Figma DS icon set at nodes `4018:4031` and `4039:13065`).

**Clicking Blank:** sets `setIsNewArticle(false)`, focuses the `MarkdownEditor` textarea. The prompt disappears; the full split-pane editor renders.

**Clicking Use Template:** opens `TemplatePicker` overlay.

---

#### Step 3 — Template Picker opens (TemplatePicker.tsx)

**Mount mechanism:** A new state variable `showTemplatePicker` in `DocumentView`:

```typescript
const [showTemplatePicker, setShowTemplatePicker] = useState(false)
```

Renders `{showTemplatePicker && <TemplatePicker onSelect={handleTemplateSelect} onClose={() => setShowTemplatePicker(false)} />}` at the bottom of the DocumentView return, outside the main layout div.

**TemplatePicker layout** — full-screen overlay (`position: fixed, inset: 0, zIndex: 1100`):

```
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER (white, borderBottom)                                      │
│  "Choose a Template"                              [X] Cancel            │
├──────────────────────────┬──────────────────────┬──────────────────────┤
│  LEFT SIDEBAR (240px)    │  CARD GRID (flex: 1) │  PREVIEW PANE (320px)│
│                          │                      │                      │
│  Search input            │  [search results /   │  Template name       │
│                          │   category filter]   │  ─────────────────   │
│  All Templates           │                      │  Rendered markdown   │
│  ─────────────────       │  ┌────┐ ┌────┐       │  preview (read-only) │
│  Procedures              │  │    │ │    │       │                      │
│  Support                 │  │    │ │    │       │  [Use This Template] │
│  Product                 │  └────┘ └────┘       │                      │
│  Onboarding              │  ┌────┐ ┌────┐       │                      │
│  Compliance              │  │    │ │    │       │                      │
│  Engineering             │  └────┘ └────┘       │                      │
│                          │                      │                      │
├──────────────────────────┴──────────────────────┴──────────────────────┤
│  FOOTER (white, borderTop)                                              │
│  [Cancel]                                        [Use This Template]   │
└────────────────────────────────────────────────────────────────────────┘
```

---

#### Step 4 — Search and filter

**Search input:** Positioned at the top of the left sidebar (not top of page). Filters the card grid in real-time by matching `template.name` and `template.description` (case-insensitive). Follows the same styling as the tag search in `DocumentView` lines 479–490.

**Category filter:** The sidebar lists category labels (`All Templates`, `Procedures`, `Support`, `Product`, `Onboarding`, `Compliance`, `Engineering`). Clicking a category filters the card grid. "All Templates" is selected by default. Active category has `background: #e8effd, color: #3264b8, fontWeight: 600` — matching the ToolBtn active style in `MarkdownEditor.tsx` lines 75–76.

**Combined filtering:** Search and category are AND-combined. If both a category and a search string are active, results must match both.

**Empty state:** If no templates match, show a centered message in the card grid: "No templates match your search." with a "Clear search" link.

---

#### Step 5 — Card grid

**Cards per row:** 2 columns (responsive: 1 on narrow viewports). Each card:

```
┌─────────────────────────────┐
│  [Category chip]            │
│                             │
│  Template Name              │
│  Short description (2 lines)│
└─────────────────────────────┘
```

- `width: 100%` within a 2-column CSS grid (`display: grid, gridTemplateColumns: repeat(2, 1fr), gap: 12`)
- Border: `1px solid #eff1f3`, borderRadius: `8px`, padding: `16px`, background: `#fff`
- Hover: border-color `#689df6` (matches interactive token)
- Selected: border-color `#4285f4`, background `#f0f5fe`
- Category chip: small pill in top-left of card using the category's semantic color (follows tag chip pattern from `DocumentView` lines 543–580)

**Keyboard navigation:** Cards respond to arrow keys (grid-aware: left/right moves within row, up/down moves between rows), Enter/Space to select, Escape to dismiss. The card grid container uses `role="listbox"` / `aria-label="Template options"`, each card uses `role="option"` / `aria-selected`.

---

#### Step 6 — Live preview

When a card is hovered or keyboard-focused, the right-side preview pane renders a read-only rendered version of the template's markdown using the same `ReactMarkdown` + `remarkGfm` stack already in `MarkdownEditor.tsx` (lines 395–424), with the same `proseStyles` object applied.

The preview pane is **scrollable** (`overflowY: auto`) with a sticky template name heading above it.

When no card is selected/hovered, the preview pane shows a placeholder: centered icon + "Hover over a template to preview" text in `#7a828c`.

---

#### Step 7 — Selection confirmation

The user confirms by either:
1. Clicking the "Use This Template" button in the **preview pane** (primary CTA, positioned sticky at the bottom of the preview pane)
2. Clicking the "Use This Template" button in the **footer** (same action, for users who don't look at the preview)
3. Pressing **Enter** when a card is focused

Both CTAs are disabled (opacity 0.45, `cursor: not-allowed`) until a template card is selected.

**Button label:** "Use This Template" — primary style (background `#4285f4`, color `#fff`, borderRadius 8, fontSize 13, fontWeight 600), matches the Save Changes button in `DocumentView` lines 409–428.

---

#### Step 8 — Editor population

On confirmation:

```typescript
function handleTemplateSelect(template: KBTemplate) {
  setMarkdown(template.markdown)      // replaces the empty markdown state
  setShowTemplatePicker(false)        // closes the overlay
  setIsNewArticle(false)              // dismisses the choice prompt
  // Focus the editor textarea on next frame
  requestAnimationFrame(() => {
    textareaRef.current?.focus()
  })
}
```

The MarkdownEditor renders with the template content pre-populated. The split-pane view shows the template markdown on the left and the rendered preview on the right — exactly as if the user had typed it. The author can immediately edit.

A toast notification fires: `toast.success('Template applied', { description: template.name })` — matching the pattern in `DocumentView` line 410.

---

#### Step 9 — Cancel / Back behaviour

Three exit paths from the template picker:

1. **"Cancel" button** (footer left, or header X button): closes `TemplatePicker`, returns to the starting-choice prompt (Blank / Use Template). No content is modified. `isNewArticle` remains `true`, `markdown` remains `''`.

2. **Escape key:** Same as Cancel. The existing `keydown` listener pattern from `Modal` (line 83) and `PortalDropdown` (line 171) applies directly.

3. **Clicking the backdrop** (the dimmed overlay behind the panel): Same as Cancel. Matches `Modal`'s backdrop-click behaviour at line 167.

There is **no "Blank" ↔ "Use Template" toggle** after the editor has been populated with a template. If a user wants to start fresh after applying a template, they use the toolbar's Select All + Delete, or the Cancel button in the DocumentView footer (which calls `onBack` and discards the article entirely).

---

## 9. Technical Considerations

### 9.1 Architecture decision: full-screen overlay vs. centred modal

**Option A — `<Modal size="large">` from `components/ui/modal.tsx`**

- Max width is 701px — too narrow for a 3-pane gallery layout
- Does not support the sidebar + card grid + preview layout without overriding the ModalBody padding
- Focus trap and Escape handling are already implemented — avoids reimplementation
- Suitable for simple confirmation dialogs, not gallery experiences

**Option B — Full-screen overlay (recommended)**

- Follows the exact same pattern as `BulkMoveModal.tsx` (which is itself full-screen at `zIndex: 1001`)
- Allows 3-column layout without width constraints
- Gives adequate space for the markdown preview (min ~320px) alongside the card grid
- Consistent with the rest of the sandbox's "major workflow step = full screen" convention
- Must manually implement focus trap and Escape handling — but these are < 20 lines referencing `Modal.tsx` as a template

**Verdict: Option B — custom full-screen overlay.**

---

### 9.2 State shape in DocumentView

Add to `DocumentView` props interface:

```typescript
interface DocumentViewProps {
  article: Article
  onBack:  () => void
  isNew?:  boolean   // true when creating a new article
}
```

Add to `DocumentView` internal state:

```typescript
const [showTemplatePicker, setShowTemplatePicker] = useState(false)
```

The `isNew` prop controls the initial editor body rendering. Once `markdown` is non-empty (either from Blank click or template selection), the choice prompt is replaced by `<MarkdownEditor>`. This can be expressed as:

```typescript
const showChoicePrompt = isNew && markdown === ''
```

---

### 9.3 Template data structure

```typescript
// app/sandbox/collapsible-filter/template-data.ts

export type TemplateCategory =
  | 'Procedures'
  | 'Support'
  | 'Product'
  | 'Onboarding'
  | 'Compliance'
  | 'Engineering'

export type KBTemplate = {
  id:          string
  name:        string
  category:    TemplateCategory
  description: string       // 1–2 sentences, shown in card
  markdown:    string       // full template body
}

export const KB_TEMPLATES: KBTemplate[] = [
  // 8 entries as defined in Section 7
]
```

Template data lives in a **flat constant array**, not a registry file or remote fetch. It is co-located with the sandbox feature (`app/sandbox/collapsible-filter/`) per the single-responsibility convention. No API call, no dynamic import.

---

### 9.4 Where templates live

Templates are **hardcoded constants** in `template-data.ts`. Rationale:
- This is a sandbox prototype, not a production feature
- The template content is static and not user-editable at this stage
- Avoids adding a data-fetching layer for a feature that doesn't need one (YAGNI)
- The file has no strict line limit (data / registry type, per CLAUDE.md)

If templates need to become user-editable in a future phase, the `KBTemplate` type maps cleanly to an API schema and `KB_TEMPLATES` can be replaced with a `useQuery` hook without touching any component logic.

---

### 9.5 File size compliance

| File | Estimated lines | Limit |
|---|---|---|
| `TemplatePicker.tsx` | ~220 lines | 250 (complex component) |
| `template-data.ts` | ~150 lines | No limit (data file) |
| `DocumentView.tsx` (modified) | +40 lines (~750 total) | Needs split — see note |

`DocumentView.tsx` is currently 709 lines. Adding the choice prompt UI (+40 lines) and the template picker trigger state (+5 lines) would push it to ~750 lines. This exceeds the 300-line section limit from CLAUDE.md. **Before implementing**, extract the starting-choice prompt UI into a small co-located component `ArticleStartPrompt.tsx` (~60 lines). This brings `DocumentView.tsx` net change to approximately +10 lines.

---

### 9.6 Performance

- `ReactMarkdown` is already loaded in the bundle via `MarkdownEditor.tsx` — no additional dependency
- `KB_TEMPLATES` is a static constant — no runtime cost
- The full-screen overlay is conditionally rendered (`{showTemplatePicker && <TemplatePicker …/>}`) — it is not in the DOM until triggered
- Template preview re-renders on every card hover. Since `ReactMarkdown` with `remarkGfm` is not expensive for short template strings (~300 words), no memoisation is required at this stage. If preview lag is observed, wrap the preview render in `useMemo`.

---

## 10. Missing shadcn Component — Gap Analysis

### 10.1 What's already available

| Need | Available component | Status |
|---|---|---|
| Full-screen overlay | `BulkMoveModal.tsx` pattern + `createPortal` | ✅ No new dep |
| Primary button | `components/ui/button.tsx` | ✅ Already installed |
| Text input (search) | `components/ui/input.tsx` | ✅ Already installed |
| Tabs (category filter) | `components/ui/tabs.tsx` | ✅ Already installed |
| Card selection visual | `components/ui/clickable-card.tsx` | ✅ Already installed |
| Category chip | `components/ui/chip.tsx` | ✅ Already installed |
| Markdown preview | `react-markdown` + `remark-gfm` | ✅ Already installed |
| Icons | `@phosphor-icons/react` | ✅ Already installed |
| Focus trap | Copied from `components/ui/modal.tsx` lines 100–110 | ✅ Pattern exists |

**No `@radix-ui/*` packages are currently installed.** The project uses `@base-ui/react` (MUI's Base UI) for lower-level primitives. The shadcn install uses `base-nova` style.

---

### 10.2 The gap — Scrollable regions

The `TemplatePicker` has **three independent scrollable panels**:

| Panel | Content | Overflow behaviour needed |
|---|---|---|
| Category sidebar (240px wide) | 7 category labels + search input | Vertical scroll if viewport is short |
| Card grid (flex: 1) | 8+ template cards in a 2-col grid | Vertical scroll — primary scroll region |
| Preview pane (320px wide) | Full markdown template body (~40–80 lines) | Vertical scroll — content can exceed pane height |

The existing pattern (`overflowY: 'auto'` on plain `<div>`) works functionally but renders **native OS scrollbars** — which are visually inconsistent and cannot be styled with DS tokens. In the polished 3-pane gallery layout this is especially visible as each pane has its own scrollbar, all in different OS-native styles.

---

### 10.3 Recommended missing component — `ScrollArea`

**shadcn component:** `scroll-area`  
**Underlying package:** `@radix-ui/react-scroll-area`  
**Install command:**

```bash
npx shadcn@latest add scroll-area
```

**Output file:** `components/ui/scroll-area.tsx`

#### Why this is the right choice

| Criterion | Assessment |
|---|---|
| **Stability** | `@radix-ui/react-scroll-area` has been stable since 2021 — one of the oldest Radix primitives. Zero breaking changes since v1.0. |
| **Bundle size** | ~2 KB gzipped. Negligible. |
| **Compatibility** | Works with React 19 and Next.js 16. No peer dependency conflicts with the existing stack. |
| **DS alignment** | Renders as an **overlay scrollbar** (appears on hover, floats over content) — avoids the layout-shift problem of classic scrollbars and matches the visual language of modern SaaS tools like Linear and Notion. |
| **No new paradigm** | Used as a drop-in wrapper: `<ScrollArea><div>…content…</div></ScrollArea>`. No state, no hooks. |
| **Reusability** | `BulkMoveModal.tsx` sidebar (line 154: `overflowY: 'auto'`) and the document right sidebar in `DocumentView.tsx` (line 438: `overflowY: 'auto'`) would immediately benefit from the same component. |

#### Alternatives considered and rejected

| Option | Reason rejected |
|---|---|
| `overflowY: 'auto'` (current pattern) | Renders native OS scrollbars — inconsistent across platforms, unstyled |
| `@base-ui/react` ScrollArea | Base UI does not yet have a ScrollArea component (as of v1.3) |
| Custom CSS `::-webkit-scrollbar` | Non-standard, unsupported in Firefox, requires vendor-prefix hacks |
| `rc-scrollbars` / `react-custom-scrollbars-2` | Third-party, less maintained, adds more bundle weight than Radix |

#### Usage in TemplatePicker.tsx

```tsx
import { ScrollArea } from '@/components/ui/scroll-area'

// Category sidebar
<ScrollArea className="h-full">
  {/* category buttons */}
</ScrollArea>

// Card grid
<ScrollArea className="flex-1 min-h-0">
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: 16 }}>
    {filteredTemplates.map(t => <TemplateCard key={t.id} template={t} … />)}
  </div>
</ScrollArea>

// Preview pane
<ScrollArea className="flex-1 min-h-0">
  <ReactMarkdown …>{selectedTemplate.markdown}</ReactMarkdown>
</ScrollArea>
```

#### Styling note

The default shadcn `scroll-area.tsx` output uses Tailwind classes. Since this project uses Tailwind v4 with the `@theme` block, the scrollbar track/thumb colours should be updated in `globals.css` after install:

```css
/* styles/globals.css — add to @layer base */
[data-radix-scroll-area-scrollbar] {
  --scrollbar-thumb: var(--color-border, #d9dce0);
  --scrollbar-thumb-hover: var(--color-text-secondary, #7a828c);
}
```

---

### 10.4 Updated implementation order

With `ScrollArea` added:

1. Install `ScrollArea`: `npx shadcn@latest add scroll-area`
2. Add `isNew` prop to `DocumentView` + `isNewArticle` state to `page.tsx`
3. Wire the "Add New Article" `onClick` in `page.tsx` (line 2253)
4. Create `ArticleStartPrompt.tsx` (the Blank / Use Template two-card UI)
5. Create `template-data.ts` with all 8 `KBTemplate` entries
6. Create `TemplatePicker.tsx` — use `<ScrollArea>` for all three scrollable regions
7. Connect `TemplatePicker` to `DocumentView` via `showTemplatePicker` state

---

## 11. Recommended Approach Summary

**Single recommended approach:** A **full-screen overlay** (`TemplatePicker.tsx`) with a 3-pane layout (category sidebar / card grid / preview), opened from a **two-card choice prompt** rendered in the DocumentView editor body when `isNew === true && markdown === ''`.

**Justification:**

1. **Consistent with existing patterns.** `BulkMoveModal.tsx` establishes full-screen overlays as the convention for major multi-step workflows in this sandbox. Using the same approach avoids introducing a new UI paradigm.

2. **Adequate space for the gallery.** The centred `<Modal>` at 701px max-width cannot comfortably host a category sidebar + 2-column card grid + preview pane. A full-screen overlay can.

3. **One targeted dependency.** `ReactMarkdown` and `@phosphor-icons/react` are already bundled. The only new addition is `@radix-ui/react-scroll-area` via `npx shadcn@latest add scroll-area` — 2 KB gzipped, stable since 2021, no peer conflicts with the current stack. All other needs are covered by existing components (see Section 10).

4. **Two-step flow reduces cognitive load.** Inspired by Intercom's two-card inline picker: the user first sees a simple "Blank vs. Use Template" choice (low cognitive overhead), and only then enters the full gallery. This avoids dropping users directly into a large modal on article creation.

5. **Direct state injection.** Populating the editor is a single `setMarkdown(template.markdown)` call — no special MarkdownEditor API is needed. The editor's `value` / `onChange` contract is unchanged.

6. **Matches the Figma specification exactly.** The Figma node `4414:131122` shows the "Blank" and "Use Template" buttons as ghost/icon-text buttons inside the editor pane, confirming the two-card starting prompt approach is the intended design.

**Implementation order:**

1. Add `isNew` prop to `DocumentView` + `isNewArticle` state to `page.tsx`
2. Wire the "Add New Article" `onClick` in `page.tsx` (line 2253)
3. Create `ArticleStartPrompt.tsx` (the Blank / Use Template two-card UI)
4. Create `template-data.ts` with all 8 `KBTemplate` entries
5. Create `TemplatePicker.tsx` (full overlay: sidebar, grid, preview)
6. Connect `TemplatePicker` to `DocumentView` via `showTemplatePicker` state

---

*Sources consulted:*
- *[Modal Pattern | UX Patterns for Developers](https://uxpatterns.dev/patterns/content-management/modal)*
- *[React Aria Accessibility](https://react-aria.adobe.com/)*
- *[Accessibility – React Aria](https://react-spectrum.adobe.com/react-aria/accessibility.html)*
- *[PatternFly Card Accessibility](https://www.patternfly.org/components/card/accessibility/)*
- *[6 Knowledge Base Article Templates | Pylon](https://www.usepylon.com/blog/6-knowledge-base-article-templates)*
- *[8 Knowledge Base Article Templates | Zendesk](https://www.zendesk.com/blog/knowledge-base-article-template/)*
- *[Streamline Support: 4 Essential KB Article Templates | Swifteq](https://swifteq.com/post/knowledge-base-article-templates)*
- *[A brand new gallery for Notion templates — Notion Blog](https://www.notion.com/blog/new-template-gallery)*
- *[How to Build Keyboard-Navigable Components in React | OneUptime](https://oneuptime.com/blog/post/2026-01-15-keyboard-navigable-components-react/view)*
