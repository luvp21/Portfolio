# 005 — Remove the layout-property height animation in the experience timeline

- **Status**: DONE
- **Commit**: 5c5927c
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file, small

## Problem

`components/experience-timeline.tsx:32-50` wraps each experience entry's
description/skills block in a `motion.div` that animates the `height` CSS
property from `0` to `"auto"`:

```tsx
// components/experience-timeline.tsx:32-50 — current
          {/* expandedItems.includes(exp.id) && */}

          {(
            <motion.div
              className="px-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <p className="mb-3 text-md text-muted-foreground">{exp.description}</p>
              <div className="flex flex-wrap gap-1">
                {exp.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
```

`height` is a layout property — animating it forces the browser to
recompute layout on every frame, unlike `transform`/`opacity` which the
compositor can handle independently. Per the audit playbook: "Animate
`transform` and `opacity` only. `width`/`height`/`margin`/`padding`/`top`/
`left` trigger layout + paint + composite."

The commented-out condition (`{/* expandedItems.includes(exp.id) && */}`)
shows this block used to be a collapsible accordion section gated on an
`expandedItems` array that no longer exists in this component. The
condition was removed and replaced with a bare `(true &&`-equivalent
`{(...)}`, so this block now always renders and animates once on mount,
alongside the *parent* `motion.div`'s own opacity/`y` entrance
(`experience-timeline.tsx:11-16`) — which already fades and slides the
entire card (including this child) into view. The `height` animation on the
child is therefore pure overhead: the content is already invisible until
the parent's entrance finishes, so the nested reveal adds a layout-thrashing
animation with no additional visible effect a user would perceive as
"revealing."

## Target

Replace the `motion.div` with a plain `div` — no animation, since the
parent's fade/slide entrance already covers this content:

```tsx
// target — components/experience-timeline.tsx:32-50
          <div className="px-4">
            <p className="mb-3 text-md text-muted-foreground">{exp.description}</p>
            <div className="flex flex-wrap gap-1">
              {exp.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
```

The stray comment `{/* expandedItems.includes(exp.id) && */}` is removed
along with it — it references state that doesn't exist in this component
and is misleading dead code, not a deliberate design note to preserve.

## Repo conventions to follow

- The parent `motion.div` at `experience-timeline.tsx:11-16` is the
  exemplar for how this component already handles entrance — a single
  opacity+position fade covering the whole card is the established pattern;
  this plan just stops duplicating it on a child element.

## Steps

1. In `components/experience-timeline.tsx`, replace lines `32-50` (the
   commented condition, the `{(` wrapper, the `motion.div` with its
   `initial`/`animate`/`exit` props, and its closing `</motion.div>` /
   `)}`) with the plain `<div className="px-4">...</div>` shown in Target.
   The inner JSX (the `<p>` and skills `<div>`) is unchanged — only the
   wrapping element and the removal of the dead comment.

## Boundaries

- Do NOT touch the parent `motion.div` at `experience-timeline.tsx:11-16` —
  that's covered separately by plans `002-reduced-motion-support.md` and
  `004-transform-string-conversion.md`.
- Do NOT reintroduce an `expandedItems`/collapsible-toggle feature — this
  plan only removes the now-meaningless animation, it does not restore the
  accordion behavior the comment hints at. If real expand/collapse is
  wanted, that's a separate feature request, not an animation-audit fix.
- Do NOT remove the `Badge` import or any other import — `Badge` is still
  used in the replacement `div`.

## Verification

- **Mechanical**: `npx tsc --noEmit` — expect no new errors. Also confirm
  `motion` is still imported and used (the parent `motion.div` at `:11`
  still needs it) — do not remove the `framer-motion` import from this
  file.
- **Feel check**: open the Experience panel and confirm each entry's
  description and skill badges are visible immediately as part of the
  card's fade/slide-in — no separate "unfurling" motion, no layout jump,
  content just appears already in place as the card fades in.
- **Done when**: no `height`-animating `motion.div` remains in
  `experience-timeline.tsx`, and the panel's visual entrance is otherwise
  unchanged (card still fades/slides in as before).
