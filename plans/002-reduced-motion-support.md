# 002 — Respect `prefers-reduced-motion` across entrance animations

- **Status**: DONE
- **Commit**: 5c5927c
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 7 files, mechanical (same pattern repeated per file)

## Problem

Zero handling of `prefers-reduced-motion` exists anywhere in this repository
(confirmed via `grep -rn "prefers-reduced-motion\|useReducedMotion" .` —
0 matches outside `node_modules`). Every Framer Motion entrance animation in
the app moves regardless of the user's OS-level motion preference. The
`framer-motion` package (already a dependency, v12.12.1) exports a
`useReducedMotion()` hook for exactly this.

Per the audit playbook: reduced motion means fewer/gentler animations, not
zero — keep opacity feedback, drop position/scale movement.

This plan is intentionally scoped to entrance animations only. It does NOT
cover:
- `components/command-bar.tsx` — its animation is removed entirely by plan
  `001-command-palette-no-animation.md`. If that plan has not been executed
  yet, this plan does not touch `command-bar.tsx` either; there is nothing
  to gate once 001 lands.
- `components/experience-timeline.tsx:37-39` (the inner height/opacity
  block) — that code is removed entirely by plan
  `005-experience-timeline-height-animation.md`. Do not modify it here.
- `components/theme-toggle/index.tsx` — covered by its own dedicated plan,
  `003-theme-toggle-reduced-motion.md`, since it's a `window.matchMedia`
  check in a non-component callback, not a `useReducedMotion()` hook call.
- `components/panel.tsx` and `components/dock.tsx` — panel drag position is
  driven by raw motion values (`style={{x, y}}`), not `initial`/`animate`
  props, so this plan's technique doesn't apply the same way there. Left out
  of this plan's scope; not currently animated enough to be a priority
  (panel's only entrance motion is a 0.9→1 scale/opacity on the whole panel,
  spring-driven — revisit separately if desired).

## Target

The rule applied at every site below is the same: when
`useReducedMotion()` returns `true`, set the *moving* axis's `initial` value
equal to its `animate` target (so there is no distance to travel — the
spring/tween settles with zero visible movement) while keeping the opacity
fade, and shorten tween durations to ~0.15s. Springs need no duration change
— an unchanged spring with zero distance to travel naturally settles near-
instantly.

### `components/profile-card.tsx`

```tsx
// current — components/profile-card.tsx:1-21
"use client"

import { motion } from "framer-motion"
import { memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PERSONAL, PROFILE_TAGS, PROFILE_LINKS } from "@/lib/data"

export const ProfileCard = memo(function ProfileCard() {
  return (
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
"use client"

import { motion, useReducedMotion } from "framer-motion"
import { memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PERSONAL, PROFILE_TAGS, PROFILE_LINKS } from "@/lib/data"

export const ProfileCard = memo(function ProfileCard() {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.15 : 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex gap-1 sm:gap-6 mt-6 lg:px-4"
        initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.15 : 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
      >
```

### `components/achievements-card.tsx`

```tsx
// current — components/achievements-card.tsx:1-9, 32-38
"use client"

import { motion } from "framer-motion"
import { Award, Star, Trophy, Medal, Sparkles, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ACHIEVEMENTS } from "@/lib/data"

export function AchievementsCard() {
  // ...
        {ACHIEVEMENTS.map((achievement) => (
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
"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Award, Star, Trophy, Medal, Sparkles, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ACHIEVEMENTS } from "@/lib/data"

export function AchievementsCard() {
  const shouldReduceMotion = useReducedMotion()
  // ...
        {ACHIEVEMENTS.map((achievement) => (
          <motion.div
            key={achievement.id}
            className="px-2 flex items-center gap-3"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.3 }}
          >
```

### `components/experience-timeline.tsx` (outer block only — see Boundaries)

```tsx
// current — components/experience-timeline.tsx:1-16
"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { EXPERIENCE } from "@/lib/data"

export function ExperienceTimeline() {
  return (
    <div className="space-y-4 p-2 hide-scrollbar">
      {EXPERIENCE.map((exp) => (
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
"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { EXPERIENCE } from "@/lib/data"

export function ExperienceTimeline() {
  const shouldReduceMotion = useReducedMotion()
  return (
    <div className="space-y-4 p-2 hide-scrollbar">
      {EXPERIENCE.map((exp) => (
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : exp.id * 0.1 }}
          className="py-1"
        >
```

(Leave `components/experience-timeline.tsx:37-39`, the inner
`height`/`opacity` block, completely untouched — it is removed by plan 005.)

### `components/discord-presence.tsx`

```tsx
// current — components/discord-presence.tsx:1-6, 156-165
"use client";

import { useEffect, useState } from "react";
import { SiDiscord, SiSpotify } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
// ...
    return (
        <AnimatePresence>
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
"use client";

import { useEffect, useState } from "react";
import { SiDiscord, SiSpotify } from "react-icons/si";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// ... inside export function DiscordPresence() { ... }, add near the top:
//   const shouldReduceMotion = useReducedMotion();
    return (
        <AnimatePresence>
            <motion.div
                key="discord-presence"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                transition={{ duration: shouldReduceMotion ? 0.15 : 0.35, ease: "easeOut" }}
                className="w-full pointer-events-auto select-none overflow-hidden"
            >
```

Note: `DiscordPresence` has early `return`s for the loading/error states
(`components/discord-presence.tsx:143-145`) before this JSX. Call
`useReducedMotion()` at the top of the component body (before those early
returns) so the Hook Rules are respected (hooks must run unconditionally).

### `components/coding-stats-panel.tsx`

```tsx
// current — components/coding-stats-panel.tsx:1-5, 179-185
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
// ...
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full bg-card/80 pointer-events-auto select-none flex px-4"
        >
```

```tsx
// target
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
// ... inside export function CodingStatsPanel() { ... }, add near the top:
//   const shouldReduceMotion = useReducedMotion();
    return (
        <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.35, ease: "easeOut" }}
            className="w-full bg-card/80 pointer-events-auto select-none flex px-4"
        >
```

### `components/Sandbox.tsx` — star pop-in and add-message modal

```tsx
// current — components/Sandbox.tsx:6, star at :514-528, modal at :695-706
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
// ...
          <motion.div
            key={msg.id}
            className="absolute z-10 cursor-pointer"
            style={{ left: `${normalizedPos.x}px`, top: `${normalizedPos.y}px` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: isMobile ? 1.1 : 1.2 }}
            whileTap={{ scale: 0.95 }}
// ...
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-start justify-center bg-black/70 backdrop-blur-sm z-40 p-4 overflow-y-auto hide-scrollbar"
          >
```

```tsx
// target
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
// ... inside export const Sandbox = React.memo(function Sandbox() { ... }, add near the top:
//   const shouldReduceMotion = useReducedMotion()
          <motion.div
            key={msg.id}
            className="absolute z-10 cursor-pointer"
            style={{ left: `${normalizedPos.x}px`, top: `${normalizedPos.y}px` }}
            initial={{ scale: shouldReduceMotion ? 1 : 0, opacity: shouldReduceMotion ? 0 : 1 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: isMobile ? 1.1 : 1.2 }}
            whileTap={{ scale: 0.95 }}
// ...
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
            className="absolute inset-0 flex items-start justify-center bg-black/70 backdrop-blur-sm z-40 p-4 overflow-y-auto hide-scrollbar"
          >
```

The star's `whileHover`/`whileTap` are left untouched — those are
interaction feedback (press/hover), not passive entrance movement, and stay
subtle regardless of the motion preference.

## Repo conventions to follow

- `framer-motion` is already the project's only motion library — use its own
  `useReducedMotion()` hook rather than hand-rolling a `matchMedia` listener
  (that hand-rolled approach is reserved for `theme-toggle/index.tsx` in plan
  003, where it's a non-component callback and can't call a React hook).
- Name the local variable `shouldReduceMotion` consistently across every
  file touched, matching Framer Motion's own naming convention for this
  hook's return value.

## Steps

1. `components/profile-card.tsx` — apply the diff shown above.
2. `components/achievements-card.tsx` — apply the diff shown above.
3. `components/experience-timeline.tsx` — apply the diff shown above (outer
   block only).
4. `components/discord-presence.tsx` — apply the diff shown above, adding
   the `useReducedMotion()` call before the early-return checks.
5. `components/coding-stats-panel.tsx` — apply the diff shown above, adding
   the `useReducedMotion()` call before the `if (loading)` early return.
6. `components/Sandbox.tsx` — apply the diff shown above (both the star
   `motion.div` and the modal `motion.div`).

## Boundaries

- Do NOT touch `components/command-bar.tsx`, `components/panel.tsx`,
  `components/dock.tsx`, or `components/theme-toggle/index.tsx` — see
  Problem section for why each is out of scope.
- Do NOT touch `components/experience-timeline.tsx:37-39`.
- Do NOT add a new reduced-motion utility file — call
  `useReducedMotion()` directly in each component; there's no shared
  wrapper convention to build here since it's a single import.
- If any listed file's code has drifted from the "current" excerpt shown
  above (e.g. because plan 004's transform-string conversion already ran),
  STOP for that file and report the mismatch — do not improvise a merge.

## Verification

- **Mechanical**: `npx tsc --noEmit` — expect no new errors.
- **Feel check**: in Chrome DevTools, open the Rendering panel, set "Emulate
  CSS media feature `prefers-reduced-motion`" to `reduce`, then reload:
  - Open each panel (About, Achievements, Experience, Message) and confirm
    content still fades in (opacity) but does not visibly slide/move.
  - Confirm the Discord presence card and coding-stats panel fade in
    without a vertical slide.
  - Confirm guestbook stars appear via a quick fade instead of popping from
    zero scale; the add-message modal fades in without the scale-up.
  - Set the emulation back to `no-preference` and confirm every animation
    above is unchanged from its current (pre-plan) feel — full movement,
    original durations.
- **Done when**: every site above changes behavior only under the emulated
  `prefers-reduced-motion: reduce` setting, with no regression when it's off.
