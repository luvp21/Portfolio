# 008 — Trim the panel-open backdrop dim duration to the modal/scrim budget

- **Status**: DONE
- **Commit**: 5c5927c
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file, trivial

## Problem

```tsx
// components/pixelated-banner.tsx:159-165 — current
      <div
        className={cn(
          "absolute inset-0 pointer-events-none backdrop-blur-sm bg-background/50 transition-opacity duration-700 ease-in-out",
          isBlurred ? "opacity-100" : "opacity-0"
        )}
      />
```

This overlay dims/blurs the banner behind the desktop canvas whenever any
panel is open (`isBlurred` is set from `PortfolioInterface.tsx` based on
whether any panel is active). It functions as a modal-adjacent scrim. The
audit playbook's duration budget for that class of UI ("Modals, drawers")
is 200–500ms; `duration-700` runs past the top of that band for something
that fires every time a panel opens or closes — a moderately frequent
interaction, not a rare/explanatory one.

## Target

```tsx
// target
      <div
        className={cn(
          "absolute inset-0 pointer-events-none backdrop-blur-sm bg-background/50 transition-opacity duration-500 ease-in-out",
          isBlurred ? "opacity-100" : "opacity-0"
        )}
      />
```

## Repo conventions to follow

- Tailwind's built-in `duration-{n}` utilities are used throughout this
  codebase for CSS transitions (e.g. `project-card.tsx`'s
  `duration-300`) — `duration-500` follows that same convention, just
  picking the value at the top of the audit's modal/drawer budget rather
  than introducing a new duration token for a single site.

## Steps

1. In `components/pixelated-banner.tsx:162`, change `duration-700` to
   `duration-500`.

## Boundaries

- Do NOT change `ease-in-out`, `backdrop-blur-sm`, or `bg-background/50` —
  only the duration value.
- Do NOT touch the `isBlurred` prop logic in
  `components/PortfolioInterface.tsx` — this plan is a pure CSS timing
  change.

## Verification

- **Mechanical**: none needed beyond a visual check — this is a Tailwind
  class value change with no logic touched.
- **Feel check**: open and close a panel (e.g. click "About" in the dock)
  a few times and confirm the banner dim/blur fades in and out noticeably
  faster than before, but still smoothly (no abrupt snap) — 500ms is still
  a deliberate, visible fade, just tighter than 700ms.
- **Done when**: `pixelated-banner.tsx` uses `duration-500` and the fade
  still reads as smooth, not abrupt.
