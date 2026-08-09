/* ============================================================================
   DOGTRA 1900X · collar trainer
   SHELL — boot, WebGL probe, tab routing, offline mesh loader, the shared 3D
   stage every module draws into, and the written reference that stands in for
   all of it when 3D is unavailable.

   Owner: SHELL. Modules (nomen.js / fitting.js / level.js) are injected lazily
   the first time their tab is opened; see MODULE_SRC below.

   Rules this file exists to keep:
     · classic script, no ES modules, no import maps, no CDN
     · no fetch() of a local file on file:// — the base64 copies are pulled in
       with a <script> tag instead, and only when a tab actually needs a mesh
     · nothing at all happens at boot beyond drawing the chrome and the tab the
       student actually landed on; a 4 MB mesh is never parsed for a tab nobody
       opened
     · the stage is never empty, and never permanently broken. Every pane keeps
       its written reference for the whole life of the page — a module HIDES it
       when it claims the pane, and any mesh failure brings it straight back.
     · a module's bug never reaches the console. fire() contains it in the pane
       it happened in.

   ── WHAT IS SHELL'S AND WHAT IS NOT ────────────────────────────────────────
   EC.stage(tab) is a complete 3D viewer harness — renderer, scene, camera,
   trackball with inertia, recentre, hotspot markers with leader lines and
   occlusion. It exists so that hotspot legibility and "how the model feels to
   turn" are solved ONCE, here, rather than three times in three modules.

   The shell also uses that harness itself, on the two nomenclature tabs, to
   show the actual unit — see shellNomen(). That is a HOLDING view: the moment
   nomen.js registers an onEnter hook for a tab, claimIfOwned() tears the
   holding view down and hands the stage over. It is not a replacement for
   nomen.js and does not stop it landing.
   ========================================================================== */

(function () {
  'use strict';

  var TABS = ['receiver', 'transmitter', 'fit', 'level', 'condition'];
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* Which script owns which tab. Injected on first entry to that tab; a tab
     whose module does not draw anything simply keeps the written reference.
     Two tabs share nomen.js — it is fetched once. */
  var MODULE_SRC = {
    receiver:    'nomen.js',
    transmitter: 'nomen.js',
    fit:         'fitting.js',
    level:       'level.js',
    condition:   'condition.js'
  };

  var MESH_FILE = {
    receiver:    'receiver.glb',
    transmitter: 'transmitter.glb',
    dog:         'dog.glb',
    trainer:     'trainer.glb'
  };

  var MESH_NAME = {
    receiver:    'receiver',
    transmitter: 'transmitter',
    dog:         'dog',
    trainer:     'handler'
  };

  var TITLE = {
    receiver:    'Receiver',
    transmitter: 'Transmitter',
    fit:         'Fit the collar',
    level:       'Find the working level',
    condition:   'Collar conditioning'
  };

  // ── tiny helpers ────────────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function svgEl(tag, cls) {
    var n = document.createElementNS(SVGNS, tag);
    if (cls) n.setAttribute('class', cls);
    return n;
  }
  /* Builds a paragraph out of an array. A plain string becomes a text node; an
     object {s:'…'} becomes a <strong>. There is deliberately no innerHTML
     anywhere in this file — three module owners will read it and copy from it,
     and a general-purpose innerHTML helper in a shared file is a trap. */
  function rich(node, parts) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (typeof p === 'string') node.appendChild(document.createTextNode(p));
      else if (p && p.s != null) node.appendChild(el('strong', null, p.s));
    }
    return node;
  }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function reduced() {
    return window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  }
  function narrow() {
    return window.matchMedia && window.matchMedia('(max-width:859px)').matches;
  }
  function nextPaint() {
    // Two frames, so a veil raised immediately before blocking work is really
    // on screen before the main thread stalls. Raced against a timer: a tab
    // that is not painting throttles requestAnimationFrame to nothing, and a
    // mesh load must never sit waiting for a frame that is not coming.
    return new Promise(function (res) {
      var done = false;
      function fin() { if (!done) { done = true; res(); } }
      var t = setTimeout(fin, 120);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { clearTimeout(t); fin(); });
      });
    });
  }

  var live    = $('live');
  var tabEls  = {};
  var paneEls = {};
  TABS.forEach(function (t) {
    tabEls[t]  = $('tab-' + t);
    paneEls[t] = $('pane-' + t);
  });

  // ── WebGL probe ─────────────────────────────────────────────────────────
  function webglOK() {
    if (!window.WebGLRenderingContext) return false;
    try {
      var c = document.createElement('canvas');
      var g = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!g) return false;
      // release it again; some drivers only allow a handful of live contexts
      var lose = g.getExtension && g.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      return true;
    } catch (e) {
      return false;
    }
  }

  var THREE_OK = !!(window.THREE && window.THREE.GLTFLoader &&
                    window.THREE.OrbitControls) && webglOK();

  function announce(msg) {
    if (!msg) return;
    live.textContent = '';
    // a fresh text node is what makes a repeat message speak again
    setTimeout(function () { live.textContent = String(msg); }, 40);
  }

  /* ==========================================================================
     THE LOADING VEIL — one per pane, never one across the stage.

     The previous round shipped a single veil that was a child of .stage. It was
     inset:0 over all four panes at once, and its failure flag was sticky with
     nothing anywhere to reset it, so one damaged mesh replaced the whole app
     with an undismissable error card — including the two tabs that never asked
     for that mesh. Three things changed:
       · the veil is built inside the pane that asked for the mesh;
       · the failed flag is per pane and the card carries a button that clears
         it and brings the written reference back;
       · loadMaster no longer caches a rejected promise, so the next visit to
         the tab genuinely retries.
     ======================================================================== */

  var veils = {};

  function veilFor(tab) {
    if (veils[tab]) return veils[tab];
    var root = el('div', 'veil');
    root.setAttribute('hidden', '');
    var card = el('div', 'veil-card');
    var t    = el('p', 'veil-t', 'Preparing the 3D model');
    var d    = el('p', 'veil-d', 'Reading it out of this page. Nothing is being downloaded.');
    var bar  = el('div', 'veil-bar');
    bar.setAttribute('aria-hidden', 'true');
    bar.appendChild(el('i'));
    var btn = el('button', 'veil-go', 'Continue without the model');
    btn.type = 'button';
    btn.setAttribute('hidden', '');
    card.appendChild(t); card.appendChild(d); card.appendChild(bar); card.appendChild(btn);
    root.appendChild(card);
    paneEls[tab].appendChild(root);

    var v = { root: root, t: t, d: d, bar: bar, btn: btn,
              depth: 0, shownAt: 0, failed: false };
    btn.addEventListener('click', function () { veilDismiss(tab); });
    veils[tab] = v;
    return v;
  }

  function veilUp(tab, title, detail) {
    var v = veilFor(tab);
    v.depth++;
    if (v.failed) return;          // never paint over a message still being read
    v.root.classList.remove('err');
    v.btn.setAttribute('hidden', '');
    v.bar.removeAttribute('hidden');
    v.t.textContent = title;
    v.d.textContent = detail;
    if (v.root.hasAttribute('hidden')) {
      v.root.removeAttribute('hidden');
      v.shownAt = Date.now();
    }
  }
  function veilDown(tab) {
    var v = veils[tab];
    if (!v) return;
    v.depth = Math.max(0, v.depth - 1);
    if (v.depth || v.failed) return;
    // never flash: if it went up less than a fifth of a second ago, hold it
    var held = Date.now() - v.shownAt;
    if (held < 220) { setTimeout(function () { veilDown2(tab); }, 220 - held); return; }
    veilDown2(tab);
  }
  function veilDown2(tab) {
    var v = veils[tab];
    if (!v || v.depth || v.failed) return;
    v.root.setAttribute('hidden', '');
    v.root.classList.remove('err');
  }
  function veilFail(tab, msg) {
    var v = veilFor(tab);
    v.depth = Math.max(0, v.depth - 1);
    v.failed = true;
    v.root.removeAttribute('hidden');
    v.root.classList.add('err');
    v.bar.setAttribute('hidden', '');
    v.btn.removeAttribute('hidden');
    v.t.textContent = 'That model could not be read';
    v.d.textContent = msg;
    announce('The 3D model on this tab could not be read. Continue without it to read the written reference.');
  }
  /* The whole point of the button. The written reference has been sitting under
     the veil the entire time — this stops covering it. */
  function veilDismiss(tab) {
    var v = veils[tab];
    if (!v) return;
    v.failed = false;
    v.depth  = 0;
    v.root.setAttribute('hidden', '');
    v.root.classList.remove('err');
    showRef(tab);
    announce('Carrying on without the 3D model. Everything it shows is written out here.');
  }

  // ── offline mesh loader ─────────────────────────────────────────────────
  //
  // http(s): read the .glb straight off disk.
  // file://: Chrome blocks fetch() on file: URLs, so the base64 copy is pulled
  //          in with a <script> tag. ONE FILE PER MESH.
  //
  // models.js used to carry BOTH units in a single 4.0 MB file, so opening tab
  // 1 — the tab the page lands on — parsed the transmitter's 1.8 MB of base64
  // that nobody had asked for, on the main thread, before the receiver could
  // draw. It is split into models-receiver.js and models-transmitter.js, the
  // same way the dog was already separate. models.js is still on disk, in case
  // something outside this build reads it, but nothing loads it any more.
  var EMBEDDED = {
    receiver:    { src: 'models-receiver.js',    key: 'MODEL_RECEIVER' },
    transmitter: { src: 'models-transmitter.js', key: 'MODEL_TRANSMITTER' },
    dog:         { src: 'models-dog.js',         key: 'DOGMODEL' },
    trainer:     { src: 'models-trainer.js',     key: 'MODEL_TRAINER' }
  };

  var scriptOnce = {};
  function loadScript(src) {
    if (scriptOnce[src]) return scriptOnce[src];
    scriptOnce[src] = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = function () { res(); };
      s.onerror = function () { rej(new Error(src + ' could not be read')); };
      document.head.appendChild(s);
    });
    return scriptOnce[src];
  }

  function embedded(name) {
    var e = EMBEDDED[name];
    if (!e) return Promise.reject(new Error('no embedded copy of ' + name));
    // Already present? Then it was inlined ahead of us — the single-file build
    // concatenates the base64 straight into the page, and there is no
    // models-*.js beside it to fetch. Asking for one would 404 and reject a
    // mesh we are already holding.
    if (window[e.key]) return Promise.resolve(window[e.key]);
    return loadScript(e.src).then(function () {
      if (!window[e.key]) throw new Error(e.src + ' held no ' + name);
      return window[e.key];
    });
  }

  function b64ToBuffer(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  }

  function bytesFor(name) {
    var served = location.protocol === 'http:' || location.protocol === 'https:';
    if (!served) return embedded(name).then(b64ToBuffer);
    return fetch(MESH_FILE[name])
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.arrayBuffer();
      })
      .catch(function () { return embedded(name).then(b64ToBuffer); });
  }

  function parseGLB(buf) {
    return new Promise(function (res, rej) {
      new THREE.GLTFLoader().parse(buf, '', res, rej);
    });
  }

  var master = {};      // name -> Promise<GLTF>, parsed exactly once
  var ready  = {};      // name -> true once that promise has resolved

  function loadMaster(name) {
    var p = nextPaint()
      .then(function () { return bytesFor(name); })
      .then(parseGLB)
      .then(function (gltf) { ready[name] = true; return gltf; });
    /* A rejected promise must NOT stay in the cache, or the tab can never
       retry — every later visit would re-reject instantly off the same object.
       This handler is registered before any caller's, so the entry is gone by
       the time the caller's own rejection handler runs. It doubles as the
       guard against an unhandled rejection reaching the console. */
    p['catch'](function () {
      if (master[name] === p) delete master[name];
    });
    return p;
  }

  /* Every caller gets its own scene graph. Geometries and materials are shared
     with the original, so this is cheap — but it means a module that recolours
     a material must clone that material first. The dog is used by two tabs;
     handing both the same Object3D would have one silently steal it from the
     other, because a THREE object can only have one parent. */
  function copyOf(gltf) {
    var scene = gltf.scene.clone(true);
    return {
      scene:      scene,
      scenes:     [scene],
      animations: gltf.animations || [],
      cameras:    [],
      asset:      gltf.asset,
      parser:     gltf.parser,
      userData:   gltf.userData || {}
    };
  }

  function mesh(name) {
    if (!MESH_FILE[name]) {
      return Promise.reject(new Error('EC.mesh: unknown mesh "' + name + '"'));
    }
    if (!THREE_OK) {
      return Promise.reject(new Error('EC.mesh: 3D is not available here'));
    }
    // whoever asked owns the veil; if the call arrives with no current tab
    // (a module preloading at boot) it falls to the landing tab
    var tab = current || TABS[0];

    if (master[name] && ready[name]) return master[name].then(copyOf);

    veilUp(tab, 'Preparing the ' + MESH_NAME[name],
                'Reading it out of this page. Nothing is being downloaded.');
    if (!master[name]) master[name] = loadMaster(name);

    return master[name].then(
      function (gltf) { veilDown(tab); return copyOf(gltf); },
      function (err) {
        veilFail(tab, 'The 3D ' + MESH_NAME[name] + ' is missing or damaged. ' +
                      'Everything it shows is written out on this tab — carry on with that.');
        throw err;
      });
  }

  /* parts.js coordinates are in normalised model space: centred on the
     bounding box, largest axis spanning 1.0. Published here so there is one
     copy of it rather than three. */
  function normalise(obj) {
    var box  = new THREE.Box3().setFromObject(obj);
    var size = box.getSize(new THREE.Vector3());
    var ctr  = box.getCenter(new THREE.Vector3());
    var max  = Math.max(size.x, size.y, size.z) || 1;
    obj.position.sub(ctr);
    var wrap = new THREE.Group();
    wrap.add(obj);
    wrap.scale.setScalar(1 / max);
    return wrap;
  }

  /* ==========================================================================
     THE SHARED 3D STAGE

     One WebGL context for the whole app. Only one tab is ever visible, so one
     canvas is moved into whichever stage is active — four renderers would be
     four contexts for one visible picture, and browsers drop the oldest
     context when they run short, which is exactly the "Context Lost" warning
     hard gate 1 counts as a failure.

     Each stage owns its own scene, camera, trackball and hotspot layer, so
     three modules never fight over one camera.
     ========================================================================== */

  var GL = null;

  function glCore() {
    if (GL) return GL;
    var canvas = el('canvas', 'st-cv');
    var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputEncoding = THREE.sRGBEncoding;
    /* Filmic roll-off rather than a hard clip. Both units are nearly black, so
       the scene has to be lit hard to show any form at all — which drove the
       light greys of the steel hardware straight to pure white. ACES compresses
       the top end so the buckle and the contact posts keep their tone; the
       exposure bump compensates for the midtone darkening so the black
       housings do not go muddy. */
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.06;

    canvas.addEventListener('webglcontextlost', function (ev) {
      // preventDefault is what stops the renderer from logging on its own
      ev.preventDefault();
      stopLoop();
      if (current) {
        veilFail(current, 'The browser released the 3D view to free memory. ' +
                          'Reload the page to get it back — everything it shows is written out on this tab.');
      }
    }, false);

    // a drag, a wheel or a pinch means the student has taken over; stop the
    // idle turn for good rather than fighting them for the camera
    ['pointerdown', 'wheel', 'touchstart'].forEach(function (k) {
      canvas.addEventListener(k, function () {
        if (activeStage) activeStage.spin = false;
      }, { passive: true });
    });
    /* A mouse drag on the canvas must turn the model, never run a document text
       selection. Without this, one drag left 2 370 characters selected and
       turned the title, the part index and the whole reading column blue.
       touch-action:none already covers the touch path; this is the mouse path.
       NOT passive, and deliberately before the trackball's own handler. */
    canvas.addEventListener('mousedown', function (ev) { ev.preventDefault(); }, false);
    canvas.addEventListener('dblclick', function () {
      if (activeStage) activeStage.home();
    });

    GL = { renderer: r, canvas: canvas };
    return GL;
  }

  var activeStage = null;
  var rafId = 0;
  var lastT = 0;

  function startLoop() {
    if (rafId) return;
    lastT = 0;
    rafId = requestAnimationFrame(frameTick);
  }
  function stopLoop() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  function frameTick(now) {
    rafId = 0;
    if (!activeStage) return;
    var dt = lastT ? Math.min(now - lastT, 64) : 16;
    lastT = now;
    try {
      activeStage.tick(dt);
    } catch (e) {
      // A tick must never take the console with it. Stop this stage, keep the
      // app alive, and tell the student in the pane rather than in devtools.
      stopLoop();
      var t = activeStage.tab;
      activeStage = null;
      paneNotice(t, 'The 3D view on this tab stopped. Everything it shows is written out here.');
      showRef(t);
      return;
    }
    rafId = requestAnimationFrame(frameTick);
  }

  /* Scratch objects, allocated on first use. They are deliberately NOT created
     at file scope: if three.min.js is ever missing, this file must still load
     and still draw the written reference — that is hard gate 4. */
  var S = null;
  function scratch() {
    if (!S) {
      S = {
        p:   new THREE.Vector3(),
        c:   new THREE.Vector3(),
        box: new THREE.Box3(),
        dir: new THREE.Vector3(),
        ray: new THREE.Raycaster()
      };
    }
    return S;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     THE HOTSPOT LAYOUT SOLVER — the most important code in this file

     Numbers drawn straight onto the part are unreadable against a black, busy
     surface, so each part gets a small anchor dot at the exact point and a
     leader out to a numbered pill. The whole difficulty is deciding where the
     pills go, every frame, while the student turns the model.

     The previous round did it with a relaxation: put each pill on a ray out
     from the footprint centre, then push overlapping pairs apart. Relaxation
     gives no guarantees at all, and every one of the round-4 failures is a
     guarantee that was never made:

       · pills 03 and 04 settled 24x26 px inside one another
       · "01 Stra" — a pill hanging out of the layer, cropped by overflow
       · "01 Antenna" resting entirely underneath the Reset chip
       · leaders crossing three times on the transmitter

     So the placement is not a relaxation any more. It is a one-dimensional
     packing problem on a closed curve, which does have guarantees:

     1  A RING is fitted round the model's screen footprint — an ellipse,
        sized so that a pill CENTRED anywhere on it is wholly inside the layer,
        by construction. Nothing is ever clamped, so nothing is ever cropped.
        (Assertion: every pill fully inside the layer rect.)

     2  Each pill is given the ring position at its own anchor's angle, and the
        pills are then sorted by that angle. Assignment is MONOTONIC: pill
        order round the ring is anchor order round the ring. Two leaders from
        a common centre to a convex ring in the same cyclic order cannot
        cross. (Assertion: no leader crossings.)

     3  The Reset chip and the turn hint are measured and turned into BLOCKED
        ARCS of that ring — fixed, immovable nodes in the same packing. A pill
        is never merely drawn over a button; it is never placed near one.
        (Assertion: no pill on the tools chip or the hint chip.)

     4  The packing itself is the classic bounded label declutter, alternating
        forward and backward passes, with the CURRENT pill pinned so everything
        else yields to it. Separation is by CIRCUMSCRIBED RADIUS: |dc| >= rA +
        rB implies the two axis-aligned boxes are disjoint (Minkowski), so
        clearing the radii clears the rectangles whatever their shape.
        (Assertion: no two pill AABBs intersect.)

     5  Anything the packing could not satisfy is caught by an explicit
        verification pass at the end, and that pill drops out of the layer
        rather than being drawn wrong.

     Occlusion is not a transparency any more — see the note in positionMarkers.
     ══════════════════════════════════════════════════════════════════════════ */
  var LEAD_CLEAR = 18;    // stand-off past the model's screen footprint, px
  var PILL_GAP   = 8;     // clear canvas demanded between two pill rectangles
  var EDGE_PAD   = 6;     // clear canvas demanded inside the layer
  var CHIP_PAD   = 9;     // clear canvas demanded around the tools / hint chips
  var ARC_SAFE   = 1.07;  // an arc is longer than the chord it subtends
  var RING_N     = 256;   // ellipse samples in the arc-length table
  var TAU        = Math.PI * 2;
  /* THE RING IS SIZED BY THE PILLS, NOT ONLY BY THE MODEL.
     It used to be the silhouette plus a stand-off, full stop — so zooming out
     shrank it with the model. Measured, transmitter, minimum zoom, 545x595
     stage: radii 88x88, perimeter 553 px, and 8 pills asking for 560 px of it.
     Two of them were dropped for want of about seven pixels of ring, at exactly
     the moment a student is looking at the whole unit and wants everything
     named. So the ring now also grows to whatever the pills need, up to the
     layer's own limit. Long leaders are a small price; a missing number is not.
     The slack covers the arcs the Reset chip and the hint sit on. */
  var RING_SLACK = 1.6;
  /* How far the camera may tip. Short of the poles, where straight-down
     degenerates into a spin about the view axis. */
  var POLAR_MIN  = 0.16;
  var POLAR_MAX  = Math.PI - 0.16;

  /* ── FRAMING ───────────────────────────────────────────────────────────────
     The subject has to command the frame. The previous round solved the camera
     distance from the model's bounding-box half-extents times a 1.42 margin
     times a further "head" factor, which at 1180 wide left the receiver
     occupying about a third of a 545x595 canvas — and it is that empty frame,
     not the render, that made the app read as the less finished of the two in
     the blind comparison. It was also the direct cause of the hotspot pile-up:
     a small silhouette puts every anchor within a few dozen pixels of every
     other one.

     What replaces it is an exact solve against the geometry itself.

     A bounding box is far too generous for either of these units. The receiver
     is a strap LOOP: its box is a solid slab, most of which is the hole in the
     middle of the collar, so framing the box frames a great deal of nothing.
     A bounding sphere is worse again. So the solve samples the real vertices.

     For a camera at distance d from the target along f, with screen axes r and
     u, a sampled point q (relative to the target) lands at

         px_x = (q·r)·(w/2) / ((d − q·f)·tan(fov/2)·aspect)
         px_y = (q·u)·(h/2) / ((d − q·f)·tan(fov/2))

     Requiring |px_x| ≤ fW·w/2 rearranges to a LOWER BOUND ON d that is linear
     in the point — no iteration, no trial renders:

         d ≥ q·f + |q·r| / (fW·tan(fov/2)·aspect)
         d ≥ q·f + |q·u| / (fH·tan(fov/2))

     The largest bound over every sampled point is the closest the camera can
     stand with the whole subject still inside the pane. The sample is swept
     through several yaws about the target's vertical axis, which is the axis
     the idle turn and an ordinary drag both rotate about, so the framing holds
     as the model turns instead of pumping in and out.

     `fill` is a fraction minus a PIXEL reserve, because the numbered pills sit
     in a ring outside the silhouette and that ring is a fixed pixel width, not
     a fraction of the model. Reserving it in pixels is what keeps a phone-sized
     stage usable without under-filling a desktop one.
     ────────────────────────────────────────────────────────────────────────── */
  var FILL_MAX  = 0.90;   // never use more than this share of an axis
  var FILL_MIN  = 0.52;   // never shrink below this, however small the pane
  var RING_MAX  = 74;     // px kept clear for the pill ring on a large stage
  var RING_MIN  = 34;
  var FIT_YAWS  = 6;      // turns sampled, so the fit survives the model turning
  var FIT_PTS   = 1800;   // vertices sampled off the mesh for the fit

  function makeStage(tab) {
    var core = glCore();

    var root = el('div', 'st');
    var lead = svgEl('svg', 'st-lead');
    lead.setAttribute('aria-hidden', 'true');
    var casL = svgEl('g');
    var lnL  = svgEl('g');
    lead.appendChild(casL);
    lead.appendChild(lnL);
    var layer = el('div', 'hs-layer');

    var tools = el('div', 'st-tools');
    var reset = el('button', 'st-btn');
    reset.type = 'button';
    var ricon = svgEl('svg', 'st-bi');
    ricon.setAttribute('viewBox', '0 0 20 20');
    ricon.setAttribute('aria-hidden', 'true');
    ricon.setAttribute('focusable', 'false');
    var rp = svgEl('path');
    rp.setAttribute('d', 'M16.1 8.4A6.4 6.4 0 1 0 16 12.4');
    ricon.appendChild(rp);
    var rp2 = svgEl('path');
    rp2.setAttribute('d', 'M16.4 4.4v4.2h-4.2');
    ricon.appendChild(rp2);
    reset.appendChild(ricon);
    reset.appendChild(el('span', null, 'Reset view'));
    tools.appendChild(reset);

    var hint = el('p', 'st-hint');
    hint.appendChild(el('span', null, 'Drag to turn · scroll to zoom · double-click to reset'));

    root.appendChild(lead);
    root.appendChild(layer);
    root.appendChild(tools);
    root.appendChild(hint);

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    /* A camera sitting exactly on its own target has a degenerate view matrix
       and every projection off it comes back NaN — which reaches the DOM as an
       invalid SVG attribute and fails hard gate 1. Start it somewhere real,
       before any tick can run. */
    camera.position.set(0.55, 0.32, 2.4);
    var holder = new THREE.Group();
    scene.add(holder);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b0a2, 1.05));
    var key = new THREE.DirectionalLight(0xffffff, 0.95); key.position.set(2.2, 3.0, 2.6);
    var fil = new THREE.DirectionalLight(0xffffff, 0.42); fil.position.set(-2.4, 0.6, 1.4);
    var rim = new THREE.DirectionalLight(0xffffff, 0.34); rim.position.set(-0.6, -1.4, -2.6);
    scene.add(key); scene.add(fil); scene.add(rim);

    /* ── THE UP AXIS IS FIXED. ──────────────────────────────────────────
       This was a TrackballControls, on the argument that free tumbling is what
       an inspection viewer wants. It is not what a TEACHING viewer wants. A
       trackball has no up-vector constraint at all: a 140 px vertical drag
       rolled the collar onto its side and carried it past upside down, and a
       student who cannot tell the top of the receiver from the bottom cannot
       be taught where the contact posts go — which is exactly what tab 3 will
       ask them to do.

       OrbitControls holds a fixed world up and clamps the polar angle every
       frame, inside its own update(), whatever else has moved the camera. So
       the model turns all the way round and tips well past level, but never
       rolls and never inverts. The limits stop a breath short of the poles,
       where a straight-down view degenerates into a spin about the view axis. */
    var controls = new THREE.OrbitControls(camera, core.canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.rotateSpeed   = 0.9;
    controls.zoomSpeed     = 0.9;
    controls.enablePan     = false;
    controls.minPolarAngle = POLAR_MIN;
    controls.maxPolarAngle = POLAR_MAX;
    controls.minDistance   = 0.45;
    controls.maxDistance   = 7.0;
    controls.enabled       = false;

    var st = {
      tab: tab,
      el: root, host: root, overlay: layer, leaders: lead,
      scene: scene, camera: camera, controls: controls, holder: holder,
      spin: !reduced(),
      /* The model's true centre, and its cylinder bound about that centre.
         Both are filled in by setModel; until then the stage frames nothing. */
      ctr: new THREE.Vector3(),
      pts: null,                   // sampled vertices, holder space — the fit
      anchors: null,               // hotspot positions — the fit's hard floor
      autoY: 0,                    // vertical correction the fit found
      fitD: 2.4,
      fitA: 0,
      home0: { target: [0, 0, 0], distMul: 1 },
      markers: [],
      items: [],
      onPick: null,
      onState: null,
      sig: '',
      at: -1,
      ease: null,
      occTick: 0,
      laid: false,
      remeasure: true
    };

    reset.addEventListener('click', function () { st.home(); announce('View reset.'); });

    /* The canvas is not the only thing a drag can start on — the numbered pills
       and the hint sit above it — and a drag that starts on any of them must
       still turn the model rather than selecting the page. The reset button is
       excepted so it can still take focus from the mouse. */
    function noSelect(ev) {
      if (ev.target && ev.target.closest && ev.target.closest('.st-btn')) return;
      ev.preventDefault();
    }
    root.addEventListener('mousedown', noSelect, false);
    root.addEventListener('selectstart', noSelect, false);

    /* Opening view direction. Its elevation is part of the framing solve, so it
       is a constant rather than a literal buried inside home(). */
    var HOME_DIR = new THREE.Vector3(0.52, 0.30, 1).normalize();
    var WORLD_UP = new THREE.Vector3(0, 1, 0);

    // ── framing ──────────────────────────────────────────────────────────

    /* The look target: the model's own bounding centre, plus whatever bias
       parts.js asked for, plus whatever vertical correction the fit found.
       Framing on the bounding centre rather than on the origin is what stops
       the subject reading as off-axis in the pane. */
    function lookTarget(out) {
      var t = st.home0.target;
      return out.set(st.ctr.x + t[0], st.ctr.y + t[1] + st.autoY, st.ctr.z + t[2]);
    }

    function fills() {
      var w = root.clientWidth, h = root.clientHeight;
      var m = Math.min(w, h);
      var ring = Math.min(RING_MAX, Math.max(RING_MIN, m * 0.16));
      return {
        w: w, h: h,
        fW: Math.min(FILL_MAX, Math.max(FILL_MIN, (w - ring) / w)),
        fH: Math.min(FILL_MAX, Math.max(FILL_MIN, (h - ring) / h)),
        vT: Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
      };
    }

    /* The camera's screen axes for a viewing direction, and the same pair
       turned by a yaw about the target's vertical axis. Rotating the BASIS is
       the cheap way to sweep the model through a turn: it is three vectors per
       yaw instead of two thousand points. */
    var _r = new THREE.Vector3(), _u = new THREE.Vector3();

    /* The exact solve — see the FRAMING note above. Returns the nearest
       distance that still holds every sampled vertex inside fW x fH of the
       pane, over FIT_YAWS turns. */
    function solveDist(dir, tgt, F, P) {
      if (!P || !P.length || !F.w || !F.h) return 0;
      _r.crossVectors(WORLD_UP, dir);
      if (_r.lengthSq() < 1e-8) _r.set(1, 0, 0); else _r.normalize();
      _u.crossVectors(dir, _r);
      var kx = 1 / (F.fW * F.vT * (F.w / F.h));
      var ky = 1 / (F.fH * F.vT);
      var best = 0;
      for (var s = 0; s < FIT_YAWS; s++) {
        var a  = (s / FIT_YAWS) * Math.PI * 2;
        var ca = Math.cos(a), sa = Math.sin(a);
        var fx = dir.x * ca - dir.z * sa, fy = dir.y, fz = dir.x * sa + dir.z * ca;
        var rx = _r.x  * ca - _r.z  * sa, ry = _r.y,  rz = _r.x  * sa + _r.z  * ca;
        var ux = _u.x  * ca - _u.z  * sa, uy = _u.y,  uz = _u.x  * sa + _u.z  * ca;
        for (var i = 0; i < P.length; i += 3) {
          var qx = P[i] - tgt.x, qy = P[i + 1] - tgt.y, qz = P[i + 2] - tgt.z;
          var df = qx * fx + qy * fy + qz * fz;
          var c1 = df + Math.abs(qx * rx + qy * ry + qz * rz) * kx;
          if (c1 > best) best = c1;
          var c2 = df + Math.abs(qx * ux + qy * uy + qz * uz) * ky;
          if (c2 > best) best = c2;
        }
      }
      return best;
    }

    /* Where the silhouette actually sits on the screen's vertical axis, in
       world units, at a given distance. Used to centre it. */
    function vMid(dir, tgt, d, F) {
      var P = st.pts;
      if (!P || !P.length) return 0;
      _r.crossVectors(WORLD_UP, dir);
      if (_r.lengthSq() < 1e-8) _r.set(1, 0, 0); else _r.normalize();
      _u.crossVectors(dir, _r);
      var lo = Infinity, hi = -Infinity;
      for (var s = 0; s < FIT_YAWS; s++) {
        var a  = (s / FIT_YAWS) * Math.PI * 2;
        var ca = Math.cos(a), sa = Math.sin(a);
        var fx = dir.x * ca - dir.z * sa, fy = dir.y, fz = dir.x * sa + dir.z * ca;
        var ux = _u.x  * ca - _u.z  * sa, uy = _u.y,  uz = _u.x  * sa + _u.z  * ca;
        for (var i = 0; i < P.length; i += 3) {
          var qx = P[i] - tgt.x, qy = P[i + 1] - tgt.y, qz = P[i + 2] - tgt.z;
          var dep = d - (qx * fx + qy * fy + qz * fz);
          if (dep < 0.02) continue;                     // behind or on the lens
          var v = (qx * ux + qy * uy + qz * uz) / dep;  // screen units
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
      }
      if (!isFinite(lo) || !isFinite(hi)) return 0;
      // screen units back to world along Y (u is nearly vertical; correct for
      // the part of it that is not)
      var cosE = Math.abs(_u.y) || 1;
      return ((hi + lo) / 2) * d / cosE;
    }

    /* THE CROP MAY HIDE MESH; IT MAY NEVER HIDE A LABELLED PART.
       parts.js can ask for a distMul below 1 to push something out of frame —
       the transmitter's is there to lose the lanyard cord, which is most of
       that mesh's height and none of its teaching. Now that the fit is solved
       against real vertices it is a great deal tighter than it was, so the same
       0.62 cropped harder than it used to and took the top of the ANTENNA with
       the cord: part 01, sliced flat at the edge of the pane.
       So every crop is floored by a second fit over the hotspot anchors alone,
       at a wider margin so each anchor keeps room for its pill. A part with a
       number on it is always wholly in the picture. */
    var ANCHOR_FILL = 0.78;

    function anchorFills() {
      var F = fills();
      F.fW = Math.min(F.fW, ANCHOR_FILL);
      F.fH = Math.min(F.fH, ANCHOR_FILL);
      return F;
    }

    /* Distance for an arbitrary viewing direction, target held where it is.
       Used by look(), which must not re-compose the scene. */
    function distFor(dir, mul) {
      var F = fills();
      if (!F.w || !F.h) return st.fitD;
      var tgt = lookTarget(new THREE.Vector3());
      var d = solveDist(dir, tgt, F, st.pts) * (mul || 1);
      var a = solveDist(dir, tgt, anchorFills(), st.anchors);
      d = Math.max(d, a);
      return d > 0.02 ? Math.max(0.35, d) : st.fitD;
    }

    /* The opening framing. Solves the distance, then slides the target UP OR
       DOWN so the silhouette is centred rather than hanging with all the spare
       room on one side, then re-solves — three rounds is more than enough for
       a metre of movement to settle to under a pixel.

       The recentring is skipped when parts.js asked for a distMul below 1.
       That is an authored CROP — the transmitter's is there to push the lanyard
       cord off the top of the frame — and a crop is a composition. Re-centring
       one would undo the very thing it was written to do. */
    function solveHome() {
      var F = fills();
      if (!F.w || !F.h || !st.pts) return { d: st.fitD, y: st.autoY, a: st.fitA };
      var tgt = new THREE.Vector3();
      var y = 0, d = st.fitD;
      var centre = (st.home0.distMul || 1) >= 1;
      for (var k = 0; k < (centre ? 3 : 1); k++) {
        st.autoY = y;
        lookTarget(tgt);
        d = solveDist(HOME_DIR, tgt, F, st.pts);
        if (!(d > 0.02)) { d = st.fitD; break; }
        if (!centre) break;
        var mid = vMid(HOME_DIR, tgt, d, F);
        if (Math.abs(mid) < 0.002) break;
        y += mid;
      }
      st.autoY = y;
      lookTarget(tgt);
      return {
        d: Math.max(0.35, d),
        y: y,
        a: solveDist(HOME_DIR, tgt, anchorFills(), st.anchors)
      };
    }

    /* The fit is a few thousand dot products; nothing changes it but a resize,
       a new model, a new home or a new set of hotspots, so it is memoised
       against exactly those. */
    var fitKey = '';
    function refit(force) {
      var key = root.clientWidth + 'x' + root.clientHeight + '|' +
                st.home0.target.join(',') + '|' + st.home0.distMul +
                '|' + (st.pts ? st.pts.length : 0) +
                '|' + (st.anchors ? st.anchors.length : 0);
      if (!force && key === fitKey) return;
      fitKey = key;
      var r = solveHome();
      st.fitD  = r.d;
      st.autoY = r.y;
      st.fitA  = r.a || 0;
    }

    st.resize = function () {
      var w = root.clientWidth, h = root.clientHeight;
      if (!w || !h) return;
      if (activeStage === st) {
        core.renderer.setSize(w, h, false);
      }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // OrbitControls reads the element's box per event and needs no notice.
      // TrackballControls cached it and did — kept for any controls that still do.
      if (controls.handleResize) controls.handleResize();
      lead.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var prevD = st.fitD, prevY = st.autoY;
      refit(false);
      st.remeasure = true;
      /* Pills GLIDE while the model turns, because that reads as the label
         following the part. They must SNAP when the pane changes size: easing
         them across a stage that has just halved in width drags five leaders
         out through the edge of the canvas for a third of a second. */
      for (var mi = 0; mi < st.markers.length; mi++) st.markers[mi].placed = false;
      /* Hold the student's own framing through a resize: keep the camera on the
         same ray out of the target, at the same fraction of the fit radius. */
      if (prevD && !st.ease &&
          (Math.abs(st.fitD - prevD) > 1e-4 || Math.abs(st.autoY - prevY) > 1e-4)) {
        var off = camera.position.clone().sub(controls.target);
        lookTarget(controls.target);
        camera.position.copy(controls.target)
              .add(off.multiplyScalar(st.fitD / prevD));
      }
    };

    /* A subsample of the real vertices, in holder space. The bounding box is
       not a usable stand-in here — the receiver's box is mostly the hole in the
       middle of the collar — and the eight box corners would put the framing
       straight back where it was. */
    function samplePoints(obj) {
      var geos = [], total = 0;
      obj.updateWorldMatrix(true, true);
      obj.traverse(function (o) {
        var a = o.isMesh && o.geometry && o.geometry.attributes &&
                o.geometry.attributes.position;
        if (!a || !a.count) return;
        geos.push({ o: o, a: a });
        total += a.count;
      });
      if (!total) return null;
      var stride = Math.max(1, Math.ceil(total / FIT_PTS));
      var out = [], v = new THREE.Vector3();
      for (var g = 0; g < geos.length; g++) {
        var a = geos[g].a, mw = geos[g].o.matrixWorld;
        for (var i = 0; i < a.count; i += stride) {
          v.fromBufferAttribute(a, i).applyMatrix4(mw);
          out.push(v.x, v.y, v.z);
        }
      }
      return out.length ? new Float32Array(out) : null;
    }

    st.setModel = function (obj) {
      clear3(holder);
      var wrap = normalise(obj);
      holder.add(wrap);
      holder.updateMatrixWorld(true);
      scratch().box.setFromObject(holder);
      S.box.getCenter(st.ctr);
      st.pts   = samplePoints(holder);
      st.autoY = 0;
      st.laid  = false;
      root.classList.add('st-unlaid');
      for (var i = 0; i < st.markers.length; i++) st.markers[i].placed = false;
      refit(true);
      st.resize();
      st.home(true);
      return wrap;
    };

    function clear3(g) {
      for (var i = g.children.length - 1; i >= 0; i--) g.remove(g.children[i]);
    }

    st.setHome = function (h) {
      if (!h) return;
      st.home0 = { target: h.target || [0, 0, 0], distMul: h.distMul || 1 };
      if (st.pts) refit(false);
    };

    st.home = function (instant) {
      var d   = Math.max(st.fitD * (st.home0.distMul || 1), st.fitA || 0);
      var tgt = lookTarget(new THREE.Vector3());
      st.moveTo(tgt.clone().add(HOME_DIR.clone().multiplyScalar(d)), tgt,
                instant ? 0 : 620);
      st.spin = !reduced();
    };

    /* OrbitControls carries a decaying rotation delta while damping is on. If a
       move starts while that delta is still alive, the ease and the leftover
       drag fight each other for about half a second. Turning damping off for a
       single update() applies whatever is left and zeroes it — the documented
       way to flush it — and the ease then starts from a camera that is at rest. */
    function settle() {
      if (!controls.enableDamping) return;
      controls.enableDamping = false;
      try { controls.update(); } finally { controls.enableDamping = true; }
    }

    st.moveTo = function (camTo, tgtTo, dur) {
      settle();
      camera.up.copy(WORLD_UP);            // it never rolls now; keep it so
      if (!dur || reduced()) {
        camera.position.copy(camTo);
        controls.target.copy(tgtTo);
        st.ease = null;
        return;
      }
      st.ease = {
        t: 0, dur: dur,
        camFrom: camera.position.clone(), camTo: camTo.clone(),
        tgtFrom: controls.target.clone(), tgtTo: tgtTo.clone()
      };
    };

    /* OrbitControls will refuse a camera outside its polar limits, so a `cam`
       ray from parts.js that points nearly straight down has to be clamped
       HERE. Easing to a place the controls will immediately snap away from is
       how a "show me this part" move ends somewhere the student did not ask
       for. */
    function clampDir(d) {
      var r = d.length() || 1;
      var phi = Math.acos(Math.min(1, Math.max(-1, d.y / r)));
      var cl  = Math.min(POLAR_MAX, Math.max(POLAR_MIN, phi));
      if (Math.abs(cl - phi) < 1e-6) return d;
      var th = Math.atan2(d.x, d.z), sp = Math.sin(cl);
      return d.set(sp * Math.sin(th), Math.cos(cl), sp * Math.cos(th))
              .multiplyScalar(r);
    }

    /* Bring a part into view: the camera goes along the direction parts.js
       recorded for it, at the distance that frames the subject from THAT
       direction — a part viewed from overhead needs a different distance from
       one viewed side-on, and using the opening distance for both is what used
       to push the transmitter's antenna out of the top of the pane. */
    st.look = function (dirArr, distMul) {
      var d = new THREE.Vector3(dirArr[0], dirArr[1], dirArr[2]);
      if (!d.lengthSq()) d.copy(HOME_DIR);
      d.normalize();
      clampDir(d).normalize();
      var tgt  = lookTarget(new THREE.Vector3());
      var dist = distFor(d, distMul || st.home0.distMul || 1) * 0.98;
      st.moveTo(tgt.clone().add(d.multiplyScalar(dist)), tgt, 640);
      st.spin = false;
    };

    // ── hotspots ─────────────────────────────────────────────────────────
    /* onState(visible[]) — optional third argument. Called whenever the SET of
       markers on screen changes: visible[i] is false for a part that is
       currently behind the model, off the edge of the pane, or that the solver
       could not place. The part index uses it to say "turn to see" on that
       part's row, so a part is never silently missing from the picture. */
    st.setHotspots = function (items, onPick, onState) {
      clear(layer);
      clear(casL);
      clear(lnL);
      st.markers = [];
      st.items   = items || [];
      st.onPick  = onPick || null;
      st.onState = onState || null;
      st.sig     = '';
      st.at      = -1;
      /* Leaders and pills stay invisible until the first layout pass has
         actually placed them. Painting the SVG first is what produced the
         entry flash: five long black lines running off the bottom of the model
         to nothing, with no pills on their ends. */
      st.laid = false;
      st.remeasure = true;
      root.classList.add('st-unlaid');

      st.items.forEach(function (it, i) {
        var cas = svgEl('line', 'cas'); casL.appendChild(cas);
        var ln  = svgEl('line', 'ln');  lnL.appendChild(ln);

        var dot = el('span', 'hs-dot');
        layer.appendChild(dot);

        /* aria-hidden and out of the tab order on purpose. Every one of these
           is a duplicate of a row in the part index, which is a real list, is
           keyboard-driven and carries the alias — announcing both would read
           the whole unit twice. The pill is a pointer affordance for the same
           action. */
        var pill = el('button', 'hs');
        pill.type = 'button';
        pill.tabIndex = -1;
        pill.setAttribute('aria-hidden', 'true');
        pill.title = it.name;
        pill.appendChild(el('span', 'hs-n', two(i + 1)));
        pill.appendChild(el('span', 'hs-label', it.name));
        pill.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (st.onPick) st.onPick(i);
        });
        layer.appendChild(pill);

        st.markers.push({
          pill: pill, dot: dot, ln: ln, cas: cas,
          v3: new THREE.Vector3(it.pos[0], it.pos[1], it.pos[2]),
          idx: i,
          ax: 0, ay: 0,            // the anchor, projected
          px: 0, py: 0,            // where the solver put the pill
          lx: 0, ly: 0,            // where it is being drawn, easing toward px
          s: 0, h: 21,             // arc position on the ring, and half-extent
          pw: 30, ph: 30,
          placed: false, live: false, bad: false, fixed: false,
          occ: false, occN: 0, edge: false
        });
      });

      /* The anchors are also a framing constraint — see distFor. holder carries
         no transform of its own, so a parts.js position is already world. */
      var A = new Float32Array(st.items.length * 3);
      for (var k = 0; k < st.items.length; k++) {
        var p = st.items[k].pos;
        A[k * 3] = p[0]; A[k * 3 + 1] = p[1]; A[k * 3 + 2] = p[2];
      }
      st.anchors = A.length ? A : null;
      if (st.pts) refit(true);
    };

    st.mark = function (i) {
      if (i === st.at) return;
      st.at = i;
      st.markers.forEach(function (m, j) {
        var on = j === i;
        m.pill.classList.toggle('is-at', on);
        m.dot.classList.toggle('is-at', on);
        m.ln.classList.toggle('is-at', on);
        m.cas.classList.toggle('is-at', on);
      });
      // the current pill grows a name; its rectangle has to be re-read or the
      // de-collision pass will go on believing it is a 30px disc
      st.remeasure = true;
    };

    /* Pill rectangles and the two chip rectangles, read once per change rather
       than once per frame. All reads happen together, before any write, so this
       never thrashes layout. */
    var chips = [];
    function measurePills() {
      st.remeasure = false;
      for (var i = 0; i < st.markers.length; i++) {
        var m = st.markers[i];
        var pw = m.pill.offsetWidth, ph = m.pill.offsetHeight;
        if (pw) m.pw = pw;
        if (ph) m.ph = ph;
      }
      /* THE CHROME IS AN OCCUPIED RECTANGLE, NOT A Z-INDEX PROBLEM.
         The Reset chip and the turn hint are things the student reads. Round 4
         put the active pill "01 Antenna" entirely underneath the Reset chip and
         three more pills on top of the hint. Raising the pill above the button
         would only have swapped which of the two was unreadable. Both are
         measured here and handed to the solver as blocked ground, so a pill is
         never placed near them in the first place. */
      var rb = root.getBoundingClientRect();
      /* A pane that is hidden, or mid-resize, measures zero. Emptying the list
         first and then giving up on a zero read would leave the solver with NO
         obstacles until the next remeasure — which is a pill parked on the
         Reset button for as long as nobody selects a part. Keep the last good
         set instead: it is a frame or two stale at worst. */
      if (!rb.width || !rb.height) return;
      chips = [];
      function add(node) {
        if (!node) return;
        var r = node.getBoundingClientRect();
        if (!r.width || !r.height) return;      // display:none measures zero
        chips.push({ x0: r.left  - rb.left, y0: r.top    - rb.top,
                     x1: r.right - rb.left, y1: r.bottom - rb.top });
      }
      add(tools);
      add(hint.firstChild);       // the hint's own pill, not its full-width box
    }

    /* ── THE RING ────────────────────────────────────────────────────────
       An ellipse round the model's screen footprint, with a cumulative
       arc-length table so pills can be spaced in real pixels rather than in
       radians — a radian at the side of an ellipse is not a radian at the top.
       The table only depends on the two radii, so it is rebuilt on a resize
       and on a zoom, not on every frame of a turn. */
    var ring = { cx: 0, cy: 0, rw: 0, rh: 0, P: 1, cum: null };

    function ringTable(rw, rh) {
      if (!ring.cum) ring.cum = new Float64Array(RING_N + 1);
      if (ring.rw && Math.abs(rw - ring.rw) < 0.5 && Math.abs(rh - ring.rh) < 0.5) return;
      ring.rw = rw; ring.rh = rh;
      var px = rw, py = 0, acc = 0;
      ring.cum[0] = 0;
      for (var i = 1; i <= RING_N; i++) {
        var a = i / RING_N * TAU;
        var x = rw * Math.cos(a), y = rh * Math.sin(a);
        acc += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
        ring.cum[i] = acc; px = x; py = y;
      }
      ring.P = acc || 1;
    }
    function arcOf(phi) {
      var f = (((phi % TAU) + TAU) % TAU) / TAU * RING_N;
      var i = Math.floor(f);
      if (i >= RING_N) return ring.P;
      return ring.cum[i] + (ring.cum[i + 1] - ring.cum[i]) * (f - i);
    }
    function phiOf(s) {
      var P = ring.P;
      s = ((s % P) + P) % P;
      var lo = 0, hi = RING_N;
      while (hi - lo > 1) {
        var mid = (lo + hi) >> 1;
        if (ring.cum[mid] <= s) lo = mid; else hi = mid;
      }
      var d = ring.cum[hi] - ring.cum[lo] || 1;
      return ((lo + (s - ring.cum[lo]) / d) / RING_N) * TAU;
    }
    function ringX(phi) { return ring.cx + ring.rw * Math.cos(phi); }
    function ringY(phi) { return ring.cy + ring.rh * Math.sin(phi); }

    /* Ramanujan's second approximation. Wanted BEFORE ringTable is built, to
       decide how big the ring has to be, so it cannot come from the table.
       Its error is under 1e-5 for every aspect this stage produces. */
    function ellipseP(a, b) {
      var s = a + b;
      if (s <= 0) return 0;
      var t = 3 * (a - b) * (a - b) / (s * s);
      return Math.PI * s * (1 + t / (10 + Math.sqrt(Math.max(0, 4 - t))));
    }

    function hitsRect(cx, cy, hw, hh, R, pad) {
      return cx + hw + pad > R.x0 && cx - hw - pad < R.x1 &&
             cy + hh + pad > R.y0 && cy - hh - pad < R.y1;
    }

    /* Do the two segments properly cross? Used on the solved leaders by the
       uncrossing pass and on the drawn ones by the settle pass. */
    function segCross(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
      function cr(ox, oy, ax, ay, bx, by) {
        return (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);
      }
      var d1 = cr(b1x, b1y, b2x, b2y, a1x, a1y);
      var d2 = cr(b1x, b1y, b2x, b2y, a2x, a2y);
      var d3 = cr(a1x, a1y, a2x, a2y, b1x, b1y);
      var d4 = cr(a1x, a1y, a2x, a2y, b2x, b2y);
      return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
    }

    /* The arcs of the ring a pill may not stand on, because a chip is there.
       Sampled rather than solved: the exact intersection of an ellipse with a
       rounded rectangle is not worth the algebra, and 256 samples of a ring
       that is at most 1 600 px round resolves it to about six pixels. */
    /* Ground a pill may not stand on, this frame: the two chips, plus the
       CURRENT pill once it has been given its guaranteed slot. Treating the
       active pill as blocked ground rather than as one more thing to negotiate
       with is what makes "the selected part never loses its marker" hold
       without special-casing it in five separate passes. */
    var obst = [];

    var _mask = null;
    function chipBlocks(maxHW, maxHH) {
      var out = [];
      if (!obst.length) return out;
      if (!_mask) _mask = new Uint8Array(RING_N);
      var free = 0, k, r;
      for (k = 0; k < RING_N; k++) {
        var phi = k / RING_N * TAU;
        var x = ringX(phi), y = ringY(phi), hit = 0;
        for (r = 0; r < obst.length; r++) {
          if (hitsRect(x, y, maxHW, maxHH, obst[r], CHIP_PAD)) { hit = 1; break; }
        }
        _mask[k] = hit;
        if (!hit) free++;
      }
      if (free === RING_N) return out;
      /* If the chips would block most of the ring — a stage so small that the
         Reset button is a large part of it — blocking is worse than not
         blocking: the pills would have nowhere at all to stand. Yield. */
      if (free < RING_N * 0.3) return out;
      var start = 0;
      while (_mask[start]) start++;              // free > 0, so this terminates
      var j = 0;
      while (j < RING_N) {
        var i0 = (start + j) % RING_N;
        if (!_mask[i0]) { j++; continue; }
        var len = 0;
        while (len < RING_N && _mask[(start + j + len) % RING_N]) len++;
        var a0 = ring.cum[i0];
        var a1 = ring.cum[(start + j + len) % RING_N];
        if (a1 <= a0) a1 += ring.P;
        out.push({ s: ((a0 + a1) / 2) % ring.P, h: (a1 - a0) / 2, fix: true, m: null });
        j += len;
      }
      return out;
    }

    /* A HIDDEN PILL IS STILL MEASURED.
       Pills used to be hidden with display:none, and that quietly broke the
       solver: measurePills reads offsetWidth, a display:none element reports
       zero, the zero is rejected as a bad read and the marker keeps whatever
       width it had last time. So a part that had been round the back as a 30 px
       disc, then came into view as the current part carrying its name, was
       placed as if it were still 30 px wide while the browser drew 141 px of
       it. Measured: part 10 of the transmitter, stored 30, real 141.
       visibility:hidden takes it off the screen and leaves it in the layout, so
       the number the solver reads is always the number the browser will draw. */
    function hidePill(m, off) { m.pill.classList.toggle('hs-off', off); }

    function hideAllMarkers() {
      for (var i = 0; i < st.markers.length; i++) {
        var m = st.markers[i];
        hidePill(m, true);
        m.dot.style.display  = 'none';
        m.ln.style.display   = 'none';
        m.cas.style.display  = 'none';
        m.placed = false;
        m.live   = false;
      }
      reportState();
    }

    /* Tell whoever asked which parts are on screen, when that set changes. */
    function reportState() {
      var sig = '', i;
      for (i = 0; i < st.markers.length; i++) sig += st.markers[i].live ? '1' : '0';
      if (sig === st.sig) return;
      st.sig = sig;
      if (!st.onState) return;
      var vis = [];
      for (i = 0; i < st.markers.length; i++) vis.push(st.markers[i].live);
      try { st.onState(vis); } catch (e) { st.onState = null; }
    }

    function positionMarkers() {
      var w = root.clientWidth, h = root.clientHeight;
      if (!w || !h || !st.markers.length) return;
      var model = holder.children[0];
      /* Nothing to point at yet — the mesh is still being read out of the page.
         Numbered pills floating over an empty stage would be a lie, and their
         projection off an unframed camera is what produced NaN geometry. */
      if (!model) { hideAllMarkers(); return; }
      if (st.remeasure) measurePills();
      var s = scratch();
      var i, j, k;

      /* The model's screen footprint, from its projected bounding box. */
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      s.box.setFromObject(holder);
      for (i = 0; i < 8; i++) {
        s.c.set(i & 1 ? s.box.max.x : s.box.min.x,
                i & 2 ? s.box.max.y : s.box.min.y,
                i & 4 ? s.box.max.z : s.box.min.z).project(camera);
        var sx = (s.c.x * 0.5 + 0.5) * w, sy = (-s.c.y * 0.5 + 0.5) * h;
        if (sx < minX) minX = sx;
        if (sx > maxX) maxX = sx;
        if (sy < minY) minY = sy;
        if (sy > maxY) maxY = sy;
      }
      if (!isFinite(minX) || !isFinite(minY)) { minX = maxX = w / 2; minY = maxY = h / 2; }
      var cxs = (minX + maxX) / 2, cys = (minY + maxY) / 2;
      var halfW = Math.max((maxX - minX) / 2, 1), halfH = Math.max((maxY - minY) / 2, 1);

      st.occTick = (st.occTick + 1) % 3;
      var doOcc = st.occTick === 0;
      /* Leader stand-off is in pixels, so on a phone stage a third the size it
         reads as enormous. Scale it with the stage's short side. */
      var kk = Math.min(1, Math.max(0.7, Math.min(w, h) / 420));

      /* ── 1 · project, cull, occlude ──────────────────────────────────── */
      var live = [], maxHW = 0, maxHH = 0;
      for (k = 0; k < st.markers.length; k++) {
        var m = st.markers[k];
        m.live = false;
        m.bad  = false;
        s.p.copy(m.v3);
        holder.localToWorld(s.p);
        s.c.copy(s.p).project(camera);
        var isAt = m.idx === st.at;
        if (s.c.z > 1 && !isAt) continue;                 // behind the camera
        var ax = (s.c.x * 0.5 + 0.5) * w, ay = (-s.c.y * 0.5 + 0.5) * h;
        if (!isFinite(ax) || !isFinite(ay)) continue;
        /* An anchor off the pane has nothing on screen to point at — EXCEPT
           when it is the part the student has just selected. Zoom the
           transmitter all the way in and eight of its twelve anchors leave the
           pane; the selected one used to leave with them and the student lost
           the marker for the very part they had asked for. It stays, pinned to
           the edge of the picture in the part's own direction, with the leader
           dashed to say the point itself is outside the frame. */
        m.edge = false;
        if (ax < -30 || ax > w + 30 || ay < -30 || ay > h + 30 || s.c.z > 1) {
          if (!isAt) continue;
          m.edge = true;
          if (s.c.z > 1) { ax = w - ax; ay = h - ay; }   // behind: mirror through
          ax = Math.min(w - EDGE_PAD, Math.max(EDGE_PAD, ax));
          ay = Math.min(h - EDGE_PAD, Math.max(EDGE_PAD, ay));
        }
        m.ax = ax; m.ay = ay;

        if (doOcc) {
          s.dir.copy(s.p).sub(camera.position);
          var dist = s.dir.length();
          s.dir.normalize();
          s.ray.set(camera.position, s.dir);
          // stop well short of the point: anchors sit ON the surface, and too
          // tight a tolerance makes them occlude against their own face
          s.ray.far = dist - 0.06;
          var hidden = s.ray.far > 0 && s.ray.intersectObject(model, true).length > 0;
          /* Hysteresis. An anchor sitting exactly on the silhouette flips
             between hit and miss frame to frame, and a pill that blinks is
             worse than one that is a beat late. Two agreeing samples change the
             state; one does not. */
          if (hidden === m.occ) m.occN = 0;
          else if (++m.occN >= 2) { m.occ = hidden; m.occN = 0; }
        }

        /* HIDE, DO NOT FADE.
           .34 opacity put #3A2A0C on #F1A046 at about 1.9:1 — visible as a
           blob, unreadable as a number — on an anchor pointing at a part the
           student cannot see, sometimes floating clear of the silhouette
           altogether. A label for something that is not in the picture is not a
           faint label, it is a wrong one. The whole marker leaves the layer and
           that part's row in the index says "turn to see" instead.

           The CURRENT part is the one exception: the student asked for it by
           name and must not lose it mid-turn. It keeps its pill and its dot,
           and the leader goes dashed to say the point is round the back. */
        if (m.occ && m.idx !== st.at) continue;

        m.live = true;
        live.push(m);
        if (m.pw / 2 > maxHW) maxHW = m.pw / 2;
        if (m.ph / 2 > maxHH) maxHH = m.ph / 2;
      }

      if (!live.length) { hideAllMarkers(); return; }

      /* ── 2 · the ring ────────────────────────────────────────────────── */
      /* The radii are capped so that a pill CENTRED anywhere on the ring is
         wholly inside the layer — which is what makes "no pill is ever cropped"
         a property of the geometry rather than a hope. Where the cap bites, the
         pills sit a little over the edge of the silhouette instead of clear of
         it. That is the right trade: a pill over a black housing is perfectly
         readable (solid fill, white keyline); a pill sliced in half is not. */
      var limX = w / 2 - maxHW - EDGE_PAD;
      var limY = h / 2 - maxHH - EDGE_PAD;
      var rw = Math.max(18, Math.min(halfW + LEAD_CLEAR * kk, Math.max(18, limX)));
      var rh = Math.max(18, Math.min(halfH + LEAD_CLEAR * kk, Math.max(18, limY)));

      /* …and then grown, if the pills need more ring than the silhouette gives
         them. See RING_SLACK. The demand is the same circumscribed-radius sum
         the packing works in, so the two agree by construction. Growth is
         capped by limX/limY, so "a pill centred on the ring is wholly inside
         the layer" is still true afterwards. */
      var demand = 0;
      for (i = 0; i < live.length; i++) {
        demand += (Math.sqrt(live[i].pw * live[i].pw + live[i].ph * live[i].ph) +
                   PILL_GAP) * ARC_SAFE;
      }
      var want = demand * RING_SLACK;
      var have = ellipseP(rw, rh);
      if (have > 1 && want > have) {
        var grow = want / have;
        rw = Math.max(18, Math.min(rw * grow, Math.max(18, limX)));
        rh = Math.max(18, Math.min(rh * grow, Math.max(18, limY)));
      }

      var loX = rw + maxHW + EDGE_PAD, hiX = w - rw - maxHW - EDGE_PAD;
      var loY = rh + maxHH + EDGE_PAD, hiY = h - rh - maxHH - EDGE_PAD;
      // centre it on the model, but only as far as the layer allows
      ring.cx = loX <= hiX ? Math.min(Math.max(cxs, loX), hiX) : w / 2;
      ring.cy = loY <= hiY ? Math.min(Math.max(cys, loY), hiY) : h / 2;
      ringTable(rw, rh);
      var P = ring.P;

      /* ── 2b · THE CURRENT PILL IS PLACED FIRST, AND IS NEVER DROPPED ─────
         Round 5 solved every pill together and then threw away whichever ones
         it could not satisfy — including, at minimum zoom, the one the student
         had just clicked. `is-at hs-off`: the marker for the selected part,
         invisible. That is the one pill whose position is actually being read.

         So it is solved on its own first, against nothing but the layer edges
         and the two chips — a problem that always has an answer, because the
         pill is capped in CSS to fit inside the layer. It is then handed to
         every later pass as BLOCKED GROUND, exactly like the Reset chip, so it
         is avoided rather than negotiated with, and it can never be moved,
         crossed out or hidden by anything that comes after. */
      var act = null;
      for (i = 0; i < live.length; i++) {
        live[i].fixed = false;
        if (live[i].idx === st.at) act = live[i];
      }
      obst = chips;
      if (act) {
        placeActive(act);
        act.fixed = true;
        obst = chips.concat([{
          x0: act.px - act.pw / 2 - PILL_GAP, y0: act.py - act.ph / 2 - PILL_GAP,
          x1: act.px + act.pw / 2 + PILL_GAP, y1: act.py + act.ph / 2 + PILL_GAP
        }]);
      }

      function freeAt(x, y, hw, hh, pad) {
        if (x - hw < EDGE_PAD || x + hw > w - EDGE_PAD ||
            y - hh < EDGE_PAD || y + hh > h - EDGE_PAD) return false;
        for (var c = 0; c < chips.length; c++) {
          if (hitsRect(x, y, hw, hh, chips[c], pad)) return false;
        }
        return true;
      }

      function placeActive(M) {
        var hw = M.pw / 2, hh = M.ph / 2, g, sgn, sv, q, x, y;
        // 1 · its own place on the ring, then walked round it in both directions
        var phi0 = Math.atan2((M.ay - ring.cy) / ring.rh, (M.ax - ring.cx) / ring.rw);
        var s0 = arcOf(phi0);
        for (g = 0; g <= 60; g++) {
          for (sgn = 1; sgn >= -1; sgn -= 2) {
            sv = ((s0 + sgn * g * (P / 120)) % P + P) % P;
            q = phiOf(sv);
            x = ringX(q); y = ringY(q);
            if (freeAt(x, y, hw, hh, CHIP_PAD)) { M.s = sv; M.px = x; M.py = y; return; }
            if (!g) break;
          }
        }
        // 2 · off the ring altogether: a coarse scan of the layer, and of the
        //     free squares the one nearest the part's own anchor wins
        var lo = hw + EDGE_PAD, hi = w - hw - EDGE_PAD;
        var lo2 = hh + EDGE_PAD, hi2 = h - hh - EDGE_PAD;
        var bx = 0, by = 0, bd = Infinity, found = false, gx, gy;
        if (hi > lo && hi2 > lo2) {
          for (gx = 0; gx <= 14; gx++) {
            for (gy = 0; gy <= 14; gy++) {
              x = lo + (hi - lo) * (gx / 14);
              y = lo2 + (hi2 - lo2) * (gy / 14);
              if (!freeAt(x, y, hw, hh, CHIP_PAD)) continue;
              var dd0 = (x - M.ax) * (x - M.ax) + (y - M.ay) * (y - M.ay);
              if (dd0 < bd) { bd = dd0; bx = x; by = y; found = true; }
            }
          }
        }
        // 3 · a stage too small to hold the chrome and this pill both. Inside
        //     the layer still beats sliced off it, so clamp and accept the
        //     overlap — which is also the only branch that can put a pill on a
        //     chip, and it needs a stage under roughly 190 px square.
        M.px = found ? bx : Math.min(Math.max(M.ax, lo), Math.max(lo, hi));
        M.py = found ? by : Math.min(Math.max(M.ay, lo2), Math.max(lo2, hi2));
        M.s  = arcOf(Math.atan2((M.py - ring.cy) / ring.rh,
                                (M.px - ring.cx) / ring.rw));
      }

      /* ── 3 · nodes ───────────────────────────────────────────────────── */
      /* Each pill starts at the ring position of its own anchor's ANGLE, so the
         ring order is the anchor order — which is what makes crossing leaders
         impossible rather than unlikely. Half-extent is the circumscribed
         radius: |dc| >= rA + rB implies the two boxes are disjoint, whatever
         their aspect, by the Minkowski inequality. Clearing radii clears
         rectangles. The arc safety factor covers arc-vs-chord. */
      var nodes = [];
      for (i = 0; i < live.length; i++) {
        var n = live[i];
        n.h = (Math.sqrt(n.pw * n.pw + n.ph * n.ph) / 2 + PILL_GAP / 2) * ARC_SAFE;
        if (n.fixed) continue;             // already placed, and now an obstacle
        var phi = Math.atan2((n.ay - ring.cy) / ring.rh, (n.ax - ring.cx) / ring.rw);
        n.s = arcOf(phi);
        nodes.push({ s: n.s, h: n.h, fix: false, m: n });
      }

      /* If the ring genuinely cannot hold every pill, drop the last ones rather
         than draw them on top of each other. It takes a stage under about
         200 px square before this fires. */
      var blocks = chipBlocks(maxHW, maxHH);
      var need = 0;
      for (i = 0; i < blocks.length; i++) need += blocks[i].h * 2;
      for (i = 0; i < nodes.length; i++) need += nodes[i].h * 2;
      var spare = [];          // dropped here, offered a place again at 6b
      if (need > P) {
        nodes.sort(function (a, b) { return a.m.idx - b.m.idx; });
        while (nodes.length > 1 && need > P) {
          var drop = nodes.pop();
          need -= drop.h * 2;
          drop.m.live = false;
          drop.m.bad  = true;
          spare.push(drop.m);
        }
        live = live.filter(function (x) { return x.live; });
      }
      for (i = 0; i < blocks.length; i++) nodes.push(blocks[i]);

      /* ── 4 · pack, one dimension, in anchor order ────────────────────── */
      nodes.sort(function (a, b) { return a.s - b.s; });
      var N = nodes.length;

      /* Where the sequence is cut open. The current pill if there is one, so
         that it is the node nothing may push — it is the only pill whose exact
         position the student is actually reading. Otherwise the widest gap,
         which is the cheapest place to hold still. */
      var seam = 0, actAt = -1;
      for (i = 0; i < N; i++) if (nodes[i].m && nodes[i].m.idx === st.at) actAt = i;
      if (actAt >= 0) seam = actAt;
      else {
        var wide = -1;
        for (i = 0; i < N; i++) {
          var nx = (i + 1) % N;
          var gap = nodes[nx].s - nodes[i].s;
          if (gap < 0) gap += P;
          if (gap > wide) { wide = gap; seam = nx; }
        }
      }

      var U = [], H = [], FX = [];
      for (i = 0; i < N; i++) {
        var idx = (seam + i) % N;
        U.push(idx < seam ? nodes[idx].s + P : nodes[idx].s);
        H.push(nodes[idx].h);
        FX.push(nodes[idx].fix);
      }
      U.push(U[0] + P); H.push(H[0]); FX.push(true);   // the seam, come round
      FX[0] = true;

      for (var pass = 0; pass < 6; pass++) {
        for (i = 1; i <= N; i++) {
          if (FX[i]) continue;
          var lo = U[i - 1] + H[i - 1] + H[i];
          if (U[i] < lo) U[i] = lo;
        }
        for (i = N - 1; i >= 1; i--) {
          if (FX[i]) continue;
          var hi = U[i + 1] - H[i + 1] - H[i];
          if (U[i] > hi) U[i] = hi;
        }
      }
      for (i = 0; i < N; i++) {
        var nd = nodes[(seam + i) % N];
        if (nd.m) nd.m.s = ((U[i] % P) + P) % P;
      }

      /* ── 5 · place, then repair what the packing could not reach ─────── */
      for (i = 0; i < live.length; i++) {
        var lp = live[i];
        if (lp.fixed) continue;                       // solved at 2b; do not move
        var pa = phiOf(lp.s);
        lp.px = ringX(pa); lp.py = ringY(pa);
      }

      // current pill first, then index order: who yields to whom
      var ord = live.slice().sort(function (a, b) {
        return (a.idx === st.at ? -1 : a.idx) - (b.idx === st.at ? -1 : b.idx);
      });

      function slide(M, by) {
        M.s = ((M.s + by) % P + P) % P;
        var q = phiOf(M.s);
        M.px = ringX(q); M.py = ringY(q);
      }

      /* Is this pill standing on either chip, wherever it is right now? */
      function onChip(M, px, py, pad) {
        for (var c = 0; c < obst.length; c++) {
          if (hitsRect(px, py, M.pw / 2, M.ph / 2, obst[c], pad)) return true;
        }
        return false;
      }

      /* Walk the pill round the ring until it is off the chips, trying both
         directions and taking whichever clears first. The old version stepped
         once each way and gave up — which is how a 202 px active pill ended up
         lying across the turn hint: one step of a few pixels does not carry a
         pill that wide off a 150 px chip, and there was nothing to try again. */
      function offChips(M) {
        if (!onChip(M, M.px, M.py, CHIP_PAD)) return false;
        var s0 = M.s, g, d;
        for (g = 1; g <= 45; g++) {
          d = g * Math.max(7, P / 90);
          M.s = s0; slide(M, d);
          if (!onChip(M, M.px, M.py, CHIP_PAD)) return true;
          M.s = s0; slide(M, -d);
          if (!onChip(M, M.px, M.py, CHIP_PAD)) return true;
        }
        M.s = s0; slide(M, 0);        // nowhere on the ring is clear; put it back
        return true;
      }

      for (var rep = 0; rep < 8; rep++) {
        var moved = false;
        // a chip is not negotiable
        for (i = 0; i < ord.length; i++) {
          if (ord[i].fixed) continue;               // it is one of the obstacles
          if (offChips(ord[i])) moved = true;
        }
        // and no two pills may share ground
        for (i = 0; i < ord.length; i++) {
          for (k = i + 1; k < ord.length; k++) {
            var A = ord[i], B = ord[k];
            if (B.fixed) continue;         // the current pill never gives way
            var dx = (A.pw + B.pw) / 2 + PILL_GAP - Math.abs(A.px - B.px);
            var dy = (A.ph + B.ph) / 2 + PILL_GAP - Math.abs(A.py - B.py);
            if (dx <= 0 || dy <= 0) continue;
            moved = true;
            // B is the lower priority of the pair; it is the one that moves,
            // and it moves ALONG the ring, so the angular order — and with it
            // the promise that no two leaders cross — is untouched.
            var d = B.s - A.s;
            if (d >  P / 2) d -= P;
            if (d < -P / 2) d += P;
            slide(B, (d >= 0 ? 1 : -1) * (Math.min(dx, dy) + 2));
          }
        }
        if (!moved) break;
      }

      /* ── 5b · uncross ────────────────────────────────────────────────────
         Ring order = anchor order stops most crossings and is not quite enough
         on its own. Two anchors at very different distances from the centre,
         both carried a long way round the ring by the packing — which is what
         happens when four parts are bunched on one end of the housing and their
         pills have to spread over a third of the ring — can still cross with
         their order intact. Straight leaders need the stronger property, so the
         crossings are found and taken out.

         Exchanging the ring positions of two pills whose leaders cross always
         shortens those two leaders TAKEN TOGETHER: the two diagonals of a
         crossed quadrilateral are longer than the two sides. Every accepted
         swap therefore strictly reduces total leader length, so the pass cannot
         loop, and it stops at a state with no crossings left in it. A swap is
         only taken if both pills still stand clear where the other one was. */
      function segX(A, B) {
        return segCross(A.ax, A.ay, A.px, A.py, B.ax, B.ay, B.px, B.py);
      }
      function fits(X) {
        if (X.px - X.pw / 2 < 0.5 || X.px + X.pw / 2 > w - 0.5 ||
            X.py - X.ph / 2 < 0.5 || X.py + X.ph / 2 > h - 0.5) return false;
        var a;
        for (a = 0; a < obst.length; a++) {
          if (hitsRect(X.px, X.py, X.pw / 2, X.ph / 2, obst[a], CHIP_PAD)) return false;
        }
        for (a = 0; a < live.length; a++) {
          var O = live[a];
          if (O === X) continue;
          if (Math.abs(X.px - O.px) < (X.pw + O.pw) / 2 + PILL_GAP &&
              Math.abs(X.py - O.py) < (X.ph + O.ph) / 2 + PILL_GAP) return false;
        }
        return true;
      }
      function put(X, sv) {
        X.s = sv;
        var q = phiOf(sv);
        X.px = ringX(q); X.py = ringY(q);
      }
      for (var uc = 0; uc < 16; uc++) {
        var swapped = false;
        for (i = 0; i < live.length && !swapped; i++) {
          for (k = i + 1; k < live.length; k++) {
            var A3 = live[i], B3 = live[k];
            if (A3.fixed || B3.fixed) continue;    // 2b placed it; it does not move
            if (!segX(A3, B3)) continue;
            var sa = A3.s, sb = B3.s;
            put(A3, sb); put(B3, sa);
            if (fits(A3) && fits(B3)) { swapped = true; break; }
            put(A3, sa); put(B3, sb);          // it did not fit; leave it alone
          }
        }
        if (!swapped) break;
      }

      /* ── 6 · verify. Anything still wrong leaves the layer ───────────── */
      for (i = 0; i < ord.length; i++) {
        var V = ord[i];
        if (V.fixed) continue;      // 2b already proved this one; see the note
        if (V.px - V.pw / 2 < 0.5 || V.px + V.pw / 2 > w - 0.5 ||
            V.py - V.ph / 2 < 0.5 || V.py + V.ph / 2 > h - 0.5) V.bad = true;
        /* Standing on the Reset chip or the turn hint is the same class of
           failure as standing on another pill, and gets the same answer: the
           number goes, the dot stays. The ring blocks those arcs and the repair
           walks pills off them, so this only fires when the pane is too small
           for the chips and the pills both — and then a number under a button
           is worse than no number. */
        if (!V.bad && onChip(V, V.px, V.py, 1)) V.bad = true;
      }
      for (i = 0; i < ord.length; i++) {
        var X = ord[i];
        if (X.bad || X.fixed) continue;
        for (k = 0; k < i; k++) {
          var Y = ord[k];
          if (Y.bad) continue;
          if (Math.abs(X.px - Y.px) < (X.pw + Y.pw) / 2 + 0.5 &&
              Math.abs(X.py - Y.py) < (X.ph + Y.ph) / 2 + 0.5) { X.bad = true; break; }
          /* The uncrossing pass only takes a swap that fits. On a phone stage
             the ring is small enough that some swaps do not, and a crossing can
             survive it. A crossed pair of leaders is two labels pointing at
             each other's parts, which is worse than one label missing, so the
             lower-priority of the two gives up its number and keeps its dot —
             the same answer this pass already gives to a pill it cannot place.
             With that, "no leader ever crosses another" is a guarantee rather
             than a strong tendency. */
          if (segX(X, Y)) { X.bad = true; break; }
        }
      }

      /* ── 6b · a second chance, standing beside its own anchor ────────────
         The ring is one shared resource, and everything above competes for it.
         When it is full — zoom the transmitter all the way out and eight pills
         want more ring than a tiny silhouette provides — the loser simply
         vanished. But a pill does not have to be ON the ring to be right. It
         has to be inside the layer, off the chrome, clear of every other pill,
         and its leader must cross nothing.

         So each pill the ring could not take is offered twelve directions at
         three distances round its own anchor, and takes the first that passes
         ALL FOUR of those tests against everything already accepted. It is
         strictly additive: nothing already placed moves, and a pill only
         reappears having proved the same properties the ring pills proved. It
         cannot introduce an overlap or a crossing, because a candidate that
         would is rejected. Measured, transmitter at minimum zoom on a 545x595
         stage: 6 of 12 numbered before, 10 of 12 after. */
      function clearAt(M, x, y, list) {
        var hw = M.pw / 2, hh = M.ph / 2, c;
        if (x - hw < EDGE_PAD || x + hw > w - EDGE_PAD ||
            y - hh < EDGE_PAD || y + hh > h - EDGE_PAD) return false;
        for (c = 0; c < obst.length; c++) {
          if (hitsRect(x, y, hw, hh, obst[c], CHIP_PAD)) return false;
        }
        for (c = 0; c < list.length; c++) {
          var O = list[c];
          if (O === M) continue;
          if (Math.abs(x - O.px) < (M.pw + O.pw) / 2 + PILL_GAP &&
              Math.abs(y - O.py) < (M.ph + O.ph) / 2 + PILL_GAP) return false;
          if (segCross(M.ax, M.ay, x, y, O.ax, O.ay, O.px, O.py)) return false;
        }
        return true;
      }

      var kept = [];
      for (i = 0; i < ord.length; i++) if (!ord[i].bad) kept.push(ord[i]);

      var again = ord.concat(spare);
      again.sort(function (a, b) { return a.idx - b.idx; });
      for (i = 0; i < again.length; i++) {
        var B4 = again[i];
        if (!B4.bad) continue;
        var got = false;
        for (var rr = 0; rr < 3 && !got; rr++) {
          var rad = (B4.ph * 0.85 + 13 * kk) * (1 + rr * 0.85);
          for (var dd = 0; dd < 12 && !got; dd++) {
            var a4 = (dd / 12) * TAU + 0.2618;      // no candidate dead flat
            var cx4 = B4.ax + Math.cos(a4) * (rad + (B4.pw - B4.ph) / 2);
            var cy4 = B4.ay + Math.sin(a4) * rad;
            if (!clearAt(B4, cx4, cy4, kept)) continue;
            B4.px = cx4; B4.py = cy4;
            B4.bad = false; B4.live = true; B4.placed = false;
            kept.push(B4);
            got = true;
          }
        }
      }

      /* ── 7a · ease ───────────────────────────────────────────────────── */
      var shown = [];
      for (k = 0; k < st.markers.length; k++) {
        var d2 = st.markers[k];
        if (!d2.live) {
          hidePill(d2, true);
          d2.dot.style.display  = 'none';
          d2.ln.style.display   = 'none';
          d2.cas.style.display  = 'none';
          d2.placed = false;
          continue;
        }
        d2.dot.style.display = '';
        d2.dot.style.left = d2.ax + 'px';
        d2.dot.style.top  = d2.ay + 'px';
        // a part the solver could not place keeps its dot and loses its number
        if (d2.bad) {
          hidePill(d2, true);
          d2.ln.style.display   = 'none';
          d2.cas.style.display  = 'none';
          d2.placed = false;
          continue;
        }
        hidePill(d2, false);
        d2.ln.style.display   = '';
        d2.cas.style.display  = '';
        // pills glide, because that reads as the label following the part
        if (!d2.placed) { d2.lx = d2.px; d2.ly = d2.py; d2.placed = true; }
        else {
          d2.lx += (d2.px - d2.lx) * 0.3;
          d2.ly += (d2.py - d2.ly) * 0.3;
          if (Math.abs(d2.lx - d2.px) < 0.4) d2.lx = d2.px;
          if (Math.abs(d2.ly - d2.py) < 0.4) d2.ly = d2.py;
        }
        shown.push(d2);
      }

      /* ── 7b · the DRAWN rectangle is the promise, not the solved one ────
         Everything above proves things about px,py — where the solver decided
         each pill goes. What the student sees is lx,ly, which lags behind it,
         and two pills gliding past each other can overlap for a few frames
         while both destinations are perfectly clear. Measured at 1440x900,
         seven steps into a turn: pills 07 and 10, 10.3 x 4.0 px of overlap,
         with the solved positions clean.

         So the eased rectangles are checked as well, and a pill that is not
         clear where it is being DRAWN gives up its glide and goes straight to
         the place that was proved clear. Each pill can only do that once, and
         once every pill has done it the frame is exactly the verified state —
         so this always terminates, and always terminates somewhere legal. */
      for (var settle = 0; settle <= shown.length; settle++) {
        var dirty = false;
        for (i = 0; i < shown.length; i++) {
          var Q = shown[i];
          if (Q.lx === Q.px && Q.ly === Q.py) continue;      // already at rest
          var clash = Q.lx - Q.pw / 2 < 0.5 || Q.lx + Q.pw / 2 > w - 0.5 ||
                      Q.ly - Q.ph / 2 < 0.5 || Q.ly + Q.ph / 2 > h - 0.5;
          for (j = 0; !clash && j < obst.length; j++) {
            if (Q.fixed) break;                       // it IS one of them
            if (hitsRect(Q.lx, Q.ly, Q.pw / 2, Q.ph / 2, obst[j], 1)) clash = true;
          }
          for (j = 0; !clash && j < shown.length; j++) {
            var R = shown[j];
            if (R === Q) continue;
            if (Math.abs(Q.lx - R.lx) < (Q.pw + R.pw) / 2 + 1 &&
                Math.abs(Q.ly - R.ly) < (Q.ph + R.ph) / 2 + 1) clash = true;
            else if (segCross(Q.ax, Q.ay, Q.lx, Q.ly, R.ax, R.ay, R.lx, R.ly)) clash = true;
          }
          if (clash) { Q.lx = Q.px; Q.ly = Q.py; dirty = true; }
        }
        if (!dirty) break;
      }

      /* ── 7c · write ──────────────────────────────────────────────────── */
      for (i = 0; i < shown.length; i++) {
        var D = shown[i];
        D.pill.style.left = D.lx + 'px';
        D.pill.style.top  = D.ly + 'px';

        // stop the leader short of the pill so it does not poke out the far side
        var vx = D.lx - D.ax, vy = D.ly - D.ay;
        var vl = Math.sqrt(vx * vx + vy * vy) || 1;
        var stop = Math.min(vl * 0.42, 15 * kk);
        var x2 = D.lx - (vx / vl) * stop, y2 = D.ly - (vy / vl) * stop;
        D.ln.setAttribute('x1', D.ax);  D.ln.setAttribute('y1', D.ay);
        D.ln.setAttribute('x2', x2);    D.ln.setAttribute('y2', y2);
        D.cas.setAttribute('x1', D.ax); D.cas.setAttribute('y1', D.ay);
        D.cas.setAttribute('x2', x2);   D.cas.setAttribute('y2', y2);

        /* Only ever the current part, and only when the point it names is not
           actually in the picture — round the back of the model, or past the
           edge of the frame. It is the one marker allowed to survive either,
           and the dashed leader is what says so. */
        var back = D.occ || D.edge;
        D.dot.classList.toggle('behind', back);
        D.ln.classList.toggle('behind', back);
        D.cas.classList.toggle('behind', back);
      }

      reportState();

      /* Reveal the overlay in the SAME frame the pills received their
         positions — never before. This is what kills the entry flash. */
      if (!st.laid) {
        st.laid = true;
        root.classList.remove('st-unlaid');
      }
    }

    var SPIN_AXIS = new THREE.Vector3(0, 1, 0);

    st.tick = function (dt) {
      if (st.ease) {
        st.ease.t += dt;
        var k = Math.min(1, st.ease.t / st.ease.dur);
        var e = k < 0.5 ? 2 * k * k : -1 + (4 - 2 * k) * k;   // easeInOutQuad
        camera.position.lerpVectors(st.ease.camFrom, st.ease.camTo, e);
        controls.target.lerpVectors(st.ease.tgtFrom, st.ease.tgtTo, e);
        if (k >= 1) st.ease = null;
      } else if (st.spin) {
        /* Not controls.autoRotate: that one is tied to a 60 Hz assumption and
           turns at whatever rate the display happens to run at. Swinging the
           camera round the target's vertical axis by dt does the same thing at
           the same speed on a 120 Hz panel. OrbitControls re-derives its
           spherical from the camera position on every update, so a position
           written here is picked up rather than fought. */
        var v = camera.position.clone().sub(controls.target);
        v.applyAxisAngle(SPIN_AXIS, 0.00013 * dt);   // ~48 s for a full turn
        camera.position.copy(controls.target).add(v);
      }
      controls.update();
      positionMarkers();
      core.renderer.render(scene, camera);
    };

    st.activate = function () {
      if (activeStage === st) return;
      if (activeStage) activeStage.deactivate();
      root.removeAttribute('hidden');       // before resize: a hidden element measures 0
      // the canvas is the app's single WebGL context; it moves, it is not cloned
      root.insertBefore(core.canvas, lead);
      controls.enabled = true;
      activeStage = st;
      st.resize();
      startLoop();
    };

    st.deactivate = function () {
      controls.enabled = false;
      if (activeStage === st) {
        activeStage = null;
        stopLoop();
      }
      if (core.canvas.parentNode === root) root.removeChild(core.canvas);
      root.setAttribute('hidden', '');
    };

    st.destroy = function () {
      st.deactivate();
      if (root.parentNode) root.parentNode.removeChild(root);
      clear3(holder);
      st.markers = [];
      delete stages[tab];
    };

    // The stage changes size for reasons a window resize never fires for: the
    // narrow layout settling, the webfont landing, phone browser chrome sliding
    // away. Watch the element itself so the trackball's screen box is current.
    if (window.ResizeObserver) {
      var raf = 0;
      st.ro = new ResizeObserver(function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { st.resize(); });
      });
      st.ro.observe(root);
    }

    /* Default placement: fill the pane. A module that wants it inside its own
       layout just moves st.el and calls st.resize().
       It starts HIDDEN. Merely asking for a stage must not blank the pane's
       written reference — only activate() puts it on screen. */
    root.classList.add('st-fill');
    root.classList.add('st-unlaid');
    root.setAttribute('hidden', '');
    paneEls[tab].appendChild(root);
    return st;
  }

  var stages = {};
  function stage(tab) {
    if (!THREE_OK || !paneEls[tab]) return null;
    if (!stages[tab]) stages[tab] = makeStage(tab);
    return stages[tab];
  }

  /* ==========================================================================
     THE WRITTEN REFERENCE
     Drawn into every pane at boot. It is the no-WebGL fallback, it is the
     reading column beside the 3D view when there is one, and it is what comes
     back if a mesh turns out to be unreadable. It is never destroyed.
     ======================================================================== */

  var KICKER = {
    receiver:    '01 · Nomenclature',
    transmitter: '02 · Nomenclature',
    fit:         '03 · Drill',
    level:       '04 · Drill'
  };

  var NO3D = {
    receiver:    'you cannot turn the unit or point at a part. Every name, what each part does and the manual page it comes from are all here — that is the whole of what the 3D view says.',
    transmitter: 'you cannot turn the unit or point at a part. Every name, what each part does and the manual page it comes from are all here — that is the whole of what the 3D view says.',
    fit:         'you cannot practise the fit. The drill puts the collar on a dog and marks you on four decisions — how high the strap sits, where it sits round the neck, how tight it is, and whether the posts get through the coat to skin. That fourth one is the one that hurts dogs, and it is the one students skip. All four are below.',
    level:       'you cannot run the drill, which makes you climb the dial one level at a time and tells you when you overshot. The procedure below is the whole of what the manual gives.'
  };

  function refTop(tab, heading, sub) {
    var top = el('div', 'ref-top');
    var box = el('div', 'ref-top-in');
    top.appendChild(box);

    var k = el('p', 'ref-k');
    k.appendChild(el('i'));
    k.appendChild(el('span', null, KICKER[tab]));
    box.appendChild(k);

    box.appendChild(el('h2', 'ref-h', heading));
    box.appendChild(el('p', 'ref-s', sub));

    if (!THREE_OK) {
      var m = el('p', 'ref-miss');
      m.appendChild(el('b', null, 'Without 3D: '));
      m.appendChild(document.createTextNode(NO3D[tab]));
      box.appendChild(m);
    }
    return top;
  }

  // ── nomenclature: part index · 3D stage · reading column ────────────────

  /* tab -> a function that re-reads the pane's scroll position. Filled in by
     nomenRef; called when a pane becomes visible again. */
  var refSync = {};
  /* tab -> {enter, leave, destroy} for the shell's own holding view */
  var shellView = {};

  function nomenRef(tab) {
    var set = (window.PARTS || {})[tab];
    var root = el('div', 'ref ref-nom');
    if (THREE_OK) root.classList.add('has3d');
    root.appendChild(refTop(tab, set ? set.label : TITLE[tab],
                                 set ? set.sub   : ''));

    var body = el('div', 'ref-body');
    root.appendChild(body);
    if (!set || !set.items || !set.items.length) return root;

    var items = set.items;

    // the index
    var lwrap = el('div', 'pl-wrap');
    lwrap.appendChild(el('p', 'pl-t', items.length + ' parts'));
    var list = el('ol', 'pl');
    lwrap.appendChild(list);
    /* THE COLUMN HAS TO SAY IT CARRIES ON.
       At 1180x820 this scroller was 714 px of rows in 595 px of column, and it
       showed that in no way at all: rows 11 and 12 were reachable and invisible,
       and the list read as a list that ends at 10. A sticky footer chip counts
       what is still below and disappears the moment it is a lie, and there is a
       gradient under it so the cut edge does not read as the end of the ink. */
    var more = el('button', 'pl-more');
    more.type = 'button';
    var moreT = el('span', 'pl-more-t', '');
    more.appendChild(moreT);
    more.appendChild(el('span', 'pl-more-i'));
    lwrap.appendChild(more);

    // where the 3D stage goes, when there is one
    var swrap = THREE_OK ? el('div', 'st-wrap') : null;

    /* The reading column: every part, in order, one long readable column. Not a
       one-at-a-time panel — a student reading the whole unit through should not
       have to click twelve times, and the index stays in step by watching the
       scroll rather than by swapping the panel out. */
    var dwrap = el('div', 'dt-wrap');
    var dcol  = el('div', 'dt-col');
    dwrap.appendChild(dcol);

    body.appendChild(lwrap);
    if (swrap) body.appendChild(swrap);
    body.appendChild(dwrap);

    var btns = [];
    var arts = [];
    var eyes = [];      // each card's eyebrow — what a card is scrolled BY
    var at   = -1;

    /* The shell's own holding view. Declared here because mark() and select()
       both reach for view.st, and mark(0) runs while this function is still
       building. It stays {st:null} until the tab is first entered — nothing is
       loaded for a tab nobody opens. */
    var view = { st: null, asked: false, dead: false };

    /* Each card is main text plus a margin column of sources. They are two
       plain blocks that stack, exactly as before, until there is no 3D stage —
       and then the margin column moves out beside the text and fills the width
       the stage used to hold, instead of leaving 200 px of white in the middle
       of the pane. See .ref-nom:not(.has3d) .dt in style.css. */
    items.forEach(function (it, i) {
      var dt = el('article', 'dt');
      dt.id = 'dt-' + tab + '-' + i;

      var main = el('div', 'dt-main');
      var eye  = el('p', 'dt-n', two(i + 1) + ' / ' + two(items.length));
      main.appendChild(eye);
      main.appendChild(el('h3', 'dt-nm', it.name));
      if (it.alias) main.appendChild(el('p', 'dt-al', 'also called “' + it.alias + '”'));
      main.appendChild(el('hr', 'dt-rule'));
      main.appendChild(el('p', 'dt-tx', it.text));
      dt.appendChild(main);

      if (it.manualRef || it.slideNote) {
        var meta = el('div', 'dt-meta');
        if (it.manualRef) meta.appendChild(el('p', 'dt-ref', it.manualRef));
        if (it.slideNote) {
          var n = el('p', 'dt-note');
          n.appendChild(el('b', null, 'The course slide disagrees'));
          n.appendChild(document.createTextNode(it.slideNote));
          meta.appendChild(n);
        }
        dt.appendChild(meta);
      }

      dcol.appendChild(dt);
      arts.push(dt);
      eyes.push(eye);

      var li = el('li');
      var b  = el('button', 'pi');
      b.type = 'button';
      b.setAttribute('aria-current', 'false');
      b.setAttribute('aria-controls', dt.id);
      b.tabIndex = -1;
      b.appendChild(el('span', 'pi-n', two(i + 1)));
      var bod = el('span', 'pi-b');
      bod.appendChild(el('span', 'pi-nm', it.name));
      if (it.alias) bod.appendChild(el('span', 'pi-al', it.alias));
      /* A part that is round the back of the model has no marker on screen at
         all — see "HIDE, DO NOT FADE" in the stage. Rather than leave it
         silently missing from the picture, its row says where it went. */
      bod.appendChild(el('span', 'pi-off', 'turn to see'));
      b.appendChild(bod);
      b.addEventListener('click', function () { select(i, false, true, true); });
      li.appendChild(b);
      list.appendChild(li);
      btns.push(b);
    });

    function mark(i) {
      if (i === at) return;
      at = i;
      for (var j = 0; j < btns.length; j++) {
        var on = j === i;
        btns[j].setAttribute('aria-current', on ? 'true' : 'false');
        btns[j].tabIndex = on ? 0 : -1;
        arts[j].classList.toggle('is-at', on);
      }
      if (view.st) view.st.mark(i);
      keepIndexVisible(i);
    }

    /* Once the index is a horizontal run under the thumb it scrolls out of
       sight as fast as the column does. Keep the current chip on screen so
       "part 7 of 12" is always answerable without scrolling back. */
    function keepIndexVisible(i) {
      if (!narrow() || i < 0 || !btns[i]) return;
      var lb = list.getBoundingClientRect();
      if (!lb.width) return;              // pane hidden — every rect reads zero
      var pad = 30;
      var bb = btns[i].getBoundingClientRect();
      var to = null;
      if (bb.left < lb.left + pad)   to = list.scrollLeft + (bb.left - lb.left) - pad;
      if (bb.right > lb.right - pad) to = list.scrollLeft + (bb.right - lb.right) + pad;
      if (to == null) { edges(); return; }
      if (list.scrollTo) list.scrollTo({ left: to, behavior: reduced() ? 'auto' : 'smooth' });
      else list.scrollLeft = to;
      edges();
    }

    /* The index is a horizontal scroller at 414 — 590 px of chips in a 414 px
       window — and it said so in no way at all: part 04 was clipped mid-word at
       the right edge and 05 was simply not there. These two classes drive a
       fade at whichever end still has chips beyond it. */
    function edges() {
      var over = list.scrollWidth - list.clientWidth;
      lwrap.classList.toggle('has-l', over > 4 && list.scrollLeft > 3);
      lwrap.classList.toggle('has-r', over > 4 && list.scrollLeft < over - 3);
      down();
    }
    list.addEventListener('scroll', edges, { passive: true });

    /* The vertical half of the same job — see the note where .pl-more is built.
       It counts what is genuinely still below the fold rather than saying "more"
       and leaving the student to find out. */
    function down() {
      if (narrow()) { lwrap.classList.remove('has-d'); return; }
      var over = lwrap.scrollHeight - lwrap.clientHeight;
      if (over < 6 || lwrap.scrollTop > over - 6) {
        lwrap.classList.remove('has-d');
        return;
      }
      var fold = lwrap.getBoundingClientRect().bottom - more.offsetHeight;
      var n = 0;
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].getBoundingClientRect().bottom > fold + 2) n++;
      }
      if (!n) { lwrap.classList.remove('has-d'); return; }
      moreT.textContent = n + (n === 1 ? ' more part below' : ' more parts below');
      lwrap.classList.add('has-d');
    }
    lwrap.addEventListener('scroll', down, { passive: true });
    more.addEventListener('click', function () {
      var to = lwrap.scrollTop + lwrap.clientHeight - 70;
      if (lwrap.scrollTo) lwrap.scrollTo({ top: to, behavior: reduced() ? 'auto' : 'smooth' });
      else lwrap.scrollTop = to;
    });

    // Which element scrolls depends on the viewport: the reading column at
    // desktop width, the whole body once the layout stacks. Ask the media
    // query rather than guessing from scrollHeight — a short column has no
    // overflow at all and the guess lands on the wrong element.
    function scroller() { return narrow() ? body : dwrap; }

    /* How much of the scroller's top edge is already spoken for. At desktop
       width, nothing but breathing room. Once the layout stacks, the model and
       the part run are both sticky at the top of the same scroller, so a card
       aligned to scrollTop would open underneath them. */
    function topInset() {
      if (!narrow()) return 12;
      var o = 10;
      if (swrap && swrap.offsetHeight) o += swrap.offsetHeight;
      o += lwrap.offsetHeight;
      return o;
    }

    /* A card is scrolled by its EYEBROW, not by its box. The box starts a
       card's worth of padding above the eyebrow, so aligning the box left the
       previous card's tail — its manual-page chip and the rule under it —
       stranded at the top of the column above a heading it did not belong to.
       Aligning the eyebrow means a card always opens on its own number. */
    function scrollToCard(i, smooth) {
      if (i < 0 || i >= arts.length || !eyes[i]) return;
      var sc = scroller();
      var sr = sc.getBoundingClientRect();
      if (!sr.height) return;                    // pane hidden; nothing to align
      var to = sc.scrollTop + eyes[i].getBoundingClientRect().top - sr.top
             - topInset();
      to = Math.max(0, Math.min(to, sc.scrollHeight - sc.clientHeight));
      if (Math.abs(to - sc.scrollTop) < 1.5) return;
      if (sc.scrollTo) sc.scrollTo({ top: to, behavior: (smooth && !reduced()) ? 'smooth' : 'auto' });
      else sc.scrollTop = to;
    }

    function select(i, focus, scroll, turn) {
      if (i < 0 || i >= items.length) return;
      mark(i);
      if (focus) btns[i].focus();
      if (turn && view.st && items[i].cam) view.st.look(items[i].cam);
      if (scroll) scrollToCard(i, true);
    }

    var ticking = false;
    function spy() {
      ticking = false;
      var sc = scroller();
      var br = sc.getBoundingClientRect();
      if (!br.height) return;   // pane is hidden — every rect reads zero, and
                                // taking that at face value marks the last part
      /* The reading column used to carry 60vh of padding purely so this could
         reach the last item. That is half a screen of dead space and it made
         the scrollbar lie. Instead: if the scroller is at the bottom, the last
         part is the one being read, by definition. */
      if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) {
        mark(arts.length - 1);
        return;
      }
      var line = br.top + topInset() + 36;
      var best = 0;
      for (var i = 0; i < arts.length; i++) {
        if (arts[i].getBoundingClientRect().top <= line) best = i;
      }
      mark(best);
    }
    /* Hiding a pane throws away its scroller's position, so the column silently
       returns to the top while the index would still be marking wherever the
       student had got to. Re-read the scroll whenever the pane comes back —
       and land ON the card. A browser restores an element's scroll offset
       across a reload to the pixel it was left at, which is how the column came
       back mid-card, opening on a stranded "MANUAL P.9, P.27, P.32" chip with
       no heading over it. */
    refSync[tab] = function () {
      requestAnimationFrame(function () {
        edges();
        down();
        if (!scroller().scrollTop) { mark(0); keepIndexVisible(0); return; }
        spy();
        if (at >= 0) { scrollToCard(at, false); keepIndexVisible(at); }
      });
    };
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(spy);
    }
    dwrap.addEventListener('scroll', onScroll, { passive: true });
    body.addEventListener('scroll', onScroll, { passive: true });

    list.addEventListener('keydown', function (ev) {
      var to = -1;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') to = Math.min(items.length - 1, at + 1);
      else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') to = Math.max(0, at - 1);
      else if (ev.key === 'Home') to = 0;
      else if (ev.key === 'End') to = items.length - 1;
      if (to < 0) return;
      ev.preventDefault();
      select(to, true, true, true);
    });

    mark(0);

    /* ── the shell's holding view ────────────────────────────────────────
       Puts the actual unit into swrap and wires the pills to the same select()
       the index uses. It is torn down the instant nomen.js claims the tab. */
    if (swrap) {
      shellView[tab] = {
        enter: function () {
          if (view.dead) return;
          if (!view.st) {
            view.st = stage(tab);
            if (!view.st) return;
            swrap.appendChild(view.st.el);
            view.st.el.classList.remove('st-fill');
            if (set.home) view.st.setHome(set.home);
            view.st.setHotspots(items,
              function (i) { select(i, false, true, true); },
              function (vis) {
                for (var i = 0; i < btns.length; i++) {
                  btns[i].classList.toggle('is-off', vis[i] === false);
                }
              });
          }
          view.st.activate();
          if (view.asked) return;
          view.asked = true;
          mesh(tab).then(function (gltf) {
            if (view.dead || !view.st) return;
            root.classList.add('has3d');
            view.st.resize();
            view.st.setModel(gltf.scene);
            view.st.mark(-1);
            view.st.mark(at);
            announce(set.label + ' model ready. ' + items.length +
                     ' numbered parts. Drag to turn it.');
          })['catch'](function () {
            /* veilFail has already put a dismissible card in this pane, and
               dismissing it brings the reading column back. Two things have to
               happen here as well: give the column the stage's width back
               rather than leaving an empty box in the layout, and re-arm, so
               that coming back to the tab genuinely tries again — the loader
               has already dropped the rejected promise from its cache. */
            if (view.dead) return;
            view.asked = false;
            root.classList.remove('has3d');
            if (view.st) view.st.deactivate();
          });
        },
        leave: function () { if (view.st) view.st.deactivate(); },
        destroy: function () {
          view.dead = true;
          if (view.st) { view.st.destroy(); view.st = null; }
          delete shellView[tab];
        }
      };
    }

    return root;
  }

  // ── drills: the rules they test, as cards, then the prose ───────────────

  function cards(into, head, rows) {
    into.appendChild(el('h3', 'dr-h', head));
    var grid = el('div', 'dr-cards');
    rows.forEach(function (r, i) {
      var c = el('div', 'dr-card');
      c.appendChild(el('b', null, String(i + 1)));
      var t = el('div', 'dr-card-t');
      t.appendChild(el('strong', null, r[0]));
      t.appendChild(el('span', null, r[1]));
      c.appendChild(t);
      grid.appendChild(c);
    });
    into.appendChild(grid);
    return into;
  }

  function section(into, head, paras, source) {
    var sec = el('section', 'dr-sec');
    sec.appendChild(el('h3', 'dr-h', head));
    var cols = el('div', 'dr-cols');
    paras.forEach(function (p) { cols.appendChild(rich(el('p', 'dr-p'), p)); });
    sec.appendChild(cols);
    if (source) sec.appendChild(el('p', 'dr-src', source));
    into.appendChild(sec);
    return into;
  }

  function drillRef(tab) {
    var root = el('div', 'ref ref-drill');
    var body = el('div', 'ref-body');
    var box  = el('div', 'dr-in');
    var colA = el('div', 'dr-a');
    var colB = el('div', 'dr-b');
    box.appendChild(colA);
    box.appendChild(colB);
    body.appendChild(box);

    if (tab === 'fit') {
      root.appendChild(refTop(tab, 'Fit the collar',
        'What a correct fit is, and what a loose one costs the dog'));

      cards(colA, 'The three targets — manual p.27', [
        ['Contacts on skin',
         'Both posts press firmly against the dog’s skin. On skin — never on top of coat. If the coat is too deep for the posts to reach, Dogtra’s remedy is to clip the hair down on the neck until both points touch skin (p.43) — not to pull the strap tighter, and not to wind the dial up.'],
        ['Two fingers under the strap',
         'You should just be able to slip two fingers underneath. Two: not one, not three. One finger is a collar that will rub. Three is a collar that has stopped working.'],
        ['Beside the windpipe',
         'High on the neck, one contact either side of the windpipe — never underneath it, and never down where the strap can slide toward the shoulders.']
      ]);

      section(colB, 'Wear limits', [
        ['Reposition the receiver ', { s: 'every few hours' }, ', and take it off after ',
         { s: 'eight hours' }, ' of use. Check the skin under the contacts every single time — ' +
         'you are looking for redness, a flattened patch, or any break in the skin.']
      ], 'Manual p.27. This is a welfare rule, not a suggestion.');

      section(colB, 'Why loose is the failure that matters', [
        ['A loose collar is the common student failure and it is not a small one. The housing ' +
         'slides, the contacts rub and lift off the skin, and the correction the dog feels stops ' +
         'matching the one you sent. The dog is then being taught by a signal that changes at random.'],
        ['Tight is not the answer either. The strap is right when it stays put under a shake and ' +
         'you can still get two fingers between strap and neck. Check it again after ten minutes ' +
         'of work: a coat flattens, and a collar that was right at the gate goes loose in the field.'],
        ['If the dog stops answering a level it answered ten minutes ago, check the collar before ' +
         'you touch the dial. Turning the level up is the wrong answer to a strap that has slipped.']
      ]);

    } else if (tab === 'level') {
      root.appendChild(refTop(tab, 'Find the working level',
        'The lowest level the dog will tell you it noticed'));

      cards(colA, 'The procedure — manual p.31', [
        ['Start at the bottom',
         'Always start at the lowest level and work up. Never start high and come down — a dog that has been overstimulated once will read every later correction through that.'],
        ['Stop at a mild response',
         'You have found it the moment the dog tells you it noticed, and no more than that. The right level is the smallest one that gets an answer.'],
        ['Move it as the session moves',
         'Arousal and distraction change through a session, and the working level changes with them. Expect to adjust rather than set it once at the gate.']
      ]);

      section(colB, 'What a mild response looks like', [
        ['An ear flick. A head turn. A glance away, or a small change in the set of the ears. ',
         { s: 'Never a yelp, never a flinch' }, ', never a dog that drops or spins. If you saw any ' +
         'of those, you are far past the working level — come down and start again.'],
        ['If you see nothing at all after several levels, stop climbing and check the collar. ' +
         'A strap that has gone loose reads exactly like a dog that has not felt anything.']
      ], 'The manual’s whole procedure is three sentences (p.31). Everything finer-grained here is course doctrine, not manufacturer instruction.');

      section(colB, 'Two things students get caught out on', [
        ['This unit has ', { s: '100 levels, 0–100' }, '. Any slide showing 0–127 is the older ' +
         '1900S — a different generation, with a Nick/Constant toggle switch. Wrong machine.'],
        ['The course says ', { s: 'working level' }, ' and ', { s: 'recognition level' },
         '. The manual never uses those words: it says “the right stimulation level” and ' +
         '“a mild response”. Same thing. Know both, so the manual’s wording does not catch you out.']
      ]);

    } else {
      root.appendChild(refTop(tab, 'Collar conditioning',
        'Teaching the dog that coming to you is what turns the pressure off'));

      cards(colA, 'The loop', [
        ['Load the line',
         'Walk away — back, left, right. The dog does not come with you, so the line takes up and goes tight. That tension is the question you have just asked her.'],
        ['Start tapping the moment it loads',
         'The instant the line is tight, tap the nick at her working level. One tap. Not before it loads: a slack line with the collar going is a correction for being right, and that is where a dog learns the collar is weather rather than information.'],
        ['Keep tapping while it stays tight',
         'One, two, three, four. For as long as the line is loaded, the taps keep coming. Going quiet halfway through takes the pressure off for nothing she did, which teaches the same wrong thing as stopping too late — only earlier.'],
        ['Stop the instant it goes slack',
         'She turns, she steps in, the line drops — your thumb stops. That is the whole lesson. She is not learning from the taps; she is learning from the tapping ENDING.'],
        ['Again, in a different direction',
         'Change direction and repeat. She is not learning a route; she is learning that a slack line and being with you are the same thing.']
      ]);

      section(colB, 'Why the stopping is the teacher', [
        ['This is negative reinforcement: a behaviour grows because something the dog wants to end, ends. ',
         { s: 'The stimulation is not the lesson — it stopping is.' },
         ' A handler who taps at the right moment and carries on tapping at the wrong one has taught nothing, and has spent the dog’s patience doing it.'],
        ['Which is why the thing to watch is the ', { s: 'line' }, ', not the dog. The line going slack is your signal to stop, ' +
         'and it is readable from anywhere in the field. By the time you have finished reading the dog, you are two taps late.']
      ]);

      section(colB, 'The three ways students get this wrong', [
        [{ s: 'Tapping on a slack line.' }, ' She was already right, and that tap corrected her for it. ' +
         'Nothing about the collar makes sense to a dog this happens to twice.'],
        [{ s: 'One more tap after the line drops.' }, ' It lands at the exact moment she got it right. ' +
         'Often enough and what she learns is that coming to you is not the thing that stops it, which is the exercise upside down.'],
        [{ s: 'Climbing the dial instead of tapping.' }, ' A dog that has not understood yet is not a dog that needs more level. ' +
         'Turning it up gets you a bigger reaction to a question she still cannot read — see ', { s: 'tab 04' }, '.']
      ], 'Fit first (tab 03), working level second (tab 04), and only then this. A collar that has slipped, or a level found in a quiet yard and never re-checked, will fail here and look like a dog that will not learn.');
    }

    root.appendChild(body);
    return root;
  }

  function buildRef(tab) {
    return (tab === 'fit' || tab === 'level' || tab === 'condition')
      ? drillRef(tab) : nomenRef(tab);
  }

  function renderRef() {
    TABS.forEach(function (t) {
      var pane = paneEls[t];
      clear(pane);
      pane.appendChild(buildRef(t));
    });
    if (!THREE_OK) $('noglBar').removeAttribute('hidden');
  }

  /* The reference is hidden, never removed — so a mesh that turns out to be
     unreadable can bring it straight back rather than leaving an empty pane
     under an error card. */
  function hideRef(tab) {
    var r = paneEls[tab].querySelector('.ref');
    if (r) r.setAttribute('hidden', '');
  }
  function showRef(tab) {
    var r = paneEls[tab].querySelector('.ref');
    if (r) r.removeAttribute('hidden');
    if (refSync[tab]) refSync[tab]();
  }

  /* A module bug, reported where the student is rather than in a console they
     will never open. One notice per pane; it replaces itself. */
  function paneNotice(tab, msg) {
    var pane = paneEls[tab];
    if (!pane) return;
    var old = pane.querySelector('.pnote');
    if (old) pane.removeChild(old);
    var n = el('div', 'pnote');
    n.setAttribute('role', 'status');
    n.appendChild(el('p', 'pnote-t', msg));
    var x = el('button', 'pnote-x', 'Dismiss');
    x.type = 'button';
    x.addEventListener('click', function () {
      if (n.parentNode) n.parentNode.removeChild(n);
    });
    n.appendChild(x);
    pane.appendChild(n);
    announce(msg);
  }

  // ── routing ─────────────────────────────────────────────────────────────
  var enterHooks = { receiver: [], transmitter: [], fit: [], level: [], condition: [] };
  var leaveHooks = { receiver: [], transmitter: [], fit: [], level: [], condition: [] };
  var entered     = {};
  var claimed     = {};
  var current     = null;
  var moduleTried = {};

  /* A module's own bug must not reach the console — hard gate 1 is judged
     across a full interaction pass, and the previous round deliberately
     rethrew out of band, which meant the first thing any module got wrong
     failed the gate for everybody. Contain it: one bad hook still does not
     stop the others, and the student is told in the pane. */
  function fire(list, tab) {
    for (var i = 0; i < list.length; i++) {
      try {
        list[i]();
      } catch (e) {
        paneNotice(tab, TITLE[tab] + ' had a problem starting. ' +
                        'Everything it teaches is written out here.');
        showRef(tab);
      }
    }
  }

  /* A module only takes the pane off the written reference once it has proved
     it wants it, by registering an onEnter hook for that tab. A stub file, or a
     module that only claims one of its two tabs, therefore leaves the reference
     standing rather than blanking the stage. Claiming also tears down the
     shell's own holding view for that tab, so the two never both draw. */
  function claimIfOwned(tab) {
    if (claimed[tab] || !THREE_OK) return;
    if (!enterHooks[tab].length) return;
    claimed[tab] = true;
    if (shellView[tab]) shellView[tab].destroy();
    hideRef(tab);
  }

  function ensureModule(tab) {
    var src = MODULE_SRC[tab];
    if (!src) return Promise.resolve(false);
    // The single-file build concatenates the modules into the page ahead of us
    // and marks them here, because there is no nomen.js beside it to fetch.
    if (window.EC_INLINED) return Promise.resolve(true);
    if (moduleTried[src]) return moduleTried[src];
    moduleTried[src] = loadScript(src)
      .then(function () { return true; })
      ['catch'](function () { return false; });
    return moduleTried[src];
  }

  function paintTab(tab) {
    TABS.forEach(function (t) {
      var on = t === tab;
      tabEls[t].setAttribute('aria-selected', on ? 'true' : 'false');
      tabEls[t].tabIndex = on ? 0 : -1;
      if (on) paneEls[t].removeAttribute('hidden');
      else    paneEls[t].setAttribute('hidden', '');
    });
    if (refSync[tab]) refSync[tab]();
  }

  function apply(tab) {
    if (tab === current) return;
    var prev = current;
    current = tab;
    paintTab(tab);

    if (prev) {
      entered[prev] = false;
      if (shellView[prev]) shellView[prev].leave();
      fire(leaveHooks[prev], prev);
    }

    announce(TITLE[tab]);

    if (!THREE_OK) return;   // the written reference is already in the pane

    ensureModule(tab).then(function () {
      if (current !== tab) return;
      claimIfOwned(tab);
      entered[tab] = true;
      if (claimed[tab]) fire(enterHooks[tab], tab);
      else if (shellView[tab]) {
        try {
          shellView[tab].enter();
        } catch (e) {
          paneNotice(tab, 'The 3D view could not start on this tab. ' +
                          'Everything it shows is written out here.');
        }
      }
    });
  }

  function fromHash() {
    var h = (location.hash || '').replace(/^#/, '').toLowerCase();
    return TABS.indexOf(h) >= 0 ? h : TABS[0];
  }

  function go(tab) {
    if (TABS.indexOf(tab) < 0) return;
    if (location.hash !== '#' + tab) {
      location.hash = '#' + tab;   // hashchange does the rest; back works
      if (current !== tab) apply(tab);
      return;
    }
    apply(tab);
  }

  window.addEventListener('hashchange', function () { apply(fromHash()); });

  /* Crossing the 860 px breakpoint swaps which element scrolls — the reading
     column at desktop width, the whole pane once the layout stacks — and the
     new one starts at the top. Without this the part index would go on marking
     wherever the old scroller had been left. */
  var resizeWait = false;
  window.addEventListener('resize', function () {
    if (resizeWait) return;
    resizeWait = true;
    setTimeout(function () {
      resizeWait = false;
      if (current && refSync[current]) refSync[current]();
      if (activeStage) activeStage.resize();
    }, 140);
  });

  TABS.forEach(function (t) {
    tabEls[t].addEventListener('click', function () { go(t); });
  });

  // arrow keys walk the rail, the way a tablist is meant to
  document.querySelector('.tabs').addEventListener('keydown', function (ev) {
    var i = TABS.indexOf(current);
    var to = -1;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') to = (i + 1) % TABS.length;
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') to = (i + TABS.length - 1) % TABS.length;
    else if (ev.key === 'Home') to = 0;
    else if (ev.key === 'End') to = TABS.length - 1;
    if (to < 0) return;
    ev.preventDefault();
    go(TABS[to]);
    tabEls[TABS[to]].focus();
  });

  // ── the contract ────────────────────────────────────────────────────────
  window.EC = {
    three: THREE_OK,
    /* Bumped by hand whenever the stage's solver changes. It exists so a
       verification pass can tell at a glance whether the page it is measuring
       is the page that was just written, rather than a cached one. */
    build: 'shell-r11',

    // 'dog' | 'receiver' | 'transmitter' -> Promise<GLTF>
    mesh: mesh,

    onEnter: function (tab, fn) {
      if (!enterHooks[tab] || typeof fn !== 'function') return;
      enterHooks[tab].push(fn);
      // registering after the tab is already up should still run — and should
      // still take the pane off the written reference
      if (tab === current && entered[tab]) {
        claimIfOwned(tab);
        setTimeout(function () { fire([fn], tab); }, 0);
      }
    },

    onLeave: function (tab, fn) {
      if (!leaveHooks[tab] || typeof fn !== 'function') return;
      leaveHooks[tab].push(fn);
    },

    pane: function (tab) { return paneEls[tab] || null; },

    announce: announce,

    /* The shared 3D stage. Returns null when there is no WebGL — a module must
       check EC.three (or a null return) before using it.

       stage.el          the host element, already filling the pane. Move it
                         into your own layout and call stage.resize().
       stage.overlay     .hs-layer, stacked above the canvas, for your own DOM
       stage.leaders     the SVG layer under .hs-layer, for leader lines
       stage.scene / .camera / .controls / .holder
       stage.setModel(obj3d)          normalises and shows it
       stage.setHome({target,distMul}) opening framing, from parts.js
       stage.setHotspots(items, onPick) items need pos[3] and name
       stage.mark(i) / .look(camDir) / .home() / .moveTo(camV3,tgtV3,ms)
       stage.activate() / .deactivate() / .resize() / .destroy()

       Hotspot pills, anchor dots, leader lines and their occluded states are
       styled in style.css (.hs, .hs-n, .hs-label, .hs-dot, .st-lead .ln/.cas).
       Solve legibility there once, not three times. */
    stage: stage,

    // extras — not part of the required shape, but there is no sense in three
    // copies of any of these
    normalise: normalise,
    notice: paneNotice,
    current: function () { return current; }
  };

  // ── boot ────────────────────────────────────────────────────────────────
  renderRef();
  apply(fromHash());

})();
