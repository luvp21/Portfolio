# 001 — Remove open/close animation from the command palette

- **Status**: DONE
- **Commit**: 5c5927c
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 1 file, small

## Problem

`components/command-bar.tsx` is a command palette toggled via `Ctrl+K` or the
`/` key (bound in `components/PortfolioInterface.tsx`) — a keyboard-driven,
high-frequency action. It currently animates open/close with a backdrop fade
and a spring-driven slide-in panel:

```tsx
// components/command-bar.tsx:448-465 — current
return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-end bg-black/50 backdrop-blur-sm rounded-lg py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="w-full max-w-sm h-full bg-background shadow-lg rounded-lg overflow-hidden flex flex-col border"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
```

Per the audit playbook's frequency rule: "100+ times/day (keyboard shortcuts,
command palette toggle) → No animation. Ever." Raycast's command palette is
cited as the reference example — it has none. Every time this user opens the
palette with a keyboard shortcut, they wait through a spring settle before
the UI is visually stable, which is the opposite of what a keyboard-driven
tool should feel like (even though the input already autofocuses immediately
via the separate `useEffect` at `command-bar.tsx:90-96`, independent of the
animation).

## Target

No animation. The palette mounts/unmounts instantly with plain conditional
rendering — no `AnimatePresence`, no `motion.div`, no spring, no slide.

```tsx
// components/command-bar.tsx:448-465 — target
return (
    open && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-end bg-black/50 backdrop-blur-sm rounded-lg py-4"
          onClick={() => onOpenChange(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-background shadow-lg rounded-lg overflow-hidden flex flex-col border"
            onClick={(e) => e.stopPropagation()}
          >
```

The closing tags at the bottom of the component (currently `</motion.div>`,
`</motion.div>`, `</AnimatePresence>`) must be updated to match (`</div>`,
`</div>`, and the `AnimatePresence` wrapper removed).

## Repo conventions to follow

- This repo has no shared "no-animation" convention to imitate — this plan
  establishes the pattern of plain conditional rendering for 100+/day actions.
  `components/dock.tsx` and `components/panel.tsx` are NOT exemplars here —
  their entrance animations are for occasional actions (opening a panel),
  not a keyboard shortcut fired dozens of times per session.

## Steps

1. In `components/command-bar.tsx:26`, remove `motion, AnimatePresence` from
   the `framer-motion` import. Confirm via grep that `motion` and
   `AnimatePresence` are not used anywhere else in this file before removing
   the import (they are only used in the two `return` blocks touched here).
2. Replace the `return` statement at `components/command-bar.tsx:448-465`
   with the target code above: drop `<AnimatePresence>`, change both
   `<motion.div ...>` to `<div ...>` with only their `className` and
   `onClick` props kept (drop `initial`, `animate`, `exit`, `transition`).
3. Update the matching closing tags at the end of the returned JSX
   (`components/command-bar.tsx:503-506`) from `</motion.div>` /
   `</motion.div>` / `</AnimatePresence>` to `</div>` / `</div>` (remove the
   `AnimatePresence` closing tag entirely, and remove the now-unneeded outer
   `open &&` wrapping via the ternary/`&&` shown in the target — i.e. the
   component returns `open && (...)` directly instead of wrapping children in
   `<AnimatePresence>`).

## Boundaries

- Do NOT touch the backdrop's `bg-black/50 backdrop-blur-sm` styling — only
  the animation props and wrapper components.
- Do NOT change the keyboard handling, fuzzy search, or command execution
  logic anywhere else in this file.
- Do NOT add a CSS transition as a "compromise" — the audit rule for this
  frequency tier is literally zero animation, not a shorter one.
- Out of scope: `components/PortfolioInterface.tsx`'s keyboard binding logic.

## Verification

- **Mechanical**: `npx tsc --noEmit` — expect no new errors (confirms no
  leftover references to `motion`/`AnimatePresence` and no unused-import
  lint failure).
- **Feel check**: run the dev server, press `Ctrl+K` (or `/` outside a text
  field) repeatedly in quick succession:
  - The palette must appear and disappear with no fade/slide — instantly
    present or instantly gone on every toggle, with no visible "settle."
  - The input must still be focused immediately after opening (unchanged
    behavior from `command-bar.tsx:90-96`).
  - Clicking the backdrop still closes the palette; clicking inside the
    panel does not (the `onClick`/`stopPropagation` behavior is unchanged).
- **Done when**: no `motion`/`AnimatePresence` usage remains in
  `command-bar.tsx`, and opening/closing via keyboard shortcut is visually
  instantaneous.
