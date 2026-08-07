# Module contract — read before touching anything

Several builders work on this app at the same time. **Own only your files.**
Editing a file you do not own loses someone else's work.

| File | Owner | Contains |
|---|---|---|
| `index.html` | SHELL | markup skeleton, `<script>` tags, `<link>` |
| `style.css` | SHELL | every rule in the app, including module rules |
| `app.js` | SHELL | boot, WebGL probe, tab routing, offline mesh loader, no-WebGL fallback |
| `parts.js` | DATA | `window.PARTS` — part names, copy, hotspot coords |
| `nomen.js` | NOMEN | tabs 1 & 2 — the two nomenclature viewers |
| `fitting.js` | FIT | tab 3 — fit the collar |
| `level.js` | LEVEL | tab 4 — find the working level |
| `vendor/`, `*.glb`, `models*.js` | nobody | frozen; copied from the previous build |

`_work/` is scratch. It ships in the folder but nothing loads from it.

## What SHELL guarantees to everyone else

```js
window.EC = {
  three:  true|false,          // WebGL available and THREE loaded
  mesh(name)   -> Promise<GLTF>,   // 'dog' | 'receiver' | 'transmitter'
                                   // resolves http(s) .glb or base64 on file://
  onEnter(tab, fn),            // fn() each time this tab becomes visible
  onLeave(tab, fn),            // fn() when it stops being visible
  pane(tab)    -> HTMLElement, // your root element; already sized
  announce(msg),               // polite live-region text for screen readers
  stage(tab)   -> Stage|null,  // the shared 3D viewer — see below
  notice(tab,msg),             // an in-pane, dismissible problem notice
  normalise(obj3d),            // centre + scale to the parts.js unit cube
};
```

### `EC.stage(tab)` — the shared 3D viewer

There is **one WebGL context in the whole app** and one canvas, moved into
whichever stage is active. Do not create your own `WebGLRenderer`: four
renderers are four contexts for one visible picture, and the browser drops the
oldest when it runs short — which is the `Context Lost` warning hard gate 1
counts as a failure.

```js
stage.el                       // host element, already filling the pane.
                               // Move it into your own layout, then .resize()
stage.overlay                  // .hs-layer, above the canvas, for your own DOM
stage.leaders                  // the SVG layer under it, for leader lines
stage.scene / .camera / .controls / .holder
stage.setModel(obj3d)          // normalises and shows it
stage.setHome({target,distMul})// opening framing (parts.js `home`)
stage.setHotspots(items, onPick)  // items need pos[3] and name
stage.mark(i)                  // which hotspot is current
stage.look(camDir[, distMul])  // ease the camera to a parts.js `cam` ray
stage.home() / .moveTo(camV3,tgtV3,ms)
stage.activate() / .deactivate() / .resize() / .destroy()
```

Hotspot pills, anchor dots, leader lines and their `occluded` states are styled
in `style.css` (`.hs`, `.hs-n`, `.hs-label`, `.hs-dot`, `.st-lead .ln/.cas`).
**Use those classes.** BAR.md axis 1 is hotspot legibility over both a light and
a dark model; if three modules each solve it separately the app reads as three
products. Turn feel — inertia, damping, recentre, the idle turn that stops the
moment a student touches it — is solved in the stage, once, for the same reason.

`stage(tab)` returns `null` when there is no WebGL. Check `EC.three` first.

- Tabs are `receiver`, `transmitter`, `fit`, `level`.
- A module must do **no work at all** until its first `onEnter`. Boot must not
  parse a 4 MB base64 mesh for a tab nobody opened.
- `EC.mesh` caches; call it freely. It raises a loading veil **inside the pane
  that asked**, and if the mesh cannot be read it puts a dismissible error card
  there — in that pane only, never across the app — and brings the written
  reference back. A failed load is not cached, so the next visit retries.
- If `EC.three` is false you will never be entered. SHELL renders the fallback.
- Every pane keeps its written reference for the life of the page. Claiming a
  tab (registering an `onEnter` for it) **hides** it; it is never destroyed.
  Do not remove elements from the pane you did not create.
- An exception thrown out of your `onEnter`/`onLeave` is caught, turned into an
  in-pane notice and never reaches the console. Do not rely on that: hard gate
  1 is judged across a full interaction pass, so a `setInterval` of yours that
  throws still fails it.

## What SHELL draws when a module has not landed

Tabs 1 and 2 currently carry a **holding view** built by SHELL: the real mesh
in an `EC.stage`, with the parts.js hotspots wired to the same part index the
written reference uses. The moment `nomen.js` registers an `onEnter` hook for a
tab, `claimIfOwned()` destroys that holding view and hands the stage over. It
is scaffolding for the blind comparison, not a design NOMEN has to match or
work around — take the pane and build what the tab should be.

## Hard gates — every piece is judged against these, every round

1. **Console clean.** Zero errors and zero warnings on load, on every tab, and
   through a full interaction pass. `THREE.WebGLRenderer: Context Lost` counts.
2. **`file://` works.** Double-click `index.html`. No server, no CDN, no
   `fetch()` of a local file, no ES modules, no import maps. Classic scripts only.
3. **No horizontal overflow at 414 px.** `document.documentElement.scrollWidth`
   must equal the viewport width on every tab.
4. **No-WebGL path.** Must degrade to something a student can still learn from.
5. **Offline.** No network request leaves the page, ever. Check the network log.

## House style

- Colours and type come from `style.css` custom properties. Never hard-code a
  hex in JS; read the property or use a class.
- Brand: **`--hc-blue #1C70B9`, `--hc-orange #F1A046`**.

  *Corrected 2026-08-06.* This file previously stated `#1560A6` / `#CF8B3E` and
  called them "sampled from the real mark". They are not what the sign
  measures — both are noticeably darker and duller than the vinyl. Two
  independent re-derivations from `_work/photos/LOGO.png` now agree with each
  other and disagree with that pair:

  | reading | blue | orange |
  |---|---|---|
  | fitted illumination field, per-tile medians (see the note at the top of `style.css`) | `#196EBF`–`#1A71BF` | `#EF9C43`–`#F8A143` |
  | six white points, 50th–99th percentile | `#1D6AAE`–`#2075C1` | `#E89D45`–`#FFAD4C` |
  | **shipped** — midpoint, inside both ranges | **`#1C70B9`** | **`#F1A046`** |

  The full method is recorded at the top of `style.css` so it can be repeated
  rather than taken on trust. `style.css` is the source of truth for every
  colour; if this table and that file ever disagree again, the file is right.
  The previous build's `#1B75BB` / `#E5A03C` were guesses. Do not use those.
- Orange never carries body text — at brand lightness it is 2.1:1 on paper. It
  marks; it does not explain. Use `--hc-orange-d` when text must be orange.
- British spelling in student-facing copy ("colour", "recognise", "metre").
- Write for a student on a wet field, not for a reader at a desk.

## Reusing the previous build

`~/Desktop/E-COLLAR-3D/` is **read-only**. Never write to it.

**Read the CURRENT files, not this summary.** That repo is under active
development by its owner in a parallel session and moved on 2026-08-06 at 15:11
(commit `37f24ce`). Anything below that disagrees with the code is wrong; the
code wins. Re-read `level.js` and `fitting.js` before you rely on any of it.

Four problems are solved there and must be lifted, not re-derived:

- **The neck rig** (`level.js`) — the dog mesh has no skeleton. There is **no
  rigid head cut any more**; `37f24ce` removed it. The head piece now starts
  *above* the strap and its bottom rim is weighted 0, so the rim never moves and
  the join is invisible wherever it falls — the neck bends over its length the
  way a real one does. The older rigid cut needed the strap built to clear the
  widest the oval neck presents across the head's full turn, which left it
  standing up to 13.6% of the local radius proud of the neck: it read as a
  *loose collar* on the very dog a student has just been marked 4/4 for fitting
  snugly. Do not reintroduce that. `RIG.headCut` is now a weight boundary, not
  a cut.
- **Ear skinning** (`level.js`) — ears are *not* cut. Cutting tore the base open
  past ~20°. Each vertex carries a weight from 1 at the tip to 0 in the skull and
  takes that fraction of the rotation. The two ears have different axes because
  the head is turned.
- **UV-seam welding** (`level.js`) — duplicated seam vertices are welded before
  flood-filling the surface, or the fill leaks.
- **Neck frame** (`fitting.js`) — centreline plus a radial profile at 7 heights ×
  32 angles, raycast off `dog.glb`, giving the true oval section. Published as
  `window.CollarKit` so there is one copy. The strap wraps the neck because of
  this; without it, it passes through.

These are valid only for this `dog.glb`. It is the same file, so they transfer.
