# 006 — Consolidate duplicated spring configs into a shared token

- **Status**: DONE
- **Commit**: 5c5927c
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 3 files (1 new, 2 edited)

## Problem

Three near-identical spring configs are hand-typed independently, each with
a slightly different `damping` value for what should read as the same
"snap" feel:

```tsx
// components/panel.tsx:305
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

```tsx
// components/dock.tsx:39
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

```tsx
// components/command-bar.tsx:463 (only relevant if plan 001 has NOT been
// applied yet — see Boundaries)
transition={{ type: "spring", damping: 25, stiffness: 300 }}
```

All three share `stiffness: 300` but drift across `damping: 20/25/30` with
no shared source — a classic "five hand-typed values that almost match"
consolidation finding. This repo has no motion-token file at all (confirmed:
no `lib/motion.ts` or equivalent; no `--ease-*`/`--duration-*` CSS custom
properties in `app/globals.css`).

## Target

Add a new `lib/motion.ts` exporting one shared spring preset, using the
middle `damping` value (`25`) as the consolidated default:

```tsx
// lib/motion.ts — new file
import type { Transition } from "framer-motion"

// Shared "snappy" spring used for panel/dock entrance and interaction
// feedback across the app — keeps damping/stiffness consistent instead of
// each component hand-typing a slightly different value.
export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
}
```

```tsx
// components/panel.tsx:1-9 — current imports
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, type PanInfo, useMotionValue } from "framer-motion"
import { X, Minimize2, Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

```tsx
// target
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, type PanInfo, useMotionValue } from "framer-motion"
import { X, Minimize2, Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SPRING_SNAPPY } from "@/lib/motion"
```

```tsx
// components/panel.tsx:305 — current
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

```tsx
// target
      transition={SPRING_SNAPPY}
```

```tsx
// components/dock.tsx:1-8 — current imports
"use client"

import type React from "react"

import { motion } from "framer-motion"
import { User, Briefcase, History, FileText, Layers, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
```

```tsx
// target
"use client"

import type React from "react"

import { motion } from "framer-motion"
import { User, Briefcase, History, FileText, Layers, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SPRING_SNAPPY } from "@/lib/motion"
```

```tsx
// components/dock.tsx:39 — current
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

```tsx
// target
      transition={SPRING_SNAPPY}
```

## Repo conventions to follow

- Shared, non-component utilities live in `lib/` (`lib/utils.ts`,
  `lib/data.tsx`, `lib/supabaseClient.ts`) — `lib/motion.ts` follows that
  existing placement convention.
- Import via the `@/lib/*` path alias, matching every other cross-file
  import in this codebase (see `tsconfig.json`'s `paths` config and any
  existing `@/lib/utils` import).

## Steps

1. Create `lib/motion.ts` with the `SPRING_SNAPPY` export shown above.
2. In `components/panel.tsx`, add the `SPRING_SNAPPY` import and replace the
   `transition` prop at `:305` with `transition={SPRING_SNAPPY}`.
3. In `components/dock.tsx`, add the `SPRING_SNAPPY` import and replace the
   `transition` prop at `:39` with `transition={SPRING_SNAPPY}`.
4. Check whether `components/command-bar.tsx` still contains a spring
   transition at (originally) `:463`. If plan
   `001-command-palette-no-animation.md` has already been applied, that
   `motion.div`/spring no longer exists — skip this file entirely. If it has
   NOT been applied yet, add the same `SPRING_SNAPPY` import and replace
   `transition={{ type: "spring", damping: 25, stiffness: 300 }}` with
   `transition={SPRING_SNAPPY}` there too, for consistency until 001 lands.

## Boundaries

- Do NOT change `stiffness`/`damping` values beyond consolidating to the
  `300`/`25` pair shown — do not "improve" the feel, only deduplicate it.
- Do NOT touch any other `transition` object in the codebase (e.g. the
  `duration`-based tweens in `profile-card.tsx`, `achievements-card.tsx`,
  etc.) — this plan is scoped to the spring-type configs only.
- Do NOT create additional exports in `lib/motion.ts` beyond
  `SPRING_SNAPPY` — keep the file minimal; other tokens can be added in a
  future pass if needed.

## Verification

- **Mechanical**: `npx tsc --noEmit` — expect no new errors (confirms
  `Transition` type import from `framer-motion` resolves and `SPRING_SNAPPY`
  is a valid `Transition`).
- **Feel check**: open a panel via the dock and confirm the panel's
  entrance spring and the dock's own mount spring both still feel snappy
  with no visible bounce overshoot — `damping: 25` sits between panel's
  previous `20` (slightly bouncier) and dock's previous `30` (slightly
  stiffer), so a small feel difference on each is expected and acceptable;
  neither should feel broken or sluggish.
- **Done when**: `lib/motion.ts` exists with one export, and `panel.tsx`/
  `dock.tsx` (and `command-bar.tsx` if plan 001 hasn't run yet) all
  reference `SPRING_SNAPPY` instead of inlining their own spring object.
