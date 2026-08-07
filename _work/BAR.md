# The bar: BioDigital Human

Every critic judges against the real thing, in a real browser — never against
this description. This file only tells you how to *reach* it.

## Working no-login URL

`/explore` redirects to a login wall. The **widget** endpoint does not, and it
carries the full interface:

```
https://human.biodigital.com/widget?id=production/maleAdult/male_system_anatomy_skeletal_09&ui-info=true&ui-menu=true&ui-nav=true&ui-tools=true&ui-anatomy-descriptions=true&ui-search=true&ui-fullscreen=true&ui-dissect=true&ui-zoom=true&ui-share=true&ui-annotations=true&ui-layers=true
```

Open it with `preview_start {url}`, then `resize_window`. Do **not** sign up
for an account — it is not needed and it is not ours to create.

Other model ids follow the same shape, e.g.
`production/maleAdult/male_region_head`. A bad id gives "unable to find the
model" — that is a wrong id, not a broken URL.

## The two viewports

- Desktop **1440 × 900**
- iPad landscape **1180 × 820**

Reload after resizing so load-time layout decisions re-run.

## What to actually look at

Judge these four, in this order. They are the axes the whole project is scored on.

1. **Hotspot legibility** — can you tell what is clickable before you click it,
   and does the label survive being over a light model and a dark one?
2. **Part list** — how the list and the 3D view stay in sync, and how a long
   list stays navigable.
3. **Cross-section readability** — the dissect / layer tools. Does a cut plane
   read instantly, or do you have to work at it?
4. **How the model feels to turn** — inertia, damping, how it stops, whether it
   ever ends up somewhere you cannot recover from, and whether a wrong drag
   loses your place.

## Honest read of BioDigital's own weaknesses

Ours has to win, so know where it is beatable. Observed 2026-08-06:

- The 3D nav control cluster is bottom-right, small, and low contrast; the
  "recenter" affordance is not obvious.
- Clicking a *transparent* body shell selects nothing and gives no feedback —
  a miss and a no-op look identical.
- The info panel is a wall of grey text with no visual tie back to the object.
- Nothing is *taught*. It presents; it never asks the viewer to do anything or
  tells them whether they were right.

That last one is the opening. Our tabs 3 and 4 are drills with a verdict.
BioDigital has no equivalent — but that only wins if our rendering and
interaction are in the same class as theirs. Presentation first, then the drill.

## Rule for the blind comparison

Strip the labels. Put our screenshot beside theirs with no indication of which
is which, and say which is better *and why*, in that order. If ours does not
win, say so plainly and name the single biggest remaining gap. Praise is not
useful and will be ignored.
