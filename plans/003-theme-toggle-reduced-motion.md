# 003 — Skip the View Transition reveal under reduced motion

- **Status**: DONE
- **Commit**: 5c5927c
- **Severity**: MEDIUM
- **Category**: Accessibility / Physicality
- **Estimated scope**: 1 file, small

## Problem

`components/theme-toggle/index.tsx` drives a full-viewport `clip-path`/blur
reveal (700ms–1s depending on `variant`) via the View Transitions API every
time the theme is toggled, with no check for `prefers-reduced-motion`:

```tsx
// components/theme-toggle/index.tsx:586-606 — current
const toggleTheme = useCallback(() => {
    setIsDark((s) => !s);

    const animation = createAnimation(variant, start, blur, gifUrl);
    updateStyles(animation.css);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
        // theme is the stored value (light/dark)
        setTheme(theme === "light" ? "dark" : "light");
    };

    if (!("startViewTransition" in document)) {
        switchTheme();
        return;
    }

    // @ts-ignore - experimental API
    (document as any).startViewTransition(switchTheme);
}, [theme, setTheme, variant, start, blur, gifUrl, updateStyles]);
```

The same pattern repeats in `setCrazyLightTheme` (`:608-619`) and
`setCrazyDarkTheme` (`:621-632`). A full-viewport animated `clip-path` reveal
is exactly the kind of movement `prefers-reduced-motion: reduce` exists to
suppress — this is a bigger, more disorienting motion than any other
animation in the app, and currently the only theme-switch fallback path that
skips the animation is browser-capability detection
(`!("startViewTransition" in document)`), not user preference.

## Target

Add a small `prefersReducedMotion()` helper (plain `window.matchMedia`
check — these three functions are callbacks, not component render bodies, so
they cannot call the `useReducedMotion()` React hook used elsewhere in the
codebase per plan 002) and short-circuit to the instant `switchTheme()` path
when it's `true`, skipping both the CSS injection and
`startViewTransition` call:

```tsx
// target — add near the top of the file, after the STYLE_ID constant (:553)
const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

```tsx
// target — components/theme-toggle/index.tsx:586-606
const toggleTheme = useCallback(() => {
    setIsDark((s) => !s);

    const switchTheme = () => {
        // theme is the stored value (light/dark)
        setTheme(theme === "light" ? "dark" : "light");
    };

    if (typeof window === "undefined") return;

    if (prefersReducedMotion() || !("startViewTransition" in document)) {
        switchTheme();
        return;
    }

    const animation = createAnimation(variant, start, blur, gifUrl);
    updateStyles(animation.css);

    // @ts-ignore - experimental API
    (document as any).startViewTransition(switchTheme);
}, [theme, setTheme, variant, start, blur, gifUrl, updateStyles]);
```

Note the reorder: `updateStyles`/`createAnimation` now only run on the path
that actually uses the injected CSS, instead of always running and then
being ignored on the reduced-motion/unsupported-browser paths.

Apply the identical restructuring to `setCrazyLightTheme` and
`setCrazyDarkTheme`.

## Repo conventions to follow

- This file already has an established "no capability, no animation" guard
  (`!("startViewTransition" in document)`) — this plan extends that same
  guard with an `||` clause rather than introducing a different pattern.
- Keep the `@ts-ignore` comment above `startViewTransition` — unrelated to
  this change, and the experimental API still has no TS types.

## Steps

1. In `components/theme-toggle/index.tsx`, after the `const STYLE_ID = ...`
   line (`:553`), add the `prefersReducedMotion` helper shown above.
2. Restructure `toggleTheme` (`:586-606`) to match the target: compute
   `switchTheme` first, check `typeof window === "undefined"` first, then
   check `prefersReducedMotion() || !("startViewTransition" in document)`
   before calling `createAnimation`/`updateStyles`.
3. Apply the same restructuring to `setCrazyLightTheme` (`:608-619`).
4. Apply the same restructuring to `setCrazyDarkTheme` (`:621-632`).

## Boundaries

- Do NOT modify `createAnimation`, `generateSVG`, `getPositionCoords`, or any
  of the CSS-string-building logic (`:51-549`) — only the three callback
  functions that decide whether to invoke it.
- Do NOT touch `ThemeToggleButton`'s `transition-all duration-300
  active:scale-95` className (`:669`) — that's covered by plan
  `007-transition-all-cleanup.md`.
- Do NOT add `useReducedMotion()` here — these are plain callbacks outside
  component render, not hook-eligible call sites.

## Verification

- **Mechanical**: `npx tsc --noEmit` — expect no new errors.
- **Feel check**:
  - With no reduced-motion preference set, click the theme toggle button and
    confirm the circular/blur reveal still plays exactly as before.
  - In Chrome DevTools → Rendering panel, set "Emulate CSS media feature
    `prefers-reduced-motion`" to `reduce`, then click the theme toggle:
    confirm the theme switches with no visible transition/reveal at all —
    an instant swap, same as what already happens in browsers without
    `startViewTransition` support.
  - Confirm no extra `<style id="theme-transition-styles">` CSS gets
    injected into `<head>` when reduced motion is active (check via
    DevTools Elements panel) — `updateStyles` should not run on that path.
- **Done when**: theme toggling is instant under emulated reduced motion and
  visually unchanged otherwise.
