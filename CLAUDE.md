@AGENTS.md

# Development Guidelines & Best Practices

**Purpose:** Keep code clean, maintainable, and context-efficient  
**Status:** Active — reference this document for ALL development

---

## Core Principles

### 1. KISS — Keep It Simple, Stupid

- Choose the simplest solution that works
- Avoid complex abstractions unless absolutely necessary
- If you can't explain it in one sentence, it's too complex

### 2. DRY — Don't Repeat Yourself

- Reuse existing components before creating new ones
- Extract repeated logic into utilities
- But: don't abstract prematurely (see Rule of Three below)

### 3. YAGNI — You Aren't Gonna Need It

- Only build what's in the specifications
- No "future-proofing" or "just in case" code
- Features are added when needed, not anticipated

### 4. Single Responsibility Principle

- One file = one purpose
- One function = one task
- One component = one UI element

---

## Pre-Development Checklist

Before writing ANY code:

```
□ Does this already exist in the project?
   → Check /components, /lib first

□ Can I use a built-in Next.js feature?
   → Routing, metadata, image optimization

□ Can I use a Tailwind utility class?
   → Before writing custom CSS

□ Does this library exist in the stack?
   → Check package.json before adding a new dependency

□ Is this in the specifications?
   → Don't add features not requested

□ Will this file do ONE thing well?
   → If no, split it up
```

---

## Anti-Patterns to Avoid

### Over-Engineering

**DON'T:**

```typescript
// Unnecessary abstractions
const ButtonFactory = {
  createPrimaryButton: (props) => <Button variant="primary" {...props} />,
  createSecondaryButton: (props) => <Button variant="secondary" {...props} />,
}

// Complex state management for simple data
const [state, dispatch] = useReducer(complexReducer, initialState)
```

**DO:**

```typescript
<Button variant="primary">Click Me</Button>

const [isOpen, setIsOpen] = useState(false)
```

### Reinventing the Wheel

**DON'T:**

```typescript
// Custom debounce when lodash exists
function myDebounce(fn, delay) {
  /* ... */
}

// Custom button when <Button> exists
function MySpecialButton() {
  /* ... */
}
```

**DO:**

```typescript
import { debounce } from 'lodash'

<Button className="special-styling">Click Me</Button>
```

### Code Repetition

**DON'T:**

```typescript
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
```

**DO:**

```typescript
const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

<motion.div variants={fadeUpVariants}>
```

### Multiple Responsibilities Per File

**DON'T:**

```typescript
// components/Dashboard.tsx (1000+ lines)
export function Dashboard() {
  // Header logic
  // Table logic
  // Filter logic
  // Chart logic — all in one file!
}
```

**DO:**

```typescript
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/ds/DataTable";
import { FilterBar } from "@/components/ds/FilterBar";
import { Chart } from "@/components/ds/Chart";
```

---

## Component Development Rules

### Rule 1: Check Before You Create

```
1. Search existing components in /components/ui and /components/ds
2. Check if Next.js has it built-in
3. Check if Tailwind can do it
4. Check if shadcn/ui has it (components.json)
5. ONLY THEN create a new one
```

### Rule 2: Component Size Limits

Recommended maximum lines per component file: **250–300**

If a component exceeds 300 lines:

- Split into smaller components
- Extract logic into custom hooks
- Move data to separate files

Guidelines by type:

- Simple UI (Button, Badge, Chip): 50–100 lines
- Complex components (Form, Modal, Table): 150–250 lines
- Layout / page-level sections: 200–300 lines
- Page files: up to 400+ if just composing components

### Rule 3: Component Structure

```typescript
// 1. Imports (grouped — see Rule 8)
// 2. Types/Interfaces
// 3. Component (single responsibility)
// 4. Named exports preferred
```

### Rule 4: The Rule of Three

Don't abstract until you've repeated something **three times**.

```typescript
// First time: write it inline
// Second time: copy-paste is OK
// Third time: NOW extract to a component or utility
```

---

## File Organization Rules

### Rule 5: File Naming Convention

```
Components:     PascalCase.tsx        (Button.tsx, DataTable.tsx)
Utils:          camelCase.ts          (formatDate.ts)
Data:           kebab-case.ts         (component-registry.ts)
Types:          kebab-case.types.ts   (button.types.ts)
Hooks:          use-*.ts              (use-dark-mode.ts)
```

### Rule 6: Maximum Files Per Directory

No more than **10 files** in a single directory. If you exceed 10, create subdirectories by feature.

### Rule 7: File Size Limits

```
Component (Simple):    < 100 lines
Component (Complex):   < 250 lines
Component (Section):   < 300 lines
Page:                  < 500 lines
Utility:               < 100 lines
Data / Registry:       No strict limit (content-heavy is OK)
Hook:                  < 100 lines
```

### Rule 8: Import Organization

```typescript
// 1. React and Next.js
import React from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

// 3. Internal components
import { Button } from "@/components/ui/button";

// 4. Internal utilities / lib
import { cn } from "@/lib/utils";

// 5. Types (use `import type`)
import type { ComponentProps } from "@/lib/types";
```

---

## Styling Rules

### Rule 9: Tailwind First, CSS Last

```
1. Use Tailwind utility classes
2. Use CSS vars defined in globals.css (@theme block)
3. Use CSS modules only if Tailwind can't do it
4. NEVER use inline styles (except for truly dynamic values)
```

### Rule 10: No Magic Numbers in Styles

**DON'T:** `<div className="mt-[73px]">`

**DO:** Define a named token in `globals.css` or `tailwind.config.ts`, then use it.

---

## Utility Function Rules

### Rule 11: Check lib/ First

```
1. Check if it exists in /lib/utils
2. Check if lodash has it
3. Check if Next.js has it
4. ONLY THEN create it
```

### Rule 12: One Function = One File

Closely related functions (max 3) may share a file; otherwise split.

### Rule 13: Pure Functions Preferred

Utility functions should be pure — no side effects, no logging, no localStorage access.

---

## TypeScript Rules

### Rule 14: No Implicit `any`

```typescript
// BAD
function processData(data) {
  return data.map((item) => item.value);
}

// GOOD
function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}
```

### Rule 15: All Props Must Be Typed

```typescript
interface ButtonProps {
  variant: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}
```

### Rule 16: Use Type Imports

```typescript
// GOOD
import type { CaseStudy } from "@/lib/types";
```

---

## Animation Rules

### Rule 17: Shared Animation Variants

Create reusable variants rather than repeating inline configs:

```typescript
// lib/animations/variants.ts
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
```

### Rule 18: Performance-First Animations

Only animate `transform` and `opacity` — these are GPU-accelerated and don't cause reflow.

---

## Performance Rules

### Rule 19: Image Optimization

Always use the Next.js `<Image>` component, never a raw `<img>`.

### Rule 20: Lazy Load Below-Fold Components

```typescript
const HeavyChart = dynamic(() => import("@/components/ds/HeavyChart"));
```

---

## Comments & Documentation

### Rule 21: Code Should Be Self-Documenting

Comment **why**, not what. Only add a comment where the logic isn't self-evident.

```typescript
// Apply discount before tax calculation (business requirement)
return price * (1 - discount);
```

### Rule 22: TODO Format

```typescript
// TODO(rodrigo): Add error handling for edge case
// FIXME(rodrigo): Animation stutters on mobile
```

---

## Git Rules

### Rule 23: Commit Message Format

```
feat: add collapsible filter to sidebar
fix: resolve playground not updating on prop change
refactor: extract PropControls into smaller components
docs: update button MDX with new variants
style: format with Prettier
perf: lazy-load chart components
```

### Rule 24: Commit Size

Each commit should do **one thing**, be reversible, build successfully, and pass TypeScript checks.

**Never include `Co-Authored-By` trailers in commit messages.**

---

## Red Flags Checklist

Stop and refactor if you see:

```
□ Simple component over 150 lines
□ Complex component over 300 lines
□ Function over 50 lines
□ Repeated code 3+ times
□ 4+ levels of nesting
□ Any 'any' types
□ Commented-out code
□ Unused imports
□ Magic numbers
□ Unclear variable names (x, data, temp, etc.)
□ Multiple responsibilities in one file
```

---

## Pre-Commit Checklist

```
□ TypeScript compiles without errors
□ No console.log() statements left
□ No commented-out code
□ Imports are organized
□ File sizes within limits
□ Follows component structure
□ No repeated code
□ No over-engineering
□ Follows specifications
□ No Co-Authored-By trailer in commit message
```

---

## Golden Rules

1. Simple beats complex
2. Reuse before creating
3. One file, one purpose
4. Small files, clear names
5. Tailwind first, CSS last
6. Type everything
7. Performance matters
8. Test as you build
9. Git commits are small and focused
10. Context window is precious
