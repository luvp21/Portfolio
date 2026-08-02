# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A desktop-OS-style portfolio site built with Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, and Supabase. The whole site is one draggable/resizable "window manager" UI rather than a scrolling page — panels (About, Projects, Experience, Message, Stack, Achievements) can be opened, dragged, resized, minimized, and pinned within a virtual desktop canvas.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # next lint
```

There is no test suite configured in this repo.

## Environment setup

Copy `.env.example` to `.env.local` and fill in Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the older `NEXT_PUBLIC_SUPABASE_ANON_KEY` name — `lib/supabaseClient.ts` accepts either)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, used by `app/api/visit/route.ts`; never expose as `NEXT_PUBLIC_*`

Supabase backs two features: the atomic page-visit counter (`visit_counters` table + `increment_visit_counter` RPC) and the guestbook constellation (`messages` table). Table/RPC definitions are in `README.md` under "Supabase Setup".

## Architecture

### The window manager (core abstraction)

`components/PortfolioInterface.tsx` is the top-level client component and owns all panel state:
- `PanelType` = `"about" | "projects" | "experience" | "message" | "stack" | "achievements"` (`components/types.ts`)
- Panel state (position, active, minimized, zIndex, pinned) lives in a single `Record<PanelType, PanelState>` and persists to `localStorage` under `"portfolioPanels"` (desktop only; mobile always force-activates all panels and ignores saved state).
- A fixed **design canvas** of `1440×670` is rendered off-DOM-scale and then CSS-`transform: scale(...)`'d to fit the actual viewport (see `canvasScale`, driven by a `ResizeObserver` on the canvas host). All panel drag/resize math in `components/panel.tsx` divides pointer deltas by `canvasScale` to compensate — **any new pointer-based interaction on the canvas must do the same scale correction** or it will drift from the cursor.
- Panel positions/sizes are re-derived (not fixed pixel constants) from `getDefaultPanelDimensions()`/`createDefaultPanelState()` in `PortfolioInterface.tsx`, scaled proportionally to canvas size.
- `components/DesktopCanvas.tsx` renders the actual `Panel` components and maps each `PanelType` to its content component (`ProfileCard`, `ProjectCard` grid, `Sandbox`, `TechStack`, `ExperienceTimeline`, `AchievementsCard`).
- `components/panel.tsx` (`Panel`) is the generic draggable/resizable/pinnable/minimizable window chrome, built on Framer Motion `useMotionValue` for drag position — not Framer's built-in `drag` prop, because positions must be externally controllable (for `localStorage` restore and canvas-boundary constraints).
- Mobile (`width < 768`) bypasses the canvas/scaling system entirely and renders `components/MobileLayout.tsx` instead, with all panels force-active.
- Global keyboard shortcuts (`Ctrl+K` or `/`) toggle the command bar (`components/command-bar.tsx`, built on `cmdk`), which dispatches through `executeCommand()` in `PortfolioInterface.tsx` to open/close panels, switch theme, or reset layout.

### Content/data

`lib/data.tsx` is the single source of truth for site content (personal info, projects, tech stack, experience, achievements) — update this file rather than hardcoding content in components.

### Theming

Custom theme system in `components/theme-provider.tsx` (**not** `next-themes`, despite it being a dependency) — a simple light/dark context backed by `localStorage`. `app/layout.tsx` injects an inline script (`THEME_INIT_SCRIPT`) that applies the stored theme class before hydration to avoid a flash of the wrong theme. Theme toggling uses the View Transitions API for a circular reveal effect (`components/theme-toggle/`).

### API routes (`app/api/*/route.ts`)

- `visit/route.ts` — GET returns current visit count; POST atomically increments via the `increment_visit_counter` Postgres RPC (using the service-role Supabase client), gated by a `VISITED_TODAY` cookie so repeat visits in a day don't double-count. Live updates propagate to clients via Supabase Realtime (Postgres replication over WebSockets), not polling.
- `github/route.ts` — fetches GitHub profile + contribution data (proxies `api.github.com` and `github-contributions-api.jogruber.de`), cached with `next: { revalidate: 3600 }`.
- `leetcode/route.ts` — similar pattern for LeetCode stats.

### Guestbook constellation (`components/Sandbox.tsx`)

Visitor messages are plotted as glowing "stars" on an HTML5 canvas, connected by lines when within a responsive distance threshold. Spam prevention uses a client-side browser fingerprint (WebGL renderer info + hardware/locale properties hashed with 32-bit FNV-1a) stored in `metadata`, not auth — there is no server-side validation of this fingerprint, so treat it as a soft signal only.

### Path aliases

`@/*` maps to the repo root (see `tsconfig.json`). shadcn/ui config (`components.json`) defines aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks` — new shadcn components should be added via the shadcn CLI, which respects this config.
