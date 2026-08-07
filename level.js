/* ============================================================================
   TAB 04 · FIND THE WORKING LEVEL — Highland Canine Training
   Owner of this file: LEVEL. It owns level.js and its own block at the foot of
   style.css. Nothing else.

   WHAT THIS TAB IS FOR
   A student does not fail a dog by not knowing the word "rheostat". They fail
   it by starting high. So this tab is not a diagram of a dial — it is a run:
   the same dog from tab 3, wearing the collar the student has just been marked
   on, and a dial. Start at the bottom, step up ONE level at a time, and stop
   the moment she tells you she noticed. Then commit to a number and be marked
   on the PROTOCOL, not only on the answer.

   THE FOUR THINGS THAT ARE MARKED SEPARATELY, because each is a real failure
   an instructor watches for on the field:
     · opening above level 5
     · jumping more than two levels at a time
     · pressing the same level over and over
     · pushing high enough to make her flinch
   A fifth is marked as well — whether the student CONFIRMED the level before
   committing to it — because that is the one that makes the rest work.

   SHE DOES NOT ANSWER EVERY TIME. At her own threshold she shows you on a bit
   over half the presses, and a level or two above it she still misses some.
   That is deliberate and it is the whole reason the protocol says test a level
   again rather than climb. She also moves for her own reasons: a small number
   of presses BELOW anything she can feel produce a glance or a shift that has
   nothing to do with the collar, and it is drawn to look like the real thing,
   because on a real dog it does. A student who commits off one sign gets that
   said to them in the marking.

   HONESTY. A model is not a dog. The signs here are larger and cleaner than the
   ones on the end of your lead, and two real ones are missing outright: this
   mesh has no eyelids and no tongue, so it cannot blink and it cannot lick its
   lips. Both are named in the tab as MISSING rather than faked — a student who
   learns to watch for a blink that this app invented has learned the wrong
   thing.

   VOCABULARY (discrepancy D6). Highland Canine says "working level"; the manual
   (p.31) says "the right stimulation level" and "a mild response". The course
   words are what the student is examined on, so they are what the UI uses — and
   the manual's own phrase is stated once, under the heading, so nobody is
   caught out reading the book.

   100 LEVELS (manual p.7). Not 127 — that is the 1900S, a different generation.

   ── HOW IT IS BUILT ────────────────────────────────────────────────────────
   The 3D goes through EC.stage('level'): one WebGL context for the whole app,
   one canvas, the shell's orbit feel, its Reset chip and its hotspot layer.
   Nothing here creates a renderer.

   The neck frame and the rig are LIFTED, not re-derived — every number below
   was measured off this same dog.glb in the previous build and is only valid
   for this mesh. They are carried here in full rather than read out of
   window.CollarKit, because CollarKit is published by fitting.js, fitting.js is
   another owner's file, and it is only injected when tab 3 is opened. A student
   who deep-links to #level must not get a dog with no collar because they
   happened not to visit the tab before it.

   NOTHING IS RIGIDLY CUT. The head piece starts ABOVE the strap and its bottom
   rim is weighted 0, so the rim never moves and the join is invisible wherever
   it falls; the neck bends over its length the way a real one does. The older
   rigid cut forced the strap to stand proud of the neck and read as a LOOSE
   collar on the very dog a student had just been marked 4/4 for fitting snugly.
   It is not coming back. The ears are skinned the same way — cutting them tore
   the base open past about twenty degrees.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.EC || typeof window.EC.onEnter !== 'function') return;

  var EC  = window.EC;
  var TAB = 'level';
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ── measured neck frame ────────────────────────────────────────────────
     u     : neck axis, head-ward.  eTop : 12 o'clock (dorsal).  eSide: 3.
     Angle is measured from eTop toward eSide, so 180 deg is the underside of
     the neck — the windpipe. prof is a radial profile, 7 heights x 32 angles,
     raycast off dog.glb, which is what makes the strap wrap an OVAL neck
     instead of passing through a round guess. */
  var NECK = {
    u:     [0.04994, 0.74222, 0.66830],
    eTop:  [0, 0.66913, -0.74314],
    eSide: [0.99875, -0.03711, -0.03341],
    base:  [-0.163, 0.10, 0.22],
    top:   [-0.170, 0.28, 0.31],
    prof: [
      [0.1196,0.1268,0.1361,0.1402,0.1392,0.1363,0.1304,0.1248,0.1227,0.1237,0.1246,0.1258,0.1243,0.1176,0.1159,0.1221,0.1268,0.1160,0.1043,0.0940,0.0874,0.0839,0.0847,0.0878,0.0912,0.0963,0.1053,0.1147,0.1208,0.1264,0.1288,0.1241],
      [0.1150,0.1194,0.1253,0.1268,0.1251,0.1229,0.1205,0.1157,0.1126,0.1139,0.1158,0.1192,0.1213,0.1242,0.1261,0.1268,0.1162,0.0973,0.0955,0.0937,0.0877,0.0849,0.0835,0.0831,0.0844,0.0889,0.0963,0.1030,0.1070,0.1111,0.1149,0.1158],
      [0.1054,0.1077,0.1124,0.1156,0.1161,0.1168,0.1184,0.1208,0.1233,0.1233,0.1209,0.1170,0.1183,0.1229,0.1224,0.1201,0.1094,0.1010,0.0959,0.0896,0.0823,0.0799,0.0779,0.0768,0.0774,0.0804,0.0857,0.0913,0.0954,0.0998,0.1034,0.1050],
      [0.0873,0.0909,0.0961,0.1008,0.1035,0.1056,0.1071,0.1088,0.1109,0.1137,0.1179,0.1226,0.1331,0.1354,0.1284,0.1210,0.1108,0.1064,0.0959,0.0817,0.0743,0.0684,0.0648,0.0635,0.0648,0.0677,0.0704,0.0726,0.0753,0.0785,0.0824,0.0851],
      [0.0628,0.0685,0.0768,0.0867,0.0967,0.1045,0.1070,0.1077,0.1088,0.1120,0.1242,0.1329,0.1311,0.1275,0.1207,0.1134,0.1071,0.0976,0.0834,0.0709,0.0667,0.0629,0.0602,0.0588,0.0589,0.0597,0.0594,0.0592,0.0591,0.0592,0.0591,0.0600],
      [0.0537,0.0595,0.0692,0.0853,0.1003,0.1104,0.1160,0.1208,0.1283,0.1275,0.1257,0.1211,0.1184,0.1144,0.1091,0.1017,0.0955,0.0872,0.0701,0.0609,0.0586,0.0553,0.0527,0.0519,0.0521,0.0517,0.0503,0.0489,0.0483,0.0482,0.0488,0.0504],
      [0.0515,0.0576,0.0681,0.0866,0.1055,0.1170,0.1206,0.1220,0.1239,0.1258,0.1288,0.1415,0.1386,0.1146,0.0977,0.0900,0.0829,0.0746,0.0639,0.0542,0.0468,0.0441,0.0422,0.0407,0.0400,0.0397,0.0396,0.0398,0.0407,0.0420,0.0441,0.0472]
    ]
  };

  /* ── the rig ────────────────────────────────────────────────────────────
     Weights run 0 (stays put) to 1 (moves fully). neckFull must not run past
     1.10: the muzzle hangs forward and LOW, so it sits low on the neck axis —
     take the band any higher and the jaw picks up a partial weight, the head
     stops rotating and starts deforming, and the dog gets a squashed face.
     Between 0.90 and 1.10 there is nothing but neck. */
  var RIG = {
    headCut:  0.90,     // where the mesh is split into two draw calls
    neckZero: 0.90,     // ... and the split rim is weighted 0, so it never moves
    neckFull: 1.10,
    earFull:  -0.055,   // distances along each ear's own axis, from its tip
    earZero:  -0.100,
    earReach: 0.062,    // beyond this from the axis, it is skull, not ear
    ears: [
      { // far side from the opening camera
        tip:   [-0.1487, 0.4546, 0.4012],
        axis:  [ 0.0374, 0.8395, 0.5420],
        pivot: [-0.1510, 0.3806, 0.3710],
        swing: [ 0.9976, 0.0000, -0.0688] },
      { // near side — this is the ear a student watches
        tip:   [-0.0278, 0.4483, 0.3382],
        axis:  [ 0.5567, 0.7886, 0.2611],
        pivot: [-0.0594, 0.3758, 0.3234],
        swing: [ 0.4246, 0.0000, -0.9054] }
    ]
  };

  /* The collar is tab 3's own correct answer: high on the neck, 4:30 so it is
     beside the windpipe, two fingers of slack. A student marked 4 of 4 over
     there has to see that same collar here, or the two tabs teach different
     things. */
  /* These three numbers are NOT free. They are tab 3's published correct
     answer — CollarKit.goodFit — and they must track it. 0.80 shipped here
     while tab 3 scored 0.80 as 3 of 4, "past the neck, the strap is round the
     jaw": the drill failed a fit and the next tab showed it as the reference.
     Read from CollarKit where it exists so the two can never drift again. */
  var FIT = (function () {
    var g = window.CollarKit && window.CollarKit.goodFit;
    return g
      ? { height: g.height, clockDeg: (g.clock * 180) / Math.PI, tension: g.tension }
      : { height: 0.49, clockDeg: 140, tension: 0.53 };
  })();
  function slackAt(t) { return 0.026 - t * 0.034; }   // -> 0.0073, inside SNUG

  /* ── how she arrives ────────────────────────────────────────────────────
     ONE dog — the same animal as tab 3 — in a different state each run. That
     is not a device for variety: the manual's own procedure (p.31) ends by
     saying to expect the level to move as arousal and distraction change, and
     four named dogs would have taught the opposite. `read` is how freely she
     shows you; a dog locked on to a noise two kennels away genuinely tells you
     less than the same dog on a quiet morning, and that difference is most of
     the skill. */
  var STATES = [
    { id: 'quiet', name: 'Quiet morning',
      line: 'First session of the day. Nothing going on in the yard, and she is with you.',
      band: [4, 9],   read: 1.10 },
    { id: 'van',   name: 'Straight off the van',
      line: 'Just unloaded. Wound up, ears everywhere, still taking the place in.',
      band: [11, 19], read: 0.95 },
    { id: 'late',  name: 'Two hours into a session',
      line: 'Tired, and starting to switch off. She has stopped offering you much.',
      band: [7, 13],  read: 1.05 },
    { id: 'noise', name: 'A dog barking two kennels down',
      line: 'Locked on to it. Hard to reach, and she will not show you a great deal.',
      band: [18, 30], read: 0.78 }
  ];

  /* What each sign is called, and what kind of thing it is.
       sign  — she acknowledged the stimulation. This is what you are after.
       clear — she acknowledged it, and rather more than you wanted.
       bad   — you have gone too far.
       noise — she moved for her own reasons. Nothing to do with the collar.
       none  — nothing. */
  var WORDS = {
    earFlick:   'the near ear flicked back',
    earTwitch:  'a small twitch of the near ear',
    earsSwivel: 'both ears swivelled back for a moment',
    glance:     'a brief glance away',
    headDip:    'the head dipped, very slightly',
    headTurn:   'she turned her head toward the collar',
    lookBack:   'she looked right round at her flank',
    shakeOff:   'she shook her head, the way she would at a fly',
    flinch:     'she flinched — ears flat, and she dropped away from it',
    yelp:       'she jumped and vocalised',
    awayLook:   'she looked off across the yard',
    settle:     'she shifted her weight and settled again',
    none:       'no change at all'
  };
  var SUBTLE = ['earFlick', 'earTwitch', 'earsSwivel', 'glance', 'headDip'];
  var CLEAR  = ['headTurn', 'lookBack', 'shakeOff'];
  var NOISE  = ['awayLook', 'settle'];

  /* Which part of her the "tell me what happened" cue points at. Keys are the
     sign names above; values are model-space anchors. */
  var CUE_AT = {
    earFlick: 'ear', earTwitch: 'ear', earsSwivel: 'ears',
    glance: 'head', headDip: 'head', headTurn: 'head', lookBack: 'head',
    shakeOff: 'head', flinch: 'head', yelp: 'head',
    awayLook: 'head', settle: 'head'
  };

  // ── tiny helpers ────────────────────────────────────────────────────────
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function sv(tag, at) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in at) if (Object.prototype.hasOwnProperty.call(at, k)) n.setAttribute(k, at[k]);
    return n;
  }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  }
  /* House rule: no hex in JS. The two physical colours the rig needs have no
     natural home in the cascade, so they are declared as custom properties in
     this module's own CSS block and read back here. */
  function cssVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name);
      v = (v || '').trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  // ── module state ────────────────────────────────────────────────────────
  var built   = false;     // DOM built
  var asked   = false;     // meshes requested
  var ready   = false;     // rig standing
  var st      = null;      // the shared stage
  var dead    = false;
  var needFrame = false;   // the opening framing was solved against a dead pane

  var lastErr = null;      // read by the verification hook; never by the tab

  var ui = {};             // every element the drill writes to
  var rigRoot = null, joltG = null, headGeom = null, mat = null;
  var headRest = null, headRestN = null;
  var wNeck = null, wEar = null, whichEar = null;
  var earPivot = null, neckPivot = null;
  var AX_TWIST = null, AX_NOD = null, EAR_SWING = null;
  var modelScale = 1;

  // the run
  var state = null, threshold = 0, level = 0;
  var log = [], done = false, hints = false, hintsEver = false;
  var replays = 0, lastEntry = null, noiseLeft = 0;

  // playback
  var anim = null, idleT0 = 0, cue = null;

  var V3, U, ETOP, ESIDE, BASE, TOPV;
  var MAT = null;

  // ── neck maths ──────────────────────────────────────────────────────────
  function vecs() {
    if (U) return;
    V3 = function (a) { return new THREE.Vector3(a[0], a[1], a[2]); };
    U = V3(NECK.u); ETOP = V3(NECK.eTop); ESIDE = V3(NECK.eSide);
    BASE = V3(NECK.base); TOPV = V3(NECK.top);
  }
  function centreAt(s) { return BASE.clone().lerp(TOPV, s); }
  function radiusAt(s, ang) {
    var P = NECK.prof, NS = P.length, NA = P[0].length;
    var f = Math.max(0, Math.min(NS - 1.0001, s * (NS - 1)));
    var i = Math.floor(f), ti = f - i;
    var g = (ang / (Math.PI * 2)) * NA;
    g = ((g % NA) + NA) % NA;
    var k = Math.floor(g), tk = g - k;
    function row(R) { return R[k % NA] * (1 - tk) + R[(k + 1) % NA] * tk; }
    return row(P[i]) * (1 - ti) + row(P[i + 1]) * ti;
  }
  function dirAt(ang) {
    return ETOP.clone().multiplyScalar(Math.cos(ang))
      .add(ESIDE.clone().multiplyScalar(Math.sin(ang)));
  }
  /* A loose strap does not stay concentric — it drops onto the underside of the
     neck, which is exactly why a loose collar stops making contact. At this
     tension the sag is a fraction of a millimetre; the term is kept so the two
     tabs build the strap from identical maths. */
  function strapFace(s, a, slack) {
    var sag = Math.max(0, slack) * 0.55 * Math.cos(a);
    return radiusAt(s, a) + Math.max(slack, -0.004) - sag;
  }
  function makeStrapGeom(s, slack) {
    var NA = 120, W = 0.028, pos = [], idx = [], k;
    var half = U.clone().multiplyScalar(W / 2);
    for (k = 0; k <= NA; k++) {
      var a = (k / NA) * Math.PI * 2;
      var p = centreAt(s).add(dirAt(a).multiplyScalar(strapFace(s, a, slack)));
      pos.push(p.x - half.x, p.y - half.y, p.z - half.z,
               p.x + half.x, p.y + half.y, p.z + half.z);
    }
    for (k = 0; k < NA; k++) { var b = k * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }

  /* The housing is cut out of the real receiver.glb rather than modelled as a
     box, so the unit on the dog is the same object the student learned the
     parts of on tab 1. The whole collar mesh cannot be draped: it is a rigid
     loop, taller than it is wide, and this neck's section is about 0.26 across
     by 0.15 deep — a 2:1 squash would deform the housing. So the strap is built
     from the measured profile and only the housing is borrowed. */
  var HOUSING = { yMax: -0.175, xAbs: 0.215 };

  function extractHousing(root) {
    var src = null;
    root.updateMatrixWorld(true);
    root.traverse(function (o) { if (o.isMesh && !src) src = o; });
    if (!src) return null;

    var g = src.geometry;
    var pos = g.attributes.position, uv = g.attributes.uv, nrm = g.attributes.normal;
    var idx = g.index, m = src.matrixWorld, v = new THREE.Vector3(), i;

    var P = new Float32Array(pos.count * 3);
    for (i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m);
      P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z;
    }
    var keep = [], tri = idx ? idx.count / 3 : pos.count / 3;
    for (var t = 0; t < tri; t++) {
      var a = idx ? idx.getX(t * 3)     : t * 3;
      var b = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
      var c = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      var my = (P[a * 3 + 1] + P[b * 3 + 1] + P[c * 3 + 1]) / 3;
      var mx = (P[a * 3]     + P[b * 3]     + P[c * 3])     / 3;
      if (my < HOUSING.yMax && Math.abs(mx) < HOUSING.xAbs) keep.push(a, b, c);
    }
    if (!keep.length) return null;

    var out = repack(keep, P, uv, nrm);
    out.computeBoundingBox();
    var bb = out.boundingBox;
    var size = bb.getSize(new THREE.Vector3());
    var ctr  = bb.getCenter(new THREE.Vector3());
    out.translate(-ctr.x, -ctr.y, -ctr.z);
    // a 1900X housing is about two inches on a neck a foot and a half round;
    // sized off its own cut extent it came out looking like a second collar
    var k = 0.058 / Math.max(size.x, 1e-6);
    out.scale(k, k, k);
    out.computeBoundingBox();
    return {
      geom: out, mat: src.material,
      halfY: (out.boundingBox.max.y - out.boundingBox.min.y) / 2
    };
  }

  function repack(list, P, uv, nrm) {
    var map = {}, po = [], uo = [], no = [], io = [], i, x;
    for (i = 0; i < list.length; i++) {
      var v = list[i];
      x = map[v];
      if (x === undefined) {
        x = po.length / 3; map[v] = x;
        po.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
        if (uv)  uo.push(uv.getX(v), uv.getY(v));
        if (nrm) no.push(nrm.getX(v), nrm.getY(v), nrm.getZ(v));
      }
      io.push(x);
    }
    var out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(po, 3));
    if (uo.length) out.setAttribute('uv', new THREE.Float32BufferAttribute(uo, 2));
    if (no.length) out.setAttribute('normal', new THREE.Float32BufferAttribute(no, 3));
    out.setIndex(io);
    return out;
  }

  function makeReceiverMesh(h, s, a, slack) {
    var d = dirAt(a).normalize(), c = centreAt(s);
    var along = U.clone().normalize();
    var side  = new THREE.Vector3().crossVectors(along, d).normalize();
    var m4 = new THREE.Matrix4().makeBasis(side, d.clone().negate(), along);
    var mesh = h ? new THREE.Mesh(h.geom, h.mat || MAT.box)
                 : new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.024, 0.052), MAT.box);
    mesh.applyMatrix4(m4);
    mesh.position.copy(c).add(d.clone().multiplyScalar(
      strapFace(s, a, slack) + (h ? h.halfY - 0.004 : 0.012)));
    return mesh;
  }

  // ── cutting the dog into a rig ──────────────────────────────────────────
  function segment(rootObj) {
    rootObj.updateMatrixWorld(true);
    var src = null;
    rootObj.traverse(function (o) { if (o.isMesh && !src) src = o; });
    if (!src) return null;

    var g = src.geometry;
    var pos = g.attributes.position, uv = g.attributes.uv, nrm = g.attributes.normal;
    var idx = g.index, m = src.matrixWorld, v = new THREE.Vector3(), i;

    var n = pos.count, P = new Float32Array(n * 3);
    for (i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m);
      P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z;
    }
    var tb = BASE.dot(U), tt = TOPV.dot(U), span = tt - tb;

    // Two pieces only. The ears stay part of the head and are skinned.
    var low = [], high = [];
    var tri = idx ? idx.count / 3 : n / 3;
    for (var t = 0; t < tri; t++) {
      var a = idx ? idx.getX(t * 3)     : t * 3;
      var b = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
      var k = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      var cx = (P[a * 3]     + P[b * 3]     + P[k * 3])     / 3;
      var cy = (P[a * 3 + 1] + P[b * 3 + 1] + P[k * 3 + 1]) / 3;
      var cz = (P[a * 3 + 2] + P[b * 3 + 2] + P[k * 3 + 2]) / 3;
      var s = ((cx * U.x + cy * U.y + cz * U.z) - tb) / span;
      (s >= RIG.headCut ? high : low).push(a, b, k);
    }
    if (!low.length || !high.length) return null;

    /* Both pieces are open shells where they part, so they are drawn
       double-sided — otherwise a low camera looks straight through into the
       neck. The material is cloned because EC.mesh hands out scene copies that
       SHARE materials with the master. */
    mat = src.material.clone();
    mat.side = THREE.DoubleSide;
    return [repack(low, P, uv, nrm), repack(high, P, uv, nrm)];
  }

  function smooth(a, b, x) {
    var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  /* For every vertex of the head piece: how much of the neck's bend it takes,
     which ear owns it, and how much of that ear's swing it takes. The weight
     runs 1 at the tip to 0 in the skull on a smoothstep, so there is no edge
     anywhere for a seam to open at. The two ears carry different axes because
     this dog's head is turned — a symmetric rig looked wrong on one side. */
  function buildSkin(geom) {
    var pos = geom.attributes.position.array;
    var n = pos.length / 3;
    var tb = BASE.dot(U), tt = TOPV.dot(U), span = tt - tb;
    var ears = [], e;
    for (e = 0; e < RIG.ears.length; e++) {
      ears.push({ tip: V3(RIG.ears[e].tip), ax: V3(RIG.ears[e].axis) });
    }
    var d = new THREE.Vector3(), q = new THREE.Vector3();

    wNeck = new Float32Array(n);
    wEar  = new Float32Array(n);
    whichEar = new Int8Array(n);
    for (var z = 0; z < n; z++) whichEar[z] = -1;

    for (var i = 0; i < n; i++) {
      var x = pos[i * 3], y = pos[i * 3 + 1], zz = pos[i * 3 + 2];
      var s = ((x * U.x + y * U.y + zz * U.z) - tb) / span;
      wNeck[i] = smooth(RIG.neckZero, RIG.neckFull, s);

      var best = 0, who = -1;
      for (e = 0; e < ears.length; e++) {
        d.set(x - ears[e].tip.x, y - ears[e].tip.y, zz - ears[e].tip.z);
        var alng = d.dot(ears[e].ax);
        q.copy(ears[e].ax).multiplyScalar(alng);
        if (d.sub(q).length() > RIG.earReach) continue;
        var w = smooth(RIG.earZero, RIG.earFull, alng);
        if (w > best) { best = w; who = e; }
      }
      if (who >= 0 && best > 0.002) { wEar[i] = best; whichEar[i] = who; }
    }
  }

  // ── posing ──────────────────────────────────────────────────────────────
  var qA, qB, qF, qNeck = [], qEar = [[], []], vTmp, nTmp;
  var BUCKETS = 24;                 // weight is quantised so the trigonometry
  var lastPose = [999, 999, 999, 999];  // stays off the per-vertex loop

  function applySkin(twist, nod, earFar, earNear) {
    if (!wNeck) return;
    if (twist === lastPose[0] && nod === lastPose[1] &&
        earFar === lastPose[2] && earNear === lastPose[3]) return;
    lastPose[0] = twist; lastPose[1] = nod; lastPose[2] = earFar; lastPose[3] = earNear;

    var D2R = Math.PI / 180, b, e;
    qA.setFromAxisAngle(AX_TWIST, twist * D2R);
    qB.setFromAxisAngle(AX_NOD, nod * D2R);
    qF.copy(qA).multiply(qB);
    var ear = [earFar, earNear];
    for (b = 0; b <= BUCKETS; b++) {
      var f = b / BUCKETS;
      if (!qNeck[b]) qNeck[b] = new THREE.Quaternion();
      qNeck[b].set(0, 0, 0, 1).slerp(qF, f);
      for (e = 0; e < 2; e++) {
        if (!qEar[e][b]) qEar[e][b] = new THREE.Quaternion();
        qEar[e][b].setFromAxisAngle(EAR_SWING[e], ear[e] * f * D2R);
      }
    }

    var Pa = headGeom.attributes.position.array;
    var Na = headGeom.attributes.normal.array;
    var np = neckPivot;
    for (var i = 0; i < wNeck.length; i++) {
      var i3 = i * 3;
      vTmp.set(headRest[i3], headRest[i3 + 1], headRest[i3 + 2]);
      nTmp.set(headRestN[i3], headRestN[i3 + 1], headRestN[i3 + 2]);
      var w = whichEar[i];
      if (w >= 0) {
        var qe = qEar[w][Math.round(wEar[i] * BUCKETS)];
        var p = earPivot[w];
        vTmp.sub(p).applyQuaternion(qe).add(p);
        nTmp.applyQuaternion(qe);
      }
      var qn = qNeck[Math.round(wNeck[i] * BUCKETS)];
      vTmp.sub(np).applyQuaternion(qn).add(np);
      nTmp.applyQuaternion(qn);
      Pa[i3] = vTmp.x; Pa[i3 + 1] = vTmp.y; Pa[i3 + 2] = vTmp.z;
      Na[i3] = nTmp.x; Na[i3 + 1] = nTmp.y; Na[i3 + 2] = nTmp.z;
    }
    headGeom.attributes.position.needsUpdate = true;
    headGeom.attributes.normal.needsUpdate = true;
  }

  function pose(twist, nod, earFar, earNear, jolt) {
    if (!ready) return;
    applySkin(twist || 0, nod || 0, earFar || 0, earNear || 0);
    /* The jolt moves the WHOLE animal, collar included — joltG carries the
       body, the head and the collar, so nothing separates from the neck when
       she drops away from a stimulation she should never have been given. */
    joltG.position.set(0, jolt ? jolt.y : 0, jolt ? jolt.z : 0);
  }
  function restPose() { pose(0, 0, 0, 0, null); }

  function bump(p)  { return Math.sin(p * Math.PI); }               // out and back
  function quick(p) { return Math.sin(Math.min(1, p * 1.6) * Math.PI); }

  /* Ears rotate about their own base. Negative is backward: each swing axis is
     cross(up, ear axis), and these ears lean forward of vertical, so a negative
     angle rocks the tip back the way a real ear goes when a dog is listening
     behind itself. Head twist is positive toward the collar side.

     Nothing has to be held back to protect the collar: the neck's weight is 0
     for the whole length the strap covers, so the surface under the strap does
     not move at any angle.

     awayLook and settle are the two movements that are NOT answers. They are
     built to look like the real thing on purpose — on a dog they do, and that
     is the entire reason the protocol says to test a level twice rather than
     commit off one sign. awayLook turns the head AWAY from the collar side and
     carries no ear-back, which is the only tell an experienced eye gets. */
  var TELLS = {
    earFlick:   { dur: 520, run: function (p) { pose(0, 0, 0, -22 * bump(p)); } },
    earTwitch:  { dur: 420, run: function (p) { var b = bump(p); pose(1.1 * b, 0, -5 * b, -12 * b); } },
    earsSwivel: { dur: 640, run: function (p) { var b = bump(p); pose(0, 0, -14 * b, -17 * b); } },
    glance:     { dur: 700, run: function (p) { var b = bump(p); pose(-4.5 * b, 0.8 * b, -4 * b, -5 * b); } },
    headDip:    { dur: 660, run: function (p) { var b = bump(p); pose(0, 3.6 * b, -7 * b, -8 * b); } },

    headTurn:   { dur: 860, run: function (p) { var b = bump(p); pose(13 * b, 1.8 * b, -13 * b, -19 * b); } },
    lookBack:   { dur: 1020, run: function (p) { var b = bump(p); pose(19 * b, 4 * b, -19 * b, -26 * b); } },
    shakeOff:   { dur: 900, run: function (p) {
                    var env = bump(p), s = Math.sin(p * Math.PI * 6);
                    pose(10 * env * s, 2 * env, -18 * env, -21 * env); } },

    flinch:     { dur: 720, run: function (p) { var b = quick(p);
                    pose(-6 * b, 7 * b, -34 * b, -38 * b, { y: -0.017 * b, z: -0.015 * b }); } },
    yelp:       { dur: 1050, run: function (p) { var b = quick(p);
                    pose(-12 * b, 11 * b, -46 * b, -52 * b, { y: -0.033 * b, z: -0.029 * b }); } },

    awayLook:   { dur: 760, run: function (p) { var b = bump(p); pose(-6.5 * b, 1.2 * b, 0, 0); } },
    settle:     { dur: 820, run: function (p) { var b = bump(p);
                    pose(1.5 * b, 2.2 * b, -3 * b, -3 * b, { y: -0.004 * b, z: 0 }); } },

    /* Idle breathing, so she is never dead on screen. Deliberately nothing
       that could be mistaken for an answer — no ear movement at all. */
    idle:       { dur: 4200, run: function (p) {
                    if (ready) joltG.position.set(0, Math.sin(p * Math.PI * 2) * 0.0016, 0); } }
  };

  /* ==========================================================================
     THE DRILL
     ======================================================================== */

  /* How far above her threshold each band starts. A dog whose threshold is 7
     flinches a long way sooner, in dial numbers, than one whose threshold is
     28 — the dial is not a pain scale, it is a current, and the same number of
     levels is a different proportion of it. Deriving the bands from the
     threshold is what stops a stoic dog flinching at 33 because a soft one
     flinched at 12. */
  function bands(T) {
    var clear  = T + Math.max(2, Math.round(T * 0.22));
    var flinch = T + Math.max(5, Math.round(T * 0.55));
    return { clear: clear, flinch: flinch, yelp: flinch + Math.max(5, Math.round(T * 0.5)) };
  }

  function reactionFor(lvl) {
    var B = bands(threshold);
    if (lvl < threshold) {
      /* She moves for her own reasons. Rare, but not rare enough to ignore:
         one sign is not a level.

         CAPPED AT TWO A RUN. At a flat 7.5% a careful student climbing from 1
         to the high twenties takes twenty-odd presses below her threshold, and
         a run that hands them three or four false signs stops reading as a real
         dog and starts reading as an app that is cheating — which teaches
         nothing except not to trust the app. Twice is enough to make the point
         that one sign is not a level. */
      if (noiseLeft > 0 && Math.random() < 0.075) {
        noiseLeft--;
        return { key: pick(NOISE), kind: 'noise' };
      }
      return { key: 'none', kind: 'none' };
    }
    if (lvl >= B.yelp)   return { key: 'yelp',   kind: 'bad' };
    if (lvl >= B.flinch) return { key: 'flinch', kind: 'bad' };
    if (lvl >= B.clear)  {
      return Math.random() < 0.97
        ? { key: pick(CLEAR), kind: 'clear' }
        : { key: 'none', kind: 'none' };
    }
    /* At her own threshold she tells you a bit over half the time; a level or
       two up she still misses some. This is the number that makes "test it
       again" the right answer instead of "climb". */
    var over = lvl - threshold;
    var p = (over === 0 ? 0.55 : 0.78 + 0.06 * over) * state.read;
    return Math.random() < Math.min(0.95, p)
      ? { key: pick(SUBTLE), kind: 'sign' }
      : { key: 'none', kind: 'none' };
  }

  function newRun(keepState) {
    var next = state;
    if (!keepState) {
      // never the same arrival twice running
      var tries = 0;
      do { next = pick(STATES); tries++; } while (state && next === state && tries < 12);
    }
    state = next;
    threshold = rnd(state.band[0], state.band[1]);
    level = 0; log = []; done = false; replays = 0; lastEntry = null;
    noiseLeft = 2;
    anim = null; cueHide();
    restPose();
    render();
    /* Committing scrolls the sheet into view, so a second run would otherwise
       start with the column parked halfway down the previous one. Which element
       actually scrolls depends on the width — the side column at desktop, the
       whole pane once the layout stacks — so both are sent home. */
    if (ui.side) ui.side.scrollTop = 0;
    if (ui.root) ui.root.scrollTop = 0;
    EC.announce('New run. ' + state.name + '. Dial at zero.');
  }

  function play(key) {
    var t = TELLS[key];
    if (!t) return;
    anim = { t: t, start: (window.performance ? performance.now() : Date.now()) };
  }

  function nick() {
    if (done || level < 1 || !ready) return;
    var r = reactionFor(level);
    var entry = { lvl: level, key: r.key, kind: r.kind, replays: 0 };
    log.push(entry);
    lastEntry = entry;
    if (r.key === 'none') { restPose(); anim = null; } else play(r.key);
    // nothing happened means there is nowhere to point: a pill on her skull
    // reading "no change at all" is a label for an event that did not occur
    if (hints && r.key !== 'none') cueShow(r.key);
    else cueHide();
    render();
    EC.announce('Level ' + level + ' delivered. ' +
      (hints ? capitalise(WORDS[r.key]) + '.' : 'Watch her.'));
  }

  function replay() {
    if (!lastEntry || !ready || done) return;
    replays++;
    lastEntry.replays++;
    if (lastEntry.key === 'none') { restPose(); anim = null; } else play(lastEntry.key);
    if (hints && lastEntry.key !== 'none') cueShow(lastEntry.key);
    render();
    EC.announce('Replaying level ' + lastEntry.lvl + '. Nothing new is being sent.');
  }

  function commit() {
    if (done || !log.length) return;
    done = true;
    cueHide();
    render();
    var v = mark();
    /* The spoken verdict obeys the same rule as the written one: what the run
       log shows, first and in its own sentence, and the hidden number only
       afterwards and named out loud as a reveal. A screen-reader student must
       not be the one person who still gets told the secret as an observation. */
    EC.announce(v.head + '. ' + v.say +
      ' Revealed after marking: her threshold this run was ' + threshold + '.');
    if (ui.res && ui.res.scrollIntoView) {
      requestAnimationFrame(function () {
        try { ui.res.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ }
      });
    }
  }

  function capitalise(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* "You tested 9 2 times" is what a template writes. Small counts get words. */
  var COUNT = ['no', 'once', 'twice', 'three times', 'four times', 'five times',
               'six times', 'seven times', 'eight times', 'nine times'];
  function times(n) { return COUNT[n] || (n + ' times'); }

  /* ==========================================================================
     THE VERDICT — read off the run log, and off nothing else
     --------------------------------------------------------------------------
     WHAT WAS WRONG HERE. The old sheet built its headline sentence out of
     `threshold` — the number the dog is carrying, which the student cannot see
     and which the run very often never shows them. It printed "She first
     answered at 12" on runs whose log recorded level 12 as nothing at all, and
     on a measured run it printed "She first answered at 14" when 14 had never
     been sent and every one of the eight presses in the log was `none`.

     That is not an edge case, it is the centre of the tab. This drill is BUILT
     around her missing at her own threshold — that inconsistency is the entire
     argument for re-testing a level rather than climbing — so the runs the old
     verdict lied on were precisely the runs the tab exists to teach. And a
     student who catches the app asserting something they can see on screen did
     not happen has no reason left to believe anything else it tells them.

     THE INVARIANT. Everything from here down to disclose() is a pure function
     of (L, declared): the run log, and the number the student wrote down.
     `threshold` is not read anywhere inside it and must never be brought in.
     Every claim carries `c` — the indices of the log entries it is read off —
     so any sentence on the sheet can be pointed at a line of the run. A
     sentence that cannot name its lines does not get written.

     The hidden number is still disclosed, because a drill that never tells you
     the answer teaches nothing. But it is disclosed AFTERWARDS, by disclose(),
     in its own labelled block, as a reveal and not as an observation.

     window.LevelDrill.audit() proves the separation instead of asserting it: it
     rebuilds the verdict with `threshold` changed underneath it and fails if a
     single character of the sheet moves, and it checks that every claim cites
     log lines that exist.
     ======================================================================== */

  function isAck(e)  { return e.kind === 'sign' || e.kind === 'clear'; }
  function allIdx(L) { var a = [], i; for (i = 0; i < L.length; i++) a.push(i); return a; }

  /* Everything the log knows, counted once. Indices, not copies, because a
     claim cites a LINE — "look at press 7" — not a value that could have come
     from anywhere. */
  function facts(L, declared) {
    var f = {
      n: L.length,
      opened: L.length ? L[0].lvl : 0,
      step: 0, stepAt: -1,
      most: 0, mostLvl: 0, mostIdx: [],
      ack: [], bad: [], noise: [], quiet: [],
      at: [], atAck: [], atBad: [],
      replays: 0, counts: {}
    };
    var i, e, k;
    for (i = 0; i < L.length; i++) {
      e = L[i];
      if (i > 0 && (e.lvl - L[i - 1].lvl) > f.step) { f.step = e.lvl - L[i - 1].lvl; f.stepAt = i; }
      f.counts[e.lvl] = (f.counts[e.lvl] || 0) + 1;
      f.replays += e.replays || 0;
      if (isAck(e))                f.ack.push(i);
      else if (e.kind === 'bad')   f.bad.push(i);
      else if (e.kind === 'noise') f.noise.push(i);
      else                         f.quiet.push(i);
      if (e.lvl === declared) {
        f.at.push(i);
        if (isAck(e)) f.atAck.push(i);
        else if (e.kind === 'bad') f.atBad.push(i);
      }
    }
    // most-pressed level; a tie goes to the highest, which is the one being nagged
    for (k in f.counts) {
      if (Object.prototype.hasOwnProperty.call(f.counts, k) && f.counts[k] >= f.most) {
        f.most = f.counts[k]; f.mostLvl = +k;
      }
    }
    for (i = 0; i < L.length; i++) if (L[i].lvl === f.mostLvl) f.mostIdx.push(i);

    f.firstAck = f.ack.length ? f.ack[0] : -1;
    f.firstBad = f.bad.length ? f.bad[0] : -1;
    f.lowAck = -1;
    for (i = 0; i < f.ack.length; i++) {
      if (f.lowAck < 0 || L[f.ack[i]].lvl < L[f.lowAck].lvl) f.lowAck = f.ack[i];
    }
    /* Presses that gave nothing at a level she had ALREADY answered at or
       above. This is the tab's central lesson stated without the secret: the
       student can see both lines and read the inconsistency off them. */
    f.wentQuiet = [];
    if (f.lowAck >= 0) {
      for (i = 0; i < f.quiet.length; i++) {
        if (L[f.quiet[i]].lvl >= L[f.lowAck].lvl) f.wentQuiet.push(f.quiet[i]);
      }
    }
    return f;
  }

  /* What she actually did, press by press, in the order it happened. Silence is
     left out — the log below the sheet carries it — because this list is the
     evidence the sheet's sentences are drawn from. */
  function account(L) {
    var out = [], i;
    for (i = 0; i < L.length; i++) {
      if (L[i].kind === 'none') continue;
      out.push({ lvl: L[i].lvl, kind: L[i].kind, t: capitalise(WORDS[L[i].key]), c: [i] });
    }
    return out;
  }

  /* The headline judges the EVIDENCE for the number the student wrote down —
     how well the log supports it — and not the number itself. Whether the
     number was right is a different question, it needs the secret, and it is
     answered in the disclosure at the foot of the sheet. */
  function headOf(L, declared, f) {
    if (!f.at.length)
      return { head: 'You committed to a level you never sent', tone: 'bad', c: allIdx(L) };
    if (f.atBad.length)
      return { head: 'You committed to the level that hurt her', tone: 'bad', c: f.atBad };
    if (!f.atAck.length)
      return { head: 'She never answered the level you committed to', tone: 'bad', c: f.at };
    if (f.atAck.length >= 2)
      return { head: 'She answered it, and answered it again', tone: 'good', c: f.atAck };
    if (f.at.length >= 2)
      return { head: 'One answer out of ' + f.at.length + ' at that level', tone: 'meh', c: f.at };
    return { head: 'One press, one answer, and you committed on it', tone: 'meh', c: f.at };
  }

  /* The sentence that used to read "She first answered at N" off the secret.
     It may now only name a level she is logged as answering at, and when there
     is no such line it says so instead of inventing one. */
  function saidOf(L, declared, f) {
    if (!L.length)
      return { t: 'You said ' + declared + ', with nothing in the run at all.', c: [] };
    if (f.firstAck >= 0)
      return { t: 'You said ' + declared + '. The first level she answered was ' +
                  L[f.firstAck].lvl + ' — ' + WORDS[L[f.firstAck].key] + '.', c: [f.firstAck] };
    if (f.firstBad >= 0)
      return { t: 'You said ' + declared + '. She never gave you a mild response at any level: ' +
                  'the first thing she did was at ' + L[f.firstBad].lvl + ', and it was ' +
                  WORDS[L[f.firstBad].key] + '.', c: [f.firstBad] };
    if (f.noise.length)
      return { t: 'You said ' + declared + '. She never answered a single level you sent — the only movement all run came on ' +
                  (f.noise.length === 1 ? 'one press, and your run marks it' : f.noise.length + ' presses, and your run marks them') +
                  ' not the collar.', c: f.noise };
    return { t: 'You said ' + declared + '. She did not answer a single level you sent.', c: allIdx(L) };
  }

  /* The four faults the brief names are each their own row, and they are shown
     whether they were committed or not: a student learns as much from seeing
     "one level at a time — biggest step 1" ticked as from seeing it crossed.
     The fifth row is the one that makes the other four worth having. Every row
     was already log-only and stays that way — the faults are marked separately
     from whether the number was right, and neither now leans on the other. */
  function rowsOf(L, declared, f) {
    var rows = [];

    rows.push(f.opened <= 5
      ? { ok: 'y', k: 'Started at the bottom of the dial', c: L.length ? [0] : [],
          say: 'Opened at ' + f.opened + '. Right — you cannot take a stimulation back, so the first one has to be one she probably will not feel.' }
      : { ok: 'n', k: 'Started at the bottom of the dial', c: [0],
          say: 'You opened at ' + f.opened + '. Always start at the bottom and work up. Opening high is how a dog learns that the collar predicts something worth avoiding.' });

    var stepC = f.stepAt > 0 ? [f.stepAt - 1, f.stepAt] : allIdx(L);
    rows.push(f.step <= 1
      ? { ok: 'y', k: 'One level at a time', c: stepC,
          say: L.length < 2 ? 'Only one press, so nothing to step over.' : 'Biggest step: one level. That is the whole method — a working level you stepped over is a working level you never found.' }
      : f.step === 2
        ? { ok: '~', k: 'One level at a time', c: stepC,
            say: 'Biggest step: two levels, from ' + L[f.stepAt - 1].lvl + ' to ' + L[f.stepAt].lvl + '. It will usually get away with it, but on a soft dog two levels is the difference between a mild response and a hard one. Go up by one.' }
        : { ok: 'n', k: 'One level at a time', c: stepC,
            say: 'You jumped ' + f.step + ' levels in one move, from ' + L[f.stepAt - 1].lvl + ' to ' + L[f.stepAt].lvl + '. Step over her level and you never see it — you see the reaction from somewhere above it and call that the answer.' });

    rows.push(f.most <= 3
      ? { ok: 'y', k: 'Did not press one level over and over', c: f.mostIdx,
          say: f.most <= 1 ? 'No level sent more than once.' : 'At most ' + times(f.most) + ' on any one level. Sending a level again is right — it is how you tell a real sign from a dog moving on her own.' }
      : { ok: 'n', k: 'Did not press one level over and over', c: f.mostIdx,
          say: 'You sent level ' + f.mostLvl + ' ' + times(f.most) + '. Twice is testing. Beyond three you are nagging, and you are teaching her that the collar is background noise she can ignore.' });

    rows.push(!f.bad.length
      ? { ok: 'y', k: 'Never made her flinch', c: allIdx(L),
          say: 'Nothing above a mild response all run. That is the standard.' }
      : { ok: 'n', k: 'Never made her flinch', c: f.bad,
          say: 'At level ' + L[f.firstBad].lvl + ' you went high enough that ' + WORDS[L[f.firstBad].key] + '. In a real session that ends the work: she has now learned what the collar predicts, and you will spend a fortnight undoing it.' });

    rows.push(f.atBad.length
      ? { ok: 'n', k: 'Confirmed before you committed', c: f.atBad,
          say: 'The level you committed to is one that made her flinch. Whatever else it is, it is not a working level — you are writing down the number that hurt her.' }
      : f.at.length >= 2 && f.atAck.length >= 1
      ? { ok: 'y', k: 'Confirmed before you committed', c: f.at,
          say: 'You sent level ' + declared + ' ' + times(f.at.length) + ' and she answered ' +
               (f.atAck.length === f.at.length ? 'every time' : times(f.atAck.length)) +
               '. That is the check that separates her level from a level she happened to move on.' }
      : !f.at.length
        ? { ok: 'n', k: 'Confirmed before you committed', c: allIdx(L),
            say: 'You committed to ' + declared + ' without ever sending it. There is no line in your run at that level at all — it is a guess with a number on it.' }
        : !f.atAck.length
          ? { ok: 'n', k: 'Confirmed before you committed', c: f.at,
              say: 'She never once answered ' + declared + '. Whatever else was happening, that is not a level she has told you she can feel.' }
          : { ok: '~', k: 'Confirmed before you committed', c: f.at,
              say: 'You tested ' + declared + ' once and committed. One sign is not a level — send it again before you write it down.' });

    return rows;
  }

  function notesOf(L, declared, f, opts) {
    var notes = [];

    if (f.noise.length) {
      notes.push({ c: f.noise, t: 'On ' + (f.noise.length === 1 ? 'one press' : f.noise.length + ' presses') +
        ' she moved anyway — a glance, a shift of weight — and your run marks ' +
        (f.noise.length === 1 ? 'it' : 'them') + ' not the collar. Dogs move for their own reasons, and that is exactly why one sign is not a level.' });
    }

    /* The inconsistency lesson, stated entirely from what the student can see:
       levels she HAD answered at, and later presses at or above them that gave
       nothing. No secret number is needed to make the point, and the point is
       stronger for being checkable. */
    if (f.wentQuiet.length >= 2) {
      notes.push({ c: [f.lowAck].concat(f.wentQuiet), t:
        'She answered you at ' + L[f.lowAck].lvl + ', and then gave you nothing on ' + f.wentQuiet.length +
        ' later presses at ' + L[f.lowAck].lvl + ' or above. She had not stopped feeling it. Real dogs are inconsistent, and that is the reason you send a level a second time instead of climbing past it.' });
    }

    if (f.replays) {
      notes.push({ c: allIdx(L), t: 'You replayed ' + f.replays + ' of your ' + L.length +
        ' presses. On a dog there is no replay: the sign happens once, it lasts about a fifth of a second, and if you were looking at the dial you missed it.' });
    }

    if (opts && opts.hintsEver) {
      notes.push({ c: [], app: true, t: 'This run was taken with “tell me what happened” on, so the app named each sign for you. Do the next one with it off — seeing it yourself is the skill being examined.' });
    }

    if (!notes.length) {
      notes.push({ c: allIdx(L), t: 'Nothing else in the run to pick up. Every press is accounted for above.' });
    }
    return notes;
  }

  /* The whole sheet, built from the log and the committed number. No other
     argument, and no module state except the app's own hints flag — which is a
     fact about the app, not about the dog, and is flagged as such. */
  function verdict(L, declared, opts) {
    var f  = facts(L, declared);
    var hd = headOf(L, declared, f);
    var sd = saidOf(L, declared, f);
    var rows = rowsOf(L, declared, f);
    var notes = notesOf(L, declared, f, opts);
    var acct = account(L);

    var passed = 0, i;
    for (i = 0; i < rows.length; i++) if (rows[i].ok === 'y') passed++;

    var claims = [{ t: hd.head, c: hd.c }, { t: sd.t, c: sd.c }];
    for (i = 0; i < rows.length; i++) claims.push({ t: rows[i].k + ' — ' + rows[i].say, c: rows[i].c });
    for (i = 0; i < notes.length; i++) claims.push({ t: notes[i].t, c: notes[i].c, app: notes[i].app });
    for (i = 0; i < acct.length; i++) claims.push({ t: two(acct[i].lvl) + ' ' + acct[i].t, c: acct[i].c });

    return { head: hd.head, tone: hd.tone, say: sd.t, rows: rows,
             passed: passed, notes: notes, account: acct, claims: claims };
  }

  function mark() { return verdict(log, level, { hintsEver: hintsEver }); }

  /* ── the disclosure ─────────────────────────────────────────────────────
     The ONLY function in the tab allowed to read `threshold`. Everything it
     says is introduced as a reveal, under its own heading, after the marking
     is finished and visibly separate from it. Telling a student the answer is
     teaching; dressing the answer up as something they watched happen is not. */
  function disclose(L, declared) {
    var f = facts(L, declared), T = threshold, i, e;
    var sentT = [], ackT = [], atOrAbove = [], quietAbove = [];
    for (i = 0; i < L.length; i++) {
      e = L[i];
      if (e.lvl === T) { sentT.push(i); if (isAck(e)) ackT.push(i); }
      if (e.lvl >= T)  { atOrAbove.push(i); if (e.kind === 'none') quietAbove.push(i); }
    }

    var d = declared - T, grade, tone;
    if (d === 0)      { grade = 'You wrote down exactly that.'; tone = 'good'; }
    else if (d === 1) { grade = 'You wrote down ' + declared + ' — one level over, and inside the band.'; tone = 'good'; }
    else if (d < 0)   { grade = 'You wrote down ' + declared + ', ' + (-d) + ' under it. A level below her threshold is one she cannot feel, and in the field you read that silence as a dog ignoring you and turn the dial.'; tone = 'bad'; }
    else if (d <= 3)  { grade = 'You wrote down ' + declared + ' — ' + d + ' levels over.'; tone = 'meh'; }
    else              { grade = 'You wrote down ' + declared + ' — ' + d + ' levels over. Everything above her threshold is stimulation she did not need, and it is the road to a collar-shy dog.'; tone = 'bad'; }

    var lines = [];
    lines.push('Her threshold this run was ' + T + ', ' +
               (state ? state.name.toLowerCase() : 'on this arrival') + '. ' + grade);

    if (!sentT.length) {
      lines.push('You never sent ' + T + ' at all, so there was nothing in your run that could have shown it to you. That is why the sheet above does not pretend there was.');
    } else if (!ackT.length) {
      lines.push(sentT.length === 1
        ? 'You did send ' + T + ', once, and she gave you nothing. Her threshold is where she becomes able to feel it — not where she is guaranteed to tell you. Sending it again is how you find that out.'
        : 'You sent ' + T + ' ' + times(sentT.length) + ' and she gave you nothing every time. Her threshold is where she becomes able to feel it — not where she is guaranteed to tell you.');
    }

    if (quietAbove.length >= 2) {
      lines.push('Across the run she took ' + atOrAbove.length + ' presses at or above ' + T +
        ' and gave you nothing on ' + quietAbove.length + ' of them. That is the whole reason the answer to “I think I saw something” is that level again, and not the next one up.');
    }

    if (f.lowAck >= 0 && L[f.lowAck].lvl === declared && d > 0) {
      lines.push('Read off what she actually showed you, ' + declared + ' was the honest call: it is the lowest level in your run she answered at. You were marked on that, above — not on this number.');
    }

    lines.push('The same dog on a different day sits somewhere else entirely, and the manual says so itself (p.31): expect the level to move with her arousal and the distraction round her. Find it again every session.');

    return { tone: tone, lines: lines, threshold: T };
  }

  /* ==========================================================================
     THE STAGE
     ======================================================================== */

  /* The opening framing. Head, ears and collar, from the near-front quarter —
     the angle a handler actually reads a dog from at heel. It is NOT the
     shell's whole-model fit: that frames a whole dog, and an ear flick on a
     whole dog is four pixels. st.home is replaced with this so the shell's own
     Reset chip and its double-click both come back HERE, which is the one place
     a student who has turned the dog round wants to be put. */
  /* SOLVED AGAINST THE RIG, not chosen by eye. The subject that matters is the
     head, the two ears and the collar; its screen box was measured by
     projecting those three meshes at a range of targets and spans in a
     1056x754 stage. At s = 1.02 with a span of 0.44 the box lands 67 px clear
     of the top, 73 px clear of the bottom, dead on the vertical centre, and
     fills 81% of the height. Framing tighter crops an ear; framing wider — the
     first attempt used 0.58 — gives back a fifth of the picture to empty
     paper, and an ear flick is exactly the signal that cannot afford it. */
  var VIEW_AT   = 1.02;                 // position on the neck axis
  var VIEW_SPAN = 0.44;                 // model units to fill the short axis
  function frameNeck(ms) {
    if (!st || !ready) return;
    var host = ui.stage;
    var w = host ? host.clientWidth : 0, h = host ? host.clientHeight : 0;
    var tgt = worldOf(centreAt(VIEW_AT));
    var dir = new THREE.Vector3(1.02, 0.24, 0.86).normalize();
    var vT = Math.tan(st.camera.fov * Math.PI / 360);
    var dist = (VIEW_SPAN * modelScale / 2) / vT;
    var a = (w && h) ? w / h : 1.4;
    // once the pane is taller than it is wide, width is the binding axis
    if (a < 1.0) dist *= Math.min(2.0, 1.0 / a);
    st.moveTo(tgt.clone().add(dir.multiplyScalar(dist)), tgt, ms || 0);
    st.spin = false;
  }

  /* Model space -> world. setModel re-centres and rescales whatever it is
     handed, so every measured point has to go through the group's own matrix
     rather than being used raw. It comes out very close to the identity here
     (the rig is already normalised), but "very close" is not a thing to build a
     camera on. */
  var _w = null;
  function worldOf(p) {
    if (!rigRoot) return p;
    rigRoot.updateWorldMatrix(true, false);
    if (!_w) _w = new THREE.Vector3();
    _w.copy(p);
    return rigRoot.localToWorld(_w).clone();
  }

  // ── the "tell me what happened" cue ─────────────────────────────────────
  /* A dot on the part that moved, a leader, and the words. It only ever appears
     when the student has asked to be told, and it is the answer to BAR.md's
     read of BioDigital: that it presents, and never says where to look or
     whether you were right. Built out of the shell's own hotspot classes so it
     belongs to the same app as tabs 1 and 2. */
  function cueBuild() {
    if (cue || !st) return;
    var dot  = el('span', 'hs-dot lv-cue-dot');
    var pill = el('span', 'lv-cue');
    var line = sv('line', { 'class': 'ln lv-cue-ln' });
    var cas  = sv('line', { 'class': 'cas lv-cue-cas' });
    st.leaders.appendChild(cas);
    st.leaders.appendChild(line);
    st.overlay.appendChild(dot);
    st.overlay.appendChild(pill);
    cue = { dot: dot, pill: pill, line: line, cas: cas, at: null, until: 0, on: false };
    cueHide();
  }
  function cueShow(key) {
    cueBuild();
    if (!cue) return;
    var where = CUE_AT[key] || 'head';
    var p;
    if (where === 'ear') p = V3(RIG.ears[1].tip);
    else if (where === 'ears') {
      p = V3(RIG.ears[0].tip).add(V3(RIG.ears[1].tip)).multiplyScalar(0.5);
    } else {
      p = V3(RIG.ears[0].pivot).add(V3(RIG.ears[1].pivot)).multiplyScalar(0.5);
    }
    cue.at = p;
    cue.pill.textContent = capitalise(WORDS[key]);
    cue.until = (window.performance ? performance.now() : Date.now()) + 3200;
    cue.on = true;
    cue.dot.style.display = '';
    cue.pill.style.display = '';
    cue.line.style.display = '';
    cue.cas.style.display = '';
  }
  function cueHide() {
    if (!cue) return;
    cue.on = false;
    cue.dot.style.display = 'none';
    cue.pill.style.display = 'none';
    cue.line.style.display = 'none';
    cue.cas.style.display = 'none';
  }
  var _cv = null;
  function cueTick(now) {
    if (!cue || !cue.on || !st) return;
    if (now > cue.until) { cueHide(); return; }
    var host = ui.stage;
    var w = host ? host.clientWidth : 0, h = host ? host.clientHeight : 0;
    if (!w || !h) return;
    if (!_cv) _cv = new THREE.Vector3();
    _cv.copy(worldOf(cue.at)).project(st.camera);
    if (!isFinite(_cv.x) || !isFinite(_cv.y) || _cv.z > 1) { cueHide(); return; }
    var x = (_cv.x * 0.5 + 0.5) * w, y = (-_cv.y * 0.5 + 0.5) * h;
    var pw = cue.pill.offsetWidth || 120, ph = cue.pill.offsetHeight || 24;
    /* Stand off AWAY from the middle of the frame, not simply up and left. Up
       and left put "a brief glance away" flat across her far ear — a label
       covering one of the two things it is telling you to watch. Pushing it
       toward the nearer edge takes it off the silhouette instead, and it keeps
       doing so once the student has turned her round. Then the whole pill is
       clamped inside the pane, so nothing is ever cropped. */
    var away = (x < w / 2) ? -1 : 1;
    var px = x + away * (46 + pw / 2), py = y - 26;
    px = Math.min(w - pw / 2 - 8, Math.max(pw / 2 + 8, px));
    py = Math.min(h - ph / 2 - 8, Math.max(ph / 2 + 8, py));
    cue.dot.style.left = x + 'px';
    cue.dot.style.top  = y + 'px';
    cue.pill.style.left = px + 'px';
    cue.pill.style.top  = py + 'px';
    var vx = px - x, vy = py - y, vl = Math.sqrt(vx * vx + vy * vy) || 1;
    var stop = Math.min(vl * 0.42, 14);
    var x2 = px - (vx / vl) * stop, y2 = py - (vy / vl) * stop;
    cue.line.setAttribute('x1', x); cue.line.setAttribute('y1', y);
    cue.line.setAttribute('x2', x2); cue.line.setAttribute('y2', y2);
    cue.cas.setAttribute('x1', x);  cue.cas.setAttribute('y1', y);
    cue.cas.setAttribute('x2', x2); cue.cas.setAttribute('y2', y2);
  }

  /* ==========================================================================
     DOM
     ======================================================================== */

  function buildDial() {
    var R = 40, C = 56;
    var svg = sv('svg', { viewBox: '0 0 112 112', 'class': 'lv-dial-svg',
                          'aria-hidden': 'true', focusable: 'false' });
    function pt(deg, r) {
      var a = deg * Math.PI / 180;
      return [C + r * Math.sin(a), C - r * Math.cos(a)];
    }
    var p0 = pt(-135, R), p1 = pt(135, R);
    var d = 'M ' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
            ' A ' + R + ' ' + R + ' 0 1 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);

    svg.appendChild(sv('path', { d: d, 'class': 'lv-track' }));
    var prog = sv('path', { d: d, 'class': 'lv-prog' });
    svg.appendChild(prog);

    // quarter ticks, so 0 / 25 / 50 / 75 / 100 are readable at a glance
    var t;
    for (t = 0; t <= 4; t++) {
      var a0 = -135 + t * 67.5;
      var q0 = pt(a0, R + 4), q1 = pt(a0, R + 8);
      svg.appendChild(sv('line', { x1: q0[0].toFixed(2), y1: q0[1].toFixed(2),
                                   x2: q1[0].toFixed(2), y2: q1[1].toFixed(2),
                                   'class': 'lv-tick' }));
    }

    var marks = sv('g', { 'class': 'lv-marks' });
    svg.appendChild(marks);

    var ptr = sv('line', { 'class': 'lv-ptr' });
    svg.appendChild(ptr);

    var num = sv('text', { x: C, y: 66, 'text-anchor': 'middle', 'class': 'lv-num' });
    num.textContent = '00';
    svg.appendChild(num);

    ui.dialSvg = svg; ui.dialProg = prog; ui.dialPtr = ptr;
    ui.dialMarks = marks; ui.dialNum = num;
    ui.dialGeom = { R: R, C: C, pt: pt, L: 2 * Math.PI * R * 0.75 };
    return svg;
  }

  function syncDial() {
    var g = ui.dialGeom;
    if (!g) return;
    ui.dialNum.textContent = two(level);
    ui.dialProg.setAttribute('stroke-dasharray',
      (level / 100 * g.L).toFixed(2) + ' ' + (g.L * 2).toFixed(2));
    /* A short index at the rim, not a needle to the hub: a full-length needle
       at the bottom of the dial — which is where this drill spends its whole
       life — runs straight through the two digits it is there to explain. */
    var a = -135 + (level / 100) * 270;
    var i0 = g.pt(a, g.R - 15), i1 = g.pt(a, g.R - 3);
    ui.dialPtr.setAttribute('x1', i0[0].toFixed(2));
    ui.dialPtr.setAttribute('y1', i0[1].toFixed(2));
    ui.dialPtr.setAttribute('x2', i1[0].toFixed(2));
    ui.dialPtr.setAttribute('y2', i1[1].toFixed(2));

    /* Every level already sent, marked on the instrument, coloured by what she
       did. The student's own run, on the dial they are turning — which is the
       one place they are already looking. */
    clear(ui.dialMarks);
    var seen = {};
    for (var i = 0; i < log.length; i++) {
      var e = log[i];
      var kind = e.kind === 'bad' ? 'x' : (e.kind === 'none' || e.kind === 'noise') ? 'q' : 'a';
      if (seen[e.lvl] === 'x' || (seen[e.lvl] === 'a' && kind !== 'x')) continue;
      seen[e.lvl] = kind;
    }
    for (var lv in seen) {
      if (!Object.prototype.hasOwnProperty.call(seen, lv)) continue;
      var ang = -135 + (+lv / 100) * 270;
      var m0 = g.pt(ang, g.R + 3), m1 = g.pt(ang, g.R + 9);
      ui.dialMarks.appendChild(sv('line', {
        x1: m0[0].toFixed(2), y1: m0[1].toFixed(2),
        x2: m1[0].toFixed(2), y2: m1[1].toFixed(2),
        'class': 'lv-mk lv-mk-' + seen[lv] }));
    }
  }

  function setLevel(v, why) {
    if (done) return;
    var n = Math.max(0, Math.min(100, Math.round(v)));
    if (n === level) return;
    level = n;
    render();
    if (why === 'key') EC.announce('Level ' + level);
  }

  function bindDial(knob) {
    var dragging = false, lastAng = 0;
    function angOf(e) {
      var r = knob.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2),
                        e.clientX - (r.left + r.width / 2));
    }
    knob.addEventListener('pointerdown', function (e) {
      if (done) return;
      dragging = true; lastAng = angOf(e);
      try { knob.setPointerCapture(e.pointerId); } catch (x) { /* not captured */ }
      e.preventDefault();
    });
    knob.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var a = angOf(e), d = a - lastAng;
      while (d >  Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      lastAng = a;
      setLevel(level + (d / (Math.PI * 2)) * 120);
    });
    function stop(e) {
      dragging = false;
      try { knob.releasePointerCapture(e.pointerId); } catch (x) { /* not captured */ }
    }
    knob.addEventListener('pointerup', stop);
    knob.addEventListener('pointercancel', stop);
    knob.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { setLevel(level + 1, 'key'); e.preventDefault(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { setLevel(level - 1, 'key'); e.preventDefault(); }
      else if (e.key === 'Home') { setLevel(0, 'key'); e.preventDefault(); }
      else if (e.key === 'End') { setLevel(100, 'key'); e.preventDefault(); }
    });
  }

  function btn(cls, label) {
    var b = el('button', cls, label);
    b.type = 'button';
    return b;
  }

  function buildDOM(pane) {
    var root = el('div', 'lv');

    /* ── left: the animal ─────────────────────────────────────────────── */
    var main = el('div', 'lv-main');
    var stageBox = el('div', 'lv-stage');
    main.appendChild(stageBox);
    var cap = el('p', 'lv-cap');
    main.appendChild(cap);
    root.appendChild(main);
    ui.stage = stageBox; ui.cap = cap;

    /* ── right: the instrument and the run ────────────────────────────── */
    var side = el('div', 'lv-side');
    root.appendChild(side);
    ui.side = side;

    var head = el('div', 'lv-head');
    var k = el('p', 'lv-k');
    k.appendChild(el('i'));
    k.appendChild(el('span', null, '04 · Drill'));
    head.appendChild(k);
    head.appendChild(el('h2', 'lv-h', 'Find the working level'));
    head.appendChild(el('p', 'lv-sub',
      'Start at the bottom. Go up one level at a time. Stop the first time she tells you she noticed — and never a yelp, never a flinch.'));
    /* The two things a student gets caught out on, in the one place, because
       claiming this pane hides the written reference that would otherwise
       carry them. D5: the dial. D6: the vocabulary. */
    var d5 = el('p', 'lv-d6');
    d5.appendChild(el('b', null, 'On the dial: '));
    d5.appendChild(document.createTextNode(
      'this unit has 100 levels, 0–100 (manual p.7). Any slide showing 0–127 is the older 1900S — a different generation, with a Nick/Constant toggle switch.'));
    head.appendChild(d5);

    var d6 = el('p', 'lv-d6');
    d6.appendChild(el('b', null, 'On the wording: '));
    d6.appendChild(document.createTextNode(
      'Highland Canine says working level. The manual never uses that phrase — it says “the right stimulation level” and “a mild response” (p.31). Same thing; know both.'));
    head.appendChild(d6);
    side.appendChild(head);

    // who is in front of you
    var dogBox = el('div', 'lv-dog');
    var dn = el('p', 'lv-dogn');
    dn.appendChild(el('b', null, 'Ziva'));
    dn.appendChild(el('span', null, 'Malinois · 2 yr · the dog you have just fitted'));
    dogBox.appendChild(dn);
    ui.stateName = el('p', 'lv-state');
    ui.stateLine = el('p', 'lv-stateline');
    dogBox.appendChild(ui.stateName);
    dogBox.appendChild(ui.stateLine);
    side.appendChild(dogBox);

    /* THE INSTRUMENT IS ITS OWN ELEMENT, and it is the only thing that pins.
       The dial, the two steps and the Nick key have to stay under the student's
       thumb while the run scrolls past — but a sticky block that also carried
       the commit row and the options was 200 px of pinned chrome on a phone,
       and with the picture and the caption above it that left 235 px of a 777 px
       pane to read the marking sheet in. So the commit row and the options are
       siblings of the instrument, not children of it, and they scroll. */
    var ctl = el('div', 'lv-ctl');
    var dialWrap = el('div', 'lv-dialwrap');
    var knob = el('div', 'lv-dial');
    knob.tabIndex = 0;
    knob.setAttribute('role', 'slider');
    knob.setAttribute('aria-label', 'Stimulation level, 0 to 100');
    knob.setAttribute('aria-valuemin', '0');
    knob.setAttribute('aria-valuemax', '100');
    knob.appendChild(buildDial());
    dialWrap.appendChild(knob);
    ui.knob = knob;

    var stepBox = el('div', 'lv-steps');
    var lbl = el('p', 'lv-steplbl', 'Rheostat dial · 0–100');
    stepBox.appendChild(lbl);
    var pair = el('div', 'lv-pair');
    ui.down = btn('lv-step', '−');
    ui.down.setAttribute('aria-label', 'One level down');
    ui.up = btn('lv-step', '+');
    ui.up.setAttribute('aria-label', 'One level up');
    pair.appendChild(ui.down);
    pair.appendChild(ui.up);
    stepBox.appendChild(pair);
    dialWrap.appendChild(stepBox);
    ctl.appendChild(dialWrap);

    ui.nick = btn('lv-nick', '');
    ui.nickT = el('b', null, 'Nick');
    ui.nickS = el('span', null, '');
    ui.nick.appendChild(ui.nickT);
    ui.nick.appendChild(ui.nickS);
    ctl.appendChild(ui.nick);
    side.appendChild(ctl);
    ui.ctl = ctl;

    var acts = el('div', 'lv-acts');
    ui.replay = btn('lv-sec', 'Show me that again');
    ui.commit = btn('lv-go', 'This is her level');
    acts.appendChild(ui.replay);
    acts.appendChild(ui.commit);
    side.appendChild(acts);

    var opts = el('div', 'lv-opts');
    var lab = el('label', 'lv-hint');
    ui.hints = document.createElement('input');
    ui.hints.type = 'checkbox';
    lab.appendChild(ui.hints);
    lab.appendChild(el('span', null, 'Tell me what happened'));
    opts.appendChild(lab);
    ui.again = btn('lv-txt', 'New run');
    opts.appendChild(ui.again);
    side.appendChild(opts);

    // the marking sheet lands here
    ui.res = el('div', 'lv-res');
    side.appendChild(ui.res);

    // what to watch for, and what this model cannot show you
    var watch = el('section', 'lv-watch');
    var wh = btn('lv-wh', '');
    wh.appendChild(el('span', null, 'What a mild response looks like'));
    wh.appendChild(el('i', 'lv-wh-i'));
    wh.setAttribute('aria-expanded', 'true');
    var wb = el('div', 'lv-wb');
    wh.setAttribute('aria-controls', 'lv-watch-body');
    wb.id = 'lv-watch-body';
    watch.appendChild(wh);
    watch.appendChild(wb);

    /* SOURCING IS PER LINE, and it is not decoration. MANUAL-FACTS §4c: the
       manual (p.43) names neck movement, head shaking and looking over the
       shoulder as the response to climb toward, and warns it may be very
       subtle. It names none of the five below — those are Highland Canine's.
       A student who cites an ear flick to Dogtra in an exam is marked down for
       it, so the two are kept apart on the face of the tab, item by item. */
    function signList(items) {
      var ul = el('ul', 'lv-signs');
      items.forEach(function (r) {
        var li = el('li');
        li.appendChild(el('b', null, r[0]));
        li.appendChild(el('span', null, r[1]));
        li.appendChild(el('i', 'lv-tag lv-tag-' + r[2],
          r[2] === 'm' ? 'manual p.43' : 'Highland Canine'));
        ul.appendChild(li);
      });
      return ul;
    }

    wb.appendChild(signList([
      ['An ear flick', 'the near ear snaps back and forward. The canonical one.', 'd'],
      ['A small ear twitch', 'less than a flick. Easy to lose if you are watching the dial.', 'd'],
      ['Both ears back', 'a moment of listening behind herself.', 'd'],
      ['A glance away', 'the head comes off what she was doing, briefly.', 'd'],
      ['The head dips', 'a fraction, and comes back up.', 'd']
    ]));

    var pm = el('p', 'lv-wp');
    pm.appendChild(el('b', null, 'The manual’s own words: '));
    pm.appendChild(document.createTextNode(
      'keep increasing until she responds, “usually by neck movement, head shaking, looking over his shoulder” — and it warns that the response may be '));
    pm.appendChild(el('em', null, 'very subtle'));
    pm.appendChild(document.createTextNode(
      ' (p.43). That warning is the manufacturer’s, and it is the reason the five signs above are worth learning: Dogtra says itself that what you are watching for is small.'));
    wb.appendChild(pm);

    var p1 = el('p', 'lv-wp');
    p1.appendChild(el('b', null, 'Past it. '));
    p1.appendChild(document.createTextNode(
      'The manual’s three are real responses — but they are what a response looks like once you are already above the level you wanted. Highland Canine has you stop short of them.'));
    wb.appendChild(p1);

    wb.appendChild(signList([
      ['She turns her head to the collar', 'the manual’s “neck movement”.', 'm'],
      ['She looks round at her flank', 'the manual’s “looking over his shoulder”.', 'm'],
      ['She shakes her head', 'the manual’s “head shaking” — the way she would at a fly.', 'm'],
      ['A yelp or a flinch', 'not a strong signal. A failure, and a fortnight to undo.', 'd']
    ]));

    var p2 = el('p', 'lv-wp');
    p2.appendChild(el('b', null, 'She will not answer every time. '));
    p2.appendChild(document.createTextNode(
      'At her own level she shows you on rather more than half the presses, and she also moves for reasons that have nothing to do with the collar. That is why the answer to “I think I saw something” is to send that level again — not to climb.'));
    wb.appendChild(p2);

    var p3 = el('p', 'lv-wp lv-hon');
    p3.appendChild(el('b', null, 'A model is not a dog. '));
    p3.appendChild(document.createTextNode(
      'On the real animal these signs are smaller, faster and a great deal easier to miss, and two of them are missing here altogether: this mesh has no eyelids and no tongue, so it cannot blink and it cannot lick its lips. Both are real signals and both belong on your list. They are named here as missing rather than faked — learning to watch for a blink this app invented would teach you the wrong thing.'));
    wb.appendChild(p3);

    watch.appendChild(el('p', 'lv-src',
      'Sourcing. The procedure is the manual’s (p.31): start low, work up, stop at a mild response, expect to adjust. The three signs marked manual p.43 are the manual’s own words, as is its warning that the response may be very subtle. Everything marked Highland Canine — the ear flick, the twitch, the ears back, the glance, the head dip, and never a yelp and never a flinch — is course doctrine, not manufacturer instruction. Do not cite it as if it were.'));
    side.appendChild(watch);
    ui.watchBtn = wh; ui.watchBody = wb;

    // the run
    var logBox = el('section', 'lv-logbox');
    logBox.appendChild(el('h3', 'lv-lh', 'Your run'));
    ui.log = el('ol', 'lv-log');
    logBox.appendChild(ui.log);
    side.appendChild(logBox);

    pane.appendChild(root);
    ui.root = root;

    // ── wiring ──
    bindDial(knob);
    ui.up.addEventListener('click', function () { setLevel(level + 1); });
    ui.down.addEventListener('click', function () { setLevel(level - 1); });
    ui.nick.addEventListener('click', nick);
    ui.replay.addEventListener('click', replay);
    ui.commit.addEventListener('click', commit);
    ui.again.addEventListener('click', function () { newRun(false); });
    ui.hints.addEventListener('change', function () {
      hints = !!ui.hints.checked;
      if (hints) hintsEver = true; else cueHide();
      render();
    });
    wh.addEventListener('click', function () {
      var open = watch.classList.toggle('is-open');
      wh.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    watch.classList.add('is-open');
  }

  /* ==========================================================================
     RENDER
     ======================================================================== */

  function captionText() {
    if (done) return 'Run marked. Read the sheet, then take her again.';
    if (!ready) return 'Bringing her in…';
    if (!lastEntry) return 'Dial in a level and send one Nick. Watch her ears — the first sign is small.';
    var w = WORDS[lastEntry.key];
    if (!hints) return 'Level ' + two(lastEntry.lvl) + ' delivered. Did she tell you anything?';
    if (lastEntry.kind === 'noise') {
      return 'Level ' + two(lastEntry.lvl) + ' — ' + w + '. Nothing to do with the collar.';
    }
    if (lastEntry.kind === 'bad') {
      return 'Level ' + two(lastEntry.lvl) + ' — ' + w + '. That is well past it.';
    }
    return 'Level ' + two(lastEntry.lvl) + ' — ' + w + '.';
  }

  function render() {
    if (!built) return;
    syncDial();
    ui.knob.setAttribute('aria-valuenow', String(level));
    ui.knob.setAttribute('aria-valuetext', 'Level ' + level + ' of 100');

    ui.stateName.textContent = state ? state.name : '';
    ui.stateLine.textContent = state ? state.line : '';
    ui.cap.textContent = captionText();
    ui.cap.className = 'lv-cap' + (done ? ' is-done' : '');

    var canSend = ready && !done && level >= 1;
    ui.nick.disabled = !canSend;
    ui.nickT.textContent = 'Nick';
    ui.nickS.textContent = !ready ? 'waiting for the dog'
      : done ? 'run marked'
      : level < 1 ? 'the dial is at zero'
      : 'one brief pulse at level ' + two(level);
    ui.up.disabled = done || level >= 100;
    ui.down.disabled = done || level <= 0;
    ui.replay.disabled = done || !lastEntry || !ready;
    ui.commit.disabled = done || !log.length;
    ui.commit.textContent = done ? 'Marked' : 'This is her level — mark me';
    ui.hints.checked = hints;
    ui.root.classList.toggle('is-done', done);

    // the run
    clear(ui.log);
    if (!log.length) {
      var li0 = el('li', 'lv-e0', 'Nothing sent yet. Start at 1.');
      ui.log.appendChild(li0);
    } else {
      for (var i = log.length - 1; i >= 0; i--) {
        var e = log[i];
        var reveal = hints || done;
        var cls = 'lv-e';
        if (reveal) {
          /* Four states, not two: she answered (what you want), she answered
             rather more than you wanted, she gave you nothing, and she moved
             for her own reasons. Collapsing the middle two is what makes a
             student read a hard head-turn as success. */
          cls += e.kind === 'bad' ? ' x'
               : e.kind === 'none' ? ' q'
               : e.kind === 'noise' ? ' n'
               : e.kind === 'clear' ? ' c'
               : ' a';
        }
        var li = el('li', cls);
        li.appendChild(el('b', null, two(e.lvl)));
        var s = el('span', null, reveal ? capitalise(WORDS[e.key]) : 'Delivered — watch her');
        li.appendChild(s);
        if (reveal && e.kind === 'noise') {
          li.appendChild(el('i', 'lv-etag', 'not the collar'));
        }
        if (e.replays) {
          li.appendChild(el('i', 'lv-erep',
            e.replays === 1 ? 'replayed once' : 'replayed ' + e.replays + '×'));
        }
        ui.log.appendChild(li);
      }
    }

    // the marking sheet
    clear(ui.res);
    if (!done) { ui.res.classList.remove('on'); return; }

    var v = mark();
    var h = el('div', 'lv-resh ' + v.tone);
    h.appendChild(el('b', null, v.head));
    h.appendChild(el('span', null, v.say));
    ui.res.appendChild(h);

    /* The evidence, before anything is said about it. This list is every press
       that produced a movement, in the order it happened — which is what the
       sentences on the rest of the sheet are read off, and what a student can
       check them against line by line. */
    var ac = el('section', 'lv-acct');
    ac.appendChild(el('p', 'lv-acch', 'What she did, in order'));
    if (!v.account.length) {
      ac.appendChild(el('p', 'lv-accn',
        'Nothing, at any level you sent. Not one of your ' +
        (log.length === 1 ? 'single press' : log.length + ' presses') +
        ' produced a movement of any kind.'));
    } else {
      var ol = el('ol', 'lv-accl');
      v.account.forEach(function (a) {
        var li = el('li', 'lv-acce ' + (a.kind === 'bad' ? 'x' : a.kind === 'noise' ? 'n'
                                      : a.kind === 'clear' ? 'c' : 'a'));
        li.appendChild(el('b', null, two(a.lvl)));
        li.appendChild(el('span', null, a.t));
        if (a.kind === 'noise') li.appendChild(el('i', 'lv-etag', 'not the collar'));
        ol.appendChild(li);
      });
      ac.appendChild(ol);
    }
    ui.res.appendChild(ac);

    var pr = el('div', 'lv-prot');
    var ph = el('p', 'lv-proth');
    ph.appendChild(el('span', null, 'Protocol'));
    ph.appendChild(el('b', null, v.passed + ' of ' + v.rows.length));
    pr.appendChild(ph);
    v.rows.forEach(function (r) {
      var row = el('div', 'lv-row ' + (r.ok === 'y' ? 'ok' : r.ok === '~' ? 'near' : 'no'));
      row.appendChild(el('i', 'lv-rowi', r.ok === 'y' ? '✓' : r.ok === '~' ? '!' : '✗'));
      var tx = el('div', 'lv-rowt');
      tx.appendChild(el('b', null, r.k));
      tx.appendChild(el('p', null, r.say));
      row.appendChild(tx);
      pr.appendChild(row);
    });
    ui.res.appendChild(pr);

    var nb = el('div', 'lv-notes');
    v.notes.forEach(function (n) { nb.appendChild(el('p', null, n.t)); });
    ui.res.appendChild(nb);

    /* THE DISCLOSURE, and it is the last thing on the sheet on purpose. Above
       this line every sentence is read off the student's own run; below it is
       the one number they could not see. Keeping the two visibly apart is the
       point — the old sheet mixed them, and mixing them is how it came to state
       as fact an event that never happened. */
    var dis = disclose(log, level);
    var rv = el('section', 'lv-reveal ' + dis.tone);
    rv.appendChild(el('p', 'lv-revh', 'Now the number you could not see'));
    rv.appendChild(el('p', 'lv-revn',
      'Nothing above this line used it. The marking is read off your run and nothing else.'));
    /* The first line carries the number and the mark on it, so it is the line
       that has to be findable. It is classed rather than selected positionally:
       the label and the honesty note above it are <p> too, and :first-of-type
       picks the label. */
    dis.lines.forEach(function (t, i) {
      rv.appendChild(el('p', 'lv-revp' + (i === 0 ? ' lv-revg' : ''), t));
    });
    ui.res.appendChild(rv);

    var f = el('div', 'lv-resf');
    var again = btn('lv-go', 'Take her again');
    again.addEventListener('click', function () { newRun(false); });
    f.appendChild(again);
    var same = btn('lv-txt', 'Same arrival, new level');
    same.addEventListener('click', function () { newRun(true); });
    f.appendChild(same);
    ui.res.appendChild(f);
    ui.res.classList.add('on');
  }

  /* ==========================================================================
     LOADING AND MOUNTING
     ======================================================================== */

  function materials() {
    if (MAT) return;
    /* Linear-space PBR values, not UI colours: the scene is lit hard so the dog
       reads at all, and a nominal mid-black comes out grey once that lighting
       and the gamma have been applied. Declared in this module's CSS block so
       there is still exactly one place they are written down. */
    MAT = {
      strap: new THREE.MeshStandardMaterial({
        color: new THREE.Color(cssVar('--lv-strap', '#040404')),
        roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide }),
      box: new THREE.MeshStandardMaterial({
        color: new THREE.Color(cssVar('--lv-housing', '#050505')),
        roughness: 0.5, metalness: 0.1 })
    };
  }

  /* A soft contact shadow, so she stands on something when a student zooms out
     to walk round her. Generated into a canvas — nothing is fetched. */
  function groundShadow(box) {
    var n = 128, c = document.createElement('canvas');
    c.width = c.height = n;
    var g = c.getContext('2d');
    if (!g) return null;
    var rg = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    rg.addColorStop(0, 'rgba(0,0,0,0.42)');
    rg.addColorStop(0.45, 'rgba(0,0,0,0.20)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, n, n);
    var tex = new THREE.CanvasTexture(c);
    var size = box.getSize(new THREE.Vector3());
    var ctr  = box.getCenter(new THREE.Vector3());
    var m = new THREE.Mesh(
      new THREE.PlaneGeometry(size.x * 1.25, size.z * 1.5),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true,
                                    depthWrite: false, opacity: 0.85 }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(ctr.x, box.min.y + 0.002, ctr.z);
    m.renderOrder = -1;
    return m;
  }

  function buildRig(dogObj, housing) {
    var pieces = segment(dogObj);
    if (!pieces) throw new Error('the dog mesh has no geometry to rig');

    rigRoot = new THREE.Group();
    joltG = new THREE.Group();
    rigRoot.add(joltG);

    joltG.add(new THREE.Mesh(pieces[0], mat));       // body, already in world space
    headGeom = pieces[1];
    buildSkin(headGeom);
    headRest  = Float32Array.from(headGeom.attributes.position.array);
    headRestN = Float32Array.from(headGeom.attributes.normal.array);
    earPivot = [V3(RIG.ears[0].pivot), V3(RIG.ears[1].pivot)];
    neckPivot = centreAt(RIG.neckZero);
    joltG.add(new THREE.Mesh(headGeom, mat));

    var slack = slackAt(FIT.tension);
    var collar = new THREE.Group();
    collar.add(new THREE.Mesh(makeStrapGeom(FIT.height, slack), MAT.strap));
    collar.add(makeReceiverMesh(housing, FIT.height,
                                FIT.clockDeg * Math.PI / 180, slack));
    joltG.add(collar);

    qA = new THREE.Quaternion(); qB = new THREE.Quaternion(); qF = new THREE.Quaternion();
    vTmp = new THREE.Vector3(); nTmp = new THREE.Vector3();
    AX_TWIST = U.clone().normalize();
    AX_NOD   = ESIDE.clone().normalize();
    EAR_SWING = [V3(RIG.ears[0].swing).normalize(), V3(RIG.ears[1].swing).normalize()];
  }

  function mount() {
    var wrap = st.setModel(rigRoot);
    modelScale = wrap && wrap.scale ? wrap.scale.x : 1;

    // the shadow goes on AFTER the fit, so a flat plane cannot enlarge the
    // bounding box the whole normalisation is taken from
    rigRoot.updateMatrixWorld(true);
    var box = new THREE.Box3().setFromObject(joltG);
    var sh = groundShadow(box);
    if (sh) rigRoot.add(sh);

    /* The stage keeps its markers hidden until its own hotspot solver has
       placed them. This tab sets no hotspots, so that pass never runs and the
       layer would stay hidden — including the cue this module draws into it. */
    st.el.classList.remove('st-unlaid');

    /* Keep the shell's own resize behaviour pointing at the neck: it re-derives
       the camera target from home0 on every resize, so home0 has to BE the
       neck. distMul stays under 1 so the shell does not also try to re-centre
       the framing vertically on the whole animal. */
    var t = worldOf(centreAt(VIEW_AT));
    st.setHome({ target: [t.x - st.ctr.x, t.y - st.ctr.y, t.z - st.ctr.z],
                 distMul: 0.5 });

    st.controls.minDistance = 0.24 * modelScale;
    st.controls.maxDistance = 1.60 * modelScale;
    st.controls.minPolarAngle = THREE.MathUtils.degToRad(56);
    st.controls.maxPolarAngle = THREE.MathUtils.degToRad(99);

    ready = true;
    restPose();
    /* If the student left the tab while the mesh was still being read, the host
       measures zero here and the framing is taken against a fallback aspect.
       Say so, and let the next entry redo it. */
    needFrame = !(ui.stage && ui.stage.clientWidth && ui.stage.clientHeight);
    frameNeck(0);
    idleT0 = window.performance ? performance.now() : Date.now();
    render();
    EC.announce('Ziva is ready, wearing the collar you fitted. ' +
                'Set a level and send one Nick.');
  }

  /* The shell hides — never destroys — each pane's written reference when a
     module claims the tab, precisely so it can be brought back. It has no
     public "bring it back", so this does exactly what app.js's own showRef
     does. It is only ever reached when this module has nothing to show. */
  function showRefAgain() {
    var pane = EC.pane(TAB);
    var r = pane && pane.querySelector('.ref');
    if (r) r.removeAttribute('hidden');
  }

  function load() {
    if (asked) return;
    asked = true;
    EC.mesh('dog').then(function (gltf) {
      if (dead) return null;
      var dogObj = EC.normalise(gltf.scene);
      // the housing is a bonus: if the receiver will not read, a block stands in
      return EC.mesh('receiver').then(function (rx) {
        return extractHousing(EC.normalise(rx.scene));
      })['catch'](function () { return null; })
        .then(function (housing) {
          if (dead) return;
          buildRig(dogObj, housing);
          mount();
        });
    })['catch'](function (err) {
      /* EC.mesh has already put a dismissible card in this pane, and dismissing
         it brings the written reference back. Two things have to happen here:
         get this module's half-built layout out of the way so the reference is
         not sharing the pane with it, and re-arm so coming back genuinely
         tries again — the loader does not cache a rejected promise.

         A failure that is NOT the mesh — the rig itself refusing to build — has
         no card of its own, so it gets one. Either way nothing reaches the
         console: hard gate 1 is judged across a full pass. */
      if (!(EC.pane(TAB) || document).querySelector('.veil:not([hidden])')) {
        EC.notice(TAB, 'The dog could not be brought in on this tab. ' +
                       'Everything the drill teaches is written out here.');
        showRefAgain();
      }
      lastErr = err;
      asked = false;
      if (ui.root) ui.root.setAttribute('hidden', '');
      if (st) st.deactivate();
    });
  }

  // ── the frame ───────────────────────────────────────────────────────────
  /* One rAF for the whole app: the shell drives it, and this hangs the pose and
     the cue off the stage's own tick rather than starting a second loop that
     would go on running behind three other tabs. Both halves are written to
     survive being called before the rig stands — a throw here would take the
     stage down with it. */
  function hookTick() {
    var base = st.tick;
    st.tick = function (dt) {
      var now = window.performance ? performance.now() : Date.now();
      if (ready) {
        if (anim) {
          var p = Math.min(1, (now - anim.start) / anim.t.dur);
          anim.t.run(p);
          if (p >= 1) { anim = null; restPose(); idleT0 = now; }
        } else if (!reduced()) {
          TELLS.idle.run(((now - idleT0) / TELLS.idle.dur) % 1);
        }
      }
      base(dt);
      cueTick(now);
    };
  }

  // ── enter / leave ───────────────────────────────────────────────────────
  function enter() {
    var pane = EC.pane(TAB);
    if (!pane) return;

    if (!built) {
      st = EC.stage(TAB);
      if (!st) return;                      // no WebGL: the shell has the pane
      /* The neck frame is built out of THREE.Vector3, and THREE is only
         guaranteed here — a module does no work at all before its first
         onEnter, and that includes touching the library. */
      vecs();
      materials();
      buildDOM(pane);
      built = true;
      // take the stage out of its default full-pane placement and into the
      // layout this tab actually wants
      st.el.classList.remove('st-fill');
      ui.stage.appendChild(st.el);
      /* The Reset chip and a double-click on the canvas both call st.home().
         For a whole unit that is "show me all of it"; for an animal a student
         is reading, it is "put me back where I can see her ears". */
      st.home = function (instant) { frameNeck(instant ? 0 : 620); };
      hookTick();
      newRun(false);
    }

    if (ui.root) ui.root.removeAttribute('hidden');
    st.activate();
    st.spin = false;
    /* Coming BACK to this tab does not re-frame. A student who walked round to
       look at the collar from the off side, went to check a name on tab 1 and
       came back would otherwise find her snapped to the front again — losing
       their place is the fourth thing BAR.md judges a viewer on. Reset is one
       click away and says what it does. The only exception is a framing that
       was solved against a pane with no size, which is not a place worth
       keeping. */
    if (ready && needFrame) { frameNeck(0); needFrame = false; }
    load();
  }

  function leave() {
    if (st) st.deactivate();
    cueHide();
  }

  EC.onEnter(TAB, enter);
  EC.onLeave(TAB, leave);

  /* Exposed for verification only — a way to read the run's real state and to
     hold a movement at a fixed point in its arc so the extremes can be looked
     at rather than guessed at. Nothing in the tab reads any of it. */
  window.LevelDrill = {
    state: function () {
      return { arrival: state ? state.id : null, threshold: threshold, level: level,
               log: log.slice(), done: done, hints: hints, replays: replays,
               ready: ready, mark: (done || log.length) ? mark() : null,
               err: lastErr ? String(lastErr && lastErr.stack || lastErr) : null };
    },
    set: function (v) { setLevel(v); },
    nick: nick,
    commit: commit,
    force: function (t) { threshold = t; render(); },
    /* THE INVARIANT, as a test rather than a promise. Two things are checked.
       One: rebuild the verdict with `threshold` changed underneath it, and fail
       if one character of the sheet moves — that is what "derived entirely from
       the run log" means, and it cannot be argued with. Two: every claim on the
       sheet cites log lines, and every cited line exists. Claims flagged `app`
       are about the app's own settings, not about the dog, and carry no line. */
    audit: function () {
      var L = log.slice(), declared = level, opts = { hintsEver: hintsEver };
      function flat(v) {
        return JSON.stringify([v.head, v.tone, v.say, v.rows, v.notes, v.account]);
      }
      var a = flat(verdict(L, declared, opts));
      var keep = threshold;
      threshold = keep === 41 ? 73 : 41;          // any number that is not hers
      var b = flat(verdict(L, declared, opts));
      threshold = keep;

      var bad = [], claims = verdict(L, declared, opts).claims, i, j, c;
      for (i = 0; i < claims.length; i++) {
        if (claims[i].app) continue;
        c = claims[i].c || [];
        if (!c.length && L.length) { bad.push({ why: 'cites no log line', claim: claims[i].t }); continue; }
        for (j = 0; j < c.length; j++) {
          if (!(c[j] >= 0 && c[j] < L.length)) {
            bad.push({ why: 'cites log line ' + c[j] + ', which does not exist', claim: claims[i].t });
          }
        }
      }
      return { presses: L.length, claims: claims.length,
               independentOfThreshold: a === b, uncited: bad };
    },
    hold: function (key, p) {
      var t = TELLS[key];
      if (!t || !ready) return false;
      anim = null;
      t.run(p == null ? 0.5 : p);
      return true;
    },
    release: function () {
      anim = null; restPose();
      idleT0 = window.performance ? performance.now() : Date.now();
    }
  };

})();
