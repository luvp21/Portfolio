# 009 — Tighten the experience-timeline entrance stagger

- **Status**: DONE
- **Commit**: 5c5927c
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file, trivial

## Problem

```tsx
// components/experience-timeline.tsx:11-16 — current
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: exp.id * 0.1 }}
          className="py-1"
        >
```

Each experience entry staggers in `exp.id * 0.1` seconds (100ms) after the
previous one. The audit playbook's recommended stagger band for group
entrances is 30–80ms — 100ms sits above that band and, since `EXPERIENCE`
entries use sequential integer `id`s starting at 1 (confirmed in
`lib/data.tsx`), a list of even 4-5 entries takes 400-500ms to fully settle,
noticeably slower than it needs to feel for a group of small text blocks.

## Target

```tsx
// target
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: exp.id * 0.05 }}
          className="py-1"
        >
```

`0.05` (50ms) sits in the middle of the recommended 30-80ms band.

## Repo conventions to follow

- No existing stagger token exists elsewhere in the codebase to match
  against — this is the only staggered list entrance in the app, so this
  plan just brings its existing `exp.id * <factor>` pattern in line with
  the audit's band rather than introducing new infrastructure.

## Steps

1. In `components/experience-timeline.tsx:15`, change
   `transition={{ delay: exp.id * 0.1 }}` to
   `transition={{ delay: exp.id * 0.05 }}`.

## Boundaries

- Do NOT change the `y: 20` distance, the `opacity` values, or add a
  `duration` — only the stagger multiplier.
- Do NOT touch `experience-timeline.tsx:37-39` (removed by plan
  `005-experience-timeline-height-animation.md`) or apply this plan's edit
  to any other file — this is the only staggered list in the app.
- If plan `002-reduced-motion-support.md` or
  `004-transform-string-conversion.md` has already modified this exact
  line (e.g. wrapping the delay in a `shouldReduceMotion ? 0 : ...`
  ternary, or converting `y` to a `transform` string on the same
  `motion.div`), apply this plan's `0.1 → 0.05` change to whichever
  expression currently holds the `0.1` multiplier rather than reverting
  their edit — this plan only concerns the numeric stagger factor, not the
  surrounding structure.

## Verification

- **Mechanical**: none needed beyond a visual check — pure numeric constant
  change.
- **Feel check**: open the Experience panel and watch the entries fade in:
  confirm they now cascade in noticeably faster/tighter than before,
  finishing the whole list roughly twice as fast, while still reading as a
  deliberate stagger (not simultaneous).
- **Done when**: the stagger delay multiplier is `0.05` and the list still
  visibly staggers rather than appearing all at once.
