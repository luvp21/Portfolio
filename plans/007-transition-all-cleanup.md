# 007 — Replace imprecise `transition-all` with targeted transitions

- **Status**: DONE
- **Commit**: 5c5927c
- **Severity**: LOW
- **Category**: Cohesion & tokens / Performance
- **Estimated scope**: 3 files, small

## Problem

Per the audit playbook, `transition: all` (Tailwind's `transition-all`) is
always a finding — it animates unintended properties off the compositor
instead of a precise, intentional set. Three sites:

### `components/tech-stack.tsx:15`

```tsx
// current
            className="relative flex flex-col items-center gap-2 px-2 py-4 transition-all "
```

This `transition-all` has nothing to transition — the element has no
`:hover`/`:focus`/state-driven class anywhere in this file, so the class is
currently a complete no-op. `components/project-card.tsx`'s tag icons
already do the intended thing elsewhere in this codebase
(`hover:scale-110`), so this is also a missed-opportunity gap: the tech
stack icons look interactive (icon + label, grid layout) but have zero
hover feedback.

### `components/project-card.tsx:39`

```tsx
// current — :35-43
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-44 object-cover transition-all duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40" />
        </div>
```

Same situation — `transition-all duration-300` on the image, but nothing
currently triggers a state change on the image itself (no `group-hover`,
no `:hover` scale). It's dead weight exactly like the `tech-stack.tsx` case.

### `components/theme-toggle/index.tsx:669`

```tsx
// current — :663-677
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                "size-10 cursor-pointer p-0 transition-all duration-300 active:scale-95",
                className
            )}
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
```

This one is NOT a no-op: `Button`'s own base class
(`components/ui/button.tsx:8`) already includes `transition-colors` for its
hover/focus color states, and this local `active:scale-95` needs a
transition covering `transform`. **This is the one site in this plan where
naively swapping to `transition-transform` would be a regression**: `cn()`
here is `twMerge(clsx(...))` (see `lib/utils.ts`), and `transition-colors`/
`transition-transform` are Tailwind utilities in the same "transition
property" conflict group — `twMerge` keeps only the *last* one in the
merged class string. Since this component's `className` prop is merged
*after* `Button`'s base classes, swapping `transition-all` for
`transition-transform` here would cause `twMerge` to silently drop the
base `transition-colors`, breaking the button's hover color fade. The
arbitrary-value syntax `transition-[color,transform]` avoids this — it's a
distinct utility class, not a member of that conflict group, so `twMerge`
keeps it alongside (or in place of) the rest without stripping anything.

## Target

### `components/tech-stack.tsx`

```tsx
// target — :12-24
        return (
          <div
            key={tech.name}
            className="relative flex flex-col items-center gap-2 px-2 py-4 transition-transform duration-200 hover:scale-105"
          >
            <Icon
              className="text-[36px] z-10"
              style={{
                color: tech.name === "Next.js" ? "var(--foreground)" : tech.color,
              }}
            />
            <p className="z-10 text-sm text-foreground">{tech.name}</p>
          </div>
        )
```

### `components/project-card.tsx`

```tsx
// target — :31-43 (adds `group` to the outer motion.div, `group-hover:scale-105` to the image)
      <motion.div
        className="flex flex-col h-full rounded-2xl overflow-visible border bg-card text-card-foreground group"
      >
        {/* IMAGE */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40" />
        </div>
```

### `components/theme-toggle/index.tsx`

```tsx
// target — :663-677
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                "size-10 cursor-pointer p-0 transition-[color,transform] duration-300 active:scale-95",
                className
            )}
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
```

## Repo conventions to follow

- `components/project-card.tsx`'s existing tag icons (`className="... w-[22px] h-[22px] transition-transform hover:scale-110"`, around `:131`) are the exemplar for "targeted transition + hover scale" already used elsewhere in this exact file — the image treatment added here matches that pattern's spirit (slightly gentler, `scale-105`, since the image is much larger than a small tag icon).
- Tailwind's arbitrary-value transition-property syntax
  (`transition-[color,transform]`) is the correct tool whenever a component
  needs to layer a local transition on top of a base component's own
  `transition-*` class via `cn()`/`twMerge` — use this pattern for any
  future case where a shadcn `Button`/similar base component's built-in
  transition needs to be preserved alongside a new one.

## Steps

1. `components/tech-stack.tsx:15` — replace the className with the target
   shown above (`transition-transform duration-200 hover:scale-105`).
2. `components/project-card.tsx:32` — add `group` to the outer
   `motion.div`'s className.
3. `components/project-card.tsx:39` — replace `transition-all duration-300`
   with `transition-transform duration-300 group-hover:scale-105`.
4. `components/theme-toggle/index.tsx:669` — replace `transition-all
   duration-300` with `transition-[color,transform] duration-300`.

## Boundaries

- Do NOT change `components/ui/button.tsx` — the fix works entirely from
  the calling side (`theme-toggle/index.tsx`), preserving the base
  component untouched.
- Do NOT add hover treatments anywhere not listed above (e.g. don't touch
  `components/ui/sidebar.tsx:303`'s `transition-all` — that's shadcn
  boilerplate for a sidebar resize handle that isn't currently rendered
  anywhere in this app; out of scope).
- Do NOT change `duration-200`/`duration-300` values beyond what's shown.

## Verification

- **Mechanical**: `npx tsc --noEmit` and `npm run lint` — expect no new
  errors.
- **Feel check**:
  - Open the Tech Stack panel and hover each icon: confirm a subtle
    `scale-105` lift with a smooth ~200ms transition, where previously
    there was no hover feedback at all.
  - Open the Projects panel and hover a project card's image: confirm a
    subtle `scale-105` zoom on the image only (not the whole card), smooth
    over ~300ms.
  - Hover and click the theme toggle button (top-right): confirm the
    background/icon color still fades smoothly on hover (this is the
    regression to watch for) AND the `active:scale-95` press feedback
    still works when clicked. In DevTools, inspect the rendered class list
    on the button and confirm `transition-colors` classes/behavior are
    still effectively present (via the `transition-[color,transform]`
    arbitrary value) — no dropped hover-color transition.
- **Done when**: all three sites use targeted transition properties, the
  two previously-dead `transition-all` classes now have matching hover
  feedback, and the theme toggle button's hover color fade is confirmed
  unbroken.
