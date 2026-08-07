/* ============================================================================
   TAB 3 · FIT THE COLLAR — Highland Canine Training
   Owner of this file: FIT. Nothing else in the app may write here.

   Nomenclature teaches what the parts are called. This teaches the thing that
   actually fails on a wet field: a collar that is ON the dog and not WORKING.
   Four decisions, each with a real failure behind it —

     height    low on the neck the strap rides onto the shoulder, the points
               come off skin, and the dog "stops responding"
     position  on the windpipe it presses the trachea; on the crest the points
               cannot reach skin through muscle and ruff, and the box rolls
     tension   loose and the collar turns; tight and you get pressure sores
     the coat  if the coat between the points and the skin is deeper than the
               points are long, they never touch skin at all, so the dog feels
               nothing at ANY level — and the handler's instinct is to climb
               the dial on a dog that physically cannot feel it. This is the
               one students skip, and it is the one that matters most.

   ── WHOSE INSTRUCTION IS WHOSE ─────────────────────────────────────────────
   Corrected this round. The previous version printed doctrine as if Dogtra
   had written it, and invented a part Dogtra does not ship. What the 1900X
   manual actually says:

     p.27  the contact points press firmly against the dog's SKIN;
           you should be able to fit TWO FINGERS underneath the collar strap;
           the best location is ON EITHER SIDE OF THE DOG'S WINDPIPE;
           reposition every few hours and remove after 8 hours of use.
     p.43  "My dog is not reacting" — "The contact points may be too short for
           your dog's thick or long coat. You might need to trim down the hair
           on the dog's neck, so both contact points are touching the skin."

   That p.43 line is the whole of Dogtra's answer to a thick coat, and it is
   what decision 4 now drills. There is NO longer contact point in the 1900X
   box list (p.6 — receiver, strap, transmitter, splitter cable, quick start
   guide, belt clip, antenna hinge, antenna, non-stimulation contacts, test
   light, lanyard) and the manual never mentions post lengths anywhere. A
   longer pair is still offered as an option in the drill, because the points
   do unscrew and students will be told about them — but it is marked as a
   part the student may not own, and never as manufacturer instruction.

   The manual gives NO height on the neck. Decision 1 is Highland Canine's
   doctrine and every screen that carries it says so.

   ── THE NECK FRAME IS MEASURED, NOT GUESSED ────────────────────────────────
   Lifted verbatim from the previous build (~/Desktop/E-COLLAR-3D/fitting.js),
   where it was obtained by raycasting dog.glb: a centreline from the base of
   the neck to just behind the ears, plus a radial profile at 7 heights x 32
   angles giving the true OVAL section. The strap wraps the neck because of
   those numbers; without them it passes straight through. They are valid only
   for this dog.glb — it is the same file, so they transfer. Re-published as
   window.CollarKit so there is one copy in the app, not two.

   ── HOW THE STRAP SITS, AND WHY IT CHANGED ─────────────────────────────────
   The strap used to be a loop concentric with the neck, pushed out everywhere
   by the slack. That put the receiver — and the points welded into it — up to
   12.5% of the local neck radius clear of the coat on a fit the app had just
   marked 4 of 4, while the marking card printed "they reach through to skin".
   The picture called the score a liar.

   A real collar does not float. The housing is the heavy, stiff part: the loop
   rolls onto it, so the strap is DOWN ON THE NECK under the receiver and the
   slack shows on the far side. That is modelled here as a smooth press profile
   centred on the receiver's clock angle, and it is why panel A of the section
   draws the strap pressed flat with no gap while the ring above it shows the
   two-finger gap on the opposite side. Both pictures are now true at once, and
   the points seat on the coat rather than hovering over it.

   Nothing is ever drawn INSIDE the mesh. The raycast profile is the coat
   surface, so a strap at radius minus anything is simply invisible — which is
   how a quarter of the tension slider used to render a bare neck under a card
   that said "you are compressing the neck". Compression is now shown, not
   hidden: the loop goes flush all round, a translucent pressure band appears
   along the strap, and the section draws the coat crushed under it.

   ── WHERE THE NECK ACTUALLY IS, MEASURED RATHER THAN EYEBALLED ─────────────
   Fourth round of one defect. The previous three each looked at a picture and
   typed a number. The band they left behind — 'ok' = [0.66, 0.76] — FAILED a
   correct collar and PASSED one slung round the dog's jaw, and 0.72 shipped as
   this module's own 4-of-4 answer.

   Everything below was raycast off dog.glb in the running app, by slicing the
   mesh with the same ring planes the collar is built on (plane through
   centreAt(s), normal NECK.u) and taking the outermost crossing at each of 180
   angles. That reproduces NECK.prof to 5e-5 at all seven published rows, so it
   is the same measurement that produced this frame and the numbers compare.

   WHAT DOES *NOT* MARK THE END OF THE NECK — and cost three rounds:

     ECCENTRICITY rises smoothly and monotonically, 1.47 at s=0.24 to 2.43 at
     s=0.72, with no step anywhere. Nearly all of that is OBLIQUITY, not
     anatomy: every ring here is perpendicular to one fixed NECK.u while the
     neck bends forward, so the higher the ring the more slanted the cut and the
     more stretched the section. s=0.55 measures 2.17 and is a good collar. A
     band bracketed on this number is bracketed on nothing — which is how
     NECK_OVAL = 2.40 came to be "1.5x the neck's own maximum": a multiple of a
     number that was never a threshold.

     SECTION AREA falls monotonically to s=0.94, so there is no waist in it.
     GEODESIC DISTANCE FROM THE NOSE routes under the chin — short at the
     throat, long over the skull — so its isocontours are not collar lines, and
     its one clear minimum is the EARS leaving the contour, not a waist.
     ANYTHING MEASURED AGAINST THE PUBLISHED CENTRELINE is circular: the top of
     that centreline is the thing under suspicion.

   WHAT DOES. Two independent signals off the mesh, knee in the same place:

     CONCENTRICITY  |centroid(section) - centreAt(s)| / minRadius(section).
                    A collar is concentric with the neck it encircles. This sits
                    at 0.20 through the mid neck, crosses 0.5 at s = 0.55, and
                    reaches 0.72 at s = 0.72 — the ring's centre is by then
                    three quarters of the way out to the section wall. The loop
                    has stopped encircling the neck and started being slung
                    across it.

     OBLIQUITY      angle between NECK.u and the local tube axis, taken as the
                    smallest-eigenvalue eigenvector of the outward surface
                    normals round the ring. Flat at 9-11 deg from s = 0.32 to
                    0.62 — the ring really is a cross-section there. Then 13.4
                    at 0.66, 20.3 at 0.72, 27.4 at 0.80: no longer cutting a
                    tube, slicing across the head.

     THE SHOULDER, at the other end: the mean axial tilt of the ring's surface
     normals is ~0 (a true tube) at s = 0.17-0.19 and climbs steeply below
     s = 0.14 — 0.09 at 0.12, 0.17 at 0.10, 0.32 at 0.00 — while the fraction of
     the ring on tube-like surface collapses from 0.80 to 0.32. That is the flare.

   So the neck runs s = 0.14 to 0.58, and "high on the neck, behind the ears" is
   the upper part of it: 'ok' = [0.42, 0.56].

   AND THE PICTURES AGREE — lateral camera, eye along NECK.eSide, clock 140,
   tension 53:
       height 34   a collar, correct, but LOW: housing down at the neck base
       height 42   on the neck, housing on the lower side            correct
       height 49   textbook: high on the neck, snug behind the jaw   correct
       height 56   the same a shade higher, neck still clear below   correct
       height 64   the strap flares off the neck and tears across the throat
   The old band's own midpoint, 0.72, puts the strap across the cheek and the
   housing under the mandible with the neck bare below. That was the default.

   ── AND A GUARD, SO THIS CANNOT BE SHIPPED A FOURTH TIME ───────────────────
   pictureCheck() runs before the marking card is built. Strap, housing and both
   contact points must each be in the rig, visible, and geometrically real, and
   the section under them must still be a neck. If any of that fails the card
   refuses to mark at all — it says the picture and the score disagree, and no
   run of it can print "Fitted correctly" over a dog that is not wearing this
   collar. It is a hundred numbers on a button press, not per frame.

   ── WHY THE SECTION IS DRAWN FROM THE SAME NUMBERS ─────────────────────────
   The section panel is not an illustration sitting next to the model. Its
   outline IS radiusAt() at the height the student has chosen, so the neck
   visibly thickens as the strap slides toward the shoulder and thins as it
   goes up behind the ears — which is the whole argument for decision 1, made
   in one picture instead of a paragraph. Skin is that outline shrunk by the
   coat's depth, because the mesh surface a ray hits is the top of the coat,
   not the dog. All four decisions now carry a mark in it: the zone band and
   the housing for position, the strap ring and its two-finger measure for
   tension, the outline itself for height, and panel A at true scale for the
   coat. Everything in panel A is at one honest scale.
   ========================================================================== */
(function () {
'use strict';

var EC = window.EC;
if (!EC) return;
var TAB = 'fit';

/* ── measured neck frame ────────────────────────────────────────────────────
   u     : neck axis, head-ward
   eTop  : the neck's dorsal direction = 12 o'clock
   eSide : 3 o'clock. Angle is measured from eTop toward eSide, so 180 deg is
           the underside of the neck — the windpipe.                          */
var NECK = {
  u:     [0.04994, 0.74222, 0.66830],
  eTop:  [0, 0.66913, -0.74314],
  eSide: [0.99875, -0.03711, -0.03341],
  base:  [-0.163, 0.10, 0.22],     // low, at the shoulder
  top:   [-0.170, 0.28, 0.31],     // high, just behind the ears
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

/* ── the scenario: one dog, three coats ────────────────────────────────────
   The same animal every time. It is the COAT that changes, which is exactly
   how it happens — the dog you fitted in August is the dog you fit in January
   with the same collar out of the same bag. Depths are in model units, matched
   to the measured neck radius so the section is at one honest scale.

   `part` is what is LEFT of that depth after you have separated the hair under
   each point with your fingers. A blown summer coat parts and stays parted; a
   January undercoat barely moves and closes back over before the dog has left
   the yard, which is why parting is not the answer to a winter ruff.

   `phrase` is the form that goes inside a sentence. Lower-casing `name` gave
   "Left as it lies on a just clipped." — the marking card is the most-read
   text in the tab and it was ungrammatical on a third of the runs.          */
var COATS = [
  { id: 'clipped', name: 'Just clipped', phrase: 'just-clipped coat',
    when: 'Back from the groomer',
    note: 'You can see skin through it. Nothing between the points and the dog.',
    depth: 0.003, part: 1.00 },
  { id: 'summer',  name: 'Summer coat', phrase: 'summer coat',
    when: 'Mid-August',
    note: 'The undercoat has blown. What is left is short and lies flat.',
    depth: 0.007, part: 0.42 },
  { id: 'winter',  name: 'Winter coat', phrase: 'winter coat',
    when: 'January',
    note: 'Dense undercoat right through, and a heavy ruff over the neck.',
    depth: 0.015, part: 0.87 }
];

/* ── decision 4: what you do about the coat ────────────────────────────────
   NOT "which post length did they give you". Dogtra ships one pair of contact
   points with a 1900X and never mentions any other length; its own remedy for
   a coat the points cannot get through is p.43 — trim the hair down. The
   longer pair stays on the list because the points unscrew and students hear
   about aftermarket ones, but it is marked as a part they may not own and it
   does not score a pass.                                                    */
var POST_STD  = 0.011;
var POST_LONG = 0.018;

var GROOM = [
  { id: 'asis', name: 'Leave the coat',
    note: 'Buckle it up over the coat as it lies. Right whenever the coat is short enough for the points to reach skin on their own.',
    src: '' },
  { id: 'part', name: 'Part the coat',
    note: 'Separate the hair under each point with your fingers before you buckle up. Costs nothing, and it is the check you should be doing on every dog anyway.',
    src: 'Highland Canine' },
  { id: 'clip', name: 'Clip the neck',
    note: 'Take the hair down at the two contact spots. Dogtra p.43: trim down the hair on the dog’s neck so both contact points are touching the skin.',
    src: 'Manual p.43' },
  { id: 'longp', name: 'Longer points',
    note: 'The points unscrew, so a longer pair closes the gap. But no longer pair is in the 1900X box (p.6) and the manual never mentions post lengths — this is a part you may not own.',
    src: 'Not in the box' }
];

/* Tension slider t (0..1) -> the gap between strap and coat on the far side of
   the neck, in model units. The two-finger target is deliberately a BAND, not
   a point: a correct fit is a range, and marking it as a single value would be
   marking the slider rather than the fit. */
function slackAt(t) { return 0.026 - t * 0.034; }
var SNUG = [0.004, 0.012];

/* Zones round the neck, in degrees from 12 o'clock toward 3 o'clock. */
var Z_OK   = [[115, 160], [200, 245]];    // beside the windpipe — manual p.27
var Z_PIPE = [160, 200];                  // on the trachea
var Z_CREST= [[300, 360], [0, 60]];       // on top of the neck

// ── state ───────────────────────────────────────────────────────────────────
/* The drill opens with all four decisions wrong, so the student has something
   to fix. height 0.28 used to be a 'low' fail; with the measured band it is
   'mid' — a near-miss, which is a weaker start. 0.12 is below the shoulder
   flare (see the header), so it opens as the honest "down on the shoulder". */
var set  = { height: 0.12, clock: 0, tension: 0.18, groom: 'asis' };
var coat = COATS[2];              // January, and doing nothing about it is wrong
var host = null, rail = null, stage = null;
var rig = null, strapMesh = null, boxMesh = null, postMeshes = [], pressMesh = null;
var housing = null, built = false, starting = false;
var ui = {}, SEC = null, verdictOn = false, touched = false;

// ── vectors ─────────────────────────────────────────────────────────────────
function V(a) { return new THREE.Vector3(a[0], a[1], a[2]); }
var U, ETOP, ESIDE, BASE, TOP;
function vecs() {
  if (U) return;
  U = V(NECK.u); ETOP = V(NECK.eTop); ESIDE = V(NECK.eSide);
  BASE = V(NECK.base); TOP = V(NECK.top);
}

// ── neck maths ──────────────────────────────────────────────────────────────
function centreAt(s) { vecs(); return BASE.clone().lerp(TOP, s); }

/* Bilinear read of the measured profile: along the neck, and around it. */
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
  vecs();
  return ETOP.clone().multiplyScalar(Math.cos(ang))
         .add(ESIDE.clone().multiplyScalar(Math.sin(ang)));
}

/* ── HOW FAR THE STRAP STANDS OFF THE COAT, AT EVERY ANGLE ──────────────────
   Three things happen at once and all three are visible:

   1. PRESS. The receiver is the heavy, stiff part of the collar. The loop
      rolls onto it, so under the housing the strap is down on the coat and the
      points can reach through. `pressAt` is a smooth cosine hump centred on
      the receiver's clock angle. This is the fix for a strap that used to
      stand 12.5% of the neck radius proud on a 4-of-4 fit.
   2. SLACK. Away from the housing, the loop is as big as you left it. That is
      where the two fingers go, and it is what the ring in the section
      measures.
   3. GRAVITY. A slack loop drops: it lies closer to the crest and hangs clear
      under the throat. That is why a loose collar turns.

   The floor of 0.0006 is not slop — the raycast profile IS the coat surface,
   so anything at radius or below is inside the mesh and simply invisible.   */
var PRESS_W = 1.30;                        // radians; the housing's grip, +/-74 deg
function angDiff(a, b) {
  var d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}
function pressAt(ang, aRx) {
  var d = angDiff(ang, aRx);
  if (d >= PRESS_W) return 0;
  return 0.5 * (1 + Math.cos(Math.PI * d / PRESS_W));
}
function strapOff(ang, slack, aRx) {
  var s = Math.max(slack, 0);
  var loose = s * (1 - 0.5 * Math.cos(ang));
  return 0.0006 + loose * (1 - pressAt(ang, aRx));
}
/* How far past snug the strap has been pulled. Zero until the two fingers stop
   going under; this is what the pressure band and the crushed coat are drawn
   from, because a neck cannot be dented in a mesh we do not own. */
function squeezeAt(slack) { return Math.max(0, SNUG[0] - slack); }

function strapFace(s, ang, slack, aRx) {
  return radiusAt(s, ang) + strapOff(ang, slack, aRx == null ? ang : aRx);
}
function strapPoint(s, ang, extra) {
  return centreAt(s).add(dirAt(ang).multiplyScalar(radiusAt(s, ang) + extra));
}

function deg() {
  var d = (set.clock / (Math.PI * 2)) * 360;
  return ((d % 360) + 360) % 360;
}
function inBands(d, bands) {
  for (var i = 0; i < bands.length; i++) {
    if (d >= bands[i][0] && d <= bands[i][1]) return true;
  }
  return false;
}
function clockLabel(ang) {
  var h = (ang / (Math.PI * 2)) * 12;
  h = ((h % 12) + 12) % 12;
  var hh = Math.round(h * 2) / 2;
  var n = hh === 0 ? 12 : hh;
  return (n === Math.floor(n) ? n : Math.floor(n) + '½') + " o'clock";
}
function groomNow() {
  for (var i = 0; i < GROOM.length; i++) if (GROOM[i].id === set.groom) return GROOM[i];
  return GROOM[0];
}
/* The coat that is actually left between the point and the skin. */
function effDepth() {
  var g = set.groom;
  if (g === 'clip') return Math.min(coat.depth, 0.0025);   // clippers leave stubble
  if (g === 'part') return coat.depth * coat.part;
  return coat.depth;
}
function postLen() { return set.groom === 'longp' ? POST_LONG : POST_STD; }
function reaches()  { return postLen() >= effDepth(); }

/* ── verdicts, one place ──────────────────────────────────────────────────
   Read by the marking card AND by the live section, so the picture and the
   score can never disagree with each other. 'ok' | 'near' | 'no'.          */
/* ── THE HEIGHT BAND IS MEASURED, NOT CHOSEN ───────────────────────────────
   See the header for the four measurements and the five pictures. In short:
   concentricity crosses 0.5 at s = 0.55, obliquity leaves its 9-11 deg plateau
   at s = 0.62, the shoulder flare takes over below s = 0.14. The neck is
   between them, and "high on the neck" is the top of that span.

   Do not widen this without redoing the measurement. [0.66, 0.76] is what an
   eyeballed band looked like: it failed a correct fit at 0.55 and passed a
   collar hung round the dog's jaw at 0.72.                                  */
var H_OK      = [0.42, 0.56];
var H_MID     = 0.18;      // under this the strap is on the shoulder, not the neck

/* The eccentricity of the section at the measured head boundary, s = 0.62,
   read off the app's own radiusAt so the guard and the drill share one profile.
   It is NOT a multiple of anything. The previous 2.40 was 1.5x the neck's own
   maximum, picked so the then-current default of 0.72 would survive inside it —
   which is a threshold ratifying the bug it was added to catch.

   Read the note at pictureCheck() before you change this.                   */
var NECK_OVAL = 2.19;

/* Where the words "round the jaw" become TRUE, which is not where NECK_OVAL is.
   NECK_OVAL is the scoring boundary. This is a claim about the picture, and a
   verifier proved the two are not the same point: centreAt() is linear, so the
   strap moves a constant 1% of neck length per slider step, and heights 61 and
   62 are photographically the same picture — only sectionOval crossing 2.19 by
   0.37% differed. By eye the strap first bites the mandible at about 0.66 and is
   unambiguously through the jaw by 0.72. So the sentence changes at 0.66.
   Scoring is unaffected: everything above the pass band already fails. */
var JAW_H = 0.66;

/* How far the section at this height is from a round one. A neck is an oval;
   a jaw sliced across the axis of the neck is not. */
function sectionOval(s) {
  var mx = 0, mn = 1e9, i, r;
  for (i = 0; i < 32; i++) {
    r = radiusAt(s, (i / 32) * Math.PI * 2);
    if (r > mx) mx = r;
    if (r < mn) mn = r;
  }
  return mn > 1e-6 ? mx / mn : 1e9;
}

/* Four states, because the two ends fail for opposite reasons and a student
   who is told only "not high enough" will keep going up. */
function hBand() {
  if (set.height > H_OK[1]) return 'high';
  if (set.height >= H_OK[0]) return 'ok';
  return set.height >= H_MID ? 'mid' : 'low';
}
function vHeight() {
  var b = hBand();
  return b === 'ok' ? 'ok' : b === 'mid' ? 'near' : 'no';
}
function vClock() {
  var d = deg();
  if (inBands(d, Z_OK)) return 'ok';
  if (d > Z_PIPE[0] && d < Z_PIPE[1]) return 'no';
  if (inBands(d, Z_CREST)) return 'no';
  return 'near';
}
function vTension() {
  var s = slackAt(set.tension);
  return s >= SNUG[0] && s <= SNUG[1] ? 'ok' : 'no';
}
function vCoat() {
  if (!reaches()) return 'no';
  if (set.groom === 'longp') return 'near';           // works; not a part you own
  if (set.groom === 'clip' && coat.depth <= POST_STD) return 'near';  // clipped for nothing
  return 'ok';
}

// ═══════════════════════════════════════════════════════════════════════════
//  3D
// ═══════════════════════════════════════════════════════════════════════════

/* Colours here are LINEAR. The renderer converts to sRGB on output and the
   scene is lit hard so the dog reads properly, so a nominal 0x101010 comes out
   near mid-grey — which made black biothane look like grey plastic. These are
   set far darker than the colour you want to see. */
var MAT = null;
function mats() {
  if (MAT) return MAT;
  MAT = {
    strap: new THREE.MeshStandardMaterial({ color: 0x040404, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide }),
    box:   new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.5, metalness: 0.1 }),
    post:  new THREE.MeshStandardMaterial({ color: 0xb9bcc0, roughness: 0.32, metalness: 0.85 })
  };
  return MAT;
}
/* The pressure band is an ANNOTATION, not a material the collar is made of,
   so it is unlit and its colour is the same --no the marking card uses. House
   rule: a colour is written down once, in the stylesheet. */
var PRESS_MAT = null;
function pressMat() {
  if (PRESS_MAT) return PRESS_MAT;
  var hex = '';
  if (host) hex = getComputedStyle(host).getPropertyValue('--no').trim();
  var c = new THREE.Color(hex || '#AE2A20');
  if (c.convertSRGBToLinear) c.convertSRGBToLinear();
  PRESS_MAT = new THREE.MeshBasicMaterial({
    color: c, transparent: true, opacity: 0, depthWrite: false,
    side: THREE.DoubleSide
  });
  return PRESS_MAT;
}

/* THE STRAP IS A CONE, NOT A FLAT BAND.
   Both rails used to be swept from the profile at the CENTRE of the strap and
   then pushed ±W/2 along the neck axis, which makes a band of constant radius
   on a neck that tapers a centimetre over that width. The shoulder-ward rail
   therefore floated off a neck that was fatter under it, and the contact point
   seated on THAT slice came up through the strap and showed as a bright pin.
   Reading the profile at each rail's own height costs nothing and makes the
   strap sit down on the neck the whole way across, which is also simply what a
   strap does. */
function makeStrapGeom(s, slack, aRx, width) {
  vecs();
  var NA = 132, W = width || 0.030, pos = [], idx = [], k;
  var span = TOP.distanceTo(BASE) || 1;
  var ds = (W / 2) / span;
  var sA = Math.max(0, Math.min(1, s - ds));
  var sB = Math.max(0, Math.min(1, s + ds));
  var rx = aRx == null ? 0 : aRx;
  for (k = 0; k <= NA; k++) {
    var a = (k / NA) * Math.PI * 2;
    var e = strapOff(a, slack, rx);
    var d = dirAt(a);
    var pA = centreAt(sA).add(d.clone().multiplyScalar(radiusAt(sA, a) + e));
    var pB = centreAt(sB).add(d.clone().multiplyScalar(radiusAt(sB, a) + e));
    pos.push(pA.x, pA.y, pA.z, pB.x, pB.y, pB.z);
  }
  for (k = 0; k < NA; k++) {
    var b = k * 2;
    idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* The receiver on the dog is CUT OUT of the real receiver.glb rather than
   modelled as a block, so the housing a student sees here is the same object
   whose parts they were just taught — same shape, same texture, same wordmark.

   Why cut rather than drape the whole thing: receiver.glb is the complete
   collar, and it is a rigid loop taller than it is wide. This neck section is
   about 0.26 across and 0.15 deep, so draping the whole mesh needs a 2:1
   squash and the housing comes out deformed. The strap here is built from the
   measured profile instead, and only the housing is borrowed. The cut is tight
   enough to leave the buckle and the keepers behind — they sit above and
   outboard of the housing, and a looser cut brings them along as loose
   hardware floating beside the neck. */
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

  var keep = [];
  var tri = idx ? idx.count / 3 : pos.count / 3;
  for (var t = 0; t < tri; t++) {
    var a = idx ? idx.getX(t * 3)     : t * 3;
    var b = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
    var c = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
    var my = (P[a * 3 + 1] + P[b * 3 + 1] + P[c * 3 + 1]) / 3;
    var mx = (P[a * 3]     + P[b * 3]     + P[c * 3])     / 3;
    if (my < HOUSING.yMax && Math.abs(mx) < HOUSING.xAbs) keep.push(a, b, c);
  }
  if (!keep.length) return null;

  var map = {}, po = [], uo = [], no = [], io = [];
  for (i = 0; i < keep.length; i++) {
    var q = keep[i], n = map[q];
    if (n === undefined) {
      n = po.length / 3; map[q] = n;
      po.push(P[q * 3], P[q * 3 + 1], P[q * 3 + 2]);
      if (uv)  uo.push(uv.getX(q), uv.getY(q));
      if (nrm) no.push(nrm.getX(q), nrm.getY(q), nrm.getZ(q));
    }
    io.push(n);
  }
  var out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(po, 3));
  if (uo.length) out.setAttribute('uv', new THREE.Float32BufferAttribute(uo, 2));
  if (no.length) out.setAttribute('normal', new THREE.Float32BufferAttribute(no, 3));
  out.setIndex(io);
  out.computeBoundingBox();

  var bb = out.boundingBox, size = bb.getSize(new THREE.Vector3());
  var ctr = bb.getCenter(new THREE.Vector3());
  out.translate(-ctr.x, -ctr.y, -ctr.z);
  /* A 1900X housing is about two inches, on a neck a foot and a half round.
     Sized off its own cut extent it came out looking like a second collar. */
  var kk = 0.058 / Math.max(size.x, 1e-6);
  out.scale(kk, kk, kk);
  out.computeBoundingBox();
  return {
    geom: out,
    mat: src.material,
    halfY: (out.boundingBox.max.y - out.boundingBox.min.y) / 2
  };
}

function makeReceiverMesh(h, s, a, slack, aRx) {
  vecs();
  var d = dirAt(a).normalize(), c = centreAt(s);
  /* The housing's own axes: +Y is the face that lies against the dog, so it
     has to point inward; the long axis runs along the strap. */
  var along = U.clone().normalize();
  var side  = new THREE.Vector3().crossVectors(along, d).normalize();
  var m4    = new THREE.Matrix4().makeBasis(side, d.clone().negate(), along);
  var mesh  = h ? new THREE.Mesh(h.geom, h.mat || mats().box)
                : new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.024, 0.052), mats().box);
  mesh.applyMatrix4(m4);
  mesh.position.copy(c).add(d.clone().multiplyScalar(
    strapFace(s, a, slack, aRx == null ? a : aRx) + (h ? h.halfY - 0.004 : 0.012)));
  return mesh;
}

function buildStrap() {
  var slack = slackAt(set.tension), aRx = set.clock;
  if (strapMesh) { rig.remove(strapMesh); strapMesh.geometry.dispose(); strapMesh = null; }
  if (pressMesh) { rig.remove(pressMesh); pressMesh.geometry.dispose(); pressMesh = null; }

  /* THE PRESSURE BAND, and why it exists.
     The tight quarter of the slider used to sink the whole collar inside the
     mesh: the dog wore nothing while the card said "you are compressing the
     neck". A mesh we do not own cannot be dented, so the compression is drawn
     rather than simulated — a translucent band along the strap, in the same
     red the marking card fails you in, deepening as the two fingers stop
     going under. It is built first so the black strap draws over its middle
     and it reads as reddened skin either side. */
  var sq = squeezeAt(slack);
  if (sq > 0) {
    pressMesh = new THREE.Mesh(makeStrapGeom(set.height, slack, aRx, 0.056), pressMat());
    pressMesh.material.opacity = Math.min(0.62, 0.10 + sq * 34);
    pressMesh.renderOrder = 2;
    rig.add(pressMesh);
  }

  strapMesh = new THREE.Mesh(makeStrapGeom(set.height, slack, aRx), mats().strap);
  strapMesh.renderOrder = 3;
  rig.add(strapMesh);
}

function buildReceiver() {
  var i;
  if (boxMesh) { rig.remove(boxMesh); boxMesh = null; }
  for (i = 0; i < postMeshes.length; i++) {
    rig.remove(postMeshes[i]);
    postMeshes[i].geometry.dispose();
  }
  postMeshes = [];

  var s = set.height, a = set.clock, slack = slackAt(set.tension);
  var d = dirAt(a).normalize();

  boxMesh = makeReceiverMesh(housing, s, a, slack, a);
  rig.add(boxMesh);

  /* The points stay generated rather than borrowed: their length against the
     coat is half of what decision 4 is about, and the real pair is moulded
     into the housing at one fixed length.

     EACH POINT IS SEATED ON ITS OWN SLICE OF THE NECK. They were both seated
     on the profile at the housing's centre, which is a straight line across a
     neck that tapers: the head-ward point stood clear of a neck that had
     narrowed under it and showed as a bright pin floating beside the throat,
     and the student's eye went straight to it.

     THE CAP IS RECESSED, NOT PROUD. It used to be placed at
     strapFace - len/2 + 0.0005, which puts the polished outer end 0.0005
     OUTSIDE a zero-thickness strap ribbon — a bright metal pin on the outside
     of a black strap, at every clock angle, on a dog marked 4 of 4. The sign
     is now negative and the recess is deep enough that no camera angle finds
     it. */
  var p = postLen();
  var span = TOP.distanceTo(BASE) || 1;
  /* Inside the strap, not beside it. At ±0.016 the pair stood wider than the
     strap is (half-width 0.015), so the outer end of each point cleared the
     strap edge and showed as a bright pin on the neck of a dog that had just
     been marked 4 of 4. Nothing was wrong with the fit; the picture was lying
     about it. */
  var offs = [-0.0105, 0.0105];
  for (i = 0; i < offs.length; i++) {
    var si = Math.max(0, Math.min(1, s + offs[i] / span));
    var g = new THREE.CylinderGeometry(0.0045, 0.0038, p, 12);
    var m = new THREE.Mesh(g, mats().post);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().negate());
    m.position.copy(centreAt(si))
     .add(d.clone().multiplyScalar(strapFace(si, a, slack, a) - 0.0015 - p / 2));
    rig.add(m); postMeshes.push(m);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE GUARD · the picture may never disagree with the score
   ═══════════════════════════════════════════════════════════════════════════
   This module has now shipped a "4 of 4 · Fitted correctly" over a dog wearing
   nothing three times, for three different reasons: a strap sunk inside the
   mesh at high tension, a strap sunk inside the mesh at low tension, and a
   whole collar built round the animal's jaw at the top of the height slider.
   Each was fixed where it happened. None of the fixes could have caught the
   next one. This can, because it does not care WHY the collar is not on the
   dog — it checks that it is.

   It runs once, on the press of "Check the fit". A hundred-odd numbers.

   WHAT "VISIBLE" MEANS, AND WHAT IT DELIBERATELY DOES NOT.
   Visible here is: in the rig, the rig is in the scene, nothing in the chain
   is hidden, the material draws, and the geometry is real — a finite bounding
   sphere with a radius, which is what a NaN in a position attribute destroys
   and what makes three.js draw a mesh precisely nowhere.

   It is NOT "unoccluded from the camera". Two of the four parts are supposed
   to be hidden from most angles: the contact points are recessed under the
   strap on purpose — a proud metal pin on a black strap was itself a bug once
   — and the housing goes behind the neck whenever the student walks round to
   the far side. A camera test would fail every correct fit in the drill.

   The fourth check is the one the height bug needed. Every part can be present,
   visible and outside the mesh and the collar can still be around the dog's
   jaw, because the neck frame's head-ward end is not on the neck. So the
   section the collar is built on must still be a neck section: past NECK_OVAL,
   measured at s = 0.62, it is the head.

   BUT BE HONEST ABOUT WHAT THIS ARM IS. sectionOval() is a function of
   set.height alone and it is monotone over this range, so `sectionOval(h) >
   NECK_OVAL` is just `h > 0.62` wearing a disguise, and vHeight() === 'ok' is
   `h <= H_OK[1]`. Two monotone tests on one variable: whenever NECK_OVAL and
   H_OK[1] are derived from the same measurement — as they now are, 0.62 and
   0.56 — the two conditions CANNOT both hold, and this arm cannot fire at
   runtime. Making it fire would mean setting the threshold inside the pass
   band, i.e. shipping a band that marks a height 'ok' and a guard that vetoes
   the same height. That is not a guard, it is a contradiction.

   So this arm is a REGRESSION TRIPWIRE, not a runtime check, and it is the
   tripwire that matters: widen H_OK past the measured head boundary and it
   fires on every fit in the widened part, immediately, instead of shipping a
   fourth 4-of-4 over a collar round a jaw. Verified by widening H_OK to
   [0.42, 0.80] in a scratch build: heights 0.63 to 0.80 then return
   onNeck === false with vHeight() === 'ok', and the card refuses to mark.
   The missing-mesh arm above IS a live runtime check and is unchanged.

   If a live geometric veto is ever wanted, it has to test something that is
   not a function of height alone — the built strap loop's own eccentricity,
   which also moves with clock and tension. That is a real change to the
   marking, not a constant, and it is not in this round.

   THE POSITION SCAN IS DONE BY HAND, and it has to be. The obvious way to ask
   three.js whether a geometry is real is computeBoundingSphere() and a look at
   the radius — but on a NaN that method WRITES AN ERROR TO THE CONSOLE, so a
   guard built on it would fail hard gate 1 in the act of catching the bug it
   was added for. Walking the array costs about ten thousand comparisons on a
   button press and says nothing.                                             */
function finiteGeom(g) {
  var p = g.attributes.position, arr = p.array, i;
  var n = p.count * p.itemSize, span = 0;
  var mn = Infinity, mx = -Infinity;
  for (i = 0; i < n; i++) {
    var v = arr[i];
    if (!isFinite(v)) return false;
    if (v < mn) mn = v;
    if (v > mx) mx = v;
  }
  span = mx - mn;
  return span > 0;                 // a geometry collapsed to a point draws nothing
}

function drawn(o) {
  if (!o || !rig || !rig.parent) return false;
  if (o.parent !== rig) return false;
  var g = o.geometry, m = o.material;
  if (!g || !g.attributes || !g.attributes.position ||
      !g.attributes.position.count) return false;
  if (!m || m.visible === false) return false;
  if (m.transparent && !(m.opacity > 0.01)) return false;
  if (!finiteGeom(g)) return false;
  var p = o;
  while (p) { if (!p.visible) return false; p = p.parent; }
  return true;
}

function pictureCheck() {
  /* No 3D at all — no WebGL, or the mesh would not read and EC has already put
     its card in this pane and brought the written reference back. There is no
     picture, so there is nothing for the score to disagree with, and refusing
     to mark would take the drill away from the student who has least. */
  if (!built) return { drawn: false, ok: true, miss: [], onNeck: true };

  var miss = [], pts = 0, i;
  if (!drawn(strapMesh)) miss.push('the strap');
  if (!drawn(boxMesh))   miss.push('the receiver housing');
  for (i = 0; i < postMeshes.length; i++) if (drawn(postMeshes[i])) pts++;
  if (pts < 2) miss.push(pts === 1 ? 'one of the two contact points'
                                   : 'both contact points');

  /* Off the neck is only a CONTRADICTION if the marking has not already said
     so. Above H_OK[1] the height row reads "past the neck — up on the jaw" and
     the dog on screen has a strap across its jaw: card and picture agree, and
     shouting that they disagree would be crying wolf on an honest fail.
     What must never happen is the pass — so the veto is armed exactly there.
     With H_OK[1] = 0.56 and NECK_OVAL taken at s = 0.62 this cannot fire at
     runtime, by construction; it fires the moment someone widens H_OK past the
     measured head boundary. See the long note above — that is what it is for. */
  var onNeck = sectionOval(set.height) <= NECK_OVAL;
  var lies = miss.length > 0 || (!onNeck && vHeight() === 'ok');
  return { drawn: true, ok: !lies, miss: miss, onNeck: onNeck };
}

// ── framing ────────────────────────────────────────────────────────────────
/* The stage's own home() frames the whole model from a fixed ray. This tab is
   about a hand's width of neck, so it frames that instead — the same solve the
   previous build used, which was measured against this dog: a 0.46-unit
   vertical window on the neck centre, pulled further back when height rather
   than width is the binding constraint. */
/* The opening view. A three-quarter from the dog's right, a little above
   working height: the whole neck reads, the shoulder is in shot so "too low"
   has something to be low against, and it is nobody's fault if the receiver
   starts round the back — walking round is the drill. */
var HOME_DIR = new THREE.Vector3(1.1, 0.30, 0.72).normalize();

/* Where the camera has to stand to be looking straight at the receiver. The
   collar can be put anywhere round the clock, so the button that says "turn
   the dog to face this" has to solve for the answer rather than guess it. */
function faceDir() {
  vecs();
  var d = dirAt(set.clock).clone();
  d.y = 0;
  if (d.lengthSq() < 1e-6) d.copy(HOME_DIR);
  d.normalize();
  return d.multiplyScalar(0.94).add(new THREE.Vector3(0, 0.32, 0)).normalize();
}

/* The last direction the module framed from. A resize re-frames, and re-framing
   to the OPENING view would throw away the walk round the dog the student had
   just asked for with "turn the dog to face this" — the pane changes size for
   reasons that are nothing to do with them (phone chrome sliding away, the
   narrow layout settling) and losing your place to one of those is exactly the
   fault BAR.md names in the thing we are measured against. */
var lastDir = null;

function frame(instant, dir) {
  if (!stage) return;
  var cam = stage.camera;
  var tgt = centreAt(0.44);
  var vT = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
  var dist = (0.54 / 2) / vT;
  var asp = cam.aspect || 1.4;
  if (asp < 1.3) dist *= Math.min(2.1, 1.3 / asp);
  lastDir = (dir || lastDir || HOME_DIR).clone();
  var v = lastDir.clone().multiplyScalar(dist);
  stage.moveTo(tgt.clone().add(v), tgt, instant ? 0 : 620);
  stage.spin = false;
  touched = false;
}

// ═══════════════════════════════════════════════════════════════════════════
//  THE SECTION
//  Built once, then updated by attribute. Rebuilding a hundred nodes on every
//  frame of a slider drag is how a live diagram turns into a stutter.
//
//  TYPE SIZE IS A HARD CONSTRAINT HERE. Last round every label rendered at
//  7.1–10.1 CSS px, which is not a diagram a student reads in a kennel yard in
//  the rain. Nothing below is declared under 12.4 SVG units, the viewBox is
//  400 wide, and the stylesheet holds the rendered width at or above 392 px at
//  every viewport — so the smallest label on the smallest screen renders at
//  about 12.2 px, and at 1440 it is over 15. Every string in here was chosen
//  short enough to survive that.
// ═══════════════════════════════════════════════════════════════════════════

var NS = 'http://www.w3.org/2000/svg';
function sv(tag, cls, at) {
  var n = document.createElementNS(NS, tag);
  if (cls) n.setAttribute('class', cls);
  for (var k in at) if (at.hasOwnProperty(k)) n.setAttribute(k, at[k]);
  return n;
}
function txt(cls, s, at) {
  var n = sv('text', cls, at);
  n.textContent = s;
  return n;
}
function el(tag, cls, s) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (s != null) n.textContent = s;
  return n;
}
function show(node, on, cls) {
  node.setAttribute('class', cls + (on ? '' : ' fs-off'));
}

/* Section geometry, in the SVG's own units.
   K is FIXED on purpose. A section that rescaled itself to fill the frame
   would hide the single most useful thing this picture says: the neck is far
   thicker at the shoulder than it is behind the ears. */
var SX = 104, SY = 118, K = 400;    // centre of the ring, and units per model unit
var Z_R = 0.040, CLK_R = 0.062;     // zone band and clock labels, outside the coat
var DETX = 224;                     // where panel A's own coordinate space starts
var MAG = 3200;                     // panel A's scale — about 8x the ring
var DX0 = 12, DX1 = 108;            // the magnified stack, left and right
var SKINY = 168;                    // skin is the fixed datum in panel A
var FLOORY = 212;                   // bottom of the flesh block
var PX = [DX0 + 26, DX0 + 66];      // the two points in panel A
var CHIPY = 218;

/* The ring is drawn about the section's own centroid rather than about the
   centreline, so it sits still in its frame while its SIZE and SHAPE change.
   The centreline is still drawn, as a cross, because every clock angle is
   measured from it and the picture has to stay honest about that. */
function centroid(s) {
  var x = 0, y = 0, n = 48;
  for (var i = 0; i < n; i++) {
    var a = (i / n) * Math.PI * 2, r = radiusAt(s, a);
    x += Math.sin(a) * r; y += -Math.cos(a) * r;
  }
  return { x: x / n, y: y / n };
}
function ringPt(s, a, extra, c) {
  var r = radiusAt(s, a) + (extra || 0);
  return [SX + (Math.sin(a) * r - c.x) * K, SY + (-Math.cos(a) * r - c.y) * K];
}
function ringPath(s, extra, c, a0, a1, close) {
  var d = '', n = 84, i, p;
  var f = a0 == null ? 0 : a0 * Math.PI / 180;
  var t = a1 == null ? Math.PI * 2 : a1 * Math.PI / 180;
  for (i = 0; i <= n; i++) {
    p = ringPt(s, f + (t - f) * (i / n), extra, c);
    d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  }
  return d + (close ? 'Z' : '');
}
/* The strap is not concentric, so it needs its own sweep. */
function strapRingPath(s, slack, aRx, c) {
  var d = '', n = 96, i;
  for (i = 0; i <= n; i++) {
    var a = (i / n) * Math.PI * 2;
    var p = ringPt(s, a, strapOff(a, slack, aRx), c);
    d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  }
  return d + 'Z';
}

function buildSection() {
  var svg = sv('svg', 'fit-svg', { viewBox: '0 0 400 246', role: 'img' });
  svg.setAttribute('aria-label',
    'Live cross-section through the neck at the receiver, with a magnified ' +
    'view of the contact points against the coat.');
  var S = { svg: svg };

  var gR = sv('g', '', {});                                   // the ring panel
  var gD = sv('g', '', { transform: 'translate(' + DETX + ' 0)' });  // panel A
  S.gR = gR; S.gD = gD;

  // ── ring panel header ────────────────────────────────────────────────────
  gR.appendChild(txt('fs-eye', 'LOOKING DOWN THE NECK', { x: 2, y: 13 }));
  gR.appendChild(sv('line', 'fs-rule', { x1: 2, y1: 20, x2: 212, y2: 20 }));

  // ── zone band, flesh, coat, anatomy ──────────────────────────────────────
  S.zones = [];
  var zdefs = [
    ['ok', Z_OK[0]], ['ok', Z_OK[1]],
    ['no', Z_PIPE], ['no', Z_CREST[0]], ['no', Z_CREST[1]],
    ['near', [60, 115]], ['near', [245, 300]]
  ];
  for (var z = 0; z < zdefs.length; z++) {
    var pz = sv('path', 'fs-zone fs-' + zdefs[z][0], { d: '' });
    gR.appendChild(pz);
    S.zones.push({ node: pz, band: zdefs[z][1] });
  }

  S.coat  = sv('path', 'fs-coat',  { d: '' });   // outline of the coat
  S.press = sv('path', 'fs-press', { d: '' });   // the coat crushed under a tight strap
  S.flesh = sv('path', 'fs-flesh', { d: '' });   // skin inward
  S.skinL = sv('path', 'fs-skinl', { d: '' });
  gR.appendChild(S.coat);
  gR.appendChild(S.press);
  gR.appendChild(S.flesh);
  gR.appendChild(S.skinL);

  S.spine = sv('path',   'fs-spine', { d: '' });
  S.pipe  = sv('circle', 'fs-pipe',  { r: 0 });
  S.pipeI = sv('circle', 'fs-pipei', { r: 0 });
  gR.appendChild(S.spine);
  gR.appendChild(S.pipe);
  gR.appendChild(S.pipeI);

  S.cross = sv('path', 'fs-cross', { d: '' });
  gR.appendChild(S.cross);

  /* THE STRAP, WHICH THE RING USED TO LEAVE OUT ENTIRELY.
     Without it the manual's own second target — two fingers under the strap —
     had no picture anywhere in the app: panel A deliberately draws the strap
     pressed flat on the coat, because that is what it does under the housing.
     Here is where the slack lives, so here is where it is measured. */
  S.strap = sv('path', 'fs-strapr', { d: '' });
  gR.appendChild(S.strap);
  S.gapA = sv('path', 'fs-gapm', { d: '' });      // the two-finger measure
  gR.appendChild(S.gapA);
  S.gapT = txt('fs-gapl', '', { x: 0, y: 0, 'text-anchor': 'middle' });
  gR.appendChild(S.gapT);

  /* Clock labels, carried just outside the outline on their own ray. The two
     that matter carry the anatomy with them: a student does not need to be
     told there is a vertebra, they need to know that 12 o'clock is the crest
     and 6 o'clock is the windpipe. Labelling the structures separately, inside
     the section, put two words on top of each other at every neck height this
     dog has — and said less. */
  S.clk = [];
  var hours = [[0, '12 CREST'], [3, '3'], [6, '6 WINDPIPE'], [9, '9']];
  for (var h = 0; h < hours.length; h++) {
    var tn = txt('fs-clk', hours[h][1], { x: 0, y: 0, 'text-anchor': 'middle' });
    gR.appendChild(tn);
    S.clk.push({ node: tn, hour: hours[h][0] });
  }

  // the receiver on the section, and its two points
  S.rx = sv('g', 'fs-rx', {});
  S.rxPostA = sv('line', 'fs-rxpost', { x1: -5.5, y1: 0, x2: -5.5, y2: 7 });
  S.rxPostB = sv('line', 'fs-rxpost', { x1:  5.5, y1: 0, x2:  5.5, y2: 7 });
  S.rxBody  = sv('rect', 'fs-rxbody', { x: -13, y: -13.5, width: 26, height: 14, rx: 3.5 });
  S.rx.appendChild(S.rxPostA);
  S.rx.appendChild(S.rxPostB);
  S.rx.appendChild(S.rxBody);
  gR.appendChild(S.rx);

  // the detail ring — halo first, so the leader reads over the section
  S.lensC = sv('circle', 'fs-lens', { r: 24 });
  gR.appendChild(S.lensC);
  S.lensT = txt('fs-lensk', 'A', { x: 0, y: 0, 'text-anchor': 'middle' });
  gR.appendChild(S.lensT);

  // two chips: position, and tension. All four decisions now carry a mark.
  S.clkChip  = sv('rect', 'fs-chip', { x: 2, y: CHIPY, width: 102, height: 24, rx: 12 });
  S.clkChipT = txt('fs-chipt', '', { x: 53, y: CHIPY + 16.5, 'text-anchor': 'middle' });
  gR.appendChild(S.clkChip);
  gR.appendChild(S.clkChipT);
  S.tenChip  = sv('rect', 'fs-chip', { x: 110, y: CHIPY, width: 102, height: 24, rx: 12 });
  S.tenChipT = txt('fs-chipt', '', { x: 161, y: CHIPY + 16.5, 'text-anchor': 'middle' });
  gR.appendChild(S.tenChip);
  gR.appendChild(S.tenChipT);

  // ── panel A: the magnified stack ─────────────────────────────────────────
  gD.appendChild(txt('fs-eye', 'A · POINTS vs COAT', { x: 2, y: 13 }));
  gD.appendChild(txt('fs-scale', '×8', { x: 174, y: 13, 'text-anchor': 'end' }));
  gD.appendChild(sv('line', 'fs-rule', { x1: 2, y1: 20, x2: 176, y2: 20 }));

  S.dFlesh = sv('path', 'fs-flesh',  { d: '' });
  S.dCoat  = sv('rect', 'fs-coatb',  { x: DX0, y: 0, width: DX1 - DX0, height: 0 });
  S.dStrap = sv('rect', 'fs-strapb', { x: DX0, y: 0, width: DX1 - DX0, height: 14, rx: 2 });
  S.dSkin  = sv('path', 'fs-skind',  { d: '' });
  gD.appendChild(S.dFlesh);
  gD.appendChild(S.dCoat);
  gD.appendChild(S.dStrap);
  gD.appendChild(S.dSkin);

  S.dPost = [];
  for (var q = 0; q < 2; q++) {
    var g2 = sv('g', '', {});
    var ln = sv('line',   'fs-postl', { x1: 0, y1: 0, x2: 0, y2: 0 });
    var tp = sv('circle', 'fs-postt', { r: 4.4 });
    g2.appendChild(ln); g2.appendChild(tp);
    gD.appendChild(g2);
    S.dPost.push({ ln: ln, tip: tp });
  }
  // the shortfall: the gap the points do not cross
  S.dGap  = sv('line', 'fs-gap',  { x1: 0, y1: 0, x2: 0, y2: 0 });
  S.dGapT = txt('fs-gapt', 'never touched', { x: (DX0 + DX1) / 2, y: 196, 'text-anchor': 'middle' });
  gD.appendChild(S.dGap);
  gD.appendChild(S.dGapT);

  /* Panel A has 176 units of its own space; the stack takes 108 of them, so a
     band label has about 60 before it runs off the edge — and the root <svg>
     clips at the viewBox, silently. "coat · clipped" measured 83 and lost its
     last word, on the one coat treatment that passes a January dog. The
     treatment therefore gets its own line rather than being glued on. */
  S.lStrap = txt('fs-band', 'strap', { x: DX1 + 8, y: 0 });
  S.lCoat  = txt('fs-band', 'coat',  { x: DX1 + 8, y: 0 });
  S.lCoat2 = txt('fs-band2', '',     { x: DX1 + 8, y: 0 });
  S.lSkin  = txt('fs-band', 'skin',  { x: DX1 + 8, y: 0 });
  gD.appendChild(S.lStrap);
  gD.appendChild(S.lCoat);
  gD.appendChild(S.lCoat2);
  gD.appendChild(S.lSkin);

  S.dChip  = sv('rect', 'fs-chip', { x: 2, y: CHIPY, width: 174, height: 24, rx: 12 });
  S.dChipT = txt('fs-chipt', '', { x: 89, y: CHIPY + 16.5, 'text-anchor': 'middle' });
  gD.appendChild(S.dChip);
  gD.appendChild(S.dChipT);

  svg.appendChild(gR);
  svg.appendChild(gD);

  // the divider and the elbow leader live above both panels
  svg.appendChild(sv('line', 'fs-div', { x1: 218, y1: 28, x2: 218, y2: 240 }));
  S.leadH = sv('path', 'fs-lead-h', { d: '' });
  S.leadL = sv('path', 'fs-lead',   { d: '' });
  svg.appendChild(S.leadH);
  svg.appendChild(S.leadL);

  return S;
}

function updateSection() {
  if (!SEC) return;
  var S = SEC, s = set.height, d = deg(), a = set.clock;
  var slack = slackAt(set.tension), sq = squeezeAt(slack);
  var eD = effDepth(), pL = postLen(), rch = reaches();
  var c = centroid(s);
  var i, pt;

  var vc = vClock(), vt = vTension(), vco = vCoat();

  // outlines
  S.coat.setAttribute('d',  ringPath(s, 0, c, null, null, true));
  S.flesh.setAttribute('d', ringPath(s, -eD, c, null, null, true));
  S.skinL.setAttribute('d', ringPath(s, -eD, c, null, null, true));

  /* Crushed coat. There is no way to dent a mesh we do not own, so the tight
     end of the slider is shown here instead of pretending in 3D: the coat
     outline is redrawn inside itself, in the fail colour, by exactly how far
     past two fingers the strap has been pulled. */
  show(S.press, sq > 0, 'fs-press');
  if (sq > 0) S.press.setAttribute('d', ringPath(s, -Math.min(sq, eD * 0.9), c, null, null, true));

  for (i = 0; i < S.zones.length; i++) {
    var b = S.zones[i].band;
    S.zones[i].node.setAttribute('d', ringPath(s, Z_R, c, b[0], b[1], false));
  }

  /* Anatomy, carried on the rays it actually lives on. The trachea rides just
     under the ventral skin — which is the whole reason the receiver may not go
     to 6 o'clock — and the vertebra sits well in from the crest, which is the
     reason it may not go to 12 either. */
  var pipeR = Math.max(7, radiusAt(s, Math.PI) * K * 0.19);
  var pipeC = ringPt(s, Math.PI, -(eD + radiusAt(s, Math.PI) * 0.31), c);
  S.pipe.setAttribute('cx', pipeC[0].toFixed(1));
  S.pipe.setAttribute('cy', pipeC[1].toFixed(1));
  S.pipe.setAttribute('r', pipeR.toFixed(1));
  S.pipeI.setAttribute('cx', pipeC[0].toFixed(1));
  S.pipeI.setAttribute('cy', pipeC[1].toFixed(1));
  S.pipeI.setAttribute('r', (pipeR * 0.55).toFixed(1));

  var spC = ringPt(s, 0, -(eD + radiusAt(s, 0) * 0.40), c);
  var sw = Math.max(10, radiusAt(s, 0) * K * 0.27);
  S.spine.setAttribute('d',
    'M' + (spC[0] - sw).toFixed(1) + ' ' + (spC[1] - sw * 0.55).toFixed(1) +
    'h' + (sw * 2).toFixed(1) + 'a5 5 0 0 1 5 5' +
    'v' + (sw * 0.5).toFixed(1) + 'a7 7 0 0 1 -7 7' +
    'h' + (-(sw * 2 - 4)).toFixed(1) + 'a7 7 0 0 1 -7 -7' +
    'v' + (-sw * 0.5).toFixed(1) + 'a5 5 0 0 1 5 -5z');

  var cx0 = SX - c.x * K, cy0 = SY - c.y * K;
  S.cross.setAttribute('d',
    'M' + (cx0 - 5).toFixed(1) + ' ' + cy0.toFixed(1) + 'h10M' +
    cx0.toFixed(1) + ' ' + (cy0 - 5).toFixed(1) + 'v10');

  for (i = 0; i < S.clk.length; i++) {
    var ha = (S.clk[i].hour / 12) * Math.PI * 2;
    pt = ringPt(s, ha, CLK_R, c);
    S.clk[i].node.setAttribute('x', pt[0].toFixed(1));
    S.clk[i].node.setAttribute('y', (pt[1] + 4.5).toFixed(1));
  }

  // ── the strap, and the two fingers ───────────────────────────────────────
  S.strap.setAttribute('d', strapRingPath(s, slack, a, c));

  /* ── WHERE THE TWO FINGERS ACTUALLY GO ─────────────────────────────────
     This was taken blindly on the ray opposite the receiver, and the loop is
     not widest there: the housing presses it down over ±74 deg and the slack
     drops toward the underside, so on a 4½ o'clock fit the widest point is
     nearer 7 o'clock. The opposite ray under-read it by 2.3x — 1.97 units
     against 4.54 — which put it under the draw threshold at exactly the
     tension the app marks as a PASS. The manual's second target then had no
     picture at the one fit that meets it, which is the whole reason this
     measure was added. Scan for the real maximum instead.

     WHAT THE SCALE MEANS, so it is not re-derived wrongly. This is a RADIAL
     gap, not the width of two fingers. Two fingers slipped under a strap add
     about 30 mm to the loop's circumference, which is 30/2π ≈ 4.8 mm of
     radius. On this neck (radius 0.121 model units ≈ 64 mm) that is 0.009
     model units — which is where SNUG sits. The band [0.004, 0.012] is
     therefore about one finger to two-and-a-half, and a correct fit is a
     range rather than a number, which is the point. */
  var aOpp = a + Math.PI, best = -1;
  for (i = 0; i < 72; i++) {
    var ai = (i / 72) * Math.PI * 2;
    var oi = strapOff(ai, slack, a);
    if (oi > best) { best = oi; aOpp = ai; }
  }
  var gapMod = best - 0.0006;
  var gapPx = gapMod * K;
  var pC = ringPt(s, aOpp, 0, c), pS = ringPt(s, aOpp, gapMod + 0.0006, c);
  var vx = pS[0] - pC[0], vy = pS[1] - pC[1];
  var vl = Math.sqrt(vx * vx + vy * vy) || 1;
  var tx = -vy / vl * 6, ty = vx / vl * 6;
  /* 2.0 units, not 3.2: the loosest tension that still passes leaves 2.29
     units of gap, and a threshold above that hides the measure on a pass
     again. Below 2 units the strap is tight enough that the dimension is
     meaningless — and that is the end of the slider where the pressure band
     and the "Tight" chip do the talking instead. */
  /* Set BEFORE the label is placed — the placement below measures the text, so
     it has to be the text that will actually be shown. It used to be set after
     the draw block, so a label that had been hidden kept whatever it last
     said: the ring read "the gap" at a tension the card was marking "Two
     fingers under the strap". Hidden text is still read aloud by a screen
     reader walking the SVG, so it has to be true at the tight end too, where
     the measure itself is not drawn. */
  S.gapT.textContent = vt === 'ok' ? '2 fingers'
    : slack > SNUG[1] ? 'too loose' : 'too tight';

  show(S.gapA, gapPx >= 2.0, 'fs-gapm is-' + vt);
  show(S.gapT, gapPx >= 2.0, 'fs-gapl is-' + vt);
  if (gapPx >= 2.0) {
    S.gapA.setAttribute('d',
      'M' + (pC[0] - tx).toFixed(1) + ' ' + (pC[1] - ty).toFixed(1) +
      'L' + (pC[0] + tx).toFixed(1) + ' ' + (pC[1] + ty).toFixed(1) +
      'M' + pC[0].toFixed(1) + ' ' + pC[1].toFixed(1) +
      'L' + pS[0].toFixed(1) + ' ' + pS[1].toFixed(1) +
      'M' + (pS[0] - tx).toFixed(1) + ' ' + (pS[1] - ty).toFixed(1) +
      'L' + (pS[0] + tx).toFixed(1) + ' ' + (pS[1] + ty).toFixed(1));

    /* WHICH SIDE OF THE DIMENSION THE LABEL SITS ON.
       It was pinned to one side. The measure now follows the widest point of
       the loop, which on a loose fit swings round to wherever gravity has
       dropped the slack — and at several clock angles that put "too loose"
       straight on top of the "9" clock label. Both are text on a pale
       section, so the pair read as one unreadable smear.

       The clock labels are four fixed rays, so the cheapest honest fix is to
       try the four candidate offsets and keep the one that overlaps them
       least. Measured, not assumed: the strings change length with the
       verdict, and a fixed nudge that clears "2 fingers" does not clear
       "too loose". */
    var mid0 = (pC[0] + pS[0]) / 2, mid1 = (pC[1] + pS[1]) / 2;
    var cands = [2.4, -2.4, 4.6, -4.6], pick = null;
    for (var q = 0; q < cands.length; q++) {
      S.gapT.setAttribute('x', (mid0 + tx * cands[q]).toFixed(1));
      S.gapT.setAttribute('y', (mid1 + ty * cands[q] + 4.5).toFixed(1));
      var gb = null;
      try { gb = S.gapT.getBBox(); } catch (e) { gb = null; }
      var hit = 0;
      if (gb) {
        for (var w = 0; w < S.clk.length; w++) {
          var cb = null;
          try { cb = S.clk[w].node.getBBox(); } catch (e2) { cb = null; }
          if (!cb || !cb.height) continue;
          var ow = Math.min(gb.x + gb.width, cb.x + cb.width) - Math.max(gb.x, cb.x);
          var oh = Math.min(gb.y + gb.height, cb.y + cb.height) - Math.max(gb.y, cb.y);
          if (ow > 0 && oh > 0) hit += ow * oh;
        }
      }
      if (pick === null || hit < pick.hit) pick = { o: cands[q], hit: hit };
      if (hit === 0) break;
    }
    S.gapT.setAttribute('x', (mid0 + tx * pick.o).toFixed(1));
    S.gapT.setAttribute('y', (mid1 + ty * pick.o + 4.5).toFixed(1));
  }

  // the receiver, standing on the strap face at its clock angle
  var rp = ringPt(s, a, strapOff(a, slack, a), c);
  S.rx.setAttribute('transform',
    'translate(' + rp[0].toFixed(1) + ' ' + rp[1].toFixed(1) + ') rotate(' + d.toFixed(1) + ')');
  S.rxBody.setAttribute('class', 'fs-rxbody is-' + vc);
  /* True scale, not a legible one. At this size a contact point is four pixels
     long — which is the honest reason panel A exists, and drawing it bigger
     here would quietly tell the student they could judge it from the ring. */
  var pl = Math.max(2, pL * K);
  S.rxPostA.setAttribute('y2', pl.toFixed(1));
  S.rxPostB.setAttribute('y2', pl.toFixed(1));
  S.rxPostA.setAttribute('class', 'fs-rxpost is-' + (rch ? 'ok' : 'no'));
  S.rxPostB.setAttribute('class', 'fs-rxpost is-' + (rch ? 'ok' : 'no'));

  // the detail ring and its elbow leader out to panel A
  S.lensC.setAttribute('cx', rp[0].toFixed(1));
  S.lensC.setAttribute('cy', rp[1].toFixed(1));
  S.lensT.setAttribute('x', (rp[0] + 18).toFixed(1));
  S.lensT.setAttribute('y', (rp[1] - 17).toFixed(1));
  var ly = Math.max(46, Math.min(206, rp[1]));
  var lead = 'M' + (rp[0] + 24).toFixed(1) + ' ' + rp[1].toFixed(1) +
             'H206V' + ly.toFixed(1) + 'H' + (DETX + 2);
  S.leadL.setAttribute('d', lead);
  S.leadH.setAttribute('d', lead);

  S.clkChipT.textContent = clockLabel(a);
  S.clkChip.setAttribute('class', 'fs-chip is-' + vc);
  S.clkChipT.setAttribute('class', 'fs-chipt is-' + vc);
  S.tenChipT.textContent = vt === 'ok' ? 'Two fingers'
    : slack > SNUG[1] ? 'Loose' : 'Tight';
  S.tenChip.setAttribute('class', 'fs-chip is-' + vt);
  S.tenChipT.setAttribute('class', 'fs-chipt is-' + vt);

  // ── panel A ──────────────────────────────────────────────────────────────
  /* The strap is drawn sitting ON the coat with no gap, because this is the
     section AT the receiver — where the loop has rolled onto the housing and
     the strap is pressed in, not where you slide two fingers under it. The
     ring above is where the slack is, and it now draws and measures it. */
  var coatH  = Math.max(4, eD * MAG);
  var postH  = pL * MAG;
  var coatTop = SKINY - coatH;
  var strapY  = coatTop - 14;
  var tipY    = Math.min(coatTop + postH, SKINY + 14);

  S.dCoat.setAttribute('y', coatTop.toFixed(1));
  S.dCoat.setAttribute('height', coatH.toFixed(1));
  S.dStrap.setAttribute('y', strapY.toFixed(1));

  /* THE SKIN DIMPLES UNDER A POINT THAT REACHES IT. Manual p.27 asks that the
     points "press firmly against the dog's skin" — a flat skin line under a
     point that has arrived says only that it touched. */
  var dip = Math.max(0, tipY - SKINY);
  var sd = 'M' + (DX0 - 8) + ' ' + SKINY;
  for (i = 0; i < 2; i++) {
    sd += 'L' + (PX[i] - 11) + ' ' + SKINY +
          'Q' + PX[i] + ' ' + (SKINY + dip * 1.5).toFixed(1) + ' ' + (PX[i] + 11) + ' ' + SKINY;
  }
  sd += 'L' + (DX1 + 8) + ' ' + SKINY;
  S.dSkin.setAttribute('d', sd);
  S.dFlesh.setAttribute('d', sd + 'L' + (DX1 + 8) + ' ' + FLOORY +
                             'L' + (DX0 - 8) + ' ' + FLOORY + 'Z');

  for (i = 0; i < 2; i++) {
    S.dPost[i].ln.setAttribute('x1', PX[i]);
    S.dPost[i].ln.setAttribute('x2', PX[i]);
    S.dPost[i].ln.setAttribute('y1', coatTop.toFixed(1));
    S.dPost[i].ln.setAttribute('y2', tipY.toFixed(1));
    S.dPost[i].ln.setAttribute('class', 'fs-postl is-' + (rch ? 'ok' : 'no'));
    S.dPost[i].tip.setAttribute('cx', PX[i]);
    S.dPost[i].tip.setAttribute('cy', tipY.toFixed(1));
    S.dPost[i].tip.setAttribute('class', 'fs-postt is-' + (rch ? 'ok' : 'no'));
  }

  /* The gap the points do not cross, marked between them so it cannot be read
     as anything else. This dashed run IS the failure: everything below it
     never gets touched, at any level on the dial. */
  show(S.dGap,  !rch, 'fs-gap');
  show(S.dGapT, !rch, 'fs-gapt');
  if (!rch) {
    var gx = (PX[0] + PX[1]) / 2;
    S.dGap.setAttribute('x1', gx); S.dGap.setAttribute('x2', gx);
    S.dGap.setAttribute('y1', tipY.toFixed(1)); S.dGap.setAttribute('y2', SKINY);
  }

  /* Band labels, in a fixed order top to bottom: strap · coat · (treatment) ·
     skin. Each wants the middle of its own band, and on a clipped coat that
     band is a few units deep, so they collide.

     THE GAPS ARE MEASURED, NOT GUESSED. This used to push them apart by hand
     with three constants — 15 units between labels, 28 when a treatment line
     was showing, 13 to the treatment line itself. Every one of those was too
     small for the type it was spacing: "coat" and "clipped" overlapped by 4
     units in all six treated cases, at every viewport. The sizes are set in
     the stylesheet, so a constant here is stale the moment anyone touches it.
     Ask the browser for the real boxes and walk the stack down instead. */
  var treat = set.groom === 'clip' ? 'clipped'
            : set.groom === 'part' ? 'parted' : '';
  S.lCoat.textContent = 'coat';
  S.lCoat2.textContent = treat;
  show(S.lCoat2, !!treat, 'fs-band2');

  S.lStrap.setAttribute('y', (strapY + 10).toFixed(1));
  S.lCoat.setAttribute('y',  (coatTop + coatH / 2 + 4).toFixed(1));
  S.lCoat2.setAttribute('y', (coatTop + coatH / 2 + 20).toFixed(1));
  S.lSkin.setAttribute('y',  (SKINY + 16 + dip).toFixed(1));

  var stack = treat ? [S.lStrap, S.lCoat, S.lCoat2, S.lSkin]
                    : [S.lStrap, S.lCoat, S.lSkin];
  var prevBot = -1e9;
  for (i = 0; i < stack.length; i++) {
    var nd = stack[i], bb = null;
    try { bb = nd.getBBox(); } catch (e) { bb = null; }
    if (!bb || !bb.height) continue;
    var ny = parseFloat(nd.getAttribute('y')), nb = bb.y + bb.height;
    if (bb.y < prevBot + 2) {
      var sh = prevBot + 2 - bb.y;
      ny += sh; nb += sh;
      nd.setAttribute('y', ny.toFixed(1));
    }
    prevBot = nb;
  }
  /* Last resort: the stack must not walk into the chip row. Pulling the whole
     stack up keeps the gaps the measure just established. */
  var over = prevBot - (CHIPY - 4);
  if (over > 0) {
    for (i = 0; i < stack.length; i++) {
      stack[i].setAttribute('y',
        (parseFloat(stack[i].getAttribute('y')) - over).toFixed(1));
    }
  }

  S.dChipT.textContent = rch ? 'Points on skin' : 'Points stop in the coat';
  S.dChip.setAttribute('class', 'fs-chip is-' + (rch ? (vco === 'near' ? 'near' : 'ok') : 'no'));
  S.dChipT.setAttribute('class', 'fs-chipt is-' + (rch ? (vco === 'near' ? 'near' : 'ok') : 'no'));
}

// ═══════════════════════════════════════════════════════════════════════════
//  MARKING
// ═══════════════════════════════════════════════════════════════════════════

/* Every row is: what you did, and what it COSTS. A tick and a cross tell a
   student they were wrong; they do not tell them why anybody cares.
   Every row also says WHOSE rule it is. Two of the four are Dogtra's own
   words; two are Highland Canine's teaching, and a student who cannot tell
   them apart will be caught out by an examiner holding the manual. */
function grade() {
  var rows = [], vc = vClock(), vt = vTension(), vco = vCoat();
  var d = deg(), g = groomNow();

  var hb = hBand();
  rows.push(hb === 'ok'
    ? { k: 'Height on the neck', src: 'Highland Canine', v: 'ok',
        was: 'High on the neck, behind the ears.',
        say: 'The neck is narrowest here and the skin is thinnest, so the points sit where they can reach it. It is also the one place a strap will not walk to somewhere worse. The manual sets no height — this one is ours.' }
    : hb === 'high'
      ? { k: 'Height on the neck', src: 'Highland Canine', v: 'no',
          was: 'Past the neck — up on the jaw.',
          say: 'Behind the ears is the TOP of the neck, not the head. Look at the dog: the strap is across the cheek and the box is under the chin. There is no collar on that neck.',
          cost: 'The strap has nothing to sit on. The skull is wider than the neck, so it drops the moment the dog moves, and until it does the points are on jaw muscle and bone — nowhere near the skin beside the windpipe. Come back down until the strap is tucked up under the jaw and sitting on neck.' }
    : hb === 'mid'
      ? { k: 'Height on the neck', src: 'Highland Canine', v: 'near', was: 'Mid-neck.',
          say: 'It works this minute.',
          cost: 'It will not stay there. A collar this low migrates down onto the shoulder over a session, a few millimetres at a time, and you will not see it happen — you will see a dog that has stopped answering.' }
      : { k: 'Height on the neck', src: 'Highland Canine', v: 'no', was: 'Down on the shoulder.',
          say: 'The neck is at its thickest here and the points are on muscle and coat, not skin.',
          cost: 'The dog stops answering, so the handler winds the dial up. Then the collar shifts back up the neck at a shake and the level you built on a dog that could not feel it lands all at once.' });

  rows.push(vc === 'ok'
    ? { k: 'Position round the neck', src: 'Manual p.27', v: 'ok',
        was: clockLabel(set.clock) + ' — beside the windpipe.',
        say: 'Dogtra says one thing about location and you are on it: the best location is on either side of the dog’s windpipe (p.27). Staying off the crest as well is Highland Canine’s addition, not the manual’s.' }
    : (d > Z_PIPE[0] && d < Z_PIPE[1])
      ? { k: 'Position round the neck', src: 'Manual p.27', v: 'no',
          was: clockLabel(set.clock) + ' — on the windpipe.',
          say: 'Never here. The housing is sitting on the trachea, and the manual puts it beside the windpipe, not under it.',
          cost: 'A dog that hits the end of a lead is hurt by the collar before any stimulation is involved. It will cough, then it will start fighting the collar, and you will spend a week undoing that.' }
      : inBands(d, Z_CREST)
        ? { k: 'Position round the neck', src: 'Highland Canine', v: 'no',
            was: clockLabel(set.clock) + ' — on top of the neck.',
            say: 'The crest is thick muscle under the heaviest coat on the dog. The manual does not name the crest; this one is ours, and it is about whether the points can reach skin at all.',
            cost: 'The points cannot get near skin, and a box up here has nothing to sit against — it rolls to one side the first time the dog shakes, and then you have no idea where it is.' }
        : { k: 'Position round the neck', src: 'Manual p.27', v: 'near',
            was: clockLabel(set.clock) + ' — on the side, riding high.',
            say: 'On the side of the neck, but up toward the crest rather than beside the windpipe.',
            cost: 'Bring it down to 4 or 8 o\'clock. Up here one point is on muscle and one is on skin, so contact is half of what you think it is.' });

  rows.push(vt === 'ok'
    ? { k: 'Strap tension', src: 'Manual p.27', v: 'ok', was: 'Two fingers under the strap.',
        say: 'The manual’s own test, word for word: you should be able to fit two fingers underneath the collar strap. Check it again after ten minutes of work — a coat flattens, and a strap set on a dry dog goes slack on a wet one.' }
    : slackAt(set.tension) > SNUG[1]
      ? { k: 'Strap tension', src: 'Manual p.27', v: 'no', was: 'Loose. More than two fingers.',
          say: 'The collar turns as the dog moves and the box ends up under the throat.',
          cost: 'Contact comes and goes, so the correction the dog feels stops matching the one you sent — you are training with a signal that changes at random. And p.43 is blunt about it: if the dog is not reacting, the first thing to check is that the strap is tight enough for both points to touch skin.' }
      : { k: 'Strap tension', src: 'Manual p.27', v: 'no', was: 'Tight. Two fingers will not go under it.',
          say: 'You are compressing the neck. Two fingers is a ceiling as well as a floor.',
          cost: 'Left on, this is how you get pressure sores under the points — and a dog that has learned the collar hurts before you have used it once.' });

  rows.push(coatRow(vco, g));

  var pass = 0;
  for (var i = 0; i < rows.length; i++) if (rows[i].v === 'ok') pass++;
  return { rows: rows, pass: pass };
}

/* Decision 4 gets its own function because it is the one the tab exists for,
   and because it is the one that was wrong last round. Nothing in here claims
   Dogtra supplies a part it does not supply, and the manual's own remedy —
   p.43, trim the hair down — is a route to a pass rather than a footnote. */
function coatRow(v, g) {
  var K = 'The coat between points and skin';
  var C = coat.phrase;

  if (v === 'no') {
    return { k: K, src: 'Manual p.27 + p.43', v: 'no',
      was: g.id === 'part'
        ? 'Coat parted by hand on a ' + C + ' — and it closed over.'
        : 'Nothing done about a ' + C + '.',
      say: g.id === 'part'
        ? 'A dense winter undercoat does not stay parted. The hair is back between the points before the dog has left the yard, and neither point is on skin.'
        : 'The points stop in the fur. Neither one is on skin.',
      cost: 'The dog feels nothing at ANY level, so the handler climbs the dial on a dog that physically cannot answer. Then the coat parts, or the dog goes through water, and the whole of that level arrives at once. This is the failure that hurts dogs. Dogtra’s own fix is on p.43: the points may be too short for a thick or long coat, so trim the hair down on the dog’s neck until both points are touching skin.' };
  }

  if (v === 'near' && g.id === 'longp') {
    return { k: K, src: 'Not manual', v: 'near',
      was: 'Longer contact points fitted on a ' + C + '.',
      say: 'Geometrically that works — the points now clear the coat and land on skin.',
      cost: 'It works only if you own them. The 1900X box list on p.6 is receiver, strap, transmitter, splitter cable, quick start guide, belt clip, antenna and hinge, non-stimulation contacts, test light, lanyard — no longer points, and the manual never mentions post lengths anywhere. Dogtra’s answer to this dog is p.43: trim the hair down at the two contact spots. Learn that one. It is in your hands on any dog, on any day, with no part to order.' };
  }

  if (v === 'near') {          // clipped a coat that did not need clipping
    return { k: K, src: 'Manual p.43', v: 'near',
      was: 'Neck clipped on a ' + C + ' that did not need it.',
      say: 'The points would have reached skin through this coat on their own.',
      cost: 'Not a welfare failure, but you have taken hair off somebody’s dog for nothing and told the owner their dog needed clipping to wear a collar. p.43 says trim when the points are too short for the coat — reach for the clippers then, not before. Part it and look first.' };
  }

  if (g.id === 'clip') {
    return { k: K, src: 'Manual p.43', v: 'ok',
      was: 'Neck clipped at the two contact spots, ' + C + '.',
      say: 'Both points are on skin. This is Dogtra’s own answer to a coat the points cannot get through (p.43): the contact points may be too short for a thick or long coat, so trim down the hair on the dog’s neck until both are touching the skin. Two minutes and a pair of clippers, and it works on every dog you will ever be handed.' };
  }

  return { k: K, src: 'Manual p.27', v: 'ok',
    was: g.id === 'part' ? 'Coat parted under each point, ' + C + '.'
                         : 'Left as it lies on a ' + C + '.',
    say: 'The points reach skin through this coat, which is the manual’s first target on p.27 — the contact points press firmly against the dog’s skin. Part the coat and look before you buckle up. That is the check, every dog, every time, and it is free.' };
}

// ═══════════════════════════════════════════════════════════════════════════
//  DOM
// ═══════════════════════════════════════════════════════════════════════════

function seg(name, items, current, onPick) {
  var wrap = el('div', 'fit-seg');
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', name);
  var btns = [];
  items.forEach(function (it) {
    var b = el('button', 'fit-segb', it.name);
    b.type = 'button';
    b.setAttribute('aria-pressed', it.id === current ? 'true' : 'false');
    b.addEventListener('click', function () {
      for (var j = 0; j < btns.length; j++) {
        btns[j].setAttribute('aria-pressed', btns[j] === b ? 'true' : 'false');
      }
      onPick(it);
    });
    wrap.appendChild(b);
    btns.push(b);
  });
  return { node: wrap, btns: btns, items: items };
}

/* Decision 4 gets a list rather than a row of pills, because each choice needs
   a sentence and a source beside it. Which of these four is manufacturer
   instruction and which is doctrine IS the lesson; a segmented control cannot
   carry that. */
function opts(name, items, current, onPick) {
  var wrap = el('div', 'fit-opts');
  wrap.setAttribute('role', 'radiogroup');
  wrap.setAttribute('aria-label', name);
  var btns = [];
  items.forEach(function (it) {
    var b = el('button', 'fit-opt');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', it.id === current ? 'true' : 'false');
    var top = el('span', 'fit-opt-h');
    top.appendChild(el('b', null, it.name));
    if (it.src) top.appendChild(el('em', 'fit-opt-s', it.src));
    b.appendChild(top);
    b.appendChild(el('span', 'fit-opt-n', it.note));
    b.addEventListener('click', function () {
      for (var j = 0; j < btns.length; j++) {
        btns[j].setAttribute('aria-checked', btns[j] === b ? 'true' : 'false');
      }
      onPick(it);
    });
    wrap.appendChild(b);
    btns.push(b);
  });
  return { node: wrap, btns: btns, items: items };
}

function decision(n, label, hint, src) {
  var li = el('li', 'fit-dec');
  var head = el('div', 'fit-dec-h');
  head.appendChild(el('span', 'fit-dec-n', String(n)));
  var lab = el('div', 'fit-dec-l');
  lab.appendChild(el('b', null, label));
  if (hint) lab.appendChild(el('span', null, hint));
  head.appendChild(lab);
  var flag = el('span', 'fit-flag');
  head.appendChild(flag);
  li.appendChild(head);
  if (src) {
    var t = el('p', 'fit-src' + (src.man ? ' is-man' : ''), src.t);
    li.appendChild(t);
  }
  return { node: li, flag: flag };
}

function slider(id, min, max, value, aria, onIn) {
  var r = document.createElement('input');
  r.type = 'range';
  r.className = 'fit-range';
  r.id = id;
  r.min = String(min); r.max = String(max); r.step = '1';
  r.value = String(value);
  r.setAttribute('aria-label', aria);
  r.addEventListener('input', onIn);
  return r;
}

function buildUI(pane) {
  host = el('div', 'fit');

  // ── the model half ───────────────────────────────────────────────────────
  var left = el('div', 'fit-3d');
  host.appendChild(left);

  // ── the working rail ─────────────────────────────────────────────────────
  rail = el('div', 'fit-rail');
  var inner = el('div', 'fit-rail-in');
  rail.appendChild(inner);
  host.appendChild(rail);

  var head = el('div', 'fit-head');
  var k = el('p', 'fit-k');
  k.appendChild(el('i'));
  k.appendChild(el('span', null, '03 · Drill'));
  head.appendChild(k);
  head.appendChild(el('h2', 'fit-h', 'Fit the collar'));
  /* WHOSE RULE IS WHOSE, ON SCREEN, BEFORE THE FIRST DECISION.
     The old subtitle said "three are the manual's own targets (p.27)", which
     counted the height decision as manufacturer instruction. The manual gives
     no height at all. */
  head.appendChild(el('p', 'fit-s',
    'Four decisions. Two are Dogtra’s own words — two fingers under the strap, and beside the windpipe (p.27). Where on the neck is Highland Canine’s: the manual sets no height. The fourth is how you actually meet the manual’s first target, points on skin.'));
  inner.appendChild(head);

  // the dog today
  var blk = el('div', 'fit-blk');
  blk.appendChild(el('p', 'fit-lab', 'The dog in front of you'));
  ui.coatSeg = seg('The dog’s coat today', COATS, coat.id, function (it) {
    coat = it;
    ui.coatNote.textContent = it.when + '. ' + it.note;
    changed();
  });
  blk.appendChild(ui.coatSeg.node);
  ui.coatNote = el('p', 'fit-note', coat.when + '. ' + coat.note);
  blk.appendChild(ui.coatNote);
  inner.appendChild(blk);

  // the section — sticky, because a live diagram that scrolls away while you
  // work the control it answers is not a live diagram
  var fig = el('figure', 'fit-sec');
  SEC = buildSection();
  fig.appendChild(SEC.svg);
  fig.appendChild(el('figcaption', 'fit-cap',
    'Live, and measured off the model. The outline is this dog’s neck at the height you have set; panel A is the same numbers at eight times the size.'));
  inner.appendChild(fig);

  // the four decisions
  var ol = el('ol', 'fit-decs');

  var d1 = decision(1, 'Height on the neck', 'shoulder → behind the ears',
    { t: 'Highland Canine doctrine. The manual gives no height.', man: false });
  ui.f1 = d1.flag;
  ui.r1 = slider('fitHeight', 0, 100, Math.round(set.height * 100),
    'Height on the neck, 0 at the shoulder to 100 behind the ears', function (e) {
      set.height = (+e.target.value) / 100; changed();
    });
  d1.node.appendChild(ui.r1);
  ui.v1 = el('p', 'fit-read');
  d1.node.appendChild(ui.v1);
  ol.appendChild(d1.node);

  var d2 = decision(2, 'Position round the neck', 'walk it round the clock',
    { t: 'Manual p.27 — “on either side of the dog’s windpipe”.', man: true });
  ui.f2 = d2.flag;
  ui.r2 = slider('fitClock', 0, 359, Math.round(deg()),
    'Position round the neck in degrees, 0 on top, 180 on the windpipe', function (e) {
      set.clock = ((+e.target.value) / 360) * Math.PI * 2; changed();
    });
  d2.node.appendChild(ui.r2);
  ui.v2 = el('p', 'fit-read');
  d2.node.appendChild(ui.v2);
  var face = el('button', 'fit-mini', 'Turn the dog to face this');
  face.type = 'button';
  face.addEventListener('click', function () {
    frame(false, faceDir());
    EC.announce('Turned to look at the receiver.');
  });
  d2.node.appendChild(face);
  ol.appendChild(d2.node);

  var d3 = decision(3, 'Strap tension', 'loose → tight',
    { t: 'Manual p.27 — “fit two fingers underneath the collar strap”.', man: true });
  ui.f3 = d3.flag;
  ui.r3 = slider('fitTension', 0, 100, Math.round(set.tension * 100),
    'Strap tension, 0 loose to 100 tight', function (e) {
      set.tension = (+e.target.value) / 100; changed();
    });
  d3.node.appendChild(ui.r3);
  ui.v3 = el('p', 'fit-read');
  d3.node.appendChild(ui.v3);
  ol.appendChild(d3.node);

  var d4 = decision(4, 'The coat between points and skin', 'the coat is the variable, not the collar',
    { t: 'Manual p.27 (“press firmly against the dog’s skin”) and p.43.', man: true });
  ui.f4 = d4.flag;
  d4.node.appendChild(el('p', 'fit-q',
    'The points are the length Dogtra fitted them. So the question is what you do about the coat in the way.'));
  ui.groomOpts = opts('What you do about the coat', GROOM, set.groom, function (it) {
    set.groom = it.id; changed();
  });
  d4.node.appendChild(ui.groomOpts.node);
  ui.v4 = el('p', 'fit-read');
  d4.node.appendChild(ui.v4);
  /* Direction-neutral on purpose: the section is beside the controls at desk
     width and above them on a phone, and copy that says "on the right" is
     wrong on half the screens this is taught on. */
  d4.node.appendChild(el('p', 'fit-hid',
    'You cannot see this one on the dog — the coat hides it, which is exactly why it gets skipped. Panel A of the section is the only place it shows.'));
  ol.appendChild(d4.node);

  inner.appendChild(ol);

  /* THE WELFARE RULE SITS BETWEEN THE STUDENT AND THE BUTTON.
     It is on manual p.27 with the other targets, and the previous build never
     carried it at all. Putting it at the foot of a scroller is the same as not
     having it; the student has to pass it to reach "Check the fit". */
  var wel = el('aside', 'fit-wel');
  wel.appendChild(el('p', 'fit-wel-k', 'Wear limits · manual p.27'));
  var wl = el('ul', 'fit-wel-l');
  [['Move it', 'Reposition the receiver on the neck every few hours — a good fit left in one place is still a pressure sore.'],
   ['Off after eight hours', 'Take the collar off after eight hours of wear. Not "when you remember".'],
   ['Look at the skin', 'Check under both points every time it comes off: redness, a flattened patch, any break in the skin.']
  ].forEach(function (r) {
    var li = el('li');
    li.appendChild(el('b', null, r[0]));
    li.appendChild(el('span', null, r[1]));
    wl.appendChild(li);
  });
  wel.appendChild(wl);
  inner.appendChild(wel);

  ui.check = el('button', 'fit-check', 'Check the fit');
  ui.check.type = 'button';
  ui.check.addEventListener('click', showVerdict);
  inner.appendChild(ui.check);

  var again = el('button', 'fit-reset', 'Start over');
  again.type = 'button';
  again.addEventListener('click', reset);
  inner.appendChild(again);

  // ── the marking card ─────────────────────────────────────────────────────
  ui.card = el('div', 'fit-card');
  ui.card.setAttribute('hidden', '');
  ui.card.setAttribute('role', 'dialog');
  ui.card.setAttribute('aria-label', 'How the fit was marked');
  /* At 414 the card is the whole pane, so Escape has to work — otherwise a
     student on a phone whose thumb misses the Close pill has no way back to
     the dog except a reload. */
  ui.card.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape' && ev.key !== 'Esc') return;
    ev.stopPropagation();
    hideVerdict();
    ui.check.focus();
  });
  host.appendChild(ui.card);

  pane.appendChild(host);
}

function reset() {
  set.height = 0.12; set.clock = 0; set.tension = 0.18; set.groom = 'asis';
  coat = COATS[2];
  ui.r1.value = '28'; ui.r2.value = '0'; ui.r3.value = '18';
  var i;
  for (i = 0; i < ui.groomOpts.btns.length; i++) {
    ui.groomOpts.btns[i].setAttribute('aria-checked',
      ui.groomOpts.items[i].id === 'asis' ? 'true' : 'false');
  }
  for (i = 0; i < ui.coatSeg.btns.length; i++) {
    ui.coatSeg.btns[i].setAttribute('aria-pressed',
      ui.coatSeg.items[i].id === coat.id ? 'true' : 'false');
  }
  ui.coatNote.textContent = coat.when + '. ' + coat.note;
  hideVerdict();
  changed();
  EC.announce('Drill reset.');
}

var FLAG = { ok: '✓', near: '!', no: '✕' };

/* "the strap and the housing", not "the strap, the housing". The veto row is
   the one line a student reads when something has gone wrong with the app
   itself, so it had better be a sentence. */
function listOut(a) {
  if (a.length < 2) return a[0] || '';
  return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
}

function readouts() {
  var vh = vHeight(), vc = vClock(), vt = vTension(), vco = vCoat();
  var sl = slackAt(set.tension);

  /* Read straight off hBand(). Written twice, it said "High on the neck,
     behind the ears" over a strap wrapped round the dog's muzzle. */
  var hb = hBand();

  /* 'high' spans two different pictures, so it cannot have one sentence.
     Just above the band the strap is still plainly round the neck — it is
     only too high for doctrine. Saying "round the jaw" there is a claim about
     the picture that the picture refutes, which is the exact fault this whole
     module keeps being sent back for, only inverted. sectionOval is the same
     measurement the off-neck check uses, so the words change where the
     anatomy does. */
  ui.v1.textContent = hb === 'ok'
      ? (set.height <= (H_OK[0] + H_OK[1]) / 2
          ? 'High on the neck, clear of the shoulder'
          : 'High on the neck, behind the ears')
    : hb === 'high' ? (set.height < JAW_H
        ? 'Riding up onto the head — higher than the collar should sit'
        : 'Past the neck — the strap is round the jaw')
    : hb === 'mid'  ? 'Mid-neck'
    : 'Low — down on the shoulder';
  ui.v2.textContent = clockLabel(set.clock) +
    (vc === 'ok' ? ' — beside the windpipe'
     : (deg() > Z_PIPE[0] && deg() < Z_PIPE[1]) ? ' — on the windpipe'
     : inBands(deg(), Z_CREST) ? ' — on top of the neck'
     : ' — high on the side');
  ui.v3.textContent = sl > SNUG[1] ? 'Loose — more than two fingers'
    : sl < SNUG[0] ? 'Tight — two fingers will not go under'
    : 'Two fingers under the strap';
  ui.v4.textContent = !reaches()
    ? 'The points stop in this coat — no contact at all, at any level.'
    : vco === 'near' && set.groom === 'longp'
      ? 'They reach skin — with a pair Dogtra does not put in the box.'
      : vco === 'near'
        ? 'They reach skin. They would have reached it without clipping too.'
        : 'Both points reach skin through this coat.';

  var f = [[ui.f1, vh], [ui.f2, vc], [ui.f3, vt], [ui.f4, vco]];
  for (var i = 0; i < f.length; i++) {
    f[i][0].className = 'fit-flag is-' + f[i][1];
    f[i][0].textContent = FLAG[f[i][1]];
  }
}

function rebuild3d() {
  if (!built) return;
  buildStrap();
  buildReceiver();
}

function changed() {
  rebuild3d();
  updateSection();
  readouts();
  if (verdictOn) hideVerdict();
}

// ── the marking card ────────────────────────────────────────────────────────
function hideVerdict() {
  verdictOn = false;
  ui.card.setAttribute('hidden', '');
  host.classList.remove('is-marked');
}

/* The welfare paragraph used to be the LAST thing in a card that scrolled, so
   on a pass — the only time it appears — it was cut mid-sentence behind the
   Done button with nothing to say there was more. It is now the first thing
   under the score, where it cannot be clipped, and the body carries a
   more-below chip besides. */
function showVerdict() {
  var g = grade();
  /* THE GUARD RUNS BEFORE THE CARD IS BUILT, and it can veto every word of it.
     If the collar on the screen is not the collar this card would be marking,
     the card does not mark. It says so instead. */
  var pic = pictureCheck();
  var card = ui.card;
  while (card.firstChild) card.removeChild(card.firstChild);

  var tone = !pic.ok ? 'no' : g.pass === 4 ? 'ok' : g.pass >= 2 ? 'near' : 'no';
  var head = el('div', 'fit-card-h is-' + tone);
  var ht = el('div', 'fit-card-ht');
  ht.appendChild(el('p', 'fit-card-score', pic.ok ? g.pass + ' of 4' : 'Not marked'));
  ht.appendChild(el('p', 'fit-card-say',
    !pic.ok ? 'The picture and the score disagree. Nothing on this card is a pass.'
    : g.pass === 4 ? 'Fitted correctly. Put this collar on that dog.'
    : g.pass >= 2 ? 'Not on the dog yet. Fix these, then check again.'
    : 'Do not work a dog in this. Every line below is a real failure.'));
  head.appendChild(ht);
  var x = el('button', 'fit-card-x', 'Close');
  x.type = 'button';
  x.addEventListener('click', function () { hideVerdict(); ui.check.focus(); });
  head.appendChild(x);
  card.appendChild(head);

  var bw = el('div', 'fit-card-bw');
  var body = el('div', 'fit-card-b');

  /* The welfare paragraph belongs to a pass. A vetoed card is not one, so it
     does not get it — the first thing under a vetoed score is the veto. */
  if (!pic.ok) {
    var bad = el('div', 'fit-row is-no');
    bad.appendChild(el('i', 'fit-row-m', FLAG.no));
    var bt = el('div', 'fit-row-t');
    var bk = el('div', 'fit-row-kh');
    bk.appendChild(el('b', 'fit-row-k', 'The picture and the score disagree'));
    bk.appendChild(el('em', 'fit-row-src', 'App check'));
    bt.appendChild(bk);
    bt.appendChild(el('p', 'fit-row-was',
      pic.miss.length ? 'Not on the dog on screen: ' + listOut(pic.miss) + '.'
                      : 'The collar on screen is not on the neck.'));
    bt.appendChild(el('p', 'fit-row-say',
      !pic.onNeck
        ? 'The strap is round the jaw, not the neck. Whatever the four decisions below say, that is not a fitted collar — bring the height down until the strap is tucked up under the jaw and sitting on neck.'
        : 'The four decisions below were marked against a collar you cannot see. Marking that would teach you to trust a score over the dog in front of you, so this app will not do it.'));
    var bc = el('p', 'fit-row-cost');
    bc.appendChild(el('b', null, 'What to do · '));
    bc.appendChild(document.createTextNode(
      'Move the sliders until you can see the strap, the box and both points on the neck, then check again. If they will not appear, tell whoever maintains this app — the drill is broken, not you.'));
    bt.appendChild(bc);
    bad.appendChild(bt);
    body.appendChild(bad);
  }

  if (pic.ok && g.pass === 4) {
    var w = el('p', 'fit-card-w');
    w.appendChild(el('b', null, 'Now start the clock. '));
    w.appendChild(document.createTextNode(
      'Move the receiver to a new spot every few hours and take the collar off after eight. ' +
      'Check the skin under both points every time. Manual p.27 — a correct fit is not a fit you can leave on.'));
    body.appendChild(w);
  }

  g.rows.forEach(function (r) {
    var row = el('div', 'fit-row is-' + r.v);
    var m = el('i', 'fit-row-m', FLAG[r.v]);
    var tx = el('div', 'fit-row-t');
    var kh = el('div', 'fit-row-kh');
    kh.appendChild(el('b', 'fit-row-k', r.k));
    if (r.src) kh.appendChild(el('em', 'fit-row-src' + (r.src.indexOf('Manual') === 0 ? ' is-man' : ''), r.src));
    tx.appendChild(kh);
    tx.appendChild(el('p', 'fit-row-was', r.was));
    tx.appendChild(el('p', 'fit-row-say', r.say));
    if (r.cost) {
      var c = el('p', 'fit-row-cost');
      c.appendChild(el('b', null, 'What it costs · '));
      c.appendChild(document.createTextNode(r.cost));
      tx.appendChild(c);
    }
    row.appendChild(m);
    row.appendChild(tx);
    body.appendChild(row);
  });

  bw.appendChild(body);
  var more = el('div', 'fit-card-more', 'More below');
  more.setAttribute('aria-hidden', 'true');
  bw.appendChild(more);
  card.appendChild(bw);

  var foot = el('div', 'fit-card-f');
  var go = el('button', 'fit-card-go',
    (pic.ok && g.pass === 4) ? 'Done — back to the dog' : 'Back to the dog');
  go.type = 'button';
  go.addEventListener('click', function () { hideVerdict(); ui.check.focus(); });
  foot.appendChild(go);
  card.appendChild(foot);

  card.removeAttribute('hidden');
  host.classList.add('is-marked');
  verdictOn = true;
  body.scrollTop = 0;

  function moreCheck() {
    var over = body.scrollHeight - body.clientHeight;
    var atEnd = body.scrollTop >= over - 6;
    bw.classList.toggle('is-scrolly', over > 6 && !atEnd);
  }
  body.addEventListener('scroll', moreCheck);
  moreCheck();
  /* The rail's own layout settles a frame late on a narrow screen, so the
     first measurement can be taken against a body that has not been sized. */
  requestAnimationFrame(moreCheck);

  x.focus();
  EC.announce((pic.ok ? 'Marked ' + g.pass + ' of 4. '
                      : 'Not marked. The picture and the score disagree. ') +
    g.rows.map(function (r) { return r.k + ': ' + r.was; }).join(' '));
}

// ═══════════════════════════════════════════════════════════════════════════
//  MOUNT
// ═══════════════════════════════════════════════════════════════════════════

function startModel() {
  if (built || starting) return;
  starting = true;

  EC.mesh('dog').then(function (gltf) {
    stage.setModel(gltf.scene);
    rig = new THREE.Group();
    stage.scene.add(rig);
    /* The housing is a bonus. If the receiver mesh will not read, a block
       stands in and every one of the four decisions still works. */
    return EC.mesh('receiver').then(function (rx) {
      housing = extractHousing(EC.normalise(rx.scene));
    })['catch'](function () { housing = null; });
  }).then(function () {
    built = true;
    starting = false;
    rebuild3d();
    /* The stage clamps the camera a breath short of the poles, which is right
       for a hand-held unit and wrong for a dog: a student who ends up looking
       at the top of the skull has lost the collar entirely. Walk round it at
       roughly working height instead. */
    stage.controls.minPolarAngle = THREE.MathUtils.degToRad(50);
    stage.controls.maxPolarAngle = THREE.MathUtils.degToRad(101);
    stage.controls.minDistance = 0.22;
    stage.controls.maxDistance = 1.9;
    frame(true);
    updateSection();
    readouts();
  })['catch'](function () {
    starting = false;
    /* EC.mesh has already put its own card in this pane and brought the
       written reference back. Nothing to add, and nothing to log: an error in
       the console is a failed gate, not a diagnosis. */
  });
}

function mount() {
  var pane = EC.pane(TAB);
  if (!pane || host) return;
  stage = EC.stage(TAB);
  if (!stage) return;

  buildUI(pane);

  // the stage lives inside my layout rather than filling the pane
  stage.el.classList.remove('st-fill');
  host.querySelector('.fit-3d').appendChild(stage.el);

  /* The shell's Reset view restarts its idle turn. That is right for an object
     you are inspecting and wrong for a drill: a model that drifts under the
     hand while the student is reading a slider is a model that has to be
     caught. The shell's own handler runs first and sets it; this runs after
     and puts it back, without removing anything the shell does. */
  var rv = stage.el.querySelector('.st-btn');
  if (rv) {
    rv.addEventListener('click', function () {
      stage.spin = false;
      frame(false, HOME_DIR);      // reset means the OPENING view, not the last one
    });
  }

  /* Re-frame on a resize, but only while the student has not taken the camera
     themselves. Snapping a view somebody has just set is worse than a slightly
     loose crop. */
  stage.controls.addEventListener('start', function () { touched = true; });
  if (window.ResizeObserver) {
    var raf = 0, lastW = 0, lastH = 0;
    new ResizeObserver(function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var w = host.clientWidth, h = host.clientHeight;
        if (w === lastW && h === lastH) return;
        lastW = w; lastH = h;
        if (built && !touched) frame(true);
      });
    }).observe(host);
  }
}

EC.onEnter(TAB, function () {
  mount();
  if (!stage) return;
  stage.activate();
  stage.resize();
  startModel();
  if (built && !touched) frame(true);
});

EC.onLeave(TAB, function () {
  if (stage) stage.deactivate();
});

/* ── shared with tab 4 ──────────────────────────────────────────────────────
   The working-level tab stands the same dog in front of the student wearing
   the same collar, and the fit it shows there has to be literally the fit they
   were marked 4 of 4 for here. All of this was measured off dog.glb, so it
   lives in one place: if the mesh is ever replaced there is one set of numbers
   to redo, not two. Published only if nobody has published it already, so two
   modules loading in either order cannot clobber each other.

   strapFace and makeReceiverMesh now take the receiver's clock angle as a last
   argument. It is optional: leave it out and the strap presses everywhere,
   which is the right fallback for a caller that only wants a snug collar. */
if (!window.CollarKit) {
  window.CollarKit = {
    NECK: NECK,
    centreAt: centreAt, radiusAt: radiusAt, dirAt: dirAt,
    strapFace: strapFace, strapPoint: strapPoint, slackAt: slackAt,
    strapOff: strapOff, pressAt: pressAt,
    makeStrapGeom: makeStrapGeom, makeReceiverMesh: makeReceiverMesh,
    extractHousing: extractHousing,
    SNUG: SNUG.slice(),
    mats: mats,
    /* The fit tab 4 should show unless the student has been told otherwise.
       height was 0.72, which this tab now marks as a FAIL: 0.72 puts the strap
       across the cheek and the housing under the mandible, with the neck bare
       below. 0.49 is the middle of the MEASURED pass band, so the collar tab 4
       stands the dog in is literally the one a student is marked 4 of 4 for
       here. See the header for how [0.42, 0.56] was measured.

       NOTE FOR LEVEL: level.js READS THIS at load, with a hardcoded fallback
       matching it for when a student opens tab 4 without ever opening tab 3.
       It used to carry its own FIT = { height: 0.80, ... }, which this module
       scores 3 of 4 as "round the jaw" — so the drill failed a fit that the
       next tab displayed as the reference. Do not reintroduce a second copy of
       these numbers anywhere. If you change goodFit, tab 4 follows. */
    goodFit: { height: 0.49, clock: (140 / 360) * Math.PI * 2, tension: 0.53 },
    /* Published so nobody has to re-derive the band. See the header. */
    okHeight: H_OK.slice()
  };
}

/* Read-only, for verification. It reports; it does not drive. */
window.FitDrill = {
  probe: function () {
    var slack = slackAt(set.tension);
    var pic = pictureCheck();
    return {
      built: built,
      set: { height: set.height, clock: deg(), tension: set.tension, groom: set.groom },
      coat: coat.id,
      coatDepth: coat.depth, effDepth: effDepth(), postLen: postLen(),
      reaches: reaches(),
      slack: slack, squeeze: squeezeAt(slack),
      strapProudAtRx: strapOff(set.clock, slack, set.clock),
      pass: grade().pass,
      rows: grade().rows.map(function (r) { return r.k + '=' + r.v; }),
      /* the guard, so a sweep can check the picture as well as the score */
      hBand: hBand(),
      oval: sectionOval(set.height),
      strapDrawn: drawn(strapMesh),
      housingDrawn: drawn(boxMesh),
      pointsDrawn: (postMeshes[0] ? drawn(postMeshes[0]) : false) &&
                   (postMeshes[1] ? drawn(postMeshes[1]) : false),
      pictureOk: pic.ok, pictureMiss: pic.miss, onNeck: pic.onNeck
    };
  }
};

})();
