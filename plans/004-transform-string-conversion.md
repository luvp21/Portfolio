# 004 — Convert Framer Motion x/y/scale shorthands to `transform` strings

- **Status**: DONE
- **Commit**: 5c5927c
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 7 files, mechanical (same substitution pattern repeated)

## Problem

Nearly every entrance animation in the app uses Framer Motion's `x`/`y`/
`scale` numeric shorthand props instead of animating the `transform` CSS
property directly as a string. Per the audit playbook, the shorthand props
are not hardware-accelerated and run on the main thread; the fix is to
animate the full `transform` string instead (e.g.
`animate={{ transform: "translateY(20px)" }}`).

Confirmed sites (file:line → current shorthand):

- `components/profile-card.tsx:12-20` — `y: 20 → 0`, `x: -20 → 0`
- `components/achievements-card.tsx:35-37` — `y: 20 → 0`
- `components/experience-timeline.tsx:13-15` — `y: 20 → 0` (outer block only)
- `components/discord-presence.tsx:160-163` — `y: 8 → 0`
- `components/coding-stats-panel.tsx:181-183` — `y: 8 → 0`
- `components/dock.tsx:37-39` — `y: 20 → 0`
- `components/Sandbox.tsx:525-528` (star) and `:702-704` (modal) —
  `scale: 0 → 1` / `0.9 → 1`, plus `whileHover`/`whileTap` scale

## Target

### `components/profile-card.tsx`

```tsx
// current — :10-21
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex gap-1 sm:gap-6 mt-6 lg:px-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
```

```tsx
// target
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, transform: "translateY(20px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex gap-1 sm:gap-6 mt-6 lg:px-4"
        initial={{ opacity: 0, transform: "translateX(-20px)" }}
        animate={{ opacity: 1, transform: "translateX(0px)" }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
```

### `components/achievements-card.tsx`

```tsx
// current — :32-38
          <motion.div
            key={achievement.id}
            className="px-2 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
```

```tsx
// target
          <motion.div
            key={achievement.id}
            className="px-2 flex items-center gap-3"
            initial={{ opacity: 0, transform: "translateY(20px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.3 }}
          >
```

### `components/experience-timeline.tsx` (outer block only — see Boundaries)

```tsx
// current — :11-17
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: exp.id * 0.1 }}
          className="py-1"
        >
```

```tsx
// target
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, transform: "translateY(20px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ delay: exp.id * 0.1 }}
          className="py-1"
        >
```

### `components/discord-presence.tsx`

```tsx
// current — :158-165
            <motion.div
                key="discord-presence"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full pointer-events-auto select-none overflow-hidden"
            >
```

```tsx
// target
            <motion.div
                key="discord-presence"
                initial={{ opacity: 0, transform: "translateY(8px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                exit={{ opacity: 0, transform: "translateY(8px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full pointer-events-auto select-none overflow-hidden"
            >
```

### `components/coding-stats-panel.tsx`

```tsx
// current — :180-185
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full bg-card/80 pointer-events-auto select-none flex px-4"
        >
```

```tsx
// target
        <motion.div
            initial={{ opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full bg-card/80 pointer-events-auto select-none flex px-4"
        >
```

### `components/dock.tsx`

```tsx
// current — :35-40
    <motion.div
      className=" left-0 right-0 mx-auto z-[9999] flex justify-center"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
```

```tsx
// target
    <motion.div
      className=" left-0 right-0 mx-auto z-[9999] flex justify-center"
      initial={{ opacity: 0, transform: "translateY(20px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
```

### `components/Sandbox.tsx` — star pop-in (all four motion props together)

```tsx
// current — :514-528
          <motion.div
            key={msg.id}
            className="absolute z-10 cursor-pointer"
            style={{ left: `${normalizedPos.x}px`, top: `${normalizedPos.y}px` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: isMobile ? 1.1 : 1.2 }} // Smaller hover scale on mobile
            whileTap={{ scale: 0.95 }} // Add tap feedback for mobile
```

```tsx
// target
          <motion.div
            key={msg.id}
            className="absolute z-10 cursor-pointer"
            style={{ left: `${normalizedPos.x}px`, top: `${normalizedPos.y}px` }}
            initial={{ transform: "scale(0)" }}
            animate={{ transform: "scale(1)" }}
            whileHover={{ transform: isMobile ? "scale(1.1)" : "scale(1.2)" }} // Smaller hover scale on mobile
            whileTap={{ transform: "scale(0.95)" }} // Add tap feedback for mobile
```

All four props on this element (`initial`, `animate`, `whileHover`,
`whileTap`) must use the `transform` string form together — mixing the
shorthand and string forms on the same motion component causes Framer Motion
to resolve them inconsistently.

### `components/Sandbox.tsx` — add-message modal

```tsx
// current — :700-705
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-start justify-center bg-black/70 backdrop-blur-sm z-40 p-4 overflow-y-auto hide-scrollbar"
          >
```

```tsx
// target
          <motion.div
            initial={{ opacity: 0, transform: "scale(0.9)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0, transform: "scale(0.9)" }}
            className="absolute inset-0 flex items-start justify-center bg-black/70 backdrop-blur-sm z-40 p-4 overflow-y-auto hide-scrollbar"
          >
```

## Repo conventions to follow

- No existing `transform`-string usage exists in this repo to imitate — this
  plan establishes the pattern. Keep the exact `translateX(...)`/
  `translateY(...)`/`scale(...)` string formats shown above (matching units:
  always `px` for translate, unitless for scale) so future additions stay
  consistent.

## Steps

1. `components/profile-card.tsx` — apply the diff shown above.
2. `components/achievements-card.tsx` — apply the diff shown above.
3. `components/experience-timeline.tsx` — apply the diff shown above (outer
   block only, `:11-17`).
4. `components/discord-presence.tsx` — apply the diff shown above.
5. `components/coding-stats-panel.tsx` — apply the diff shown above.
6. `components/dock.tsx` — apply the diff shown above.
7. `components/Sandbox.tsx` — apply both diffs shown above (star pop-in and
   modal).

## Boundaries

- Do NOT touch `components/panel.tsx`. Its position (`x`/`y`) is driven by
  raw `useMotionValue`s bound via `style={{ x, y }}` for drag interaction —
  a literal, imperative use case, not a tweened shorthand. Converting its
  `animate={{ opacity, scale }}` (`:301-304`) to a `transform` string would
  conflict with the separate `style={{ x, y }}` binding on the same element,
  since both ultimately write to the same CSS `transform` property. Leave
  `panel.tsx` exactly as-is.
- Do NOT touch `components/command-bar.tsx` — its animation is removed
  entirely by plan `001-command-palette-no-animation.md`.
- Do NOT touch `components/experience-timeline.tsx:37-39` — removed by plan
  `005-experience-timeline-height-animation.md`.
- Do NOT change any `transition` object — only the `initial`/`animate`/
  `exit`/`whileHover`/`whileTap` value shapes.
- **Run this plan before `002-reduced-motion-support.md`** (see
  `plans/README.md` for the recommended order). If 002 has already been
  applied to a file listed here, its `initial`/`animate` objects will
  contain `shouldReduceMotion ? ... : ...` ternaries instead of the plain
  literals shown in this plan's "current" excerpts — STOP for that file and
  report the drift instead of merging the two patterns yourself.

## Verification

- **Mechanical**: `npx tsc --noEmit` — expect no new errors (the `transform`
  key is a valid Framer Motion animatable property, so this should be a
  clean type-check).
- **Feel check**: run the dev server and visually compare each animation
  before/after — they should look pixel-identical in timing and distance:
  - Open the About panel: avatar/text block slides up and in from the left,
    same as before.
  - Open Achievements and Experience panels: list items fade+slide up the
    same amount.
  - Load the page and watch the Discord presence card and the coding-stats
    banner fade+slide in identically.
  - Open the dock (page load): same spring bounce as before.
  - Open the Message Constellation panel: stars still pop from 0 to full
    size with the same hover/tap feedback; the add-message modal still
    scales in from 0.9.
  - In DevTools' Animations panel, set playback to 10% on one of the above
    and confirm the motion path (distance and curve) is unchanged from
    before this plan — only the underlying CSS property differs.
- **Done when**: all 7 files use `transform` strings instead of `x`/`y`/
  `scale` shorthand, `panel.tsx` and `command-bar.tsx` are untouched, and
  every animation looks identical to its pre-plan appearance.
