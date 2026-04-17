// ── Template registry ──────────────────────────────────────────────────────────

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
  description: string
  markdown:    string
}

// Helper for code fences inside template literals
const F = '```'

export const KB_TEMPLATES: KBTemplate[] = [
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    category: 'Procedures',
    description: 'Step-by-step instructions for completing a specific product action.',
    markdown: `# How To: [Task Name]

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
- [Link to related article]`,
  },

  {
    id: 'troubleshooting',
    name: 'Troubleshooting Guide',
    category: 'Support',
    description: 'Diagnostic steps for resolving a known product issue.',
    markdown: `# Troubleshooting: [Issue Name]

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
Contact support at [email] or open a ticket at [link].`,
  },

  {
    id: 'feature-overview',
    name: 'Feature Overview',
    category: 'Product',
    description: 'Explain what a product feature does, who it\'s for, and how to use it.',
    markdown: `# [Feature Name] — Overview

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
- [Link]`,
  },

  {
    id: 'faq',
    name: 'FAQ Article',
    category: 'Support',
    description: 'Answers to common, repetitive questions about a topic or feature.',
    markdown: `# FAQ: [Topic Name]

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

*Last updated: [Date] — [Author]*`,
  },

  {
    id: 'getting-started',
    name: 'Getting Started Guide',
    category: 'Onboarding',
    description: 'First-time setup guide for new users or newly provisioned instances.',
    markdown: `# Getting Started with [Product / Feature]

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
- [Link to video tutorial]`,
  },

  {
    id: 'release-notes',
    name: 'Release Notes',
    category: 'Product',
    description: 'Changelog-style article documenting new features, fixes, and known issues.',
    markdown: `# Release Notes — v[X.Y.Z] ([Date])

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

*See the full changelog at [link].*`,
  },

  {
    id: 'policy',
    name: 'Policy & Compliance Article',
    category: 'Compliance',
    description: 'Internal or external policy document with defined scope, rules, and references.',
    markdown: `# [Policy Name]

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
| 1.0 | [Date] | [Author] | Initial draft |`,
  },

  {
    id: 'api-reference',
    name: 'API Reference Article',
    category: 'Engineering',
    description: 'Developer-facing reference for a single API endpoint or SDK method.',
    markdown: `# [Endpoint Name] — API Reference

**Method:** \`[GET / POST / PUT / DELETE]\`
**Endpoint:** \`/api/v1/[path]\`
**Auth required:** Yes — Bearer token

## Description
What this endpoint does and when to use it.

## Request Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| \`param1\` | string | Yes | Description |
| \`param2\` | integer | No | Description |

## Request Body (JSON)

${F}json
{
  "key": "value"
}
${F}

## Response (200 OK)

${F}json
{
  "id": "abc123",
  "status": "success"
}
${F}

## Error Codes

| Code | Meaning |
| --- | --- |
| 400 | Bad request — missing required field |
| 401 | Unauthorized — invalid token |
| 404 | Resource not found |

## Example (cURL)

${F}bash
curl -X POST https://api.example.com/api/v1/[path] \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"key":"value"}'
${F}`,
  },
]

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Procedures', 'Support', 'Product', 'Onboarding', 'Compliance', 'Engineering',
]

export const CATEGORY_COLORS: Record<TemplateCategory, { bg: string; text: string }> = {
  Procedures:  { bg: '#ddf4d2', text: '#1a6b1a' },
  Support:     { bg: '#fbc6d4', text: '#8b1a2a' },
  Product:     { bg: '#d6e2f5', text: '#1a3d6b' },
  Onboarding:  { bg: '#fbeed8', text: '#7a4a00' },
  Compliance:  { bg: '#a4beea', text: '#1a3d6b' },
  Engineering: { bg: '#e8d6f5', text: '#5a1a6b' },
}
