---
name: writing-tailwind
description: Tailwind CSS v4 patterns — cn/clsx/tailwind-merge composition, mobile-first responsive, token-driven colors, anti-patterns. Skip exotic v4 syntax unless the user asks for it.
when_to_use: Triggers on edits to .tsx/.jsx/.css files when Tailwind classes are touched. Covers cn import path, conditional class composition, mobile-first breakpoints, color/spacing token rules, layer ordering with non-Tailwind CSS.
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.css"
---

# Tailwind CSS v4

> **Applicability.** If this project does not declare Tailwind v4 (no `@import "tailwindcss"` in a `.css` file, no `@theme {}` block), the patterns below do not apply — return without acting on them.

> **Working in legacy/hybrid codebases.** Tailwind here usually coexists with SCSS Modules and a UI kit (Kendo, MUI, etc.).
> Don't mass-migrate existing styles — migrate a file when you're already touching it for another reason.
> When v4 syntax recall is needed mid-task, prefer `mcp__context7__query-docs` with `library: tailwindcss`
> over guessing from memory: v3 → v4 changed enough syntax that training data misleads.

## `cn` composition

The project exposes a `cn` helper at `@/utils` built on `tailwind-merge` + `clsx`.
Use it for every `className` that combines literals + conditionals or accepts `className` from props:

```tsx
import { cn } from '@/utils';

<div className={cn('rounded-md p-4', isActive && 'bg-primary', className)} />
```

`tailwind-merge` resolves conflicting utilities — later args win. So `cn('p-2', condition && 'p-4')`
yields `p-4` when condition is truthy, not both. This is exactly the property you want for prop-driven overrides.

Some projects extend the helper further; check `cn.ts` before assuming the vanilla shape:

- **`cn.withClassNames(styles)`** — if exposed, bind a SCSS module's `styles` object once and pass
  class **names** as plain strings. Names resolve against the module while Tailwind utilities still
  pass through `tailwind-merge`. This is the canonical Tailwind ↔ SCSS-Modules bridge during
  migration. Don't reach for raw `classnames/bind` if this helper exists.
- **Custom font-size auto-registration** — if `cn.ts` builds its `extendTailwindMerge` config by
  parsing `--text-*` tokens from the project's `@theme` file at build time (via `?raw` import),
  adding a new `--text-NAME` to `@theme` is enough — no change to `cn.ts` is needed. This avoids
  ambiguity between custom font-size utilities and the shared `text-*` color utility namespace.

## Mobile-first responsive

Unprefixed utilities = mobile default. Add `md:`/`lg:`/`xl:` to override **upward**, not downward.
Avoid `max-*` prefixes — desktop-first inverts the intuition and quickly gets unreadable.

```tsx
// ✅ Mobile-first
<div className='flex-col md:flex-row' />
<div className='divide-y md:divide-y-0 md:gap-2' />

// ❌ Desktop-first
<div className='flex-row max-md:flex-col' />
```

## Tokens over arbitrary values

Never `text-[#hex]` / `bg-[#hex]` / `w-[347px]`. Two acceptable sources:

1. **Tailwind scale** — `w-80`, `text-sm`, `gap-2`, `rounded-md`.
2. **Project theme tokens** declared in the project's `@theme {}` block (typically a `src/styles/*.css` file).
   Every `--color-NAME` and `--text-NAME` automatically becomes utilities: `bg-NAME`, `text-NAME`, `border-NAME`.

When a new color is genuinely needed: search existing tokens first; if the RGB delta to an existing one is ≤ 5, reuse.
Only add a new semantic token (`--color-warning-strong`, not `--color-orange-3`) to the theme file when no close match exists.

## Layout spacing belongs to the parent

`gap` / `space-*` on the flex/grid **parent**, never `mt-*`/`mb-*` on each child. Keeps children self-contained
and reusable. (Also a `writing-react` rule — kept in sync.)

## Coexistence with non-Tailwind CSS

Common pattern in migration-stage codebases: `@layer tailwind-base, tailwind-utilities;` declared up
front, then `@layer tailwind-base { @import 'tailwindcss'; }`. This nests Tailwind in a lower-priority
layer so **unlayered SCSS overrides Tailwind by default** — intentional during a SCSS→Tailwind
migration so legacy files keep winning without per-file ordering. Check the project's main Tailwind
CSS file before assuming utility cascade behavior.

Two consequences:

- Compose via `cn` rather than relying on later utilities overriding earlier ones via cascade.
- When a legacy override (Kendo theme, SCSS module) needs to win against a Tailwind utility,
  apply `!important` only at the **exact** conflicting property in the legacy file — don't blanket
  the file.

Tailwind v4 preflight reset reference (use the table to decide when `!important` is even needed):

| Preflight resets — `!important` likely needed | Preflight ignores — never needs `!important` |
| --------------------------------------------- | -------------------------------------------- |
| `border`, `padding`, `margin`, `gap`          | `overflow`, `position`, `width`              |
| `background-color`, `line-height`             | `outline`, `box-shadow`                      |

## `@theme` and `@utility` (v4 syntax)

Project-wide design tokens live inside `@theme { ... }` in a `.css` file. New project-wide utilities use
`@utility NAME { ... }`, **not** `@layer components`:

```css
@theme {
  --color-warning: #d97706;
  --spacing-toolbar: 56px;
}

@utility skeleton-bars {
  &::before { /* ... */ }
}
```

## ESLint: `eslint-plugin-better-tailwindcss`

When enabled, `no-conflicting-classes` and `no-deprecated-classes` are real signal — fix them.
`no-unknown-classes` is commonly off in hybrid SCSS/Kendo codebases (Kendo `k-*` and SCSS-module class names
trip it up). **Class ordering is owned by `prettier-plugin-tailwindcss`** — don't reorder by hand and don't
configure a second sorter.

## Don't reach for CVA pre-emptively

`class-variance-authority` is fine when a component has a genuine N×M variant matrix
(size × variant × state). For everything else, `cn` + conditional literals is shorter and traces better.
Don't introduce `cva` "in case we add variants later" — YAGNI.

## Anti-patterns

```tsx
// ❌ Hex literals in arbitrary values
<div className='border-[#edebe9] text-[#323130]' />
// ✅ Use semantic tokens
<div className='border-border-light text-body' />

// ❌ Arbitrary pixel sizes for static layout
<div className='w-[347px] h-[219px] m-[13px]' />
// ✅ Use the scale
<div className='w-80 h-56 m-4' />

// ❌ Multiple bare conflicting classes
<div className='bg-blue-500 bg-red-500' />
// ✅ Let cn resolve them
<div className={cn('bg-blue-500', error && 'bg-red-500')} />

// ❌ Inline style={{ ... }} for things a utility already covers
<div style={{ marginTop: 8, color: '#605e5c' }} />
// ✅
<div className='mt-2 text-muted' />
```

## V4 feature surface (awareness, not promotion)

Tailwind v4 added: container queries (`@container` + `@xs/@sm/@md/@lg`), 3D transforms
(`perspective-*`, `rotate-x/y/z-*`, `transform-3d`), text-shadow utilities, advanced gradients
(`bg-linear-45`, `bg-radial-*`, `bg-conic-*`), masks (`mask-linear-*`, `mask-radial-*`),
and variants `starting:`, `not-*`, `data-[attr=value]:`. Reach for these when the design genuinely
needs them — don't introduce them just because they're new. Look up exact syntax via Context7
(`mcp__context7__query-docs` → `library: tailwindcss`) rather than recalling from training data,
since v4 syntax differs from v3 in non-obvious places.
