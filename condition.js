/* ============================================================================
   CONDITION.JS · tab 05 — COLLAR CONDITIONING
   Owner: this file owns the 'condition' tab and nothing else.

   The drill: walk away, let the line load, put pressure on while it is loaded,
   and take it off the instant she answers. Repeat in every direction until the
   dog has worked out that coming to you is the thing that ends it. That is
   negative reinforcement, and the release — not the stimulation — is what
   teaches. So the thing this module actually measures is RELEASE TIMING.

   ── WHY THIS TAB IS BUILT DIFFERENTLY FROM 03 AND 04 ───────────────────────
   Those two are viewers: one animal, held still, turned by the student. This
   one is a field with two bodies moving in it, so it takes the shared stage
   (one WebGL context for the whole app — see app.js) and drives the camera
   itself instead of leaving it on the trackball.

   Two consequences worth knowing before editing:
     · st.controls stays enabled but is opened right up (min/max distance and
       polar limits removed) in claimCamera(). OrbitControls.update() re-derives
       its spherical from the camera every frame, so a position written before
       base tick runs is kept rather than fought — but it CLAMPS to those
       limits, and the shell's defaults (0.45..7.0) are tighter than a field
       camera needs. Leave them open or the camera snaps.
     · the model is added straight to st.scene, NOT through st.setModel(). That
       call normalises and frames a single object for a turntable, which is the
       opposite of what a field needs.

   ── THE RIG ────────────────────────────────────────────────────────────────
   dog.glb has skins:0 and animations:0 — it is a scan, not a character. Tab 04
   rigs the head by cutting the mesh in two and skinning ~10k vertices on the
   CPU each frame. That does not scale to four legs plus a tail plus a head, so
   this tab builds a real THREE.Skeleton and lets the GPU do it: skinIndex and
   skinWeight are computed ONCE at load, and a frame then costs four bone
   quaternions instead of 30 000 vector rotations.

   Every number in RIG below was measured off dog.glb, not guessed:
     · the body's long axis is 13.3 deg off +Z — the animal was scanned
       standing crooked, so "forward" is NOT an axis and must not be assumed;
     · the four legs were found by welding the duplicated UV-seam vertices and
       flood filling the slab below the brisket. They stay separable up to 36%
       of the animal's height and merge into one shell above it, which is why
       every leg weight has to reach zero by then;
     · a fifth component came out of that same fill, behind the hind legs and
       hanging to hock height: the tail. It gets its own bone.
   If dog.glb is ever replaced, none of these survive. Re-measure, do not nudge.
   ========================================================================== */

(function () {
  'use strict';

  // No shell, no tab. The written reference in the pane is already correct.
  if (!window.EC || typeof window.EC.onEnter !== 'function') return;

  var TAB = 'condition';
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ── measured off dog.glb, in NORMALISED model space ─────────────────────
     Normalised = (vertex - bbox centre) / max bbox dimension, which is what
     EC.normalise() produces and the space tab 04's neck constants are already
     written in. 1.0 along the body is nose to tail-tip. */
  var RIG = {
    fwd:  [-0.2294, 0, 0.9733],    // body long axis, nose-ward, in the ground plane
    side: [ 0.9733, 0, 0.2294],    // fwd rotated to the dog's left
    ground: -0.4546,               // lowest vertex — the ground plane
    legCut: -0.127,                // legs are separable columns below this only

    /* joint = where the limb meets the body and the weight must be 0.
       knee   = the second joint, halfway down. Front and hind differ. */
    /* ph is the TROT: diagonal pairs, front-left with hind-right, two beats.
       phW is the WALK: a four-beat lateral sequence, each foot a quarter of a
       cycle after the last. She blends between them with speed, because a dog
       asked to move slowly walks — she does not trot in slow motion, and a
       slow-motion trot is one of those things that looks wrong without anyone
       being able to say why. */
    legs: [
      { id: 'fl', f:  0.205, s: -0.039, fore: 1, ph: 0.00, phW: 0.00 },
      { id: 'fr', f:  0.184, s: -0.204, fore: 1, ph: 0.50, phW: 0.50 },
      { id: 'hl', f: -0.322, s:  0.081, fore: 0, ph: 0.50, phW: 0.75 },
      { id: 'hr', f: -0.385, s: -0.140, fore: 0, ph: 0.00, phW: 0.25 }
    ],
    jointY: { fore: -0.020, hind: -0.045 },
    kneeY:  { fore: -0.235, hind: -0.215 },
    legR:   0.092,                 // capture radius about a leg's own axis

    // the tail: behind the hindquarters, hanging to hock height, on her left
    tail:   { f: -0.487, s: 0.112, baseY: 0.020, tipY: -0.265, r: 0.130 },

    /* The spine. A dog turning is not a car: the hindquarters trail and the
       forehand leads, so the body carries a curve through the loin. The chest
       bone pivots here and the weight ramps across the loin — behind `back` a
       vertex stays with the hips, ahead of `front` it belongs to the forehand.
       The hind legs sit behind `back` and the front legs ahead of `front`, so
       neither gets a partial bend. */
    spine:  { f: -0.100, y: 0.050, back: -0.280, front: 0.100 },

    /* The ears, measured for tab 04 off this same mesh. They are here because
       an ear flick is what a student is taught to watch for when a stimulation
       lands — so the tell tab 04 teaches has to actually appear on tab 05.
       The two carry different axes because this dog's head is turned; a
       symmetric rig looked wrong on one side. */
    ears: [
      { tip:   [-0.1487, 0.4546, 0.4012], axis: [0.0374, 0.8395, 0.5420],
        pivot: [-0.1510, 0.3806, 0.3710], swing: [0.9976, 0.0000, -0.0688] },
      { tip:   [-0.0278, 0.4483, 0.3382], axis: [0.5567, 0.7886, 0.2611],
        pivot: [-0.0594, 0.3758, 0.3234], swing: [0.4246, 0.0000, -0.9054] }
    ],
    earFull: -0.055, earZero: -0.100, earReach: 0.062
  };

  /* The neck frame is tab 04's, measured off this same mesh by raycasting.
     Copied rather than shared because level.js may never have been loaded —
     a student can open tab 05 without ever touching tab 04. */
  var NECK = {
    u:    [0.04994, 0.74222, 0.66830],   // neck axis, head-ward
    eTop: [0, 0.66913, -0.74314],        // 12 o'clock on the neck (dorsal)
    eSide:[0.99875, -0.03711, -0.03341], // 3 o'clock
    base: [-0.163, 0.10, 0.22],
    top:  [-0.170, 0.28, 0.31],
    /* The measured radial profile — 7 heights by 32 angles, raycast off this
       same dog.glb for tab 03. A dog's neck is an oval, so a strap built on a
       single radius stands proud at the crest and reads as a LOOSE COLLAR,
       which is the one thing this whole app exists to argue against. It is
       copied rather than shared because fitting.js may never have been
       loaded: a student can open tab 05 without ever touching tab 03. */
    prof: [
      [0.1196,0.1268,0.1361,0.1402,0.1392,0.1363,0.1304,0.1248,0.1227,0.1237,0.1246,0.1258,0.1243,0.1176,0.1159,0.1221,0.1268,0.1160,0.1043,0.0940,0.0874,0.0839,0.0847,0.0878,0.0912,0.0963,0.1053,0.1147,0.1208,0.1264,0.1288,0.1241],
      [0.1150,0.1194,0.1253,0.1268,0.1251,0.1229,0.1205,0.1157,0.1126,0.1139,0.1158,0.1192,0.1213,0.1242,0.1261,0.1268,0.1162,0.0973,0.0955,0.0937,0.0877,0.0849,0.0835,0.0831,0.0844,0.0889,0.0963,0.1030,0.1070,0.1111,0.1149,0.1158],
      [0.1054,0.1077,0.1124,0.1156,0.1161,0.1168,0.1184,0.1208,0.1233,0.1233,0.1209,0.1170,0.1183,0.1229,0.1224,0.1201,0.1094,0.1010,0.0959,0.0896,0.0823,0.0799,0.0779,0.0768,0.0774,0.0804,0.0857,0.0913,0.0954,0.0998,0.1034,0.1050],
      [0.0873,0.0909,0.0961,0.1008,0.1035,0.1056,0.1071,0.1088,0.1109,0.1137,0.1179,0.1226,0.1331,0.1354,0.1284,0.1210,0.1108,0.1064,0.0959,0.0817,0.0743,0.0684,0.0648,0.0635,0.0648,0.0677,0.0704,0.0726,0.0753,0.0785,0.0824,0.0851],
      [0.0628,0.0685,0.0768,0.0867,0.0967,0.1045,0.1070,0.1077,0.1088,0.1120,0.1242,0.1329,0.1311,0.1275,0.1207,0.1134,0.1071,0.0976,0.0834,0.0709,0.0667,0.0629,0.0602,0.0588,0.0589,0.0597,0.0594,0.0592,0.0591,0.0592,0.0591,0.0600],
      [0.0537,0.0595,0.0692,0.0853,0.1003,0.1104,0.1160,0.1208,0.1283,0.1275,0.1257,0.1211,0.1184,0.1144,0.1091,0.1017,0.0955,0.0872,0.0701,0.0609,0.0586,0.0553,0.0527,0.0519,0.0521,0.0517,0.0503,0.0489,0.0483,0.0482,0.0488,0.0504],
      [0.0515,0.0576,0.0681,0.0866,0.1055,0.1170,0.1206,0.1220,0.1239,0.1258,0.1288,0.1415,0.1386,0.1146,0.0977,0.0900,0.0829,0.0746,0.0639,0.0542,0.0468,0.0441,0.0422,0.0407,0.0400,0.0397,0.0396,0.0398,0.0407,0.0420,0.0472]
    ]
  };
  /* Tab 03's published correct answer: high on the neck, 4:30 so the contacts
     sit either side of the windpipe, two fingers of slack. She has to be
     wearing the collar the previous two tabs taught, or those tabs and this
     one are about different dogs. */
  var FIT = { height: 0.49, clockDeg: 140, slack: 0.0073 };
  var HEAD_ZERO = 0.90, HEAD_FULL = 1.10;   // the head's weight ramp along the neck

  /* Metres per normalised unit. A Malinois is about 1.2 m nose to tail-tip,
     and 1.0 normalised IS that length, so this is the whole conversion. It
     sets the dog against a 1.75 m handler and a line measured in metres, and
     it is the only place real-world scale enters. */
  var M = 1.20;

  var HANDLER = { eye: 1.62, hand: 1.02, tall: 1.75 };

  /* ── the handler mesh, measured off trainer.glb ──────────────────────────
     Same normalised space as the dog: centred on the bounding box, largest
     axis 1.0. He is 1.0 tall in it, so TALL below IS the metre conversion.

     He faces +Z, which is why nothing rotates him at build time.

     THE LEGS ARE FUSED. A flood fill below the hips returns ONE component at
     every cut from 20% to 45% of his height — image-to-3D welded the trouser
     legs into a single column. So leg membership cannot come from connectivity
     the way the dog's did; it comes from which side of the centreline a vertex
     is on, with the weight fading to zero AT that centreline so the joined
     part between the thighs stays put while the outsides of both legs swing.
     That is why hipSide starts at 0.02 rather than 0. */
  var TRAINER = {
    tall:     1.75,      // metres for 1.0 normalised — he is 1.0 tall
    ground:  -0.500,
    hipY:    -0.020,     // weight 0 here
    legFull: -0.180,     // ... and 1 by here
    kneeY:   -0.300,
    hipX:     0.075,     // thigh centres either side of the spine
    hipSide: [0.020, 0.075],   // |x| band the side weight ramps across
    /* The leash hangs off this point. x and y are the measured hand; z is
       pushed forward of the measured 0.003, because his hands hang in the
       plane of his own torso and a line starting there leaves through his
       chest. Forward of the thigh is where a hand holding a lead actually is. */
    hand:    [0.282, -0.021, 0.090]
  };

  /* ── the drill's own numbers ─────────────────────────────────────────────
     LOADED/SLACK are hysteresis, not one threshold: a single trip point makes
     the line flicker between states while the dog breathes, and every rep
     boundary would fire twice. */
  var LOADED = 0.55;        // tension at or above this and the line is loaded
  var SLACK  = 0.18;        // at or below this it is genuinely slack again

  /* ── the marking scheme ──────────────────────────────────────────────────
     THE BUTTON IS A NICK, AND A NICK IS ONE TAP.

     The first cut of this drill held the button down and marked how fast you
     let go. That is Constant, and it is not how this is taught: you TAP — one,
     two, three, four — for as long as the line is loaded, and you stop the
     moment it goes slack. The dog learns from the tapping stopping. She has no
     way to time a release inside a single burst, so there is no release
     latency to mark and none is marked.

     A rep is judged on three things instead:
       · how quickly the first tap follows the line loading;
       · whether the tapping kept going while the line stayed tight — a long
         quiet spell mid-rep is the pressure coming off for nothing she did;
       · and above all OVERRUN: taps that land after the line has already gone
         slack. Each one arrives at the exact moment she got it right. */
  var TAP = {
    startGood: 1.00,   // line tight -> first tap
    startOk:   2.10,
    gapGood:   1.70,   // longest quiet spell allowed while it stayed tight
    settle:    1.10,   // slack this long with no further tap and the rep is over
    giveUp:    6.00,   // tight this long with no tap at all = a miss
    pulse:     0.30,   // how long one nick shows on the collar and the button
    hammer:    0.26    // taps closer together than this are not information
  };

  var STAGES = [
    { id: 1, name: 'Open field',
      brief: 'Nothing else going on. Walk away, let the line load, and answer it. Ten clean reps and she starts to look for you.',
      line: 3.0, distract: 0, need: 0.22 },
    { id: 2, name: 'Changes of direction',
      brief: 'Now change direction often. She is not learning a route — she is learning that being with you is what keeps the line slack.',
      line: 3.0, distract: 0, need: 0.44, turnEvery: 7 },
    { id: 3, name: 'With a distraction',
      brief: 'Something worth leaving you for. Her arousal comes up, and the level you found in a quiet yard will not read the same.',
      line: 3.0, distract: 1, need: 0.66, turnEvery: 8 },
    { id: 4, name: 'On the long line',
      brief: 'Six metres. She can get further from you before the line says anything, so she has to choose to come back from further out.',
      line: 6.0, distract: 1, need: 0.86, turnEvery: 8 },
    /* The last stage cannot be finished by filling a meter — the meter is
       already full by the time you arrive. It is finished by proving it: four
       clean reps in a row with no line on the dog. */
    { id: 5, name: 'Off the line',
      brief: 'No line at all. The collar is the only thing left, and it now means the same thing the line used to. Four clean reps in a row and she is finished.',
      line: 0, distract: 1, need: 1.00, turnEvery: 9, bubble: 3.4, streakNeed: 4 }
  ];

  // ── module state ────────────────────────────────────────────────────────
  var built = false, asked = false, ready = false, dead = false;
  var st = null, ui = {}, world = null, dogRoot = null, skinned = null;
  var bones = null, boneOf = {}, leash = null, handlerObj = null, distractObj = null;
  var lastErr = null;                 // read by a verification hook, never by the tab

  var K = {};                         // colours, read out of the stylesheet once

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
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function smooth(a, b, x) {
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function n1(v) { return Math.round(v * 10) / 10; }
  function n2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
  /* House rule: no hex in JS. Every colour this module draws is declared as a
     custom property in style.css and read back here. */
  function cssVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name);
      v = (v || '').trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }
  function V3(a) { return new THREE.Vector3(a[0], a[1], a[2]); }
  function now() { return window.performance ? performance.now() : Date.now(); }

  // ── the run ─────────────────────────────────────────────────────────────
  var G = null;
  function newRun(stageIx) {
    var S = STAGES[stageIx];
    G = {
      stage: stageIx,
      // the two bodies, in metres, on the ground plane
      dog:  { x: 0, z: 2.2, yaw: 0, sp: 0, want: null, state: 'settle', tState: 0,
              tapsSinceTry: 0, tapsNeeded: 3 },
      man:  { x: 0, z: 0,   yaw: 0 },
      line: S.line,
      bubble: S.bubble || 0,
      tension: 0,
      gait: 0,                  // walk-cycle phase, 0..1

      // the collar. stimUntil is a lamp, not a state: each nick lights the
      // receiver and the button for TAP.pulse and then it is over.
      level: 12, stim: false, stimUntil: 0, lastTapT: null, overrunTotal: 0,

      // what the dog knows
      under: 0,                 // understanding, 0..1 — the whole point
      arousal: S.distract ? 0.62 : 0.42,

      // the rep state machine
      rep: null, reps: 0, clean: 0, streak: 0, bestStreak: 0,
      falseP: 0, missed: 0, nagged: 0,
      lastMark: null, coach: null,
      turnCue: null, turnT: 0,
      done: false, graduated: false,
      t: 0
    };
    setCoach('opening', S.brief);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  THE RIG
  // ══════════════════════════════════════════════════════════════════════════

  var FWD, SIDEV, U, ETOP, ESIDEV, BASE, TOPV, baseU, spanU, EAR_SWING;
  function vecs() {
    if (FWD) return;
    FWD = V3(RIG.fwd); SIDEV = V3(RIG.side);
    U = V3(NECK.u); ETOP = V3(NECK.eTop); ESIDEV = V3(NECK.eSide);
    BASE = V3(NECK.base); TOPV = V3(NECK.top);
    baseU = BASE.dot(U); spanU = TOPV.dot(U) - baseU;
    EAR_SWING = [V3(RIG.ears[0].swing).normalize(),
                 V3(RIG.ears[1].swing).normalize()];
  }
  // a point from body coordinates: f along the spine, s to her left, y up
  function at(f, s, y) {
    return new THREE.Vector3(
      FWD.x * f + SIDEV.x * s,
      y,
      FWD.z * f + SIDEV.z * s);
  }
  function centreAt(t) { return BASE.clone().lerp(TOPV, t); }

  // ── the collar she is wearing ───────────────────────────────────────────
  /* Ported from tab 03 rather than re-derived. The strap follows the measured
     oval, so it lies ON the neck at every angle instead of hooping round the
     widest part of it — a collar drawn on one radius stands proud at the crest
     and reads as exactly the fault tabs 03 and 04 spend their whole length
     teaching students to see. */
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
      .add(ESIDEV.clone().multiplyScalar(Math.sin(ang)));
  }
  function strapFace(s, a, slack) {
    var sag = Math.max(0, slack) * 0.55 * Math.cos(a);
    return radiusAt(s, a) + Math.max(slack, -0.004) - sag;
  }

  function buildCollar() {
    var g = new THREE.Group();
    var NA = 96, W = 0.030;
    var half = U.clone().normalize().multiplyScalar(W / 2);
    var pos = [], idx = [], k;
    for (k = 0; k <= NA; k++) {
      var a = (k / NA) * Math.PI * 2;
      var p = centreAt(FIT.height)
        .add(dirAt(a).multiplyScalar(strapFace(FIT.height, a, FIT.slack)));
      var lo = p.clone().sub(half), hi = p.clone().add(half);
      pos.push(lo.x, lo.y, lo.z, hi.x, hi.y, hi.z);
      if (k < NA) {
        var o = k * 2;
        idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      color: new THREE.Color(cssVar('--lv-strap', '#040404')),
      side: THREE.DoubleSide })));

    // the receiver, at tab 03's answer of 4:30 — beside the windpipe, not under it
    var ang = FIT.clockDeg * Math.PI / 180;
    var d = dirAt(ang).normalize();
    var box = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, 0.030, 0.046),
      new THREE.MeshLambertMaterial({
        color: new THREE.Color(cssVar('--lv-housing', '#050505')) }));
    box.position.copy(centreAt(FIT.height))
       .add(d.clone().multiplyScalar(strapFace(FIT.height, ang, FIT.slack) + 0.014));
    box.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    g.add(box);
    return g;
  }

  /* Normalise the delivered geometry in place, so model space here is the same
     space RIG was measured in. EC.mesh hands out scene copies that SHARE
     geometry and material with the master, so both are cloned first — writing
     into the shared one would move tab 03's dog too. */
  function bakeGeometry(gltf) {
    var src = null;
    gltf.scene.traverse(function (o) { if (o.isMesh && !src) src = o; });
    if (!src) throw new Error('dog.glb carries no mesh');

    src.updateMatrixWorld(true);
    var geom = src.geometry.clone();
    geom.applyMatrix4(src.matrixWorld);
    geom.computeBoundingBox();
    var bb = geom.boundingBox;
    var ctr = bb.getCenter(new THREE.Vector3());
    var size = bb.getSize(new THREE.Vector3());
    var sc = 1 / Math.max(size.x, size.y, size.z);

    var m = new THREE.Matrix4()
      .makeScale(sc, sc, sc)
      .multiply(new THREE.Matrix4().makeTranslation(-ctr.x, -ctr.y, -ctr.z));
    geom.applyMatrix4(m);
    geom.computeBoundingBox();

    /* If this ever trips, the mesh has been swapped and every measured number
       in RIG is stale. Fail loudly here rather than shipping a dog whose legs
       bend in the wrong place. */
    var g2 = geom.boundingBox;
    if (Math.abs(g2.min.y - RIG.ground) > 0.02) {
      throw new Error('dog.glb no longer matches the measured rig ' +
                      '(ground ' + n2(g2.min.y) + ', expected ' + n2(RIG.ground) + ')');
    }
    var mat = src.material.clone();
    /* r128 turns skinning on from the object type, so material.skinning is a
       no-op here — it is set anyway because this file is the kind of thing
       that gets copied onto an older three. Harmless either way. */
    mat.skinning = true;
    mat.side = THREE.FrontSide;
    return { geom: geom, mat: mat };
  }

  /* skinIndex / skinWeight for every vertex, computed once.
     Bone order: 0 root, 1 head, 2 tail, then per leg upper, lower.
     A vertex takes at most three influences — root, a limb, and that limb's
     second segment — which is inside the four the attribute carries. */
  /* Bone order, and it is load-bearing — every index below is written by hand:
       0 root    the hips and the whole rear
       1 chest   child of root, pivots at the loin so she can BEND when turning
       2 head    child of chest
       3 tail    child of root
       4,5 ears  children of head
       6..9      front legs, children of CHEST  (fl up/lo, fr up/lo)
       10..13    hind legs,  children of ROOT   (hl up/lo, hr up/lo)

     Front legs hang off the chest and hind legs off the root on purpose: that
     is what makes a turn curve the animal instead of skidding a rigid board. */
  function buildWeights(geom) {
    var pos = geom.attributes.position;
    var n = pos.count;
    var si = new Uint16Array(n * 4);
    var sw = new Float32Array(n * 4);
    var p = new THREE.Vector3(), d3 = new THREE.Vector3(), q3 = new THREE.Vector3();
    var legs = RIG.legs, i, k, e;

    var tailF = RIG.tail.f, tailS = RIG.tail.s;
    var ears = [];
    for (e = 0; e < RIG.ears.length; e++) {
      ears.push({ tip: V3(RIG.ears[e].tip), ax: V3(RIG.ears[e].axis).normalize() });
    }

    for (i = 0; i < n; i++) {
      p.fromBufferAttribute(pos, i);
      var f = p.x * FWD.x + p.z * FWD.z;
      var s = p.x * SIDEV.x + p.z * SIDEV.z;
      var y = p.y;
      var o = i * 4;

      /* The default is no longer "the root". The torso is shared between the
         hips and the forehand so the spine can flex across the loin. */
      var wChest = smooth(RIG.spine.back, RIG.spine.front, f);
      si[o] = 0; sw[o] = 1 - wChest;
      si[o + 1] = 1; sw[o + 1] = wChest;

      // the head, along the neck axis — the same ramp tab 04 uses
      var sN = (p.dot(U) - baseU) / spanU;
      var wHead = smooth(HEAD_ZERO, HEAD_FULL, sN);
      if (wHead > 0.002) {
        /* Is it an ear? Measured from the tip down its own axis, and rejected
           if it sits further than earReach off that axis — that is skull, not
           ear. The ear bone is a child of the head, so an ear vertex needs no
           separate head term to follow a head turn. */
        var bestW = 0, who = -1;
        for (e = 0; e < ears.length; e++) {
          d3.set(p.x - ears[e].tip.x, p.y - ears[e].tip.y, p.z - ears[e].tip.z);
          var alng = d3.dot(ears[e].ax);
          q3.copy(ears[e].ax).multiplyScalar(alng);
          if (d3.sub(q3).length() > RIG.earReach) continue;
          var w = smooth(RIG.earZero, RIG.earFull, alng);
          if (w > bestW) { bestW = w; who = e; }
        }
        if (who >= 0 && bestW > 0.002) {
          si[o] = 4 + who;  sw[o] = bestW;
          si[o + 1] = 2;    sw[o + 1] = (1 - bestW) * wHead;
          si[o + 2] = 1;    sw[o + 2] = (1 - bestW) * (1 - wHead);
          continue;
        }
        si[o] = 2;     sw[o] = wHead;               // head
        si[o + 1] = 1; sw[o + 1] = 1 - wHead;       // ... blending back to chest
        continue;
      }

      /* Nearest claimant wins. Legs and tail are tested together because the
         tail's capture radius reaches past a hind leg's axis — the fifth
         flood-fill component came within 0.124 of the near hind leg, and
         "whichever axis is closer" is the only rule that splits them safely. */
      var bestD = 1e9, bestK = -1;
      for (k = 0; k < legs.length; k++) {
        var dd = Math.hypot(f - legs[k].f, s - legs[k].s);
        if (dd < bestD) { bestD = dd; bestK = k; }
      }
      var dTail = Math.hypot(f - tailF, s - tailS);
      if (dTail < bestD && y < RIG.tail.baseY) {
        var wT = smooth(RIG.tail.baseY, RIG.tail.tipY, y) *
                 (1 - smooth(RIG.tail.r * 0.70, RIG.tail.r, dTail));
        if (wT > 0.002) {
          si[o] = 3;     sw[o] = wT;                // tail
          si[o + 1] = 0; sw[o + 1] = 1 - wT;        // ... back to the hips
        }
        continue;
      }
      if (bestK < 0 || bestD > RIG.legR) continue;

      var L = legs[bestK];
      var jy = L.fore ? RIG.jointY.fore : RIG.jointY.hind;
      var ky = L.fore ? RIG.kneeY.fore  : RIG.kneeY.hind;

      /* Weight 0 at the joint, 1 by the height the flood fill proved the leg
         is its own column, then feathered to 0 at the capture radius so the
         belly does not get dragged along by an edge. */
      var wLeg = smooth(jy, RIG.legCut, y) *
                 (1 - smooth(RIG.legR * 0.74, RIG.legR, bestD));
      if (wLeg <= 0.002) continue;
      var wKnee = smooth(ky + 0.055, ky - 0.055, y);

      var upper = 6 + bestK * 2, lower = upper + 1;
      // a front leg falls back to the chest, a hind leg to the hips
      si[o] = L.fore ? 1 : 0; sw[o] = 1 - wLeg;
      si[o + 1] = upper; sw[o + 1] = wLeg * (1 - wKnee);
      si[o + 2] = lower; sw[o + 2] = wLeg * wKnee;
    }
    geom.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    geom.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  }

  function buildSkeleton(geom, mat) {
    var list = [], i;
    var root = new THREE.Bone();                     // 0 — hips and rear
    list.push(root);

    var chest = new THREE.Bone();                    // 1 — the forehand
    chest.position.copy(at(RIG.spine.f, 0, RIG.spine.y));
    root.add(chest); list.push(chest);

    var head = new THREE.Bone();                     // 2
    head.position.copy(centreAt(HEAD_ZERO)).sub(chest.position);
    chest.add(head); list.push(head);

    var tail = new THREE.Bone();                     // 3
    tail.position.copy(at(RIG.tail.f, RIG.tail.s, RIG.tail.baseY));
    root.add(tail); list.push(tail);

    var earB = [];                                   // 4, 5 — children of head
    for (i = 0; i < RIG.ears.length; i++) {
      var ear = new THREE.Bone();
      ear.position.copy(V3(RIG.ears[i].pivot)).sub(centreAt(HEAD_ZERO));
      head.add(ear); list.push(ear);
      earB.push(ear);
    }

    for (i = 0; i < RIG.legs.length; i++) {          // 6..13
      var L = RIG.legs[i];
      var jy = L.fore ? RIG.jointY.fore : RIG.jointY.hind;
      var ky = L.fore ? RIG.kneeY.fore  : RIG.kneeY.hind;
      var par = L.fore ? chest : root;
      var up = new THREE.Bone();
      up.position.copy(at(L.f, L.s, jy));
      if (L.fore) up.position.sub(chest.position);   // local to its own parent
      par.add(up); list.push(up);
      var lo = new THREE.Bone();
      lo.position.set(0, ky - jy, 0);
      up.add(lo); list.push(lo);
      boneOf[L.id] = { up: up, lo: lo };
    }

    var mesh = new THREE.SkinnedMesh(geom, mat);
    mesh.add(root);
    mesh.updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(list));
    mesh.normalizeSkinWeights();
    /* The scan's bounding sphere is computed from the bind pose. A leg swinging
       forward leaves it, and three then culls the whole dog at exactly the
       moment she starts moving. */
    mesh.frustumCulled = false;
    bones = list;
    boneOf.root = root; boneOf.chest = chest;
    boneOf.head = head; boneOf.tail = tail; boneOf.ears = earB;
    return mesh;
  }

  // ── posing ──────────────────────────────────────────────────────────────
  var qTmp = null, axSide = null, axUp = null;

  /* One walk cycle. Diagonal pairs move together — front-left with hind-right
     — which is a trot, and is what a dog moving with a handler actually does.
     Amplitude follows speed, so a standing dog stands still rather than
     marking time on the spot. */
  /* STANCE AND SWING, not a sine wave.

     The first version rotated every leg on sin(2*pi*p) and advanced p on a
     clock. Both halves of that are wrong and together they are why she skated:
     a sine has the foot moving fastest at mid-stroke, when a planted foot
     should be travelling backwards at exactly the speed the body travels
     forward, and a clock-driven phase has no relationship to the ground at all.

     So the cycle is split. For the first half the foot is DOWN and the leg
     rotates back linearly; because the phase is now driven by distance
     travelled (see stepDog), that backward sweep cancels the body's forward
     motion and the paw sits still on the grass. For the second half the foot is
     UP, the knee folds to clear the ground, and the leg arcs forward on a
     smoothstep. That is the whole trick — no IK, no ground raycast.

     Amplitudes stay modest: the weight ramp is a skin, not a joint, and only
     looks like a joint over a small angle. They scale to zero at rest so she
     stands square rather than frozen mid-stride. */
  function poseLegs(phase, speed) {
    var swing = clamp(speed / 2.4, 0, 1);
    var A = 0.34 * swing;                   // radians at the shoulder
    var B = 0.46 * swing;                   // radians at the knee, swing phase only

    /* Walk below about 1 m/s, trot above about 1.6, and blend across the gap.
       DUTY is the fraction of the cycle a foot spends on the ground: about
       0.62 at a walk, 0.50 at a trot. That single number is most of what makes
       a walk look like a walk — at a walk she always has three feet down. */
    var trotness = smooth(1.05, 1.65, speed);
    var duty = lerp(0.62, 0.50, trotness);

    for (var i = 0; i < RIG.legs.length; i++) {
      var L = RIG.legs[i], b = boneOf[L.id];
      var off = lerp(L.phW, L.ph, trotness);
      var p = (phase + off) % 1;
      var th, fold;
      if (p < duty) {                       // planted
        th = A * (1 - 2 * (p / duty));
        fold = 0;
      } else {                              // through the air
        var u = (p - duty) / (1 - duty);
        th = -A + 2 * A * (u * u * (3 - 2 * u));
        fold = Math.sin(u * Math.PI) * B;
      }
      /* The hock folds the opposite way to the carpus — a hind leg that bends
         like a front one is the thing that makes a CG dog look like a table. */
      if (!L.fore) fold = -fold * 0.75;
      b.up.quaternion.setFromAxisAngle(axSide, th);
      b.lo.quaternion.setFromAxisAngle(axSide, -fold);
    }
  }

  /* Head. yaw is her looking left or right of her own nose; dip drops the
     muzzle to the ground for a scent. Bind rotations are identity, so bone
     local axes are model axes and these two are independent. */
  function poseHead(yaw, dip) {
    qTmp.setFromAxisAngle(axUp, yaw);
    var q2 = new THREE.Quaternion().setFromAxisAngle(axSide, dip);
    boneOf.head.quaternion.copy(qTmp).multiply(q2);
  }

  /* The spine, and the lean.

     She used to pivot like a car: one rigid body rotating about its centre.
     A turning dog carries a curve — the hindquarters trail, the forehand leads
     — and she banks into it slightly, the way anything that turns at speed
     does. The chest bone is a child of the hips, so rotating it about the
     vertical in the SAME direction as the turn puts the front of her ahead of
     the back of her, which is the curve. */
  function poseSpine(turnRate, speed, dt) {
    if (!boneOf.chest) return;
    var k = 1 - Math.pow(0.004, dt);
    var want = clamp(turnRate * 0.30, -0.42, 0.42);
    G.bend = lerp(G.bend || 0, want, k);
    var lean = clamp(turnRate * speed * 0.055, -0.18, 0.18);
    G.lean = lerp(G.lean || 0, lean, k);
    qTmp.setFromAxisAngle(axUp, G.bend);
    var q2 = new THREE.Quaternion().setFromAxisAngle(FWD, -G.lean);
    boneOf.chest.quaternion.copy(qTmp).multiply(q2);
  }

  /* The ears.

     Tab 04 spends its whole length teaching a student to read an ear flick as
     the sign a stimulation landed. If the ears never move on the tab where the
     stimulations actually happen, that lesson quietly contradicts itself — so
     a nick rocks an ear back here, once, and it settles. Negative is backward:
     each swing axis is cross(up, ear axis) and these ears lean forward of
     vertical, so a negative angle takes the tip back the way a real one goes. */
  function poseEars(dt) {
    if (!boneOf.ears || !boneOf.ears.length) return;
    var age = G.t - (G.earT == null ? -99 : G.earT);
    var flick = (age >= 0 && age < 0.55) ? Math.sin((age / 0.55) * Math.PI) : 0;
    /* Attention sets where they live: forward and up when she is with you,
       carried back when she is worried or working something out. */
    var base = (G.dog.state === 'come' || G.dog.state === 'settle')
      ? 0.05 : -0.10 - 0.16 * G.arousal;
    for (var i = 0; i < boneOf.ears.length; i++) {
      var a = base - (i === G.earWhich ? flick * 0.62 : flick * 0.20);
      var ax = EAR_SWING[i];
      boneOf.ears[i].quaternion.setFromAxisAngle(ax, a);
    }
  }

  /* Tail. Height carries arousal — clamped down when she is worried, loose and
     swinging when she is not — which is a tell worth having in a drill about
     reading a dog. */
  function poseTail(t, arousal, moving) {
    var lift = lerp(-0.34, 0.20, 1 - arousal);
    var sway = Math.sin(t * (moving ? 7.2 : 2.4)) * (0.10 + 0.26 * (1 - arousal));
    qTmp.setFromAxisAngle(axSide, lift);
    var q2 = new THREE.Quaternion().setFromAxisAngle(axUp, sway);
    boneOf.tail.quaternion.copy(qTmp).multiply(q2);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  THE FIELD
  // ══════════════════════════════════════════════════════════════════════════

  /* Mown stripes. They are not decoration: with a plain green plane there is
     no way to see that the handler is moving, because nothing in the frame
     passes. The stripes are the only reason walking reads as walking. */
  function grassTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var x = c.getContext('2d');
    x.fillStyle = K.grass;
    x.fillRect(0, 0, 256, 256);
    x.fillStyle = K.grassAlt;
    for (var i = 0; i < 256; i += 64) x.fillRect(0, i, 256, 32);
    // a little noise so the stripes do not band at a distance
    x.globalAlpha = 0.06;
    for (var k = 0; k < 2600; k++) {
      x.fillStyle = (k % 2) ? K.grassDark : K.grassLite;
      x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(22, 22);
    t.anisotropy = 4;
    return t;
  }

  var groundMesh = null;
  function buildField() {
    var g = new THREE.Group();
    groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshLambertMaterial({ map: grassTexture() }));
    groundMesh.rotation.x = -Math.PI / 2;
    g.add(groundMesh);
    return g;
  }

  /* The photographed turf, swapped in over the drawn stripes once it decodes.

     It is done this way round on purpose: the field is built and standing
     before the texture is asked for, so a missing or damaged field-tex.js
     costs the drill a nicer ground and nothing else. Nothing here fetches —
     the JPEG arrives as a data: URI inside a <script>, because on file:// this
     app is not allowed to fetch a local file. */
  var texOnce = null;
  function loadFieldTex() {
    if (texOnce) return texOnce;
    texOnce = new Promise(function (res, rej) {
      if (window.FIELD_TEX) return res(window.FIELD_TEX);
      var s = document.createElement('script');
      s.src = 'field-tex.js';
      s.async = false;
      s.onload = function () {
        if (window.FIELD_TEX) res(window.FIELD_TEX);
        else rej(new Error('field-tex.js held no FIELD_TEX'));
      };
      s.onerror = function () { rej(new Error('field-tex.js could not be read')); };
      document.head.appendChild(s);
    });
    texOnce['catch'](function () { texOnce = null; });
    return texOnce;
  }
  function upgradeGrass() {
    loadFieldTex().then(function (T) {
      if (!T.grass || !groundMesh || dead) return;
      new THREE.TextureLoader().load(T.grass, function (tex) {
        if (!groundMesh || dead) return;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        /* One tile is about 5.5 m of grass. Much tighter and the repeat
           becomes a visible plaid; much looser and there is nothing passing
           the camera to tell the student they are moving. */
        tex.repeat.set(22, 22);
        tex.anisotropy = 8;
        var old = groundMesh.material.map;
        groundMesh.material.map = tex;
        /* Tint it DOWN. The drawn stripes were already written dark because a
           Lambert map is multiplied by a scene lit for a studio; a photograph
           dropped in at full value comes back pale yellow-sage and nothing
           like the turf it was generated from. */
        groundMesh.material.color = new THREE.Color(K.grassTint);
        groundMesh.material.needsUpdate = true;
        if (old && old.dispose) old.dispose();
      }, undefined, function () { /* keep the drawn stripes */ });
    })['catch'](function () { /* keep the drawn stripes */ });
  }

  function shadowDisc(r) {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var x = c.getContext('2d');
    var grd = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, K.shadow);
    grd.addColorStop(1, K.shadowOut);
    x.fillStyle = grd;
    x.fillRect(0, 0, 128, 128);
    var t = new THREE.CanvasTexture(c);
    var m = new THREE.Mesh(
      new THREE.PlaneGeometry(r * 2, r * 2),
      new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.5,
                                    depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.01;
    return m;
  }

  /* The handler. Deliberately plain and dark: it is seen from behind at three
     metres, and the moment it gains a face it starts competing with a
     photogrammetry dog it cannot possibly match. What it has to do is show
     where you are standing, which way you are facing, and where your hand is —
     because the line hangs off that hand. */
  /* The generated handler, skinned so he walks.

     Bones: 0 root, then upper and lower for each leg. Everything above the
     hips rides the root, so the hand the line hangs off is a fixed point in
     his own space and does not wobble with the gait — which is what stops the
     leash jittering while he walks. */
  function buildTrainer(gltf) {
    var src = null;
    gltf.scene.traverse(function (o) { if (o.isMesh && !src) src = o; });
    if (!src) throw new Error('trainer.glb carries no mesh');
    src.updateMatrixWorld(true);

    var geom = src.geometry.clone();
    geom.applyMatrix4(src.matrixWorld);
    geom.computeBoundingBox();
    var bb = geom.boundingBox;
    var c = bb.getCenter(new THREE.Vector3());
    var size = bb.getSize(new THREE.Vector3());
    var sc = 1 / Math.max(size.x, size.y, size.z);
    geom.applyMatrix4(new THREE.Matrix4().makeScale(sc, sc, sc)
      .multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z)));
    geom.computeBoundingBox();

    var pos = geom.attributes.position, n = pos.count, i;
    var si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
    for (i = 0; i < n; i++) {
      var x = pos.getX(i), y = pos.getY(i);
      var o = i * 4;
      si[o] = 0; sw[o] = 1;
      var wLeg = smooth(TRAINER.hipY, TRAINER.legFull, y);
      if (wLeg <= 0.002) continue;
      // fade to nothing at the centreline — the thighs are one shell there
      wLeg *= smooth(TRAINER.hipSide[0], TRAINER.hipSide[1], Math.abs(x));
      if (wLeg <= 0.002) continue;
      var wKnee = smooth(TRAINER.kneeY + 0.055, TRAINER.kneeY - 0.055, y);
      var up = x >= 0 ? 2 : 4, lo = up + 1;
      sw[o] = 1 - wLeg;
      si[o + 1] = up; sw[o + 1] = wLeg * (1 - wKnee);
      si[o + 2] = lo; sw[o + 2] = wLeg * wKnee;
    }

    /* Everything above the hips rides a CHEST bone. His arms are not rigged and
       cannot be — they are 45 degrees out from a fused torso — so the walk gets
       its arm swing from twisting the whole upper body instead, which is what a
       walking body does anyway. The hips stay on the root, so the twist reads
       as a torso rotating over the legs rather than the whole man turning. */
    for (i = 0; i < n; i++) {
      var o2 = i * 4;
      if (sw[o2 + 1] > 0.002) continue;         // already claimed by a leg
      var wCh = smooth(TRAINER.hipY, TRAINER.hipY + 0.16, pos.getY(i));
      if (wCh <= 0.002) continue;
      sw[o2] = 1 - wCh;
      si[o2 + 1] = 1; sw[o2 + 1] = wCh;
    }
    geom.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    geom.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));

    var bones = [], root = new THREE.Bone();
    bones.push(root);                                  // 0
    var chest = new THREE.Bone();                      // 1
    chest.position.set(0, TRAINER.hipY, 0);
    root.add(chest); bones.push(chest);
    [TRAINER.hipX, -TRAINER.hipX].forEach(function (hx) {   // 2,3 then 4,5
      var up = new THREE.Bone();
      up.position.set(hx, TRAINER.hipY, 0);
      root.add(up); bones.push(up);
      var lo = new THREE.Bone();
      lo.position.set(0, TRAINER.kneeY - TRAINER.hipY, 0);
      up.add(lo); bones.push(lo);
    });

    var mat = src.material.clone();
    mat.skinning = true;
    var mesh = new THREE.SkinnedMesh(geom, mat);
    mesh.add(root);
    mesh.updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(bones));
    mesh.normalizeSkinWeights();
    mesh.frustumCulled = false;

    var g = new THREE.Group();
    g.scale.setScalar(TRAINER.tall);
    g.add(mesh);

    /* The hand is an empty, not a bone: the arms are not rigged, so the point
       the line leaves from is fixed in his own space. updateLeash() reads its
       world position every frame. */
    var hand = new THREE.Object3D();
    hand.position.set(TRAINER.hand[0], TRAINER.hand[1], TRAINER.hand[2]);
    mesh.add(hand);

    var outer = new THREE.Group();
    outer.add(g);
    g.position.y = -TRAINER.ground * TRAINER.tall;
    outer.add(shadowDisc(0.42));
    outer.userData.hand = hand;
    outer.userData.chest = chest;
    outer.userData.legs = [bones[2], bones[4]];
    outer.userData.knees = [bones[3], bones[5]];
    return outer;
  }

  function buildHandlerPrimitive() {
    var g = new THREE.Group();
    var coat = new THREE.MeshLambertMaterial({ color: new THREE.Color(K.coat) });
    var legM = new THREE.MeshLambertMaterial({ color: new THREE.Color(K.trouser) });
    var skin = new THREE.MeshLambertMaterial({ color: new THREE.Color(K.skin) });

    function part(par, geo, mat, x, y, z) {
      var m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      par.add(m);
      return m;
    }

    /* Legs hang off hip pivots so they can swing. The first pass had them as
       two fixed cylinders 17 cm apart at 8 cm radius, which merged into one
       column — a figure with no gap between its legs reads as a chess piece,
       and a chess piece sliding across a field reads as a bug. */
    var hips = [];
    [-0.105, 0.105].forEach(function (x) {
      var hip = new THREE.Group();
      hip.position.set(x, 0.86, 0);
      part(hip, new THREE.CylinderGeometry(0.062, 0.052, 0.80, 9), legM, 0, -0.40, 0);
      part(hip, new THREE.BoxGeometry(0.115, 0.075, 0.26), coat, 0, -0.80, 0.045);
      g.add(hip);
      hips.push(hip);
    });

    part(g, new THREE.CylinderGeometry(0.150, 0.128, 0.30, 12), legM, 0, 0.96, 0);   // hips
    part(g, new THREE.CylinderGeometry(0.163, 0.150, 0.44, 12), coat, 0, 1.30, 0);   // torso
    part(g, new THREE.SphereGeometry(0.168, 14, 10), coat, 0, 1.50, 0);              // shoulders
    part(g, new THREE.CylinderGeometry(0.052, 0.058, 0.10, 10), skin, 0, 1.585, 0);  // neck
    part(g, new THREE.SphereGeometry(0.098, 14, 12), skin, 0, 1.665, 0);             // head
    part(g, new THREE.SphereGeometry(0.104, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
         coat, 0, 1.665, 0);                                                          // cap
    part(g, new THREE.BoxGeometry(0.175, 0.018, 0.115), coat, 0, 1.668, 0.115);       // peak

    // the free arm, hanging
    var armL = new THREE.Group();
    armL.position.set(-0.168, 1.46, 0);
    part(armL, new THREE.CylinderGeometry(0.048, 0.042, 0.54, 9), coat, 0, -0.27, 0);
    part(armL, new THREE.SphereGeometry(0.052, 10, 8), skin, 0, -0.55, 0.01);
    armL.rotation.z = -0.10;
    g.add(armL);

    /* The line arm is held out and forward, and the hand is a real object
       rather than a guess: updateLeash() reads its world position every frame,
       so where the line hangs from is wherever this sphere ends up. */
    var arm = new THREE.Group();
    arm.position.set(0.168, 1.46, 0);
    part(arm, new THREE.CylinderGeometry(0.048, 0.042, 0.56, 9), coat, 0, -0.26, 0.09);
    var hand = part(arm, new THREE.SphereGeometry(0.055, 10, 8), skin, 0, -0.51, 0.20);
    arm.rotation.x = 0.30;
    g.add(arm);

    g.add(shadowDisc(0.42));
    g.userData.hand = hand;
    g.userData.arm = arm;
    g.userData.hips = hips;
    return g;
  }

  /* The handler walks. Without this the figure slides across the grass like a
     game piece, and since half the drill is the student moving their own feet,
     a handler who never takes a step undercuts the whole thing. */
  var MAN_STRIDE = 0.78;                 // metres of ground per full cycle

  function poseHandler(dt, moving) {
    var ud = handlerObj.userData;

    /* The phase was `+= 0.055` per FRAME — no dt and no speed. That is a bug,
       not just a stylistic one: on a 120 Hz screen his legs ran at double
       speed. It is now metres of ground per stride, exactly like the dog. */
    var vx = G.man.vx || 0, vz = G.man.vz || 0;
    var speed = Math.hypot(vx, vz);
    G.manGait = ((G.manGait || 0) + (speed * dt) / MAN_STRIDE) % 1;

    // his own frame: he is always facing the dog
    var fwdX = Math.sin(G.man.yaw), fwdZ = Math.cos(G.man.yaw);
    var vFwd = vx * fwdX + vz * fwdZ;          // + toward her, - backing away
    var vSide = vx * fwdZ - vz * fwdX;         // + one way round her, - the other

    var k = 1 - Math.pow(0.02, dt);
    G.manF = lerp(G.manF || 0, clamp(vFwd / 1.55, -1, 1), k);
    G.manS = lerp(G.manS || 0, clamp(vSide / 1.55, -1, 1), k);
    G.manAmp = lerp(G.manAmp || 0, moving ? 1 : 0, k);

    var a = Math.sin(G.manGait * Math.PI * 2);
    var fore = a * G.manF, side = a * G.manS;

    if (ud.legs) {                             // the generated mesh, skinned
      // fore-aft stride, signed — backing away plays the stride in reverse
      ud.legs[0].rotation.x =  fore * 0.44;
      ud.legs[1].rotation.x = -fore * 0.44;
      // and a scissoring side-step when he arcs round her
      ud.legs[0].rotation.z =  side * 0.30;
      ud.legs[1].rotation.z = -side * 0.30;
      /* The knee folds only on the leg coming through, and never backwards —
         a knee bending the wrong way is the first thing anyone notices. */
      var lift = Math.max(Math.abs(G.manF), Math.abs(G.manS)) * 0.52;
      ud.knees[0].rotation.x = -Math.max(0, a) * lift;
      ud.knees[1].rotation.x = -Math.max(0, -a) * lift;
      // torso counter-rotation: this is what swings the arms
      if (ud.chest) ud.chest.rotation.y = -fore * 0.09;
      return;
    }
    if (!ud.hips) return;                      // the primitive fallback
    ud.hips[0].rotation.x = fore * 0.46;
    ud.hips[1].rotation.x = -fore * 0.46;
    if (ud.arm) ud.arm.rotation.z = -fore * 0.16;
  }

  /* The distraction: something worth leaving you for, parked at the edge of the
     field. It is a shape and a colour, not a second animal — a second dog would
     need a second mesh, and the drill only needs somewhere her head goes. */
  function buildDistraction() {
    var g = new THREE.Group();
    var m = new THREE.MeshLambertMaterial({ color: new THREE.Color(K.distract) });
    var post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8), m);
    post.position.y = 0.55;
    g.add(post);
    var ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 12), m);
    ball.position.y = 1.2;
    g.add(ball);
    g.add(shadowDisc(0.3));
    return g;
  }

  /* The line, as a camera-facing ribbon. A tube would be more honest and four
     times the vertices for something 4 mm across; what matters is that the
     SHAPE is right, because the shape is the reading: a hanging curve means
     slack and a straight line means loaded, and the student is being taught to
     see exactly that difference. */
  var LEASH_SEG = 26;
  function buildLeash() {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position',
      new THREE.BufferAttribute(new Float32Array((LEASH_SEG + 1) * 2 * 3), 3));
    var idx = [];
    for (var i = 0; i < LEASH_SEG; i++) {
      var a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    geo.setIndex(idx);
    var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: new THREE.Color(K.leash), side: THREE.DoubleSide }));
    m.frustumCulled = false;
    return m;
  }

  /* ── the line, as a rope with memory ─────────────────────────────────────
     It was a quadratic Bezier rebuilt from the two endpoints every frame, so it
     had no past: it could not swing when the handler turned, could not lag when
     she accelerated, and slid between shapes with no weight at all. The lead is
     the most-looked-at object on this tab — the whole drill is reading it — and
     a stiff parabola reads as a broom handle.

     So it is a Verlet rope: positions, previous positions, gravity, and a few
     relaxation passes pulling neighbouring beads back to the rest spacing with
     both ends pinned. Sag, swing and the visible jolt as it comes tight all
     fall out of that rather than being drawn on. */
  var rope = null;
  var rv = { d: null, tan: null, off: null };
  function initRope(a, b) {
    rope = { p: [], q: [], n: LEASH_SEG + 1, rest: 0 };
    for (var i = 0; i <= LEASH_SEG; i++) {
      var v = new THREE.Vector3().lerpVectors(a, b, i / LEASH_SEG);
      rope.p.push(v);
      rope.q.push(v.clone());
    }
    rv.d = new THREE.Vector3(); rv.tan = new THREE.Vector3(); rv.off = new THREE.Vector3();
  }

  function stepRope(a, b, dt) {
    if (!rope) initRope(a, b);
    // rest spacing follows the line's own length, so stage 4 really does carry
    // twice the rope rather than the same rope stretched
    rope.rest = G.line / LEASH_SEG;

    var h = Math.min(dt, 1 / 30);
    var damp = 0.986, g = -9.81 * h * h;
    var i, k;
    for (i = 0; i < rope.n; i++) {
      var p = rope.p[i], q = rope.q[i];
      var vx = (p.x - q.x) * damp, vy = (p.y - q.y) * damp, vz = (p.z - q.z) * damp;
      q.copy(p);
      p.x += vx; p.y += vy + g; p.z += vz;
    }
    rope.p[0].copy(a);
    rope.p[rope.n - 1].copy(b);

    for (k = 0; k < 6; k++) {
      for (i = 0; i < rope.n - 1; i++) {
        var p1 = rope.p[i], p2 = rope.p[i + 1];
        rv.d.subVectors(p2, p1);
        var len = rv.d.length();
        if (len < 1e-6) continue;
        var diff = (len - rope.rest) / len * 0.5;
        /* A rope pulls and never pushes. Without this, a compressed pair
           springs apart and a slack line jitters like coiled wire instead of
           hanging still. */
        if (diff < 0) continue;
        rv.d.multiplyScalar(diff);
        if (i !== 0) p1.add(rv.d);
        if (i + 1 !== rope.n - 1) p2.sub(rv.d);
      }
      rope.p[0].copy(a);
      rope.p[rope.n - 1].copy(b);
      for (i = 1; i < rope.n - 1; i++) if (rope.p[i].y < 0.012) rope.p[i].y = 0.012;
    }
  }

  function updateLeash(from, to, tension, dt) {
    if (!leash) return;
    stepRope(from, to, dt);
    var pos = leash.geometry.attributes.position, arr = pos.array;
    /* Wider than a real lead. A 20 mm lead at the drill's own framing is under
       a pixel, and the SHAPE of this line is the entire reading the tab is
       teaching — so it is drawn to be legible at playing distance, and looks
       like a strap only in a close-up nobody plays at. It still thins as it
       loads, which is the tell that matters. */
    var half = lerp(0.013, 0.008, tension);
    var cam = st.camera;
    for (var i = 0; i <= LEASH_SEG; i++) {
      var pt = rope.p[i];
      rv.tan.subVectors(rope.p[Math.min(i + 1, LEASH_SEG)], rope.p[Math.max(i - 1, 0)]);
      if (rv.tan.lengthSq() < 1e-9) rv.tan.subVectors(to, from);
      rv.off.subVectors(cam.position, pt).cross(rv.tan).normalize().multiplyScalar(half);
      var o = i * 6;
      arr[o]     = pt.x - rv.off.x; arr[o + 1] = pt.y - rv.off.y; arr[o + 2] = pt.z - rv.off.z;
      arr[o + 3] = pt.x + rv.off.x; arr[o + 4] = pt.y + rv.off.y; arr[o + 5] = pt.z + rv.off.z;
    }
    pos.needsUpdate = true;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  THE SIMULATION
  // ══════════════════════════════════════════════════════════════════════════

  var keys = {};

  /* Scratch, allocated once. These two are read every frame, and a Vector3 per
     body per frame is 120 allocations a second for nothing. */
  var vHand = null, vClip = null, clipLocal = null;
  function handMetres() {
    if (!vHand) vHand = new THREE.Vector3();
    var h = handlerObj.userData.hand;
    h.updateMatrixWorld(true);
    return h.getWorldPosition(vHand);
  }
  /* Where the line clips: the underside of the neck, at the collar, on the live
     mesh. Taken through the dog's own matrix rather than from her ground
     position so it rises and falls with her as she moves. */
  function clipMetres() {
    if (!clipLocal) {
      clipLocal = centreAt(0.45).sub(ETOP.clone().multiplyScalar(0.105));
      vClip = new THREE.Vector3();
    }
    dogRoot.updateMatrixWorld(true);
    return vClip.copy(clipLocal).applyMatrix4(dogRoot.matrixWorld);
  }

  function stepHandler(dt) {
    var sp = 1.55 * dt;
    var fx = 0, fz = 0;
    // the handler always faces the dog, so "left" and "right" mean arc round her
    var dx = G.dog.x - G.man.x, dz = G.dog.z - G.man.z;
    var d = Math.hypot(dx, dz) || 1;
    var fwdX = dx / d, fwdZ = dz / d;
    var rgtX = fwdZ, rgtZ = -fwdX;

    if (keys.up)    { fx += fwdX; fz += fwdZ; }
    if (keys.down)  { fx -= fwdX; fz -= fwdZ; }
    if (keys.left)  { fx -= rgtX; fz -= rgtZ; }
    if (keys.right) { fx += rgtX; fz += rgtZ; }

    var l = Math.hypot(fx, fz);
    if (l > 0) {
      G.man.x += (fx / l) * sp;
      G.man.z += (fz / l) * sp;
      G.man.moving = true;
      /* Velocity is kept, not just the fact of moving. He always FACES the dog,
         so walking backwards and side-stepping are the normal case here, and
         the legs have to know which — a forward stride played while backing
         away is the single most obvious tell in the whole scene. */
      G.man.vx = (fx / l) * 1.55;
      G.man.vz = (fz / l) * 1.55;
    } else {
      G.man.moving = false;
      G.man.vx = 0; G.man.vz = 0;
    }

    G.man.yaw = Math.atan2(fwdX, fwdZ);
    var r = Math.hypot(G.man.x, G.man.z);
    if (r > 26) { G.man.x *= 26 / r; G.man.z *= 26 / r; }
  }

  /* Where she would go if nobody stopped her. A dog that has not understood the
     collar yet is not being naughty — she is doing something else, and the line
     is simply in the way of it. */
  function pickWander() {
    var S = STAGES[G.stage];
    var ang, dist;
    if (S.distract && Math.random() < 0.55 + 0.25 * G.arousal) {
      ang = Math.atan2(DISTRACT_AT.x - G.dog.x, DISTRACT_AT.z - G.dog.z);
      dist = 6 + Math.random() * 4;
    } else {
      ang = Math.random() * Math.PI * 2;
      dist = 3 + Math.random() * 5;
    }
    G.dog.want = { x: G.dog.x + Math.sin(ang) * dist, z: G.dog.z + Math.cos(ang) * dist };
  }
  var DISTRACT_AT = { x: 9.5, z: 7.0 };

  function setDogState(s) { G.dog.state = s; G.dog.tState = 0; }

  /* How likely she is to try coming to you, the next time she tries anything.

     The base term is what she has learnt. The second term is the LINE, and it
     is the reason this drill is taught on one: at full stretch, with the
     handler still moving away, she is being physically drawn in, so the right
     answer is the one she falls into. The collar is being paired with an
     outcome the line already guarantees — which is why the early reps work at
     all, and why taking the line away is left until stage 5. */
  function answerChance() {
    var p = 0.30 + 0.60 * G.under;
    if (G.line > 0 && G.tension > 0.90 && G.man.moving) p += 0.40;
    return clamp(p, 0, 0.95);
  }

  function stepDog(dt) {
    var D = G.dog;
    D.tState += dt;

    var hx = G.man.x - D.x, hz = G.man.z - D.z;
    var toMan = Math.hypot(hx, hz) || 1;
    var wantYaw;
    var target = 0;                       // metres per second she is trying to do

    if (D.state === 'settle') {
      target = 0;
      wantYaw = D.yaw;
      /* How long she stays with you before going off again is the clearest
         read-out of what she has learnt: at the start she leaves almost at
         once, and by the end she keeps checking in instead. */
      var stay = 0.9 + G.under * 5.5;
      if (D.tState > stay) { pickWander(); setDogState('wander'); }

    } else if (D.state === 'wander') {
      if (!D.want) pickWander();
      var wx = D.want.x - D.x, wz = D.want.z - D.z;
      var dw = Math.hypot(wx, wz);
      wantYaw = Math.atan2(wx, wz);
      target = 1.15 + 0.85 * G.arousal;
      if (dw < 0.4 || D.tState > 9) setDogState('settle');

    } else if (D.state === 'brace') {
      /* Opposition reflex. Pull on a dog and the dog pulls back — which is
         exactly why leash pressure alone does not teach this, and why the
         collar is being introduced at all. */
      wantYaw = Math.atan2(-hx, -hz);
      target = 0.35;
      /* While the pressure is still on she keeps offering things. A dog that
         locks into a brace and stays there for the rest of the rep leaves the
         student with nothing to release ON, which is not what happens in front
         of you and would make the first rep unwinnable. */
      var tapping = G.t - (G.lastTapT == null ? -99 : G.lastTapT) < 2.0;
      var braceFor = tapping ? 0.7 : 1.4;
      if (D.tState > braceFor) {
        if (tapping) { D.tapsNeeded = Math.max(1, Math.round(lerp(3.4, 1, G.under)));
                       D.tapsSinceTry = 0; setDogState('confused'); }
        else { pickWander(); setDogState('wander'); }
      }

    } else if (D.state === 'confused') {
      // pressure is on and she has not worked out what turns it off
      wantYaw = D.yaw + Math.sin(D.tState * 5.5) * 0.9;
      target = 0.5 + Math.random() * 0.3;
      /* She tries something once enough taps have landed — not after a fixed
         wait. That is the difference the tapping model makes: the handler's
         thumb is what moves the rep along, so a handler who stops tapping
         while the line is still tight is a handler she stops hearing. */
      if (D.tapsSinceTry >= D.tapsNeeded || D.tState > 4.5) {
        D.tapsSinceTry = 0;
        if (Math.random() < answerChance()) setDogState('come');
        else setDogState('brace');
      }

    } else if (D.state === 'come') {
      wantYaw = Math.atan2(hx, hz);
      target = 1.9 + 0.9 * G.under;
      if (toMan < 1.35) setDogState('settle');

    } else {
      wantYaw = D.yaw; target = 0;
    }

    // turn toward what she wants, at a believable rate
    var dy = ((wantYaw - D.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    var applied = clamp(dy, -3.2 * dt, 3.2 * dt);
    D.yaw += applied;
    // how hard she is turning, in radians a second — the spine and the head lead read this
    D.turnRate = applied / Math.max(dt, 1e-4);

    D.sp += clamp(target - D.sp, -5 * dt, 3.4 * dt);
    var wasX = D.x, wasZ = D.z;
    D.x += Math.sin(D.yaw) * D.sp * dt;
    D.z += Math.cos(D.yaw) * D.sp * dt;

    // the line is a hard constraint: she cannot be further away than it is long
    if (G.line > 0) {
      var mx = D.x - G.man.x, mz = D.z - G.man.z;
      var d = Math.hypot(mx, mz);
      if (d > G.line) {
        D.x = G.man.x + (mx / d) * G.line;
        D.z = G.man.z + (mz / d) * G.line;
        if (D.state === 'wander') setDogState('brace');
      }
    }
    var r = Math.hypot(D.x, D.z);
    if (r > 27) { D.x *= 27 / r; D.z *= 27 / r; }

    /* THE GAIT IS DRIVEN BY GROUND COVERED, NOT BY CLOCK AND NOT BY INTENT.

       It was `dt * (0.55 + sp * 0.62)` — a timer. Her legs cycled at one rate
       while her body moved at another, so her paws slid, and that 0.55 had a
       standing dog marching on the spot.

       Driving it from D.sp instead was still wrong, and wrong in a way only a
       measurement caught: pinned at the end of a taut line she keeps a healthy
       D.sp while the constraint above puts her straight back where she was, so
       her feet churned over ground she was not covering. What the legs must
       follow is the displacement that SURVIVED the constraint — measured here,
       after it. Stride length grows with speed because dogs lengthen their
       stride rather than just cycling faster. */
    var moved = Math.hypot(D.x - wasX, D.z - wasZ);
    var stride = lerp(0.62, 1.05, clamp((moved / Math.max(dt, 1e-4)) / 2.4, 0, 1));
    G.gait = (G.gait + moved / stride) % 1;
    /* What the legs are told, so a dog held on a tight line stands and leans
       rather than running on the spot. */
    D.ground = moved / Math.max(dt, 1e-4);
  }

  /* Tension. On the line it is how much of the line has been taken up; off it
     (stage 5) it is how far past her bubble she has drifted, which is the same
     question asked without a rope. */
  function stepTension() {
    var d = Math.hypot(G.dog.x - G.man.x, G.dog.z - G.man.z);
    if (G.line > 0) G.tension = smooth(G.line * 0.86, G.line * 0.995, d);
    else            G.tension = smooth(G.bubble, G.bubble * 1.45, d);
    return d;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  THE REP — what the student is actually being marked on
  // ══════════════════════════════════════════════════════════════════════════

  /* ONE TAP. Not a switch — there is no matching "off", because a nick has no
     off for the handler to time. Holding the key down does nothing after the
     first press; keeping the pressure on means pressing again. */
  function nick() {
    if (!G || G.done) return;
    var last = G.lastTapT;
    G.lastTapT = G.t;
    G.stimUntil = G.t + TAP.pulse;
    /* The ear flick. This is the tell tab 04 teaches a student to look for, so
       it has to happen on the tab where the stimulations are. Which ear moves
       is the near one more often than not — the collar's receiver sits at 4:30,
       on that side. */
    G.earT = G.t;
    G.earWhich = Math.random() < 0.68 ? 1 : 0;
    paintStim();

    if (G.rep && G.rep.open) {
      var R = G.rep;
      R.taps.push({ t: G.t, tension: G.tension });
      if (G.tension > SLACK) R.lastTightTap = G.t;
      /* Taps stacked on top of each other are one long buzz wearing a nick's
         clothes. Counted, and said out loud at the end of the rep. */
      if (last != null && G.t - last < TAP.hammer) R.hammered++;

      // every tap is another prompt; she tries something once enough have landed
      G.dog.tapsSinceTry++;
      if (G.dog.state !== 'confused' && G.dog.state !== 'come') {
        G.dog.tapsNeeded = Math.max(1, Math.round(lerp(3.4, 1, G.under)));
        G.dog.tapsSinceTry = 1;
        setDogState('confused');
      }
      return;
    }

    /* A tap with no loaded line behind it at all. This is the one that does
       real damage, so it is marked the moment it happens rather than at the
       end of a rep that never existed. */
    G.falseP++;
    G.under = Math.max(0, G.under - 0.055);
    G.arousal = Math.min(1, G.arousal + 0.16);
    G.streak = 0;
    setMark('bad', 'Slack line');
    setCoach('bad',
      'The line was slack and you tapped anyway. She was already right, and that tap ' +
      'corrected her for it. Tap only while the line is loaded — that is the whole rule.');
    setDogState('brace');
  }

  function openRep() {
    G.rep = { open: true, at: G.t, taps: [], hammered: 0,
              lastTightTap: null, slackSince: null, answerAt: null };
  }

  /* What counts as an answer.

     NOT a slack line. That was the first version and it is wrong in a way that
     matters: the line also goes slack when the HANDLER walks toward the dog,
     or when she wanders sideways, and either would have credited the student
     with a rep the dog never gave them — the drill would have been marking its
     own movement. An answer is her orienting to you, which is the thing a
     handler is really watching for and the first piece of the behaviour to
     appear. Bracing points her away, so it can never read as an answer. */
  function offToMan() {
    var a = Math.atan2(G.man.x - G.dog.x, G.man.z - G.dog.z);
    return Math.abs(((a - G.dog.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  }
  function hasAnswered() {
    if (G.dog.state === 'come') return true;
    // ~35 degrees. Wandering is excluded: going somewhere that happens to be
    // toward you is not the same as coming to you.
    return G.dog.state !== 'wander' && offToMan() < 0.62;
  }

  /* She has answered: the head has come round to you, or she has taken a step
     in. Whichever comes first — a dog that turns toward you has answered even
     if her feet have not caught up yet. */

  /* The rep is over. Everything it is judged on comes out of the tap list. */
  function closeRep() {
    var R = G.rep;
    if (!R || !R.open) return;
    R.open = false;
    G.rep = null;
    G.reps++;

    var i, startLag = R.taps[0].t - R.at;
    /* Overrun: taps that landed once the line had already gone slack. Not "one
       fewer mark" — this is the fault the whole drill exists to catch, because
       each one lands on the dog at the instant she got it right. */
    var overrun = 0, maxGap = 0, prev = null;
    for (i = 0; i < R.taps.length; i++) {
      var tp = R.taps[i];
      if (tp.tension <= SLACK) overrun++;
      else {
        if (prev != null) maxGap = Math.max(maxGap, tp.t - prev);
        prev = tp.t;
      }
    }
    // the quiet spell between the last tight tap and the line letting go counts too
    if (prev != null && R.slackSince != null) maxGap = Math.max(maxGap, R.slackSince - prev);

    var onTime = startLag <= TAP.startGood;
    var kept   = maxGap <= TAP.gapGood;
    /* Taps stacked on top of each other are one long buzz wearing a nick's
       clothes, and they have to cost a mark rather than only a coaching line —
       eight taps in eight-tenths of a second was scoring Clean. */
    var hammering = R.hammered >= 3;

    var gain, kind, head;
    if (overrun === 0 && onTime && kept && !hammering)
                                              { gain = 0.082; kind = 'good'; head = 'Clean'; }
    else if (overrun === 0 && hammering)      { gain = 0.030; kind = 'near'; head = 'Too fast'; }
    /* The gap is tested BEFORE the slow-start branch. It used to sit after it,
       where it could never be reached: a rep that started on time and then went
       quiet for three seconds with the line still tight came back "Stopped on
       time", which is true and beside the point. */
    else if (overrun === 0 && !kept)          { gain = 0.030; kind = 'near'; head = 'Went quiet'; }
    else if (overrun === 0 && startLag <= TAP.startOk)
                                              { gain = 0.058; kind = 'good'; head = 'Stopped on time'; }
    else if (overrun === 0)                   { gain = 0.034; kind = 'near'; head = 'Slow to start'; }
    else if (overrun === 1)                   { gain = 0.026; kind = 'near'; head = 'One tap too many'; }
    else if (overrun === 2)                   { gain = 0.012; kind = 'near'; head = 'Two too many'; }
    else                                      { gain = 0.004; kind = 'bad';  head = 'Kept tapping'; }

    if (overrun >= 3) G.nagged++;
    /* Overrunning does not merely fail to teach — it costs her some of what she
       had. She let the line go and the tapping carried on anyway, so letting
       the line go is not what stops it. */
    if (overrun > 0) G.under = Math.max(0, G.under - 0.018 * Math.min(overrun, 4));
    G.under = clamp(G.under + gain, 0, 1);
    G.arousal = clamp(G.arousal + (overrun ? 0.055 : -0.035), 0.05, 1);
    G.overrunTotal += overrun;

    if (kind === 'good') { G.clean++; G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak); }
    else G.streak = 0;

    setMark(kind, head, R.taps.length);
    setCoach(kind, coachLine(head, startLag, overrun, maxGap, R.taps.length, R.hammered));
    checkStage();
  }

  function coachLine(head, startLag, overrun, maxGap, taps, hammered) {
    var s = n2(startLag), t = taps + (taps === 1 ? ' tap' : ' taps');
    if (head === 'Too fast' || (hammered >= 3 && overrun === 0)) {
      return t + ', but several of them on top of each other. That is not four pieces of ' +
             'information, it is one long buzz — leave her room between taps to actually answer one.';
    }
    if (head === 'Clean') {
      return t + '. First one ' + s + ' s after the line loaded, and you stopped the moment it ' +
             'went slack. That is the rep — the tapping ending IS the thing she is learning from.';
    }
    if (head === 'Stopped on time') {
      return 'You stopped on the slack, which is the half that matters. You were ' + s +
             ' s getting the first tap in though — start while the line is still loading.';
    }
    if (head === 'Went quiet') {
      return 'You stopped on the slack, but you went quiet for ' + n2(maxGap) + ' s in the middle ' +
             'with the line still tight. The pressure came off for nothing she did — same lesson as ' +
             'stopping too late, just delivered earlier. Keep the taps coming while it stays loaded.';
    }
    if (head === 'Slow to start') {
      return 'Stopped on time, but ' + s + ' s before the first tap. By then the tight line and the ' +
             'collar are two separate events to her.';
    }
    if (head === 'One tap too many') {
      return 'One tap after the line had already gone slack. She had just got it right, and that is ' +
             'exactly when it landed. Watch the line, not the dog — the moment it drops, your thumb stops.';
    }
    if (head === 'Two too many') {
      return 'Two taps past the slack. She is now getting the collar for coming to you, which is the ' +
             'opposite of what these reps are for.';
    }
    return overrun + ' taps after the line went slack. That is nagging: she gave you the answer, the ' +
           'tapping carried on, so the answer is not what stops it. This is how a dog learns to ' +
           'ignore the collar.';
  }

  function stepRep(dt, dist) {
    if (!G || G.done) return;

    // the line loading is what opens a rep
    if (!G.rep && G.tension >= LOADED) openRep();

    var R = G.rep;
    if (!R) return;

    /* The moment it lets go.

       Once a tap has been given, this LATCHES: the first slack ends the rep
       even if she loads the line straight back up. Without the latch a rep
       could run on for as long as she kept leaving and returning — the student
       got no mark for a minute at a time, and every overrun tap was folded
       into an episode that never closed. Before the first tap it is allowed to
       clear, because nothing has been asked yet and the line taking up and
       dropping again on its own is not a repetition of anything. */
    if (G.tension <= SLACK) { if (R.slackSince == null) R.slackSince = G.t; }
    else if (!R.taps.length) R.slackSince = null;

    if (R.answerAt == null && hasAnswered()) R.answerAt = G.t;

    // never tapped at all, and the line has been tight for a long time
    if (!R.taps.length && G.t - R.at > TAP.giveUp) {
      R.open = false; G.rep = null;
      G.missed++; G.streak = 0;
      G.under = Math.max(0, G.under - 0.018);
      setMark('bad', 'Never asked');
      setCoach('bad',
        'The line sat loaded for ' + TAP.giveUp.toFixed(0) + ' seconds and you never tapped. ' +
        'She has just had six seconds of practice at leaning into a tight line, which is the ' +
        'habit this drill exists to undo.');
      return;
    }

    // the line let go on its own before you asked — no rep, no fault
    if (!R.taps.length && R.slackSince != null && G.t - R.slackSince > 0.4) {
      R.open = false; G.rep = null;
      return;
    }

    /* The rep does NOT end the instant the line goes slack. It stays open for a
       settling window, because the taps that land in that window are the entire
       point of the exercise — close on the slack and every overrun tap would be
       counted against the NEXT rep, or against nothing at all. */
    if (R.taps.length && R.slackSince != null && G.t - R.slackSince > TAP.settle) {
      var lastTap = R.taps[R.taps.length - 1].t;
      if (G.t - lastTap > TAP.settle) closeRep();
    }
  }

  function checkStage() {
    var S = STAGES[G.stage];
    if (G.stage >= STAGES.length - 1) {
      if (G.under < S.need - 0.001) return;
      if (G.streak < (S.streakNeed || 4)) return;
      G.graduated = true; G.done = true;
      setCoach('good',
        'She is off the line and staying with you. The collar now means what the line used to mean, ' +
        'which is the whole object of collar conditioning — and you got there ' +
        (G.level <= 20 ? 'without once turning the level up.'
                       : 'though you spent some of it further up the dial than she needed.'));
      paintAll();
      return;
    }
    if (G.under < S.need) return;
    advance(G.stage + 1);
  }

  /* A stage change is a change of CONDITIONS, not a new session, so it mutates
     the run in place. Rebuilding it (which is what this did first) put both
     bodies back at the origin and zeroed the clock in the middle of a working
     session — the dog teleported to the handler's feet the instant the student
     earned the next stage, which reads as a bug and throws away the position
     they had just worked into. */
  function advance(ix) {
    G.stage = ix;
    var S = STAGES[ix];
    G.line = S.line;
    G.bubble = S.bubble || 0;
    G.turnCue = null;
    G.turnT = 0;
    if (S.distract) G.arousal = Math.min(1, G.arousal + 0.18);
    if (distractObj) distractObj.visible = !!S.distract;
    if (leash) leash.visible = S.line > 0;
    /* The stage brief is NOT written into the coaching line. Advancing happens
       at the end of a rep, so doing that wiped the mark the student had just
       earned before they could read it — and the brief is already on screen in
       the heading above. */
    EC.announce('Stage ' + S.id + '. ' + S.name + '. ' + S.brief);
    paintAll();
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  THE FRAME
  // ══════════════════════════════════════════════════════════════════════════

  var camPos = null, camAim = null, camWant = null, camAimW = null, camSide = 1;
  /* Broadside, not over the shoulder.

     The first cut of this put the camera behind the handler looking down the
     leash, which is the obvious game camera and the wrong one: the handler
     stands between you and the dog, and both of the things the drill is
     actually about — the SHAPE of the line, and the distance between the two
     bodies — are foreshortened into nothing. Watching from the side of the
     field shows the line broadside, so slack reads as a hanging curve and
     loaded reads as a straight one, and the gap between handler and dog is a
     real distance on screen rather than a guess about depth.

     Three-quarters rather than dead side-on (the -0.30 along the pair's own
     axis) keeps the dog's head-turn readable, since a dog turning to look at
     you is turning toward the camera. */
  var camFrozen = false;
  function stepCamera(dt) {
    if (camFrozen) return;          // a verification pass is holding the camera
    if (!camPos) {
      camPos = new THREE.Vector3(4.6, 2.6, 1.1);
      camAim = new THREE.Vector3(0, 0.7, 1.1);
      camWant = new THREE.Vector3(); camAimW = new THREE.Vector3();
    }
    var dx = G.dog.x - G.man.x, dz = G.dog.z - G.man.z;
    var d = Math.hypot(dx, dz) || 1;
    var ux = dx / d, uz = dz / d;
    var px = uz, pz = -ux;                       // perpendicular to the pair

    var mx = (G.man.x + G.dog.x) / 2, mz = (G.man.z + G.dog.z) / 2;
    /* Far enough out that both bodies stay inside a 40 degree lens with room to
       spare. A long lens is deliberate: it keeps the dog big enough to read at
       six metres, which a wide angle does not. */
    var out = 4.4 + d * 1.02;

    /* The perpendicular has two directions and they swap as the pair rotates.
       Taking whichever is nearer the camera's current side stops it cutting
       across the field every time the handler walks round her. */
    var s1 = (camPos.x - mx) * px + (camPos.z - mz) * pz;
    if (Math.abs(s1) > 0.35) camSide = s1 > 0 ? 1 : -1;

    camWant.set(mx + px * out * camSide - ux * out * 0.30,
                2.15 + d * 0.16,
                mz + pz * out * camSide - uz * out * 0.30);
    camAimW.set(mx, 0.66, mz);

    /* Chase, do not snap: the lag is what makes walking read as walking. A
       student who asked for less motion gets the snap instead — the drill is
       the movement, so what goes is the drift, not the dog. */
    var k = reduced() ? 1 : 1 - Math.pow(0.02, dt);
    camPos.lerp(camWant, k);
    camAim.lerp(camAimW, k);

    st.camera.position.copy(camPos);
    st.controls.target.copy(camAim);
    st.camera.lookAt(camAim);
  }
  function reduced() {
    return !!(window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  }

  function stepScene(dt) {
    // the dog, in metres, on the ground
    dogRoot.position.set(G.dog.x, -RIG.ground * M, G.dog.z);
    dogRoot.rotation.y = G.dog.yaw - Math.atan2(RIG.fwd[0], RIG.fwd[2]);

    // a body that bobs with the gait, and leans into a turn
    var bob = Math.sin(G.gait * Math.PI * 4) * 0.012 * clamp(G.dog.sp, 0, 2) * M;
    dogRoot.position.y += bob;

    poseLegs(G.gait, G.dog.ground || 0);
    poseSpine(G.dog.turnRate || 0, G.dog.ground || 0, dt);
    poseEars(dt);
    poseTail(G.t, G.arousal, G.dog.sp > 0.3);

    /* Her head goes where her attention is. When she is coming to you it comes
       round to you — and that turn of the head IS the answer the student is
       waiting to see, so it must be unmistakable. */
    var wantYaw = 0, wantDip = 0;
    if (G.dog.state === 'come' || G.dog.state === 'settle') {
      var hy = Math.atan2(G.man.x - G.dog.x, G.man.z - G.dog.z);
      wantYaw = clamp(((hy - G.dog.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI, -1.15, 1.15);
    } else if (G.dog.state === 'confused') {
      wantYaw = Math.sin(G.t * 6) * 0.5;
    } else if (G.dog.state === 'wander') {
      wantDip = 0.30;                    // nose down, reading the ground
    }
    /* The head leads. Nothing that moves turns its body first — the head goes
       to the corner and the shoulders follow it — so a slice of the turn rate
       is added here, ahead of the spine bend that trails it. Capped, or a hard
       direction change screws her neck round past what a neck does. */
    wantYaw += clamp((G.dog.turnRate || 0) * 0.26, -0.45, 0.45);

    G.headYaw = lerp(G.headYaw || 0, clamp(wantYaw, -1.25, 1.25),
                     1 - Math.pow(0.004, dt));
    G.headDip = lerp(G.headDip || 0, wantDip, 1 - Math.pow(0.02, dt));
    poseHead(G.headYaw, G.headDip);

    poseHandler(dt, !!G.man.moving);
    // a walking body rises and falls twice a cycle; standing still, it does not
    var mbob = Math.abs(Math.sin((G.manGait || 0) * Math.PI * 2)) * 0.016 * (G.manAmp || 0);
    handlerObj.position.set(G.man.x, mbob, G.man.z);
    handlerObj.rotation.y = G.man.yaw;

    if (leash && leash.visible) updateLeash(handMetres(), clipMetres(), G.tension, dt);
    else rope = null;                 // stage 5 takes the line off; forget its shape
  }

  var lastPaint = 0;
  function frame(dt) {
    if (!ready || !G) return;
    var s = Math.min(dt, 64) / 1000;
    G.t += s;

    if (!G.done) {
      /* The collar light, and the button, stay lit for one nick's worth of
         time after each tap. There is no twelve-second cut-out modelled here
         any more: that is the Constant button's safety feature (manual p.3),
         and this drill does not hold Constant. */
      var lit = G.t < (G.stimUntil || 0);
      if (lit !== G.stim) { G.stim = lit; paintStim(); }
      stepHandler(s);
      stepDog(s);
      var dist = stepTension();
      stepRep(s, dist);
      stepTurnCue(s);
    }
    stepScene(s);
    stepCamera(s);

    // the HUD is not a 60 Hz surface; 12 Hz is past the point anyone can tell
    if (G.t - lastPaint > 0.08) { lastPaint = G.t; paintLive(); }
  }

  /* Stage 2 onward asks for changes of direction, so it has to say when. The
     cue is a nudge, not a score: a handler who never changes direction simply
     never gets the line to load, which is its own lesson. */
  function stepTurnCue(dt) {
    var S = STAGES[G.stage];
    if (!S.turnEvery) { G.turnCue = null; return; }
    G.turnT += dt;
    if (G.turnT > S.turnEvery) {
      G.turnT = 0;
      G.turnCue = Math.random() < 0.5 ? 'left' : 'right';
      G.turnCueT = G.t;
    }
    if (G.turnCue && G.t - G.turnCueT > 2.6) G.turnCue = null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  THE PANEL
  // ══════════════════════════════════════════════════════════════════════════

  function setMark(kind, head, rel) {
    G.lastMark = { kind: kind, head: head, rel: rel };
  }
  function setCoach(kind, text) {
    G.coach = { kind: kind, text: text };
    if (ui.coach) paintCoach();
  }

  function btn(cls, label) {
    var b = el('button', cls, label);
    b.type = 'button';
    return b;
  }

  /* The transmitter, drawn to the unit in the student's hand: the rheostat at
     the top, the nick button on the face. Tab 02 is the authority on this
     layout — if the two ever disagree, tab 02 is right. */
  function buildTx() {
    var wrap = el('div', 'cd-tx');
    var s = sv('svg', { viewBox: '0 0 120 200', class: 'cd-tx-svg',
                        'aria-hidden': 'true', focusable: 'false' });
    s.appendChild(sv('rect', { x: 14, y: 8, width: 92, height: 184, rx: 16, class: 'tx-body' }));
    s.appendChild(sv('rect', { x: 52, y: 0, width: 8, height: 12, rx: 3, class: 'tx-ant' }));
    // rheostat
    s.appendChild(sv('circle', { cx: 60, cy: 52, r: 27, class: 'tx-dial' }));
    var mark = sv('line', { x1: 60, y1: 52, x2: 60, y2: 30, class: 'tx-mark' });
    s.appendChild(mark);
    var lvl = sv('text', { x: 60, y: 58, class: 'tx-lvl', 'text-anchor': 'middle' });
    lvl.textContent = '12';
    s.appendChild(lvl);
    // the nick button
    var nick = sv('rect', { x: 34, y: 100, width: 52, height: 34, rx: 9, class: 'tx-nick' });
    s.appendChild(nick);
    var nt = sv('text', { x: 60, y: 122, class: 'tx-nickt', 'text-anchor': 'middle' });
    nt.textContent = 'NICK';
    s.appendChild(nt);
    s.appendChild(sv('rect', { x: 34, y: 146, width: 52, height: 22, rx: 7, class: 'tx-pad' }));
    wrap.appendChild(s);
    ui.txLevel = lvl; ui.txMark = mark; ui.txNick = nick; ui.txSvg = s;

    var hit = el('button', 'cd-nick');
    hit.type = 'button';
    hit.setAttribute('aria-label',
      'Nick — one tap. Tap again for as long as the line is loaded.');
    hit.appendChild(el('span', 'cd-nick-k', 'SPACE'));
    hit.appendChild(el('span', 'cd-nick-l', 'Nick'));
    wrap.appendChild(hit);
    ui.nickBtn = hit;

    /* pointerdown only. A nick is a tap, so there is no "up" half to bind —
       and binding one would deliver a second stimulation on release. */
    hit.addEventListener('pointerdown', function (ev) { ev.preventDefault(); nick(); });
    /* A button fires click on Space and Enter, and the key path is already
       handled on the document. Without this the space bar would stimulate
       twice whenever this button happened to hold focus. */
    hit.addEventListener('click', function (ev) { ev.preventDefault(); });

    var lv = el('div', 'cd-lv');
    var minus = btn('cd-lvb', '−');
    var plus  = btn('cd-lvb', '+');
    minus.setAttribute('aria-label', 'Lower the level');
    plus.setAttribute('aria-label', 'Raise the level');
    var read = el('span', 'cd-lvn', '12');
    minus.addEventListener('click', function () { setLevel(G.level - 1); });
    plus.addEventListener('click', function () { setLevel(G.level + 1); });
    lv.appendChild(minus);
    lv.appendChild(read);
    lv.appendChild(plus);
    lv.appendChild(el('span', 'cd-lvt', 'level'));
    wrap.appendChild(lv);
    ui.lvRead = read;
    return wrap;
  }

  function setLevel(v) {
    if (!G) return;
    G.level = clamp(Math.round(v), 0, 100);
    paintLevel();
    /* The level is not what is being taught here and climbing it is the classic
       way to paper over bad timing, so the tab says so — once, at the point it
       happens, rather than as a rule nobody reads. */
    if (G.level > 26) {
      setCoach('bad', 'Level ' + G.level + ' on a dog that has not understood the question yet ' +
        'gets you a bigger reaction to the same confusion. If reps are failing, it is the ' +
        'release timing, not the dial — see tab 04.');
    }
  }

  function buildDOM(pane) {
    var root = el('div', 'cd');

    // ── left: the field ──
    var main = el('div', 'cd-main');
    var stageBox = el('div', 'cd-stage');
    main.appendChild(stageBox);
    ui.stageBox = stageBox;

    var bar = el('div', 'cd-bar');
    var tenWrap = el('div', 'cd-ten');
    tenWrap.appendChild(el('span', 'cd-ten-l', 'Line'));
    var track = el('div', 'cd-ten-tr');
    var fill = el('div', 'cd-ten-f');
    track.appendChild(fill);
    var loadMark = el('i', 'cd-ten-m');
    track.appendChild(loadMark);
    tenWrap.appendChild(track);
    var tenState = el('b', 'cd-ten-s', 'slack');
    tenWrap.appendChild(tenState);
    bar.appendChild(tenWrap);
    ui.tenFill = fill; ui.tenState = tenState; ui.tenWrap = tenWrap;

    var cue = el('p', 'cd-cue');
    bar.appendChild(cue);
    ui.cue = cue;
    main.appendChild(bar);

    var keysHint = el('div', 'cd-keys');
    [['W', 'in'], ['S', 'away'], ['A', 'left'], ['D', 'right'], ['SPACE', 'tap to nick']]
      .forEach(function (k) {
        var s = el('span', 'cd-key');
        s.appendChild(el('b', null, k[0]));
        s.appendChild(el('i', null, k[1]));
        keysHint.appendChild(s);
      });
    main.appendChild(keysHint);
    root.appendChild(main);

    // ── right: the drill ──
    var side = el('aside', 'cd-side');

    var head = el('div', 'cd-head');
    head.appendChild(el('p', 'cd-kicker', '05 · DRILL'));
    var h = el('h2', 'cd-h', 'Collar conditioning');
    head.appendChild(h);
    var sub = el('p', 'cd-sub', '');
    head.appendChild(sub);
    side.appendChild(head);
    ui.sub = sub;

    var stg = el('div', 'cd-stg');
    var stgName = el('b', 'cd-stg-n', '');
    var stgPips = el('span', 'cd-pips');
    stg.appendChild(stgName);
    stg.appendChild(stgPips);
    side.appendChild(stg);
    ui.stgName = stgName; ui.stgPips = stgPips;

    var learn = el('div', 'cd-learn');
    learn.appendChild(el('span', 'cd-learn-l', 'What she has worked out'));
    var lt = el('div', 'cd-learn-tr');
    var lf = el('div', 'cd-learn-f');
    lt.appendChild(lf);
    var need = el('i', 'cd-learn-need');
    lt.appendChild(need);
    learn.appendChild(lt);
    side.appendChild(learn);
    ui.learnFill = lf; ui.learnNeed = need;

    var mark = el('div', 'cd-mark');
    side.appendChild(mark);
    ui.mark = mark;

    var coach = el('p', 'cd-coach');
    side.appendChild(coach);
    ui.coach = coach;

    side.appendChild(buildTx());

    var tally = el('dl', 'cd-tally');
    [['reps', 'Reps'], ['clean', 'Clean'], ['streak', 'Best run'],
     ['falseP', 'Taps on a slack line'], ['overrun', 'Taps after the slack']]
      .forEach(function (t) {
        var dt = el('dt', null, t[1]);
        var dd = el('dd', null, '0');
        tally.appendChild(dt); tally.appendChild(dd);
        ui['t_' + t[0]] = dd;
      });
    side.appendChild(tally);

    var again = btn('cd-again', 'Start again');
    again.addEventListener('click', function () {
      newRun(0);
      if (distractObj) distractObj.visible = false;
      if (leash) leash.visible = true;
      G.dog.x = 0; G.dog.z = 2.4; G.man.x = 0; G.man.z = 0;
      paintAll();
      EC.announce('Started again at stage 1.');
    });
    side.appendChild(again);
    root.appendChild(side);

    /* APPEND — never clear the pane. The shell's contract is that the written
       reference lives in the pane for the whole life of the page and is only
       HIDDEN when a module claims it (claimIfOwned -> hideRef), so that a mesh
       that turns out to be unreadable can bring it straight back. Clearing the
       pane here destroyed it, and the recovery path in enter() would then have
       had nothing to fall back to — an empty tab under an error card, which is
       precisely what the shell is built to prevent. */
    pane.appendChild(root);
    ui.root = root;
    return stageBox;
  }

  // ── painting ────────────────────────────────────────────────────────────
  function paintStim() {
    if (!ui.txNick) return;
    var on = G && G.stim;
    ui.txNick.setAttribute('class', on ? 'tx-nick on' : 'tx-nick');
    if (ui.nickBtn) ui.nickBtn.classList.toggle('on', !!on);
    if (ui.root) ui.root.classList.toggle('stim', !!on);
  }
  function paintLevel() {
    if (!ui.lvRead) return;
    ui.lvRead.textContent = String(G.level);
    ui.txLevel.textContent = String(G.level);
    var a = (-135 + (G.level / 100) * 270) * Math.PI / 180;
    ui.txMark.setAttribute('x2', String(60 + Math.sin(a) * 22));
    ui.txMark.setAttribute('y2', String(52 - Math.cos(a) * 22));
  }
  function paintCoach() {
    if (!ui.coach || !G.coach) return;
    ui.coach.textContent = G.coach.text;
    ui.coach.setAttribute('class', 'cd-coach is-' + G.coach.kind);
  }
  function paintMark() {
    if (!ui.mark) return;
    clear(ui.mark);
    var m = G.lastMark;
    if (!m) {
      ui.mark.setAttribute('class', 'cd-mark is-idle');
      ui.mark.appendChild(el('b', null, 'No reps yet'));
      ui.mark.appendChild(el('span', null, 'Walk away until the line loads.'));
      return;
    }
    ui.mark.setAttribute('class', 'cd-mark is-' + m.kind);
    ui.mark.appendChild(el('b', null, m.head));
    ui.mark.appendChild(el('span', null,
      m.rel != null ? m.rel + (m.rel === 1 ? ' tap' : ' taps') : '—'));
  }
  function paintPips() {
    if (!ui.stgPips) return;
    clear(ui.stgPips);
    for (var i = 0; i < STAGES.length; i++) {
      var p = el('i', 'cd-pip' + (i < G.stage ? ' done' : (i === G.stage ? ' now' : '')));
      ui.stgPips.appendChild(p);
    }
  }
  function paintLive() {
    if (!ui.tenFill) return;
    var t = G.tension;
    ui.tenFill.style.width = Math.round(t * 100) + '%';
    var state = t >= LOADED ? 'loaded' : (t <= SLACK ? 'slack' : 'taking up');
    if (ui.tenState.textContent !== state) ui.tenState.textContent = state;
    ui.tenWrap.setAttribute('class', 'cd-ten is-' + state.replace(' ', '-'));

    ui.learnFill.style.width = Math.round(G.under * 100) + '%';

    ui.t_reps.textContent   = String(G.reps);
    ui.t_clean.textContent  = String(G.clean);
    ui.t_streak.textContent = String(G.bestStreak);
    ui.t_falseP.textContent = String(G.falseP);
    ui.t_overrun.textContent = String(G.overrunTotal);

    var cue = '';
    if (G.done) cue = G.graduated ? 'Finished — she is off the line and with you.' : '';
    else if (G.turnCue) cue = 'Change direction — go ' + G.turnCue;
    else if (G.tension >= LOADED) cue = 'Line loaded — keep tapping.';
    else if (G.rep && G.rep.taps.length) cue = 'Slack — stop tapping.';
    if (ui.cue.textContent !== cue) ui.cue.textContent = cue;
    ui.cue.setAttribute('class', 'cd-cue' + (G.stim ? ' is-on' : (cue ? ' is-live' : '')));
  }
  function paintAll() {
    if (!ui.stgName) return;
    var S = STAGES[G.stage];
    ui.stgName.textContent = 'Stage ' + S.id + ' · ' + S.name;
    ui.sub.textContent = S.brief;
    ui.learnNeed.style.left = Math.min(100, Math.round(S.need * 100)) + '%';
    paintPips(); paintMark(); paintCoach(); paintLevel(); paintStim(); paintLive();
  }

  // ── keys ────────────────────────────────────────────────────────────────
  function keyName(ev) {
    var k = ev.key;
    if (k === 'ArrowUp'    || k === 'w' || k === 'W' || k === 'z' || k === 'Z') return 'up';
    if (k === 'ArrowDown'  || k === 's' || k === 'S') return 'down';
    if (k === 'ArrowLeft'  || k === 'a' || k === 'A' || k === 'q' || k === 'Q') return 'left';
    if (k === 'ArrowRight' || k === 'd' || k === 'D') return 'right';
    return null;
  }
  function onKeyDown(ev) {
    if (EC.current() !== TAB || !ready) return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var n = keyName(ev);
    if (n) { keys[n] = true; ev.preventDefault(); return; }
    if (ev.key === ' ' || ev.key === 'Spacebar') {
      ev.preventDefault();
      /* ev.repeat is the key one. Holding space must NOT auto-fire: the
         keyboard's own repeat rate would tap for you at about fifteen a
         second, and the drill would be marking the operating system's timing
         rather than the student's. One press, one nick. */
      if (!ev.repeat) nick();
    }
  }
  function onKeyUp(ev) {
    if (EC.current() !== TAB) return;
    var n = keyName(ev);
    if (n) keys[n] = false;
  }
  /* Losing the window with the space bar held would leave the collar on for as
     long as the student was away, which is precisely the fault the drill marks
     hardest. Let go of everything. */
  function allOff() {
    keys = {};
  }

  // ── build ───────────────────────────────────────────────────────────────
  function mount(gltf, trainerGltf) {
    vecs();
    qTmp = new THREE.Quaternion();
    axSide = SIDEV.clone().normalize();
    axUp = new THREE.Vector3(0, 1, 0);

    var baked = bakeGeometry(gltf);
    buildWeights(baked.geom);
    skinned = buildSkeleton(baked.geom, baked.mat);

    dogRoot = new THREE.Group();
    dogRoot.scale.setScalar(M);
    dogRoot.add(skinned);
    /* The collar rides the body, not the head: at 0.49 up the neck it is well
       below HEAD_ZERO, so every vertex under it is weighted to the root bone
       and a static mesh in the same group tracks it exactly. */
    dogRoot.add(buildCollar());
    var sh = shadowDisc(0.60 / M);
    sh.position.y = RIG.ground + 0.004;
    dogRoot.add(sh);

    world = new THREE.Group();
    world.add(buildField());
    /* The generated handler if he arrived, the primitive one if he did not.
       A field with a blocky handler still teaches the drill; a field with no
       handler at all does not, and the line has to hang off something. */
    handlerObj = null;
    if (trainerGltf) {
      try { handlerObj = buildTrainer(trainerGltf); }
      catch (e) { lastErr = e; handlerObj = null; }
    }
    if (!handlerObj) handlerObj = buildHandlerPrimitive();
    world.add(handlerObj);
    distractObj = buildDistraction();
    distractObj.position.set(DISTRACT_AT.x, 0, DISTRACT_AT.z);
    distractObj.visible = false;
    world.add(distractObj);
    leash = buildLeash();
    world.add(leash);
    world.add(dogRoot);

    st.scene.add(world);
    st.scene.fog = new THREE.Fog(new THREE.Color(K.sky), 26, 74);
    st.scene.background = new THREE.Color(K.sky);
    relight();

    claimCamera();
    ready = true;
    upgradeGrass();
  }

  /* The shell lights a stage for ONE object held close: a hemisphere at 1.05
     and three directionals, which is a studio, and it exists because a nearly
     black receiver has to read at all. Pointed at a field it blows the grass
     out to pale sage and flattens the dog.

     Each stage owns its own scene (see app.js), so these lights are this tab's
     lights and nobody else's — retuning them here to one sun and a soft sky
     cannot reach tabs 01 to 04. */
  function relight() {
    var i = 0;
    st.scene.traverse(function (o) {
      if (!o.isLight) return;
      if (o.isHemisphereLight) { o.intensity = 0.62; return; }
      if (o.isDirectionalLight) {
        i++;
        if (i === 1) { o.intensity = 0.92; o.position.set(5, 7.5, 3); }
        else if (i === 2) o.intensity = 0.16;   // fill, almost off
        else o.intensity = 0.10;                // rim, a suggestion
      }
    });
  }

  /* Take the camera off the trackball. The shell's limits are built for a
     turntable a metre from a collar; a field camera lives outside every one of
     them, and OrbitControls.update() — which base tick calls every frame —
     silently clamps to them. Opening them up is what makes writing the camera
     position each frame stick. */
  function claimCamera() {
    st.spin = false;
    st.ease = null;
    st.controls.enabled = false;
    st.controls.minDistance = 0.01;
    st.controls.maxDistance = 400;
    st.controls.minPolarAngle = 0;
    st.controls.maxPolarAngle = Math.PI;
    st.camera.near = 0.12;
    st.camera.far = 260;
    st.camera.fov = 52;
    st.camera.updateProjectionMatrix();
    /* This tab sets no hotspots, so the stage's own hotspot pass never runs and
       the overlay layer would stay hidden — same fix tab 04 needs. */
    st.el.classList.remove('st-unlaid');
    /* The stage ships with a "Reset view" button and a "drag to turn" hint,
       both of which are true of a turntable and lies here: this camera is not
       yours to turn, and there is no view to reset. Marked on the host so the
       stylesheet can take them off without app.js having to know that a tab
       exists which does not want them. */
    st.el.classList.add('st-drive');
  }

  function hookTick() {
    var base = st.tick;
    st.tick = function (dt) {
      try {
        frame(dt);
      } catch (e) {
        lastErr = e;                 // recorded, never thrown at the student
      }
      base.call(st, dt);
    };
  }

  function readColours() {
    K.grass     = cssVar('--cd-grass', '#6E8C4A');
    K.grassTint = cssVar('--cd-grass-tint', '#6F7F63');
    K.grassAlt  = cssVar('--cd-grass-2', '#66854399');
    K.grassDark = cssVar('--cd-grass-d', '#4E6A35');
    K.grassLite = cssVar('--cd-grass-l', '#87A05E');
    K.sky       = cssVar('--cd-sky', '#C8D6E2');
    K.coat      = cssVar('--cd-coat', '#2A2F36');
    K.trouser   = cssVar('--cd-trouser', '#3A4048');
    K.skin      = cssVar('--cd-skin', '#B08968');
    K.leash     = cssVar('--cd-leash', '#3A2E26');
    K.distract  = cssVar('--cd-distract', '#B4552E');
    K.shadow    = cssVar('--cd-shadow', 'rgba(30,36,26,0.55)');
    K.shadowOut = cssVar('--cd-shadow-out', 'rgba(30,36,26,0)');
  }

  /* The shell hid the reference when it handed this tab over. If the field
     cannot be built there is nothing else to show, so put it back. */
  function showRefBack() {
    var pane = EC.pane(TAB);
    var r = pane && pane.querySelector('.ref');
    if (r) r.removeAttribute('hidden');
  }

  // ── enter / leave ───────────────────────────────────────────────────────
  function enter() {
    var pane = EC.pane(TAB);
    if (!pane || dead) return;

    if (!built) {
      st = EC.stage(TAB);
      if (!st) return;                       // no WebGL — the shell owns the pane
      readColours();
      newRun(0);
      var box = buildDOM(pane);
      box.appendChild(st.el);
      built = true;
      paintAll();
      hookTick();
    }
    st.activate();
    claimCamera();
    st.resize();

    if (!asked) {
      asked = true;
      /* The dog is required; the handler is not. A trainer.glb that will not
         load resolves to null and the primitive handler stands in, rather than
         taking the whole tab down with it. */
      Promise.all([
        EC.mesh('dog'),
        EC.mesh('trainer')['catch'](function (e) { lastErr = e; return null; })
      ]).then(function (both) {
        var gltf = both[0], trainerGltf = both[1];
        try {
          mount(gltf, trainerGltf);
          st.resize();
          paintAll();
        } catch (e) {
          lastErr = e;
          dead = true;
          if (ui.root && ui.root.parentNode) ui.root.parentNode.removeChild(ui.root);
          EC.notice(TAB, 'The field could not be built on this machine. ' +
                         'Everything the drill teaches is written out here.');
          showRefBack();
        }
      })['catch'](function (e) {
        lastErr = e;
        dead = true;
        if (ui.root && ui.root.parentNode) ui.root.parentNode.removeChild(ui.root);
        EC.notice(TAB, 'The dog model could not be loaded. ' +
                       'Everything the drill teaches is written out here.');
        showRefBack();
      });
    }
  }

  function leave() {
    allOff();
    if (st) st.deactivate();
  }

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
  window.addEventListener('blur', allOff, false);

  EC.onEnter(TAB, enter);
  EC.onLeave(TAB, leave);

  /* A verification hook, not an API. Nothing in the tab reads this. */
  window.__ecCondition = {
    build: 'condition-r1',
    state: function () { return G; },
    err: function () { return lastErr && (lastErr.message || String(lastErr)); },
    ready: function () { return ready; },
    bones: function () { return bones ? bones.length : 0; },
    /* Drive the sim from a test without a keyboard: seconds of simulated time,
       stepped at a fixed 60 Hz so a result does not depend on frame rate. */
    run: function (secs, fn) {
      var n = Math.round(secs * 60);
      for (var i = 0; i < n; i++) { if (fn) fn(G, i); frame(16.667); }
      return G;
    },
    nick: nick,
    /* Kept under their old names so an existing verification pass still runs:
       a "press" is now one tap, and there is nothing to release. */
    press: nick, release: function () {},
    key: function (k, on) { keys[k] = !!on; },

    /* Step the REAL frame — sim and render together — without waiting for a
       requestAnimationFrame that a hidden pane never delivers. Everything the
       drill does is driven from st.tick, so this is the same code path the tab
       runs, not a parallel one written for the test. */
    step: function (n, dtms) {
      for (var i = 0; i < (n || 1); i++) st.tick(dtms || 16.667);
    },
    /* Park the camera close to the dog so the rig can be judged at all. At the
       drill's own framing she is forty pixels tall, which is right for reading
       a leash and useless for reading a leg. */
    close: function (on, dist, high, atMan) {
      camFrozen = !!on;
      if (!on) return;
      var d = dist || 2.6, h = high || 0.85;
      var tx = atMan ? G.man.x : G.dog.x, tz = atMan ? G.man.z : G.dog.z;
      var ty = atMan ? 0.95 : 0.42;
      st.camera.position.set(tx + d * 0.86, h, tz + d * 0.5);
      st.camera.lookAt(tx, ty, tz);
      st.controls.target.set(tx, ty, tz);
    },
    /* Where the line's two ends actually are, in the world and on the screen.
       "The leash looks like it joins her at the wrong end" is not answerable
       from a screenshot — the dog's own body occludes half the line — so it
       gets answered with numbers instead. */
    probe: function () {
      function scr(v) {
        var p = v.clone().project(st.camera);
        return [Math.round(p.x * 1000) / 1000, Math.round(p.y * 1000) / 1000];
      }
      function w(f, s, y) {
        dogRoot.updateMatrixWorld(true);
        return at(f, s, y).applyMatrix4(dogRoot.matrixWorld);
      }
      var nose = w(0.470, -0.050, 0.030);
      var tail = w(-0.500, 0.110, -0.150);
      var clip = clipMetres().clone();
      var hand = handMetres().clone();
      function r3(v) { return [Math.round(v.x * 100) / 100, Math.round(v.y * 100) / 100, Math.round(v.z * 100) / 100]; }
      return {
        nose: r3(nose), tail: r3(tail), clip: r3(clip), hand: r3(hand),
        noseScr: scr(nose), tailScr: scr(tail), clipScr: scr(clip), handScr: scr(hand),
        clipToNose: Math.round(clip.distanceTo(nose) * 100) / 100,
        clipToTail: Math.round(clip.distanceTo(tail) * 100) / 100,
        handToClip: Math.round(hand.distanceTo(clip) * 100) / 100,
        line: G.line
      };
    },
    /* Read the canvas back in the SAME task as the draw above it: the drawing
       buffer is not preserved, and a read one task later comes back blank. */
    shot: function (name) {
      st.tick(16.667);
      var cv = st.el.querySelector('canvas');
      var url = cv.toDataURL('image/png');
      return fetch('/shot/' + (name || 'x'), { method: 'POST', body: url })
        .then(function (r) { return r.text(); });
    }
  };

})();
