/* ============================================================================
   TAB 3 · FIT THE COLLAR
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

   The manual gives NO height on the neck. Decision 1 is course doctrine and
   every screen that carries it says so.

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
    src: 'Course doctrine' },
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
//  THE SECTION — the plate
//
//  Built once, then updated by attribute. Rebuilding a hundred nodes on every
//  frame of a slider drag is how a live diagram turns into a stutter.
//
//  ── WHAT CHANGED THIS ROUND, AND WHY ──────────────────────────────────────
//  THE ANATOMY WAS RIGHT AND NOBODY COULD SEE IT. The note back on the last
//  round was that the plate is genuinely an anatomical section when you blow
//  it up eight times, and that it ships at 91 x 91 CSS px beside a 1440 px
//  dog — a 20 px windpipe, 2.9 px contact points, and not one line in the
//  drawing reaching a whole device pixel. So this round is mostly arithmetic,
//  and all of it is measured in the running app:
//
//   A. THE SIZE. Three things were eating the plate and all three are gone.
//      The annotation ring stood 0.078 model units off the coat — 78% of the
//      neck's own radius — so the ring was twice the diameter of the section
//      inside it; the band is at 0.0455 now and the twelve index marks
//      straddle it instead of standing outside it. The key printed seven
//      names; Coat and Skin are named in panel A on the very stack that
//      measures them and the crest is a zone, so four are left. And the rail
//      went from 38% of the pane to 47%. Net: K 470 -> 720, the sheet
//      460x266 -> 460x350, the rendered sheet 506 -> 656 px at 1440. The
//      windpipe is 28.5 units wide instead of 18.6 and lands at 40.6 CSS px.
//   B. THE WINDPIPE IS FINDABLE. Its lumen was filled #FBF8F1, a hair off the
//      fascia behind it, so the one structure the manual names by name had
//      less weight than the muscle around it. The lumen is the darkest thing
//      inside the outline now and the ring behind it shows through the way an
//      oblique cut shows it — which this comment has claimed for two rounds
//      while the drawing carried a single arc.
//   C. THE VERTEBRA IS ONE BONE. It was a straight-sided polygon with sharp
//      corners in a picture where everything else is a spline, with the body
//      floating visibly detached from the arch. It is one closed spline from
//      the ventral crest round to the spine, and it is COOL — blue-grey
//      against warm tissue, the way _work/neck-ref.png draws it. Ivory on
//      ivory gave it an outline and no weight.
//   D. THE VERDICT WORD IS OFF THE SPECIMEN. "two fingers" / "too loose" was
//      printed across the strap ring with a paper casing that punched a hole
//      in the strap it was measuring, and the chip under the plate already
//      said it. The dimension stays; the word is gone.
//   E. THE RING IS LEGENDED, the centre mark is dashed annotation ink instead
//      of a solid grey line through the bone, "x8" has a margin, the plate
//      titles are --ink-2 (6.70:1) instead of --ink-3 (3.39:1), and every
//      stroke on the sheet clears one device pixel at 414.
//
//  ── AND THE ROUND BEFORE THAT ─────────────────────────────────────────────
//  The note then was "it doesn't look premium or real", and it was right about
//  five specific things, all of them visible in the screenshot that came with
//  it:
//
//   1. TEXT LEFT ITS PANEL. "coat / parted / skin" ran into the right edge and
//      "never touched" sat on top of the skin block. The root <svg> clips at
//      the viewBox SILENTLY, so nothing complained. Every string on this plate
//      is now MEASURED after it is set — fitText() reads getBBox(), squeezes
//      with textLength only if it must, and then shifts the box back inside
//      its own panel. Guessing at string widths is what shipped that bug.
//   2. THE NECK INTERIOR WAS A BLOB — a "+" and a circle standing in for a
//      dog. It now carries the real thing: the trachea with its C of cartilage
//      and the tracheal muscle closing it dorsally, the oesophagus just dorsal
//      to that, paired carotid sheaths with jugular and carotid in them, the
//      cervical vertebra with its canal and cord, the nuchal ligament on the
//      dorsal midline, four pairs of muscle bellies, skin as a layer of its
//      own, and the coat as real hair standing on it.
//
//      NONE of it is a pasted picture, and that is the point. Every landmark
//      is held in section-normalised coordinates — u across the neck, v down
//      it — mapped through radiusAt() at the height the student has set and
//      then clamped inside the measured skin outline. So the anatomy thickens
//      at the shoulder and narrows behind the ears exactly as the section
//      does, and it is still true at every height. A fixed drawing would stop
//      being true on the second slider step.
//
//      The windpipe is the heaviest structure on the plate on purpose. The one
//      thing the manual says about position (p.27) is "on either side of the
//      dog's windpipe", so a student has to be able to see at a glance that
//      the two points are beside this tube and not on top of it.
//   3. THE PALETTE. Dusty rose on sage on cream. It is one restrained
//      anatomical family now — see the ▓ SECTION PLATE ▓ block in style.css.
//      Orange marks the detail callout keyed A and explains nothing, which is
//      the house rule: at brand lightness it is 2.1:1 on paper.
//   4. TYPOGRAPHY. One scale, held: plate titles, anatomical labels,
//      measurements, verdicts. Numbers are tabular and dimensions are aligned.
//   5. PANEL A WAS A BAR CHART. It is now a section through strap, coat, skin
//      and flesh with two steel posts standing in it: the coat is hair at its
//      measured depth, the flesh is hatched the way a section is hatched, the
//      posts are turned metal with a domed tip, and the shortfall is a
//      dimensioned gap — extension lines, arrowheads, a value — the way an
//      engineering drawing marks one.
//
//  ── WHAT DID NOT CHANGE ───────────────────────────────────────────────────
//  Every value on this plate is still measured. The outline IS radiusAt() at
//  the chosen height; the strap ring IS strapOff(); panel A is postLen()
//  against effDepth() at exactly eight times the ring's own scale (MAG = 8*K,
//  so the "×8" is arithmetic and not a caption); the three verdicts read the
//  same vClock/vTension/vCoat the marking card reads, so the picture and the
//  score cannot disagree. "Points stop in the coat" is untouched.
//
//  ── TYPE IS NOW LIGHTER THAN THE SPECIMEN, ON PURPOSE ─────────────────────
//  The last round held every string at 14.4 SVG units, which made the key
//  labels physically larger than the structures they named: 15.85 px of
//  "Windpipe" against a 20.4 px windpipe. The plate title is 12.8 units and an
//  anatomical label 12.4 — one step down in size and two in weight — against a
//  windpipe that is now 40.6 px. At 414 the sheet is 408 px wide, which is
//  0.887 px per unit, so the smallest label on the smallest screen renders at
//  11.0 CSS px and the plate title at 11.4. Nothing on the sheet is squeezed
//  by textLength in any of the 24,024 states swept at 1440 and at 414.
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
function n1(v) { return (Math.round(v * 10) / 10); }

/* ── THE SHEET, AND WHY IT IS THE SIZE IT IS ────────────────────────────────
       0 ─────────────────────────── 306 │311│ 317 ────────── 460
         the section, in a 237-unit          panel A · the same
         band, with a four-name key          stack at eight times
       0 ── the ring's own legend ── 306
       0 ─────────────────────────────────────────────────────  460
         three verdicts, on the footer rule

   ── THE SIZE WAS THE WHOLE FAULT, SO IT WAS SOLVED AS ARITHMETIC ──────────
   The note back was that the anatomy is right and nobody will ever see it:
   the drawing that carries the lesson rendered 91 x 91 CSS px beside a
   1440 px dog, with a 20 px windpipe and 2.9 px contact points. It was not
   drawn too small by accident. Three things were eating the plate:

     1. THE ANNOTATION RING STOOD 0.078 MODEL UNITS OFF THE COAT — 78% of the
        neck's own radius — so the ring was twice the diameter of the section
        inside it and the section got half of half the sheet. The strap only
        ever reaches 0.0396 off the coat (slackAt(0) x 1.5, the loosest the
        slider goes) and the receiver's housing, which is always pressed flat
        under itself, reaches 0.0006 + 15/K. The band now sits at 0.0455 and
        the index marks straddle it: everything still clears, and the ring's
        outermost ink is at 0.0539 instead of 0.078+.
     2. THE KEY PRINTED SEVEN NAMES. Coat and Skin are named in panel A, on
        the very stack that measures them, and Crest is a zone, not a
        structure — it is named in the ring's legend where it belongs. Four
        interior names are left, so the column is 57 units instead of 71 and
        the leaders cannot run out of vertical room.
     3. THE RAIL. 38% of the pane held a 506 px sheet. It is 47% now.

   The result is arithmetic, not taste. K went 470 -> 720, the sheet 460x266
   -> 460x350, and the rendered sheet 506 -> 656 px at 1440. The windpipe is
   28.6 units wide instead of 18.6 and lands over 40 CSS px at 1440.

   ── WHAT BOUNDS IT AT 414, HONESTLY ───────────────────────────────────────
   At 414 the sheet can only be 408 px wide, and it is sticky above a rail
   570 px tall, so the plate cannot grow past about 310 px of height without
   leaving no room to work the sliders it answers. That fixes px-per-unit at
   0.887, and the windpipe lands at 25 px, not 40. K cannot be raised to make
   up the difference: at 720 the ring already fills 234 of the 237 units the
   section band is wide. The remaining lever is the phone, and it has been
   spent.                                                                   */
var VBW = 460, VBH = 350;
var HEADY = 15, RULEY = 22;    // plate title baseline, and the rule under it
/* ── THE SHEET HAS A MARGIN NOW, AND IT IS NOT DECORATION ──────────────────
   "LOOKING DOWN THE NECK" was set at x = 0 and measured back at x = 0.00: the
   first stem of the L stood exactly on the trim. Nothing was clipped, which is
   worse than being clipped — it means one step of font-size, one wider glyph,
   one different rendering of the same face, and the title loses ink silently,
   which is the failure mode this whole round was called to hunt. Three units
   is 2.7 px at 414 and 4.3 at 1440: enough that the loss would be visible
   before it was total, and enough that the sheet reads as a sheet. The title,
   the rule under it and the footer rule all sit on it, so the margin is a
   margin and not one indented string. */
var LEFTM = 3;
/* P1W and DETX are set by MEASUREMENT, not by eye — every string on this
   sheet is read back off getBBox() in the running app and held inside its own
   panel. A plate whose type is being compressed on every frame is a plate
   that does not fit. */
var SEC_Y0 = 27, SEC_Y1 = 291; // the band the section is drawn in
var P1W = 306;                 // the section plate, right edge
var DIVX = 311;                // the hairline between the plates
var DETX = 317;                // panel A's own origin
var P2W = VBW - DETX;          // 143
/* Where a leader turns, and where its label starts. Both moved 2 units left
   this round because the key now carries NINE names instead of five and the
   longest of them, "Spinal cord", measures 59.2 units against the 59 the old
   column had. Measured, not guessed: swept over every height, tension and
   clock angle, the outermost ink on the ring reaches x = 234.1 (the long index
   marks, at height 0), so a turn at 238 clears the specimen by 3.9 units with
   the leader's own paper casing — 1.7 — taken off. */
var LEADX = 238, LBLX = 242;
var LEGY = 303;                // the ring's legend, under the section
var FOOTY = 310;               // the footer rule
var CHIPY = 316, CHIPH = 26;
/* The three chips are sized to what they have to say, measured in the running
   app: "4½ o'clock" is 71.1 units, "Two fingers" 75.7 and "Points stop in the
   coat" 143.9. Three equal thirds squeezed the third one on every state where
   the points fail — which is the state the plate exists to show. */
/* AND THEY ARE INSET BY THE HALF-STROKE OF THEIR OWN BORDER. The outer two
   were flush on the trim at x = 0 and x = 460, which is not a margin — it puts
   half of a 1.2-unit border outside the viewBox, where the root <svg> clips it
   without saying so. Measured: 0.6 units of missing edge, 0.53 px at 414. */
var CHIP = [[1, 104], [112, 268], [276, 459]];

/* K is FIXED on purpose. A section that rescaled itself to fill the frame
   would hide the single most useful thing this picture says: the neck is far
   thicker at the shoulder than it is behind the ears.

   720 is solved, not chosen. Swept over every height, tension and clock
   angle, the outermost ink on the ring reaches -112.8..+121.2 units across
   and -124.2..+133.7 down from the section's own centroid at this K, which is
   234 x 258 in a band that is 237 x 264. Three units of margin, both ways. */
var SX = 116, SY = 156, K = 720;  // centre of the ring, and units per model unit
/* Reading outward from the coat, in MODEL units, so the whole ring is a fixed
   stand-off and the section grows and shrinks inside it as the height slider
   moves: strap (0.0396 at its loosest), housing (0.0006 + 15/K = 0.0214),
   then the band and the twelve index marks that straddle it. */
var Z_R = 0.0455;              // the zone band's CEILING, outside the coat
/* The index marks straddle the band and the leaders leave outside it, so all
   four radii are quoted as offsets from wherever the band actually is. The
   long marks came in from +0.0075 to +0.0045 — they used to stand 2.7 units
   proud of the band's own outer edge for no reason, and they are the outermost
   ink on the sheet, so that 2.2 units is what paid for the wider key column. */
var IDX_D0 = -0.005, IDX_D1 = 0.0045, IDX_D1S = 0;
var EXIT_D = 0.011;            // where an anatomy leader leaves the ring

/* ── THE RING WAS A DETACHED RIND HIGH ON THE NECK ─────────────────────────
   The stand-off was one constant, by design: the section then grows and
   shrinks inside a ring that holds still, which is the right instinct for a
   scale. What it did NOT survive is how much the section changes. At height 0
   the moat between coat and band is 32.6 units against a specimen 158.7 wide —
   21% — and at height 100 it is the same 32.7 units against a specimen 118.4
   wide, which is 28%, and the band is then half as wide again as the neck it
   is annotating. On screen it stops reading as an annotation on the neck and
   starts reading as an outer rind with the dog floating inside it.

   So the stand-off is now the SMALLER of three things, and every one of them
   is measured:

     prop   the same FRACTION of the section's own mean radius that 0.0455 is
            at the widest section the slider can reach. Height 0 is therefore
            unchanged to the last decimal — which matters, because K = 720 was
            solved against the ring's extent at exactly that state — and every
            section above it keeps the same proportion of moat.
     clear  the strap's own outermost ink at the tension the student has set,
            plus a hairline. The band may not be drawn on top of the strap, and
            the strap moves with the tension slider, so the floor moves with it.
     Z_R    the ceiling. It can only ever come IN, so nothing that fitted
            before can stop fitting.

   ZR_MIN is where the receiver's needle stops being a needle: it starts 15.2
   units off the strap face, on the housing, and the band's inner edge has to
   stay far enough out to leave a line as well as an arrowhead. 0.034 leaves
   5.0 units at the tightest strap the slider allows. */
var ZR_MIN = 0.034;
var ZR_REF = null;
function meanR(s) {
  var m = 0, i;
  for (i = 0; i < 16; i++) m += radiusAt(s, (i / 16) * Math.PI * 2);
  return m / 16;
}
function zoneR(s, slack) {
  if (ZR_REF === null) {
    ZR_REF = 0;
    for (var i = 0; i <= 20; i++) ZR_REF = Math.max(ZR_REF, meanR(i / 20));
  }
  var prop  = Z_R * (meanR(s) / ZR_REF);
  var clear = 0.0006 + Math.max(slack, 0) * 1.5 + 2.3 / K + 0.0055;
  return Math.min(Z_R, Math.max(ZR_MIN, prop, clear));
}

var MAG = K * 8;               // panel A. The "×8" on the plate is this line.
var DX0 = 20, DX1 = 90;        // the magnified stack, left and right
var PX = [39, 71];             // the two contact points in panel A
var POSTW = 10;
var SKINY = 176, SKIN_T = 6;   // skin is the fixed datum, and it has a thickness
var FLOORY = 220;              // bottom of the flesh block
var STRAPH = 15;               // the strap, where it runs off the housing
var HOX = 32, HOW = 46, HOH = 27;     // the housing: its face is what sits on the coat

/* The two contact points where they sit on the SECTION: half the spacing
   between them, and the width of one post. Length is never a constant here —
   it is postLen(), measured, every frame. */
var RXPX = 5.6, RXPW = 4.6;
var TRING_N = 4;                      // cartilage rings down the windpipe

/* Deterministic jitter. The coat is drawn as hair, and hair that reseeds
   itself on every frame of a slider drag shimmers. */
var JIT = (function () {
  var a = [], x = 20260807, i;
  for (i = 0; i < 220; i++) { x = (x * 16807) % 2147483647; a.push((x % 1000) / 1000); }
  return a;
})();

/* ── ANATOMY, IN SECTION-NORMALISED COORDINATES ────────────────────────────
   u runs across the neck as a fraction of the skin outline's own half-width,
   v runs down it as a fraction of its half-depth, positive ventral. Anything
   given for one side is mirrored, so the plate is symmetrical about the
   midline the way the animal is.

   The proportions are read off _work/neck-ref.png. They are stored as
   FRACTIONS precisely so that they follow the measured outline instead of
   sitting on top of it: at the shoulder the section is broad and everything
   in it is broad; behind the ears it is narrow and everything narrows with
   it. That is what lets this be a live picture and an anatomy plate at once.
   The reference itself is never drawn, and there is no raster in this app. */
var MUSCLE = [
  /* epaxial mass, dorso-lateral — why nothing reaches skin at the crest */
  { p: [[-0.13, -0.86], [-0.55, -0.72], [-0.87, -0.28], [-0.69, 0.00], [-0.38, -0.14], [-0.19, -0.48]],
    ax: [[-0.28, -0.72], [-0.62, -0.08]] },
  /* the long lateral mass — brachiocephalicus over sternocephalicus */
  { p: [[-0.91, 0.00], [-0.85, 0.44], [-0.60, 0.77], [-0.34, 0.58], [-0.38, 0.15], [-0.64, -0.06]],
    ax: [[-0.78, 0.05], [-0.45, 0.62]] },
  /* sternohyoideus, the pair that lies right under the trachea */
  { p: [[-0.28, 0.80], [-0.32, 0.97], [-0.04, 1.00], [-0.03, 0.82]],
    ax: [[-0.22, 0.85], [-0.11, 0.95]] },
  /* longus colli, slung under the vertebral body */
  { p: [[-0.35, -0.04], [-0.39, 0.16], [-0.09, 0.21], [-0.06, 0.00]],
    ax: [[-0.30, 0.02], [-0.12, 0.15]] }
];
var TRACH  = { u: 0, v: 0.57, rx: 0.275, ry: 0.225 };
var OESOPH = { u: -0.06, v: 0.285, rx: 0.150, ry: 0.100 };
/* ── THE CAROTID SHEATH — TWO VESSELS, NOT THREE SPECKS ────────────────────
   It held a jugular, a carotid and a vagus dot inside a 12.6-unit ring: an
   11 px circle carrying 5 px, 3.4 px and 2 px marks on a phone, which is
   three colours of confetti, not a neurovascular bundle. The vagus is gone —
   it is a nerve, it is not what a contact point can press on, and it was the
   smallest mark on the sheet. The two vessels that are left are bigger, and
   they have WALLS: an artery's wall is thick and its lumen small, a vein's is
   thin and its lumen wide, and at this size that difference is the only thing
   that tells them apart without reading the colour. */
var SHEATH = { u: 0.435, v: 0.405, rx: 0.140, ry: 0.108 };

/* ── THE NUCHAL LIGAMENT, AND WHY IT IS NO LONGER MAPPED LIKE THE REST ─────
   It was attached at both ends and it was still wrong, and the fault was in
   the map rather than in the numbers.

   uv() places a point by RADIAL FRACTION about O, the polar origin every ring
   path is swept about. Work it through for a point quoted on the midline —
   u = 0 — and the x that comes out is

       x = O.x + (M.x - O.x) · ANAT_IN · rs(a) / ri(a)

   in which a is that point's OWN direction from O. rs/ri — measured outline
   over ideal ellipse — is a function of direction, so two points both quoted
   on the midline at different depths come out at different x. Inside a compact
   structure the two directions barely differ and the error is invisible: the
   windpipe, the gullet, the vertebra and the sheath pair are each only a few
   units deep in the radial sense, and swept over the whole slider their axes
   stay within 3-4% of the section's width of each other, which is the method's
   own noise.

   The nuchal ligament is not compact. It runs the entire way from the dorsal
   fascia down to the vertebral spine, so its two ends look out along
   noticeably different rays — and it lives dorsally, which is exactly where
   this measured section departs most from the ellipse u and v are quoted
   against. Measured over the slider it walked 11.5 units off the vertebra by
   height 100 and its width GREW 61% while the section itself narrowed 30%. A
   structure that gets bigger as the neck gets smaller is not being scaled, it
   is being SHEARED — pinned at the fascia, pinned at the spine, and stretched
   between them. It read as tilted 25-30 degrees, sitting over the muscle belly
   rather than on the crest. The one structure whose entire definition is "on
   the dorsal midline" was the one leaning off it, and heights 69 and up are
   precisely where the lesson sends the student.

   So it is not mapped point by point any more. It is BUILT on the midline, out
   of four things that are each still an answer to the measurement:

     x     ONE number for the whole ligament — the x that the vertebral spine's
           own tip maps to. That is the bone it attaches to, so it is the
           median plane as this section draws it, and the ligament's axis and
           the vertebra's axis are now the same line by construction rather
           than by hope.
     top   where the vertical line through that x crosses the dorsal fascia,
           SOLVED off the measured outline by bisection on its own polar angle
           — not assumed, and not capped at it from outside.
     foot  the spine tip itself.
     width a fraction of HW, the measured inside-of-skin half-width, so it can
           only shrink when the neck shrinks. Nothing multiplies it any more.

   What has gone is the single degree of freedom that let it lean.

   The profile below is therefore listed as SHAPE only: a half-width as a
   fraction of the section's own half-width, and a station running 0 at the
   fascia to 1 at the spine. The stations are the old v list re-expressed —
   (v + 1.005) / 0.633 — so the outline is the same outline; only what holds it
   up has changed. */
var NUCH = [
  [ 0.000, 0.000], [ 0.058, 0.052], [ 0.096, 0.363], [ 0.091, 0.694],
  [ 0.054, 0.905], [ 0.021, 0.986], [ 0.000, 1.000], [-0.021, 0.986],
  [-0.054, 0.905], [-0.091, 0.694], [-0.096, 0.363], [-0.058, 0.052]
];
/* The elastic sheets in it, so it is a ligament and not a blank wedge. */
var NUCH_F = [[-0.030, 0.103, -0.030, 0.893], [0.030, 0.103, 0.030, 0.893]];

/* ── AND ONE MEDIAN PLANE FOR EVERYTHING ELSE THAT IS ON IT ────────────────
   The ligament was the structure the bend in uv() broke, because it is by far
   the longest thing quoted on the midline. But the bend is there for
   everything. Swept to the top of the slider, the windpipe's axis and the
   vertebra's axis came out 8.5 units apart in a section 97 units wide — a 9%
   spread in a plane that is ONE plane in every animal, and the two structures
   a student uses to orient themselves.

   The correction is applied to whole STRUCTURES and never to points. Each one
   is still mapped exactly as before, so its shape is still uv()'s answer to
   the measured outline and its DEPTH is untouched to the last decimal — which
   matters, because the windpipe's depth and the jugulars' are already inside
   the reference's own uncertainty and were not the fault. The finished
   structure is then slid sideways, rigidly, onto the plane. A rigid slide
   cannot distort anything, cannot separate a structure from itself, and cannot
   change what a leader is pointing at, because the leaders are quoted off the
   same numbers.

   Two muscle bellies ride with the structures they are defined against: the
   sternohyoideus pair IS "the pair that lies right under the trachea", and the
   longus colli IS "slung under the vertebral body". The two big lateral masses
   do not move — they belong to the outline, not to the midline.

   The plane itself is where the map puts u = 0 averaged over the depths the
   anatomy actually occupies. Averaged, so no single structure is privileged
   into being the one that never moves; over that span, because the shear is a
   function of depth and it is the middle of the span that is worth being
   right. The cap is 8 units: past that the section is no longer a neck at all
   and a slide would be doing more than de-shearing. */
function medianX(F) {
  var sx = 0, n = 9, i;
  for (i = 0; i < n; i++) sx += uv(F, 0, -0.88 + 1.76 * (i / (n - 1)))[0];
  return sx / n;
}
function slideTo(mx, ax) {
  return Math.max(-8, Math.min(8, mx - ax));
}
function sl(p, dx) { return [p[0] + dx, p[1]]; }

/* Where the ligament stands, at this height, in the plate's own units. Called
   once a frame, before anything that needs to point at it. */
function nuchAxis(F) {
  /* The foot is the vertebral spine's tip through the same map the bone uses,
     so the ligament sits on the bone rather than near it; its x is the median
     plane, which is where that bone has just been slid to. */
  var foot = uv(F, 0, VERT.out[VERT.out.length - 1][1]);
  var mx = F.mx;
  /* And the top is where the median plane meets the dorsal fascia. The fascia
     is rs(a) · ANAT_IN — the same rim every other structure is held inside —
     and x along it rises monotonically with a over the dorsal quadrant, so
     twenty-eight halvings put the crossing inside a ten-thousandth of a unit. */
  var a0 = -1.15, a1 = 1.15, am = 0, k, px;
  for (k = 0; k < 28; k++) {
    am = (a0 + a1) / 2;
    px = F.O[0] + Math.sin(am) * F.rs(am) * ANAT_IN;
    if (px < mx) a0 = am; else a1 = am;
  }
  var R = F.rs(am) * ANAT_IN;
  return { x: mx, yTop: F.O[1] - Math.cos(am) * R, yFoot: foot[1], hw: F.HW };
}
/* A point on the ligament, from its own [half-width fraction, station] pair. */
function nuchPt(N, u, t) {
  return [N.x + u * N.hw, N.yTop + t * (N.yFoot - N.yTop)];
}

/* ── THE OESOPHAGUS, WHICH WAS READING AS A SNOWFLAKE ──────────────────────
   A small pink pill with a white asterisk stroked across it. At every viewport
   it read as an icon, and it was the one clip-art object on an otherwise
   convincing plate.

   The first attempt at fixing it was a filled six-ray star, and that was still
   a snowflake — radial symmetry is the whole of what makes a glyph read as a
   glyph, so no amount of jitter on the rays was going to save it. Look at what
   _work/neck-ref.png actually draws: not a star at all, but a plain muscular
   oval with a dark, irregular, roughly TRANSVERSE slit in it. An empty
   oesophagus is closed by its own wall, and the closure is a crease, not a
   rosette.

   So the lumen is a closed slit — wide, shallow, and uneven along both edges,
   listed here as fractions of the lumen's own half-width and half-depth. It is
   filled, it has no radial symmetry left in it, and there is nothing stroked
   across the mucosa any more. */
var OES_LUMEN = [
  [-1.00,  0.06], [-0.60, -0.34], [-0.18, -0.12], [ 0.20, -0.40],
  [ 0.62, -0.16], [ 1.00, -0.02], [ 0.66,  0.34], [ 0.24,  0.14],
  [-0.14,  0.40], [-0.56,  0.18]
];

/* ── THE VERTEBRA, REDRAWN ─────────────────────────────────────────────────
   It was the one structure that did not read: a straight-sided polygon with
   sharp corners in a picture where everything else is a spline, and a body
   ellipse floating visibly detached from the arch above it. It looked like a
   paper aeroplane.

   It is now ONE closed outline, splined like every other soft structure, from
   the ventral crest of the body round the transverse process, up over the
   articular process to the short spine on the midline — the shape a mid
   cervical vertebra actually presents when you cut across it, and the shape
   in _work/neck-ref.png. The right half is listed; the left is mirrored.
   Body, pedicle, wing and lamina are one bone because they are one bone.

   And it is the only COOL mass in a warm section. In the reference the bone
   is blue-grey against pink muscle and cream fascia, which is why it is the
   second landmark you find. The old ivory sat within a hair of the fascia
   behind it, so it had an outline and no weight. */
var VERT = {
  out: [
    [0.000, -0.012], [0.115, -0.028], [0.180, -0.075], [0.168, -0.130],
    [0.245, -0.150], [0.300, -0.192], [0.268, -0.222], [0.196, -0.212],
    [0.212, -0.290], [0.176, -0.330], [0.118, -0.312], [0.052, -0.352],
    [0.000, -0.368]
  ],
  cv: -0.245, cx: 0.115, cy: 0.062,   // canal
  bv: -0.100, bx: 0.180, by: 0.085    // where the body sits, for the floor line
};

/* ── AND THE WHOLE BONE SAT 0.10 TOO FAR VENTRAL ───────────────────────────
   Normalised about the inside-of-skin frame — the only frame in which two
   drawings of two different necks can be compared at all — _work/neck-ref.png
   puts the vertebra's centre at v = -0.313 and this plate rendered it at
   -0.212 in the teaching band. Everything else on the sheet is inside the
   method's own uncertainty of about 0.05: the windpipe reads +0.478 against a
   reference +0.542, the jugulars -0.387 and +0.425 against ±0.35. The bone was
   the one landmark outside it, and it is the landmark a student uses to find
   everything else, because it is the only cool mass in a warm section.

   0.105 is what closes it, measured back in the running app rather than
   guessed. It is applied here, once, to the outline, the canal and the body
   together, so the bone moves as a bone: a shift written into thirteen
   coordinates by hand is a shift that goes stale the first time one of them is
   touched.

   The longus colli goes with it, but only by its ROOF. It is slung under the
   vertebral body — that is the whole of what it is — so its top edge has to
   follow the bone or a hole opens under the body where there is muscle in
   every reference. Its floor stays where the gullet is. The belly gets deeper
   by exactly what the bone moved, which is also what happens in the animal. */
var VERT_DV = -0.105;
(function () {
  var i;
  for (i = 0; i < VERT.out.length; i++) VERT.out[i][1] += VERT_DV;
  VERT.cv += VERT_DV;
  VERT.bv += VERT_DV;
  var LC = MUSCLE[3];
  LC.p[0][1] += VERT_DV; LC.p[3][1] += VERT_DV;
  LC.ax[0][1] += VERT_DV * 0.62; LC.ax[1][1] += VERT_DV * 0.22;
})();

/* ── ONE GEOMETRY, ONE RULE, FOR EVERY LABEL ON THE RING ───────────────────
   FOUR names, not seven. Coat and Skin are named in panel A on the very stack
   that measures them, and the crest is a zone rather than a structure — it is
   named in the ring's legend. Printing all seven here made the annotation
   column heavier than the specimen and collapsed its own leading at the top
   of the height range.

   ── AND NO ANCHOR IS TYPED TWICE ──────────────────────────────────────────
   The Carotid leader used to point at bare fascia. Not by much — about four
   units, five and a half pixels at 1440 — but it named a structure it did not
   touch, which is the one thing an anatomical key may never do. The cause was
   that KEYS carried its OWN u,v (0.40 / 0.24) beside the sheath's own record
   (0.435 / 0.405). Two hand-typed pairs for one place: change either and the
   leader silently stops agreeing with the drawing.

   A key entry no longer carries coordinates. It carries a FUNCTION that asks
   the structure where it is — SHEATH's centre, VERT's body, MUSCLE's own axis,
   TRACH's lumen — so a leader cannot disagree with the thing it names, ever,
   because there is only one number and they both read it.

   ── AND THE FIFTH ENTRY IS THE ONE THE MANUAL IS ABOUT ────────────────────
   Four structures were named and the contact points were not — the subject of
   the lesson was the only unnamed thing on the plate, and at the correct 7:30
   fit the two posts read as part of the black housing. The fifth entry is
   theirs. Its anchor is not a u,v at all: it is the tip of the actual post, at
   the clock angle and the post length the student has set, so it moves with
   the receiver round the whole dial.

   Which means it can leave from the LEFT half, and a straight run to a
   right-hand column would cross the specimen. So a leader that starts on the
   left is routed round the OUTSIDE of the ring — over the top or under the
   throat, whichever is nearer — and only then turns into the column. Routed
   round, never across: that is a draughtsman's rule and it is the reason the
   column can hold a label for something that moves. */
/* ── AND FOUR THINGS WERE DRAWN AND NOT NAMED ──────────────────────────────
   The plate got good enough to be read as anatomy, and the moment it did, an
   unnamed structure stopped reading as restraint and started reading as
   DECORATION — which is the exact charge this work exists to defeat. Four were
   drawn in full and never named: the gullet, the nuchal ligament, the spinal
   cord, and the skin, which was named only over in panel A on the stack that
   measures it and not on the specimen it is a layer of.

   The nuchal ligament is the one that mattered. Half of decision 2's reason —
   the crest is no place for a contact point — is that this band and the muscle
   either side of it are what a point would have to get through, and it sat
   there anonymous.

   NINE names, and the column was measured before they were written, not after:
   the longest is "Spinal cord" at 59.2 units against the 64 the column now
   holds, so nothing on this sheet is squeezed by textLength in any state.

   THE GULLET IS CALLED THE GULLET for the same reason the trachea is called
   the windpipe. This plate has always been in the register a trainer speaks in
   on a field — windpipe, not trachea; muscle, not brachiocephalicus; vertebra,
   not C4 — and naming one tube in Greek and the one beside it in English would
   be the only inconsistency on the sheet. The Latin sits in the plate's own
   aria-label, where a reader who wants it will find it read out. */
var KEYS = [
  { t: ['Nuchal', 'ligament'], at: function (F) {
      /* Off its own axis by a twentieth of the section's half width, which is
         inside the band at every station: it is 0.093 wide there. */
      return nuchPt(F.nuch, 0.05, 0.40);
    } },
  /* Every anchor carries its structure's own slide, read off the same F.sl the
     drawing reads, so a leader cannot point at where a structure used to be. */
  { t: ['Vertebra'], at: function (F) { return sl(uv(F, VERT.bx * 0.42, VERT.bv), F.sl.vert); } },
  { t: ['Spinal cord'], at: function (F) { return sl(uv(F, VERT.cx * 0.30, VERT.cv), F.sl.vert); } },
  { t: ['Muscle'],   at: function (F) {
      var A = MUSCLE[0].ax;
      return uv(F, -(A[0][0] + A[1][0]) / 2, (A[0][1] + A[1][1]) / 2);
    } },
  { t: ['Carotid'],  at: function (F) { return sl(uv(F, SHEATH.u, SHEATH.v), F.sl.sheath); } },
  /* On the muscular wall, not in the lumen: the wall runs from 0.76 to 1.00 of
     the tube's own half-width and the anchor is at 0.88 of it. */
  { t: ['Gullet'],   at: function (F) { return sl(uv(F, OESOPH.u + OESOPH.rx * 0.88, OESOPH.v), F.sl.oes); } },
  { t: ['Windpipe'], at: function (F) { return sl(uv(F, TRACH.u + TRACH.rx * 0.34, TRACH.v), F.sl.trach); } },
  /* The skin's anchor is IN the layer — on the outline the skin band is stroked
     along — and it is chosen each frame to stand as far round the neck from the
     receiver as the right half allows, so the leader never leaves from under
     the housing. */
  { t: ['Skin'],     at: function (F) { return F.skin; } },
  /* Two lines, because "Contact points" measures 74.1 units against the 64 the
     column has. Squeezing it with textLength would have been the first
     compressed string on the sheet. */
  { t: ['Contact', 'points'], at: null, rx: true }
];

/* The ring is drawn about the section's own centroid rather than about the
   centreline, so it sits still in its frame while its SIZE and SHAPE change.
   The centreline is still marked, as a cross, because every clock angle is
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
  var d = '', n = 96, i, p;
  var f = a0 == null ? 0 : a0 * Math.PI / 180;
  var t = a1 == null ? Math.PI * 2 : a1 * Math.PI / 180;
  for (i = 0; i <= n; i++) {
    p = ringPt(s, f + (t - f) * (i / n), extra, c);
    d += (i ? 'L' : 'M') + n1(p[0]) + ' ' + n1(p[1]);
  }
  return d + (close ? 'Z' : '');
}
/* The strap is not concentric with the neck, so it needs its own sweep. */
function strapRingPath(s, slack, aRx, c) {
  var d = '', n = 108, i;
  for (i = 0; i <= n; i++) {
    var a = (i / n) * Math.PI * 2;
    var p = ringPt(s, a, strapOff(a, slack, aRx), c);
    d += (i ? 'L' : 'M') + n1(p[0]) + ' ' + n1(p[1]);
  }
  return d + 'Z';
}

/* ── the section's own frame ───────────────────────────────────────────────
   O is the polar origin every ring path is swept about — the centreline.
   M is the middle of the SKIN outline and HW/HH are its half-extents. The
   anatomy is laid out about M, because a dog's windpipe is central to its
   neck and not to a raycast centreline that sits wherever the profile put it.
   Every anatomical point is then pulled back inside the outline by uv(), so
   no structure can escape the section at any height or any coat depth. */
function frameOf(s, eD, c) {
  var O = [SX - c.x * K, SY - c.y * K];
  function rs(a) { return Math.max(1.5, (radiusAt(s, a) - eD) * K); }
  var r0 = rs(0), r90 = rs(Math.PI / 2), r180 = rs(Math.PI), r270 = rs(Math.PI * 1.5);
  var F = {
    O: O, rs: rs,
    Mx: O[0] + (r90 - r270) / 2,
    My: O[1] + (r180 - r0) / 2,
    HW: (r90 + r270) / 2,
    HH: (r180 + r0) / 2
  };
  /* ri(a) — how far the IDEAL frame reaches in direction a. It is the ellipse
     that u and v are quoted against: centred on M, half-axes HW and HH, and
     measured from O because that is the pole every ring path is swept about.
     Solved, not sampled: substitute the ray into the ellipse and take the
     positive root. O is inside the ellipse, so there is exactly one. */
  var ex = O[0] - F.Mx, ey = O[1] - F.My;
  F.ri = function (a) {
    var sa = Math.sin(a) / F.HW, ca = -Math.cos(a) / F.HH;
    var A = sa * sa + ca * ca;
    var B = 2 * (ex * sa / F.HW + ey * ca / F.HH);
    var C = (ex / F.HW) * (ex / F.HW) + (ey / F.HH) * (ey / F.HH) - 1;
    var q = B * B - 4 * A * C;
    if (!(q > 0) || !(A > 0)) return F.rs(a);
    return Math.max(1, (-B + Math.sqrt(q)) / (2 * A));
  };
  return F;
}
/* ── HOW A LANDMARK FINDS ITS PLACE, AND WHY IT CHANGED ────────────────────
   It used to be: put the point at u·HW, v·HH, and if it fell outside the skin
   outline, pull THAT POINT back along its own radius until it fitted.

   Pulling each point back on its own is what tore the plate apart at the ends
   of the height slider. Behind the ears and down on the shoulder the section is
   not the ellipse HW and HH describe — it is flatter dorsally and it leans —
   so at those heights the clamp fired on some points of a structure and not on
   others. The sternohyoideus pair came apart into two slivers, both carotid
   sheaths ended up half-buried in the muscle edges, and the ventral quarter
   opened into a pale void. Landmarks and the muscle splines that should hold
   them were being moved independently, so of course they separated. The drill
   OPENS at height 0.12, near one of those ends: it was the first thing a
   student saw.

   It is now ONE map, applied to every point of every structure:

     radial fraction in   ->   the same radial fraction out

   t = r / ri(a) is how far out this point sits as a fraction of the ideal
   frame in its own direction; the point is then placed at that same fraction
   of the MEASURED outline in that direction. The ideal ellipse maps exactly
   onto the real section, and everything inside it comes along in proportion.
   Two structures that touch at one height touch at every height, because the
   map is continuous and every point of both goes through it.

   ANAT_IN is the fascia. 0.955 leaves a rim of even thickness between the
   outermost tissue and the skin, at every height, which is what the fascia is
   in _work/neck-ref.png. The cap at 1.045 is what lets a structure quoted
   past the frame — the nuchal ligament is, deliberately — LAND on that rim
   rather than float short of it. 0.955 x 1.045 = 0.998: nothing can cross. */
var ANAT_IN = 0.955, ANAT_CAP = 1.045;
function uv(F, u, v) {
  var x = F.Mx + u * F.HW, y = F.My + v * F.HH;
  var dx = x - F.O[0], dy = y - F.O[1];
  var r = Math.sqrt(dx * dx + dy * dy);
  if (r < 0.01) return [x, y];
  var a = Math.atan2(dx, -dy);
  var t = r / F.ri(a);
  if (t > ANAT_CAP) t = ANAT_CAP;
  var rr = F.rs(a) * ANAT_IN * t;
  return [F.O[0] + dx / r * rr, F.O[1] + dy / r * rr];
}
/* A closed Catmull-Rom through the given points, as cubics. Muscle bellies
   are not polygons, and a polygon is exactly what the old blob looked like. */
function spline(P) {
  var n = P.length, d = 'M' + n1(P[0][0]) + ' ' + n1(P[0][1]), i;
  for (i = 0; i < n; i++) {
    var p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    d += 'C' + n1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + n1(p1[1] + (p2[1] - p0[1]) / 6) +
         ' ' + n1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + n1(p2[1] - (p3[1] - p1[1]) / 6) +
         ' ' + n1(p2[0]) + ' ' + n1(p2[1]);
  }
  return d + 'Z';
}
/* A closed polyline through [x fraction, y fraction] pairs — the creased lumen
   of a collapsed tube. Straight between the creases on purpose: mucosa folds,
   it does not curve, and this is the one place on the plate where a hard
   corner is the truth rather than a shortcut. */
function foldPath(cx, cy, rx, ry, P) {
  var d = '', i;
  for (i = 0; i < P.length; i++) {
    d += (i ? 'L' : 'M') + n1(cx + P[i][0] * rx) + ' ' + n1(cy + P[i][1] * ry);
  }
  return d + 'Z';
}
function ellPath(cx, cy, rx, ry) {
  rx = Math.max(0.6, rx); ry = Math.max(0.6, ry);
  return 'M' + n1(cx - rx) + ' ' + n1(cy) +
         'a' + n1(rx) + ' ' + n1(ry) + ' 0 1 0 ' + n1(rx * 2) + ' 0' +
         'a' + n1(rx) + ' ' + n1(ry) + ' 0 1 0 ' + n1(-rx * 2) + ' 0Z';
}
/* A filled arrowhead, tip at (x,y), pointing along the unit vector (dx,dy). */
function head(x, y, dx, dy, L, W) {
  var bx = x - dx * L, by = y - dy * L, px = -dy * W, py = dx * W;
  return 'M' + n1(x) + ' ' + n1(y) + 'L' + n1(bx + px) + ' ' + n1(by + py) +
         'L' + n1(bx - px) + ' ' + n1(by - py) + 'Z';
}

/* ── NOTHING MAY RENDER OUTSIDE ITS PANEL, AND IT IS MEASURED, NOT ASSUMED ──
   The previous build guessed string widths from character counts and shipped
   a label that ran off panel A. This asks the browser instead. If a string is
   wider than the box it was given, textLength squeezes it to fit — visibly,
   so it is obvious the copy is too long — and then the box is nudged back
   inside. Bounds are in the node's OWN user space, which for anything inside
   gD is panel A's local space, so the two plates are checked independently. */
function fitText(node, x0, x1, y0, y1) {
  var cls = node.getAttribute('class') || '';
  if (cls.indexOf('fs-off') >= 0) return;
  var b;
  try { b = node.getBBox(); } catch (e) { return; }
  if (!b || !b.width) return;
  var maxW = x1 - x0;
  if (b.width > maxW && maxW > 6) {
    node.setAttribute('textLength', n1(maxW));
    node.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    try { b = node.getBBox(); } catch (e2) { return; }
  } else if (node.hasAttribute('textLength')) {
    node.removeAttribute('textLength');
    node.removeAttribute('lengthAdjust');
    try { b = node.getBBox(); } catch (e3) { return; }
  }
  var dx = 0;
  if (b.x < x0) dx = x0 - b.x;
  else if (b.x + b.width > x1) dx = x1 - (b.x + b.width);
  if (dx) node.setAttribute('x', n1(parseFloat(node.getAttribute('x') || 0) + dx));
  if (y0 == null) return;
  var dy = 0;
  if (b.y < y0) dy = y0 - b.y;
  else if (b.y + b.height > y1) dy = y1 - (b.y + b.height);
  if (dy) node.setAttribute('y', n1(parseFloat(node.getAttribute('y') || 0) + dy));
}

// ═══════════════════════════════════════════════════════════════════════════
//  BUILD
// ═══════════════════════════════════════════════════════════════════════════

function buildSection() {
  var svg = sv('svg', 'fit-svg', { viewBox: '0 0 ' + VBW + ' ' + VBH, role: 'img' });
  svg.setAttribute('aria-label',
    'Live cross-section down the neck at the receiver, drawn from the measured ' +
    'profile: coat, skin, muscle, the carotid sheaths, the cervical vertebra, ' +
    'the nuchal ligament, the oesophagus and the windpipe with its cartilage ' +
    'rings, with the strap and the receiver on it and the two contact points ' +
    'named where they stand. A coloured ring round the section marks where a ' +
    'contact point may sit and where it may not. Beside it, panel A shows the ' +
    'two contact points against the coat at eight times the size. The three ' +
    'verdicts under the plate are read out in the text below it.');
  var S = { svg: svg, fits: [] };
  var i, j, q;

  /* Gradients and the section hatch live here. Their colours are still set by
     class in the stylesheet, so the house rule holds: no hex in this file. */
  var defs = sv('defs', '', {});
  var steel = sv('linearGradient', '', { id: 'fs-steel', x1: '0', y1: '0', x2: '1', y2: '0' });
  [['fs-s0', '0'], ['fs-s1', '.26'], ['fs-s2', '.52'], ['fs-s3', '.78'], ['fs-s4', '1']]
    .forEach(function (r) { steel.appendChild(sv('stop', r[0], { offset: r[1] })); });
  defs.appendChild(steel);
  var strapg = sv('linearGradient', '', { id: 'fs-strapg', x1: '0', y1: '0', x2: '0', y2: '1' });
  [['fs-b0', '0'], ['fs-b1', '.32'], ['fs-b2', '1']]
    .forEach(function (r) { strapg.appendChild(sv('stop', r[0], { offset: r[1] })); });
  defs.appendChild(strapg);
  var hat = sv('pattern', '', {
    id: 'fs-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse',
    patternTransform: 'rotate(45)'
  });
  hat.appendChild(sv('rect', 'fs-hatchbg', { width: 6, height: 6 }));
  hat.appendChild(sv('line', 'fs-hatchl', { x1: 0, y1: 0, x2: 0, y2: 6 }));
  defs.appendChild(hat);
  /* THE SHORTFALL BAND IS NOT A MATERIAL, SO IT IS NOT HATCHED LIKE ONE. It
     used to be a 45-degree line hatch sitting directly against the flesh
     block's 45-degree line hatch — same convention, same pitch, touching, and
     meaning two completely different things: one is tissue, the other is the
     coat the points never cross.

     It is HORIZONTAL ruling now, and that is not an arbitrary third angle. The
     band is a DEPTH — the last 27% of the coat, measured up off the skin — and
     level rules read as strata, which is what it is. Upright ruling was tried
     first and was worse: the coat above it is drawn as standing hair, so
     vertical red lines simply read as more hair in another colour. The three
     fills in panel A are now hair (upright), shortfall (level) and flesh
     (45 degrees), and no two of them can be taken for each other. */
  var gapp = sv('pattern', '', {
    id: 'fs-gaphatch', width: 5, height: 4, patternUnits: 'userSpaceOnUse'
  });
  gapp.appendChild(sv('rect', 'fs-gaphbg', { width: 5, height: 4 }));
  gapp.appendChild(sv('line', 'fs-gaphl', { x1: 0, y1: 0, x2: 5, y2: 0 }));
  defs.appendChild(gapp);
  svg.appendChild(defs);

  var gR = sv('g', '', {});                                          // the section
  var gD = sv('g', '', { transform: 'translate(' + DETX + ' 0)' });   // panel A
  S.gR = gR; S.gD = gD;

  // ── plate 1 header ───────────────────────────────────────────────────────
  S.p1t = txt('fs-plate', 'LOOKING DOWN THE NECK', { x: LEFTM, y: HEADY });
  gR.appendChild(S.p1t);
  gR.appendChild(sv('line', 'fs-rule', { x1: LEFTM, y1: RULEY, x2: P1W, y2: RULEY }));

  // ── the section, back to front ───────────────────────────────────────────
  S.flesh = sv('path', 'fs-flesh', { d: '' });     // fascia inside the skin
  gR.appendChild(S.flesh);

  S.mus = []; S.fib = [];
  for (i = 0; i < MUSCLE.length * 2; i++) {
    var mp = sv('path', 'fs-mus', { d: '' });
    var fp = sv('path', 'fs-fib', { d: '' });
    gR.appendChild(mp); gR.appendChild(fp);
    S.mus.push(mp); S.fib.push(fp);
  }

  S.nuch  = sv('path', 'fs-nuch',  { d: '' });
  S.nuchF = sv('path', 'fs-nuchf', { d: '' });
  gR.appendChild(S.nuch); gR.appendChild(S.nuchF);

  /* One bone, drawn as one outline, then its spongy interior, then the floor
     of the canal, then the canal, the cord and its grey matter. */
  S.vBone  = sv('path', 'fs-bone',   { d: '' });
  S.vSpong = sv('path', 'fs-spong',  { d: '' });
  S.vFloor = sv('path', 'fs-bfloor', { d: '' });
  S.vCanal = sv('path', 'fs-canal',  { d: '' });
  S.vCord  = sv('path', 'fs-cord',   { d: '' });
  S.vGrey  = sv('path', 'fs-grey',   { d: '' });
  gR.appendChild(S.vBone); gR.appendChild(S.vSpong); gR.appendChild(S.vFloor);
  gR.appendChild(S.vCanal); gR.appendChild(S.vCord); gR.appendChild(S.vGrey);

  /* The oesophagus: a muscular wall, a submucosa, and a lumen shut into folds.
     Three layers, because that is what makes it a tube rather than a pill. */
  S.oes  = sv('path', 'fs-oes',  { d: '' });
  S.oesM = sv('path', 'fs-oesm', { d: '' });
  S.oesL = sv('path', 'fs-oesl', { d: '' });
  gR.appendChild(S.oes); gR.appendChild(S.oesM); gR.appendChild(S.oesL);

  S.sheath = []; S.vein = []; S.art = [];
  for (i = 0; i < 2; i++) {
    var sh = sv('path', 'fs-sheath', { d: '' });
    var vn = sv('path', 'fs-vein',   { d: '' });
    var ar = sv('path', 'fs-art',    { d: '' });
    gR.appendChild(sh); gR.appendChild(vn); gR.appendChild(ar);
    S.sheath.push(sh); S.vein.push(vn); S.art.push(ar);
  }

  /* ── THE WINDPIPE, AS A STACK OF RINGS ────────────────────────────────────
     One C over a cream annulus over a dark lumen reads as an eye, or a
     keyhole. What makes _work/neck-ref.png legible in a quarter of a second is
     that it stacks several pale C rings along an oblique cut: the corrugation
     IS the recognition. Four rings, drawn deepest first so the nearest sits on
     top, each a little narrower and a little flatter as it recedes. This is
     the one structure the manual names by name (p.27), so it is the one a
     student should be able to name back with the labels stripped off. */
  S.tLum  = sv('path', 'fs-tlum',  { d: '' });
  S.tRings = [];
  for (i = TRING_N - 1; i >= 0; i--) {
    var ro = sv('path', 'fs-tring fs-tr' + i, { d: '' });
    var ri = sv('path', 'fs-tin fs-ti' + i,   { d: '' });
    S.tRings[i] = { o: ro, i: ri };
    /* THE BORE GOES IN BETWEEN. Painted behind the whole stack it was covered
       by every ring below the first, and what showed through the front ring
       was two pale slivers of the second one — which read as a roll of tape,
       not as a tube you are looking into. It sits over the rings that recede
       and under the ring at the cut face, so the front ring frames a dark
       hole and the corrugation runs away from it. */
    if (i === 0) gR.appendChild(S.tLum);
    gR.appendChild(ro); gR.appendChild(ri);
  }
  S.tMus  = sv('path', 'fs-tmus',  { d: '' });
  gR.appendChild(S.tMus);

  // skin as its own layer, then the coat standing on it as real hair
  S.skinB = sv('path', 'fs-skinb', { d: '' });
  S.skinL = sv('path', 'fs-skinl', { d: '' });
  S.coat  = sv('path', 'fs-coat',  { d: '', 'fill-rule': 'evenodd' });
  S.hair  = sv('path', 'fs-hair',  { d: '' });
  S.coatE = sv('path', 'fs-coate', { d: '' });
  S.press = sv('path', 'fs-press', { d: '' });
  gR.appendChild(S.skinB); gR.appendChild(S.skinL);
  gR.appendChild(S.coat); gR.appendChild(S.hair);
  gR.appendChild(S.coatE); gR.appendChild(S.press);

  /* THE CENTRE MARK IS GONE. It was four 8.5-unit dashed stubs arranged as an
     open cross, lying across the vertebra and the left muscle belly, with no
     label and — this is the part that decided it — no room to give it one: the
     ring's legend already runs to 279.6 of the 306 units the plate is wide,
     measured in the running app, so a third legend entry does not fit and the
     only other option was to leave an unexplained mark on the specimen. At
     ship size it read as a selection marquee somebody forgot to delete, which
     is precisely the "wireframe left in" impression this whole redesign exists
     to answer. Nothing was lost with it: the twelve index marks ARE the clock
     face the angle is read off, the long ones stand at 12, 3, 6 and 9, and the
     chip under the plate prints the reading in words. */

  // ── the annotation ring ──────────────────────────────────────────────────
  S.zones = [];
  var zdefs = [
    ['ok', Z_OK[0]], ['ok', Z_OK[1]],
    ['no', Z_PIPE], ['no', Z_CREST[0]], ['no', Z_CREST[1]],
    ['near', [60, 115]], ['near', [245, 300]]
  ];
  for (q = 0; q < zdefs.length; q++) {
    var pz = sv('path', 'fs-zone fs-' + zdefs[q][0], { d: '' });
    gR.appendChild(pz);
    S.zones.push({ node: pz, band: zdefs[q][1] });
  }
  S.idx = sv('path', 'fs-idx', { d: '' });
  gR.appendChild(S.idx);

  /* THE STRAP. Without it the manual's own second target — two fingers under
     the strap — had no picture anywhere in the app. Panel A deliberately
     draws the strap pressed flat on the coat, because that is what it does
     under the housing. Here is where the slack lives, so here it is measured. */
  S.strap = sv('path', 'fs-strapr', { d: '' });
  gR.appendChild(S.strap);

  /* THE TWO-FINGER MEASURE. It carried a word — "two fingers" / "too loose" —
     printed across the specimen inside the strap ring, with a paper casing
     that punched a hole in the strap it was measuring. The chip directly
     under this plate already says Two fingers / Loose / Tight off the same
     vTension(), so the word was a second copy of a verdict, laid over the
     drawing. The dimension stays; the word is gone. */
  S.gapH = sv('path', 'fs-gapmh', { d: '' });   // casing under the dimension
  S.gapA = sv('path', 'fs-gapm',  { d: '' });
  gR.appendChild(S.gapH); gR.appendChild(S.gapA);

  // the receiver on the section, its two points, and its index needle
  S.rxNeedle = sv('path', 'fs-needle', { d: '' });
  gR.appendChild(S.rxNeedle);
  /* ── THE CONTACT POINTS, ON THE SECTION ───────────────────────────────────
     They were two round-capped strokes 3.2 units wide: 2.8 px on a phone, and
     against the black housing they read as part of it. The entire subject of
     this tab was the least visible thing on the plate.

     They are drawn the way panel A draws them, because they are the same
     object: a turned shaft with the steel gradient across it, a lit edge down
     each side and a domed tip. RXPW is 4.6 units — 4.1 px at 414 and 6.6 at
     1440 — and that number is not invented: against the housing beside it,
     which is 28 units for a 57 mm case, 4.6 units is an 9.4 mm post, and the
     posts on the owner's own unit measure 7 mm across the dome.

     THE LENGTH IS NOT EXAGGERATED AND WILL NOT BE. postLen() is 0.011 model
     units, which is 7.9 units here — 7.0 px at 414, 11.3 at 1440 — and with
     the longer pair fitted it is 13.0 units, 11.5 px at 414. Drawing it at a
     "legible" 13.5 units on the standard pair would be a 1.7x lie about the
     exact dimension the fourth decision is graded on: a student would see a
     post that looks long enough on a plate that then marks them down. That is
     why panel A exists at x8, why the callout circle rings this assembly, and
     why the legibility here was bought with width, contrast and a name. */
  S.rx = sv('g', 'fs-rx', {});
  S.rxPost = [];
  for (q = 0; q < 2; q++) {
    var pg = sv('g', '', {});
    var psh = sv('rect', 'fs-rxpm', { width: RXPW, rx: 1.1, x: n1((q ? RXPX : -RXPX) - RXPW / 2), y: -4 });
    var ptp = sv('path', 'fs-rxpt', { d: '' });
    var ped = sv('path', 'fs-rxpe', { d: '' });
    pg.appendChild(psh); pg.appendChild(ptp); pg.appendChild(ped);
    S.rx.appendChild(pg);
    S.rxPost.push({ sh: psh, tip: ptp, ed: ped });
  }
  S.rxBody  = sv('rect', 'fs-rxbody', { x: -14, y: -15, width: 28, height: 14.5, rx: 3.5 });
  S.rxTop   = sv('line', 'fs-rxtop',  { x1: -9, y1: -11.4, x2: 9, y2: -11.4 });
  S.rx.appendChild(S.rxBody);  S.rx.appendChild(S.rxTop);
  gR.appendChild(S.rx);

  /* The detail callout, keyed A. A circle round what is magnified and a keyed
     badge is the drawing convention; the elbow leader that used to run right
     across the sheet to panel A was noise, and it was standing in the way of
     the anatomy key. */
  S.lensC = sv('circle', 'fs-lens', { r: 17 });
  S.lensB = sv('rect', 'fs-lensb', { width: 17, height: 17, rx: 4 });
  S.lensT = txt('fs-lensk', 'A', { x: 0, y: 0, 'text-anchor': 'middle' });
  gR.appendChild(S.lensC); gR.appendChild(S.lensB); gR.appendChild(S.lensT);

  // ── the key ──────────────────────────────────────────────────────────────
  S.keys = [];
  for (i = 0; i < KEYS.length; i++) {
    var kh = sv('path', 'fs-keyh', { d: '' });     // casing, so a leader survives
    var kl = sv('path', 'fs-key',  { d: '' });
    var kd = sv('circle', 'fs-keyd', { r: 2.1 });
    var kls = [];
    for (q = 0; q < KEYS[i].t.length; q++) {
      var kt = txt('fs-anat', KEYS[i].t[q], { x: LBLX, y: 0 });
      kls.push(kt);
    }
    gR.appendChild(kh); gR.appendChild(kl); gR.appendChild(kd);
    for (q = 0; q < kls.length; q++) gR.appendChild(kls[q]);
    S.keys.push({ spec: KEYS[i], hal: kh, ln: kl, dot: kd, tx: kls });
  }

  /* ── THE RING'S OWN LEGEND ───────────────────────────────────────────────
     The zone arcs are honest data — Z_OK, Z_PIPE and Z_CREST, the same three
     bands vClock() grades against — but nothing on the sheet said so, and an
     unexplained coloured arc reads as decoration, which is the exact charge
     this redesign had to answer. The swatches are the arcs' own classes, so
     the legend cannot drift from what is drawn. */
  S.legS = [];
  ['ok', 'no'].forEach(function (v) {
    var sw = sv('line', 'fs-zone fs-' + v + ' fs-swatch',
      { x1: 0, y1: LEGY - 4, x2: 15, y2: LEGY - 4 });
    var tt = txt('fs-legt', v === 'ok' ? 'a point may sit here' : 'windpipe or crest',
      { x: 0, y: LEGY });
    gR.appendChild(sw); gR.appendChild(tt);
    S.legS.push({ sw: sw, tx: tt });
  });

  // ── panel A ──────────────────────────────────────────────────────────────
  S.aBadge  = sv('rect', 'fs-badge', { x: 0, y: 2, width: 15, height: 15, rx: 4 });
  S.aBadgeT = txt('fs-badget', 'A', { x: 7.5, y: HEADY - 1.5, 'text-anchor': 'middle' });
  S.aTitle  = txt('fs-plate', 'POINTS vs COAT', { x: 19, y: HEADY });
  gD.appendChild(S.aBadge); gD.appendChild(S.aBadgeT); gD.appendChild(S.aTitle);
  gD.appendChild(sv('line', 'fs-rule', { x1: 0, y1: RULEY, x2: P2W - LEFTM, y2: RULEY }));
  S.aState = txt('fs-state', '', { x: 0, y: 37 });
  /* Six units of optical margin. It used to end at x = 460.00 of a 460-unit
     sheet — flush on the trim, which is not a margin, it is a coincidence. */
  S.aScale = txt('fs-scale', '×8', { x: P2W - 6, y: 37, 'text-anchor': 'end' });
  gD.appendChild(S.aState); gD.appendChild(S.aScale);

  S.dFlesh  = sv('path', 'fs-fleshb',  { d: '' });
  S.dSkinB  = sv('path', 'fs-skinbb',  { d: '' });
  S.dCoat   = sv('rect', 'fs-coatb',   { x: DX0, y: 0, width: DX1 - DX0, height: 0 });
  S.dHair   = sv('path', 'fs-hairb',   { d: '' });
  S.dGapB   = sv('rect', 'fs-gapband', { x: DX0, y: 0, width: DX1 - DX0, height: 0 });
  S.dSkin   = sv('path', 'fs-skind',   { d: '' });
  /* THE STRAP RUNS OFF EITHER SIDE OF THE HOUSING, which is where it really
     goes: the receiver's face is what lies on the coat and the strap is
     threaded out of its two slots. Drawn as one continuous bar under the box,
     the points appeared to be driven through the strap, which is not how a
     1900X is built. Two stubs, and the geometry is honest. */
  S.dStrapL = sv('rect', 'fs-strapb', { x: DX0, y: 0, width: HOX - DX0, height: STRAPH });
  S.dStrapR = sv('rect', 'fs-strapb', { x: HOX + HOW, y: 0, width: DX1 - HOX - HOW, height: STRAPH });
  S.dStitch = sv('path', 'fs-stitch', { d: '' });
  /* THE HOUSING, which the last version left out — and without it panel A was
     two bars and two sticks, which is most of what "it looks like a bar chart"
     meant. The points screw into this and come out of its face; the face is
     what sits on the coat. It is a fixed size, because a 1900X housing is. */
  S.dHouse  = sv('rect', 'fs-house',  { x: HOX, width: HOW, height: HOH, rx: 4 });
  S.dHouseT = sv('path', 'fs-houset', { d: '' });
  gD.appendChild(S.dFlesh); gD.appendChild(S.dSkinB);
  gD.appendChild(S.dCoat); gD.appendChild(S.dHair);
  gD.appendChild(S.dGapB); gD.appendChild(S.dSkin);
  gD.appendChild(S.dStrapL); gD.appendChild(S.dStrapR); gD.appendChild(S.dStitch);
  gD.appendChild(S.dHouse); gD.appendChild(S.dHouseT);

  /* The posts are turned metal, not bars: a shaft with a gradient across it,
     a lit edge either side, and a domed tip. */
  S.dPost = [];
  for (q = 0; q < 2; q++) {
    var g2  = sv('g', '', {});
    var sh2 = sv('rect', 'fs-postm',   { width: POSTW, rx: 2 });
    var tip = sv('path', 'fs-posttip', { d: '' });
    var ed  = sv('path', 'fs-poste',   { d: '' });
    g2.appendChild(sh2); g2.appendChild(tip); g2.appendChild(ed);
    gD.appendChild(g2);
    S.dPost.push({ g: g2, sh: sh2, tip: tip, ed: ed });
  }

  // the shortfall, dimensioned the way a drawing dimensions one
  S.dExt  = sv('path', 'fs-ext',  { d: '' });
  S.dDim  = sv('path', 'fs-dim',  { d: '' });
  S.dDimA = sv('path', 'fs-dima', { d: '' });
  S.dDimV = txt('fs-dimvn', '', { x: 0, y: 0 });
  /* A DIMENSION WITH NO NOUN IS NOT A DIMENSION. The band was marked "27%" and
     nothing on the sheet said 27% of what — on a drawing that is otherwise
     engineering-grade, and for a paying client who should not have to infer
     it. The value stays on the band where it belongs; the noun goes on the
     line under the verdict, where there is room for it. Measured: the gutter
     the dimension sits in is 32 units wide and "of the coat depth" is 90, so
     it could never have gone beside the number. */
  S.dGapT = txt('fs-never', 'Never touched',
    { x: P2W / 2, y: FLOORY + 18, 'text-anchor': 'middle' });
  S.dGapT2 = txt('fs-neverx', '', { x: P2W / 2, y: FLOORY + 34, 'text-anchor': 'middle' });
  gD.appendChild(S.dExt); gD.appendChild(S.dDim);
  gD.appendChild(S.dDimA); gD.appendChild(S.dDimV);
  gD.appendChild(S.dGapT); gD.appendChild(S.dGapT2);

  /* Band names sit OUTSIDE the stack, on tick leaders, in a column of their
     own. The previous build set them in panel A's remaining sixty units and
     they ran off the sheet. */
  S.bands = [];
  ['Strap', 'Coat', 'Skin'].forEach(function (t) {
    var bl = sv('path', 'fs-bandl', { d: '' });
    var bt = txt('fs-anat', t, { x: DX1 + 13, y: 0 });
    gD.appendChild(bl); gD.appendChild(bt);
    S.bands.push({ ln: bl, tx: bt });
  });

  svg.appendChild(gR);
  svg.appendChild(gD);
  svg.appendChild(sv('line', 'fs-div', { x1: DIVX, y1: RULEY + 4, x2: DIVX, y2: SEC_Y1 }));

  // ── the footer: three verdicts, off the same functions the card reads ─────
  svg.appendChild(sv('line', 'fs-rule', { x1: LEFTM, y1: FOOTY, x2: VBW - LEFTM, y2: FOOTY }));
  S.chips = [];
  for (i = 0; i < 3; i++) {
    var cw = CHIP[i][1] - CHIP[i][0];
    var cr = sv('rect', 'fs-chip', { x: CHIP[i][0], y: CHIPY, width: cw, height: CHIPH, rx: 7 });
    var ct = txt('fs-chipt', '', { x: CHIP[i][0] + cw / 2, y: CHIPY + 17.2, 'text-anchor': 'middle' });
    svg.appendChild(cr); svg.appendChild(ct);
    S.chips.push({ rect: cr, tx: ct, x0: CHIP[i][0], x1: CHIP[i][1] });
  }

  return S;
}

// ═══════════════════════════════════════════════════════════════════════════
//  DRAW
// ═══════════════════════════════════════════════════════════════════════════

function updateSection() {
  if (!SEC) return;
  var S = SEC, s = set.height, d = deg(), a = set.clock;
  var slack = slackAt(set.tension), sq = squeezeAt(slack);
  var eD = effDepth(), pL = postLen(), rch = reaches();
  var c = centroid(s);
  var i, j, q, w;

  var vc = vClock(), vt = vTension(), vco = vCoat();
  var F = frameOf(s, eD, c);

  // ── outlines ─────────────────────────────────────────────────────────────
  /* The coat is an ANNULUS, not a disc: the outline the raycast hit, with the
     skin outline punched out of it by the even-odd rule. Drawn as a disc it
     covered the whole animal, which is how the section came to be a blob. */
  S.coat.setAttribute('d',  ringPath(s, 0, c, null, null, true) +
                            ringPath(s, -eD, c, null, null, true));
  S.coatE.setAttribute('d', ringPath(s, 0, c, null, null, true));
  S.flesh.setAttribute('d', ringPath(s, -eD, c, null, null, true));
  S.skinB.setAttribute('d', ringPath(s, -eD, c, null, null, true));
  S.skinL.setAttribute('d', ringPath(s, -eD, c, null, null, true));

  /* THE COAT IS HAIR, AT ITS MEASURED DEPTH. The annulus between the outline
     the raycast hit and the skin under it is exactly effDepth() deep, so the
     hair IS the measurement: a January ruff visibly stands where an August
     coat lies flat, and that is the whole of decision 4 in one picture. */
  var hd = '', NH = 136;
  if ((eD * K) > 1.6) {
    for (i = 0; i < NH; i++) {
      var ha = (i / NH) * Math.PI * 2 + (JIT[i % 220] - 0.5) * 0.012;
      var rC = radiusAt(s, ha) * K, rS = (radiusAt(s, ha) - eD) * K;
      var rT = rS + (rC - rS) * (0.62 + 0.38 * JIT[(i * 7) % 220]);
      var bend = (JIT[(i * 3 + 5) % 220] - 0.5) * 0.10;
      hd += 'M' + n1(F.O[0] + Math.sin(ha) * rS) + ' ' + n1(F.O[1] - Math.cos(ha) * rS) +
            'L' + n1(F.O[0] + Math.sin(ha + bend) * rT) + ' ' + n1(F.O[1] - Math.cos(ha + bend) * rT);
    }
  }
  S.hair.setAttribute('d', hd);

  /* Crushed coat. There is no way to dent a mesh we do not own, so the tight
     end of the slider is shown here instead of pretended at in 3D: the coat
     is redrawn inside itself, in the fail colour, by exactly how far past two
     fingers the strap has been pulled. */
  show(S.press, sq > 0, 'fs-press');
  if (sq > 0) S.press.setAttribute('d', ringPath(s, -Math.min(sq, eD * 0.9), c, null, null, true));

  // ── the anatomy ──────────────────────────────────────────────────────────
  /* THE MEDIAN PLANE, AND WHAT RIDES ON IT. See medianX(): each midline
     structure keeps the shape and the depth uv() gives it and is slid rigidly
     sideways onto one plane, so the windpipe, the gullet, the bone, the sheath
     pair and the ligament cannot disagree about where the middle of the animal
     is. Computed here, before anything is drawn, because the muscle bellies
     defined against two of them travel with them. */
  F.mx = medianX(F);
  var vAx = 0;
  for (i = 0; i < VERT.out.length; i++) vAx += uv(F, 0, VERT.out[i][1])[0];
  vAx /= VERT.out.length;
  var shL = uv(F, -SHEATH.u, SHEATH.v), shR = uv(F, SHEATH.u, SHEATH.v);
  F.sl = {
    trach:  slideTo(F.mx, uv(F, TRACH.u, TRACH.v)[0]),
    oes:    slideTo(F.mx, uv(F, OESOPH.u, OESOPH.v)[0]),
    vert:   slideTo(F.mx, vAx),
    sheath: slideTo(F.mx, (shL[0] + shR[0]) / 2)
  };
  /* Which belly travels with which structure: the sternohyoideus pair with the
     windpipe it lies under, the longus colli with the body it hangs from. The
     two big lateral masses belong to the outline and do not move. */
  var MSL = [0, 0, F.sl.trach, F.sl.vert];

  for (i = 0; i < MUSCLE.length; i++) {
    for (j = 0; j < 2; j++) {
      var sgn = j ? 1 : -1, M = MUSCLE[i], P = [], mp0;
      for (q = 0; q < M.p.length; q++) {
        mp0 = uv(F, M.p[q][0] * sgn, M.p[q][1]);
        P.push([mp0[0] + MSL[i], mp0[1]]);
      }
      S.mus[i * 2 + j].setAttribute('d', spline(P));
      var A = uv(F, M.ax[0][0] * sgn, M.ax[0][1]), B = uv(F, M.ax[1][0] * sgn, M.ax[1][1]);
      A = [A[0] + MSL[i], A[1]]; B = [B[0] + MSL[i], B[1]];
      var vx = B[0] - A[0], vy = B[1] - A[1];
      var L = Math.sqrt(vx * vx + vy * vy) || 1;
      var nx = -vy / L, ny = vx / L, fd = '';
      for (w = -1; w <= 1; w++) {
        var off = w * Math.min(9, L * 0.20);
        fd += 'M' + n1(A[0] + vx * 0.14 + nx * off) + ' ' + n1(A[1] + vy * 0.14 + ny * off) +
              'L' + n1(A[0] + vx * 0.86 + nx * off) + ' ' + n1(A[1] + vy * 0.86 + ny * off);
      }
      S.fib[i * 2 + j].setAttribute('d', fd);
    }
  }

  /* The nuchal ligament — the elastic band on the dorsal midline that holds
     the head up, and half the reason the crest is no place for a contact.
     Built on the midline rather than mapped point by point: see the note at
     NUCH for what was shearing and why the map could not hold it. Its axis is
     the vertebral spine's own x at every height, its top is solved against the
     dorsal fascia, and its width is a fraction of the measured half-width, so
     it shrinks with the neck instead of growing as the neck narrows. */
  var NA = nuchAxis(F);
  F.nuch = NA;
  var NP = [], nfd = '';
  for (i = 0; i < NUCH.length; i++) NP.push(nuchPt(NA, NUCH[i][0], NUCH[i][1]));
  S.nuch.setAttribute('d', spline(NP));
  for (i = 0; i < NUCH_F.length; i++) {
    var f0 = nuchPt(NA, NUCH_F[i][0], NUCH_F[i][1]);
    var f1 = nuchPt(NA, NUCH_F[i][2], NUCH_F[i][3]);
    nfd += 'M' + n1(f0[0]) + ' ' + n1(f0[1]) + 'L' + n1(f1[0]) + ' ' + n1(f1[1]);
  }
  S.nuchF.setAttribute('d', nfd);

  /* THE CERVICAL VERTEBRA, as one bone. The right half is listed in VERT.out
     and mirrored here, so the outline runs ventral crest → body → transverse
     process → articular process → spine → and back down the other side as a
     single closed spline. The spongy interior is the same outline pulled in
     toward the bone's own centre, which leaves a cortex of even thickness all
     the way round instead of an offset that thins on the processes. */
  /* On the median plane, rigidly: uvV is uv with the bone's own slide added.
     Shape and depth are exactly what the map gave; only the plane changed. */
  function uvV(u, v) { var p = uv(F, u, v); return [p[0] + F.sl.vert, p[1]]; }
  var VP = [], vcx = 0, vcy = 0;
  for (i = 0; i < VERT.out.length; i++) VP.push(uvV(VERT.out[i][0], VERT.out[i][1]));
  for (i = VERT.out.length - 2; i >= 1; i--) VP.push(uvV(-VERT.out[i][0], VERT.out[i][1]));
  for (i = 0; i < VP.length; i++) { vcx += VP[i][0]; vcy += VP[i][1]; }
  vcx /= VP.length; vcy /= VP.length;
  S.vBone.setAttribute('d', spline(VP));
  var VI = [];
  for (i = 0; i < VP.length; i++) {
    VI.push([vcx + (VP[i][0] - vcx) * 0.84, vcy + (VP[i][1] - vcy) * 0.84]);
  }
  S.vSpong.setAttribute('d', spline(VI));
  var vcn = uvV(0, VERT.cv);
  var vbf = uvV(0, VERT.bv - VERT.by);
  var vbl = uvV(-VERT.bx * 0.86, VERT.bv - VERT.by * 0.55);
  var vbr = uvV( VERT.bx * 0.86, VERT.bv - VERT.by * 0.55);
  /* The floor of the canal — the line the reference shows between the body
     and the cord above it. It is why the body reads as the body. */
  S.vFloor.setAttribute('d',
    'M' + n1(vbl[0]) + ' ' + n1(vbl[1]) +
    'Q' + n1(vbf[0]) + ' ' + n1(vbf[1] + (vbf[1] - vcn[1]) * 0.10) + ' ' +
          n1(vbr[0]) + ' ' + n1(vbr[1]));
  S.vCanal.setAttribute('d', ellPath(vcn[0], vcn[1], VERT.cx * F.HW, VERT.cy * F.HH));
  S.vCord.setAttribute('d', ellPath(vcn[0], vcn[1], VERT.cx * 0.72 * F.HW, VERT.cy * 0.70 * F.HH));
  var gx = VERT.cx * 0.32 * F.HW, gy = VERT.cy * 0.40 * F.HH;
  S.vGrey.setAttribute('d',
    'M' + n1(vcn[0] - gx) + ' ' + n1(vcn[1] - gy) +
    'Q' + n1(vcn[0]) + ' ' + n1(vcn[1]) + ' ' + n1(vcn[0] - gx) + ' ' + n1(vcn[1] + gy) +
    'M' + n1(vcn[0] + gx) + ' ' + n1(vcn[1] - gy) +
    'Q' + n1(vcn[0]) + ' ' + n1(vcn[1]) + ' ' + n1(vcn[0] + gx) + ' ' + n1(vcn[1] + gy));

  /* THE OESOPHAGUS, WHICH WAS A SNOWFLAKE. A pink pill with a white asterisk
     stroked across it — an icon, on a plate where everything else was a
     section. It is a tube now: an outer muscular wall, a submucosa inside it,
     and a lumen that is FILLED and folded shut, with rays of unequal length so
     it cannot fall back into being a symbol. Nothing about it is stroked
     radially any more; the folds are the shape of the hole. */
  var oe = uv(F, OESOPH.u, OESOPH.v);
  oe = [oe[0] + F.sl.oes, oe[1]];
  var orx = OESOPH.rx * F.HW, ory = OESOPH.ry * F.HH;
  S.oes.setAttribute('d',  ellPath(oe[0], oe[1], orx, ory));
  S.oesM.setAttribute('d', ellPath(oe[0], oe[1], orx * 0.76, ory * 0.72));
  S.oesL.setAttribute('d', foldPath(oe[0], oe[1], orx * 0.64, ory * 0.56, OES_LUMEN));

  /* The carotid sheaths, lateral to the windpipe. Two vessels with walls, not
     three specks: the jugular is the wide thin-walled one, the carotid the
     small thick-walled one, and the wall thicknesses are set in the stylesheet
     so the difference survives being shrunk to a phone. */
  for (j = 0; j < 2; j++) {
    var sg = j ? 1 : -1;
    var sc = uv(F, SHEATH.u * sg, SHEATH.v);
    /* The PAIR is slid, by one number, so the two stay a pair. */
    sc = [sc[0] + F.sl.sheath, sc[1]];
    var srx = SHEATH.rx * F.HW, sry = SHEATH.ry * F.HH;
    /* Both vessels are kept fully inside the sheath, checked at the corner
       that fails first: an ellipse offset 0.44 with a half-width of 0.38 sits
       inside at its own centre line and pokes out at its own top, which is
       what the last pass shipped. 0.40 + 0.32 clears at every latitude. */
    S.sheath[j].setAttribute('d', ellPath(sc[0], sc[1], srx, sry));
    S.vein[j].setAttribute('d',  ellPath(sc[0] - srx * 0.28 * sg, sc[1] + sry * 0.14, srx * 0.54, sry * 0.58));
    S.art[j].setAttribute('d',   ellPath(sc[0] + srx * 0.40 * sg, sc[1] - sry * 0.24, srx * 0.32, sry * 0.34));
  }

  /* THE WINDPIPE, drawn as it is actually cut: a C of cartilage open dorsally
     and closed across the gap by the trachealis muscle, with the rings behind
     it showing because this neck is cut obliquely. It is the heaviest line in
     the section on purpose — "on either side of the dog's windpipe" (p.27) is
     the only thing the manual says about where the receiver goes, and the
     student has to be able to see that the points are beside this and not on
     top of it. */
  var tc = uv(F, TRACH.u, TRACH.v);
  tc = [tc[0] + F.sl.trach, tc[1]];
  var trx = TRACH.rx * F.HW, trry = TRACH.ry * F.HH;
  /* THE LUMEN IS A HOLE AND IT IS DRAWN AS ONE. It was filled #FBF8F1 — a
     hair off the fascia behind it — so the one structure the manual names by
     name carried less weight than the muscle around it, and at shipping size
     you could not find it. It is the darkest thing inside this outline now. */
  function cArc(rx, ry, open, dy) {
    var dd = '', N = 40, k;
    for (k = 0; k <= N; k++) {
      var t = -Math.PI / 2 + open / 2 + (Math.PI * 2 - open) * (k / N);
      dd += (k ? 'L' : 'M') + n1(tc[0] + Math.cos(t) * rx) + ' ' +
            n1(tc[1] + (dy || 0) + Math.sin(t) * ry);
    }
    return dd;
  }
  /* The bore, showing dorsally where the cut opens into it. It is still the
     darkest thing inside the outline — that has not changed and should not. */
  /* The bore, sized off the front ring's own INNER edge — 4.6 units in from
     its centreline, which is half the 9-unit cartilage stroke — so the dark
     hole is exactly what that ring encloses and not an ellipse guessed at. */
  S.tLum.setAttribute('d', ellPath(tc[0], tc[1] - trry * 0.30,
    Math.max(2, trx * 0.92 - 4.6), Math.max(1.6, trry * 0.54 - 4.6)));
  /* FOUR RINGS DOWN THE TUBE. Each C opens dorsally and is closed across the
     gap by the trachealis; each is a little narrower and a little flatter as
     it recedes down the oblique cut. One ring was a keyhole. Four is a
     windpipe, and it is the reason the reference reads in a quarter of a
     second. */
  var TR_OPEN = 0.84;
  for (i = 0; i < TRING_N; i++) {
    var rf = TRING_N > 1 ? i / (TRING_N - 1) : 0;
    var rrx = trx * (0.92 - 0.15 * rf);
    var rry = trry * (0.54 - 0.09 * rf);
    var rdy = trry * (-0.30 + 0.86 * rf);
    var dR = cArc(rrx, rry, TR_OPEN, rdy);
    S.tRings[i].o.setAttribute('d', dR);
    S.tRings[i].i.setAttribute('d', dR);
  }
  /* The trachealis, closing the first ring's gap dorsally. It is set from that
     ring's own numbers, so it lands on the two cut ends rather than near them. */
  var mgx = Math.cos(-Math.PI / 2 + TR_OPEN / 2) * trx * 0.92;
  var mgy = Math.sin(-Math.PI / 2 + TR_OPEN / 2) * trry * 0.54;
  S.tMus.setAttribute('d',
    'M' + n1(tc[0] - mgx) + ' ' + n1(tc[1] - trry * 0.30 + mgy) +
    'L' + n1(tc[0] + mgx) + ' ' + n1(tc[1] - trry * 0.30 + mgy));

  // ── the annotation ring ──────────────────────────────────────────────────
  /* Where the band stands this frame. See zoneR(): the smaller of a constant
     proportion of the section, the strap's own outermost ink, and the ceiling
     the whole plate was sized against. */
  var zR = zoneR(s, slack);
  for (i = 0; i < S.zones.length; i++) {
    var bnd = S.zones[i].band;
    S.zones[i].node.setAttribute('d', ringPath(s, zR, c, bnd[0], bnd[1], false));
  }
  /* The twelve index marks now STRADDLE the band rather than standing outside
     it. Outside, they were the outermost ink on the sheet and cost the
     section 0.025 model units of radius on every side for nothing. */
  var idd = '';
  for (i = 0; i < 12; i++) {
    var ia = (i / 12) * Math.PI * 2;
    var lng = (i % 3) === 0;
    var q0 = ringPt(s, ia, zR + IDX_D0, c);
    var q1 = ringPt(s, ia, zR + (lng ? IDX_D1 : IDX_D1S), c);
    idd += 'M' + n1(q0[0]) + ' ' + n1(q0[1]) + 'L' + n1(q1[0]) + ' ' + n1(q1[1]);
  }
  S.idx.setAttribute('d', idd);

  // ── the strap, and the two fingers ───────────────────────────────────────
  S.strap.setAttribute('d', strapRingPath(s, slack, a, c));

  /* ── WHERE THE TWO FINGERS ACTUALLY GO ─────────────────────────────────
     Taken blindly on the ray opposite the receiver, this under-read the loop
     by 2.3x: the housing presses it down over ±74 deg and the slack drops
     toward the underside, so on a 4½ o'clock fit the widest point is nearer
     7. That put the measure under its own draw threshold at exactly the
     tension the app marks as a PASS — the manual's second target had no
     picture at the one fit that meets it. Scan for the real maximum. */
  var aOpp = a + Math.PI, best = -1;
  for (i = 0; i < 72; i++) {
    var ai = (i / 72) * Math.PI * 2;
    var oi = strapOff(ai, slack, a);
    if (oi > best) { best = oi; aOpp = ai; }
  }
  var gapMod = best - 0.0006;
  var gapPx = gapMod * K;
  var pC = ringPt(s, aOpp, 0, c), pS = ringPt(s, aOpp, gapMod + 0.0006, c);
  var dvx = pS[0] - pC[0], dvy = pS[1] - pC[1];
  var vl = Math.sqrt(dvx * dvx + dvy * dvy) || 1;
  var ux = dvx / vl, uy = dvy / vl;
  var tx = -uy * 6.5, ty = ux * 6.5;

  /* 3.7 units, not 2.4: the loosest tension that still passes leaves 3.8
     units of gap at this K, and a threshold above that hides the measure on a
     pass. Below it the strap is tight enough that the dimension is
     meaningless, and that is the end of the slider where the pressure band
     and the Tight verdict do the talking instead. */
  var dimOn = gapPx >= 3.7;
  show(S.gapA, dimOn, 'fs-gapm is-' + vt);
  show(S.gapH, dimOn, 'fs-gapmh');
  if (dimOn) {
    var dimd =
      'M' + n1(pC[0] - tx) + ' ' + n1(pC[1] - ty) + 'L' + n1(pC[0] + tx) + ' ' + n1(pC[1] + ty) +
      'M' + n1(pS[0] - tx) + ' ' + n1(pS[1] - ty) + 'L' + n1(pS[0] + tx) + ' ' + n1(pS[1] + ty) +
      'M' + n1(pC[0]) + ' ' + n1(pC[1]) + 'L' + n1(pS[0]) + ' ' + n1(pS[1]) +
      head(pC[0], pC[1], -ux, -uy, 4.4, 2.0) + head(pS[0], pS[1], ux, uy, 4.4, 2.0);
    S.gapA.setAttribute('d', dimd);
    S.gapH.setAttribute('d', dimd);
  }

  // ── the receiver, standing on the strap face at its clock angle ──────────
  var rp = ringPt(s, a, strapOff(a, slack, a), c);
  S.rx.setAttribute('transform',
    'translate(' + n1(rp[0]) + ' ' + n1(rp[1]) + ') rotate(' + n1(d) + ')');
  S.rxBody.setAttribute('class', 'fs-rxbody is-' + vc);
  /* TRUE SCALE, and now visible at it. postLen() straight through: 7.9 units
     on the standard pair, 13.0 on the longer one. What changed is the section
     through the post — 4.6 units of turned steel with a domed tip instead of a
     3.2-unit stroke — and the fact that it is now named.

     The posts stay STEEL whether they reach or not, which is what panel A has
     always done and what this stylesheet's own note says: they are metal. The
     ring's job is where the points are; whether they get through the coat is
     panel A's job, and it is carried there four ways. A post that changed
     colour when it was in the wrong place made two drawings of one object. */
  var pl = Math.max(2.4, pL * K);
  for (q = 0; q < 2; q++) {
    var pxq = (q ? RXPX : -RXPX) - RXPW / 2;
    var pty = pl - RXPW * 0.34;
    S.rxPost[q].sh.setAttribute('height', n1(Math.max(1.5, pty + 4)));
    S.rxPost[q].tip.setAttribute('d',
      'M' + n1(pxq) + ' ' + n1(pty) +
      'Q' + n1(pxq + RXPW / 2) + ' ' + n1(pl + RXPW * 0.26) + ' ' +
            n1(pxq + RXPW) + ' ' + n1(pty) + 'Z');
    S.rxPost[q].ed.setAttribute('d',
      'M' + n1(pxq) + ' -2V' + n1(pty) + 'M' + n1(pxq + RXPW) + ' -2V' + n1(pty));
  }

  /* The needle. The receiver is the pointer and the zone band is the scale it
     is read against, so the two are joined rather than left to be guessed at
     across a gap that changes with the tension slider. */
  /* It stops on the band's own INNER edge — half the arc's stroke plus a
     hairline — rather than at a constant 0.009, because the band moves now and
     a constant inset measured against a moving scale is a guess. */
  var nSt = ringPt(s, a, strapOff(a, slack, a) + 15.2 / K, c);
  var nEn = ringPt(s, a, zR - (2.3 + 1.5) / K, c);
  var ndx = nEn[0] - nSt[0], ndy = nEn[1] - nSt[1];
  var ndl = Math.sqrt(ndx * ndx + ndy * ndy);
  show(S.rxNeedle, ndl > 3.5, 'fs-needle is-' + vc);
  if (ndl > 3.5) {
    S.rxNeedle.setAttribute('d',
      'M' + n1(nSt[0]) + ' ' + n1(nSt[1]) + 'L' + n1(nEn[0]) + ' ' + n1(nEn[1]) +
      head(nEn[0], nEn[1], ndx / ndl, ndy / ndl, Math.min(5, ndl * 0.62), 2.6));
  }

  S.lensC.setAttribute('cx', n1(rp[0]));
  S.lensC.setAttribute('cy', n1(rp[1]));
  var bx2 = rp[0] + (rp[0] > SX ? 1 : -1) * 26 - 8.5, by2 = rp[1] - 30;
  bx2 = Math.max(1, Math.min(LEADX - 20, bx2));
  by2 = Math.max(SEC_Y0 + 1, Math.min(SEC_Y1 - 18, by2));
  S.lensB.setAttribute('x', n1(bx2));
  S.lensB.setAttribute('y', n1(by2));
  S.lensT.setAttribute('x', n1(bx2 + 8.5));
  S.lensT.setAttribute('y', n1(by2 + 12.6));

  // ── the key ──────────────────────────────────────────────────────────────
  /* Four structures, all of them on the right half of the section. A leader
     leaves along its own ray, stops just outside the ring, and turns once
     into the column. The exit is then CLAMPED into the section band, which
     shortens a radial at the extremes of the height slider but cannot change
     the order the exits are in. Rows are sorted by exit height and take
     column slots in that order, so ring order and column order are one order
     and no two leaders can cross. */
  /* The receiver's own transform, read back as maths, so the contact-point
     anchor is the tip of a post the student can see and not a guess at it. */
  var dr = d * Math.PI / 180, cdr = Math.cos(dr), sdr = Math.sin(dr);
  function rxLoc(lx, ly) {
    return [rp[0] + lx * cdr - ly * sdr, rp[1] + lx * sdr + ly * cdr];
  }
  /* Which post the leader touches: the one nearer the column, whichever way
     round the dial the receiver has been turned. */
  var tipA = rxLoc(-RXPX, pl), tipB = rxLoc(RXPX, pl);
  var cpSgn = tipB[0] >= tipA[0] ? 1 : -1;
  var cpAnc = cpSgn > 0 ? tipB : tipA;
  /* AND IT LEAVES SIDEWAYS FIRST. A leader that goes straight out along its
     own radius from a post tip runs back up the post and over the housing —
     it would lie on top of the one thing it is pointing at. One tangential
     step in the receiver's own frame, past the edge of the housing, and only
     then out to the ring. */
  var cpPre = rxLoc(cpSgn * (RXPX + 15), pl * 0.5);

  /* 2.2, not 2. The leader carries a 4.2-unit paper casing under it so it
     survives crossing the strap, and half of that is 2.1: clamped to x = 2 the
     casing reached x = -0.1 and the root <svg> quietly took a tenth of a unit
     of it off the left edge. Ink is what overflows, not coordinates. */
  function exitAt(aa) {
    var rr = (radiusAt(s, aa) + zR + EXIT_D) * K;
    return [Math.max(2.2, Math.min(LEADX - 8, F.O[0] + Math.sin(aa) * rr)),
            Math.max(SEC_Y0 + 3, Math.min(SEC_Y1 - 3, F.O[1] - Math.cos(aa) * rr))];
  }
  var TAU = Math.PI * 2;
  /* WHERE "SKIN" POINTS. The skin is a layer, not a place, so its anchor sits
     IN the layer — on the outline the skin band is stroked along, at -effDepth
     off the coat — and it is picked each frame from five stations on the right
     half, whichever stands furthest round the neck from the receiver. Fixed,
     it would have spent part of the dial underneath the housing, pointing at a
     structure the student cannot see for the box on top of it. */
  var skA = 1.05, skBest = -1;
  [0.55, 0.92, 1.29, 1.66, 2.03].forEach(function (aa) {
    var dd = angDiff(aa, a);
    if (dd > skBest) { skBest = dd; skA = aa; }
  });
  F.skin = ringPt(s, skA, -eD, c);
  var rows = [];
  for (i = 0; i < S.keys.length; i++) {
    var sp2 = S.keys[i].spec;
    var anc = sp2.rx ? cpAnc : sp2.at(F);
    var pre = sp2.rx ? [cpPre] : [];
    var from = pre.length ? pre[pre.length - 1] : anc;
    var ang = Math.atan2(from[0] - F.O[0], -(from[1] - F.O[1]));
    var nrm = ((ang % TAU) + TAU) % TAU;
    /* ONLY THE RECEIVER MAY BE ON THE LEFT, AND NOW THAT IS ENFORCED RATHER
       THAN ASSUMED. The old comment said "only the fifth entry can ever be
       here"; it was a claim about where four hand-picked anchors happened to
       fall, and the key now carries three anchors quoted ON the midline — the
       ligament, the vertebra and the cord. M is not O, so a midline anchor can
       land a hair to the LEFT of the pole the exit angle is measured about, and
       a structure in the middle of the neck would then have been walked the
       whole way round the outside of the ring to reach a column four units to
       its right. A midline exit is a vertical one; it is clamped to that. */
    if (!sp2.rx && nrm > Math.PI) nrm = nrm > Math.PI * 1.5 ? 0.03 : Math.PI - 0.03;
    rows.push({ k: S.keys[i], anc: anc, pre: pre, ang: nrm,
                rx: !!sp2.rx, round: !!sp2.rx && nrm > Math.PI + 0.02 });
  }
  /* ── NO TWO LEADERS MAY LEAVE THE RING ON TOP OF EACH OTHER ───────────────
     Five of the nine structures sit on or beside the dorsal midline, so five
     leaders wanted to leave the ring inside a few degrees of 12 o'clock — and
     at 12 o'clock the receiver is there too, with a leader of its own. Two
     exits 1.2 units apart, going to rows 25 apart, is not a fan: it is a
     bundle that crosses itself the moment the rows separate. Measured at the
     shoulder with the strap at its loosest, that was four crossings among the
     anatomy leaders and nine counting the receiver's.

     So the exits are pushed apart on the ring before anything is drawn, the
     same way the rows are pushed apart in the column: 0.19 radians is about
     11 degrees, and nine of them is 1.7 radians inside the 2.9 the right half
     of the ring gives. The receiver's own exit is PINNED — it has to leave
     where its post is — and the anatomy moves round it. An exit that has been
     nudged is still a radial run out of the specimen, a few degrees off the
     structure's own bearing; it is the ONE freedom a draughtsman has here and
     it is the freedom that stops the fan tangling. */
  var MINA = 0.19, A0 = 0.10, A1 = Math.PI - 0.10;
  var sp3 = rows.filter(function (r) { return !r.round; });
  for (q = 0; q < 6; q++) {
    sp3.sort(function (p, r) { return p.ang - r.ang; });
    for (i = 1; i < sp3.length; i++) {
      var dd2 = sp3[i].ang - sp3[i - 1].ang;
      if (dd2 >= MINA) continue;
      var nd = MINA - dd2;
      if (sp3[i - 1].rx) sp3[i].ang += nd;
      else if (sp3[i].rx) sp3[i - 1].ang -= nd;
      else { sp3[i - 1].ang -= nd / 2; sp3[i].ang += nd / 2; }
    }
    for (i = 0; i < sp3.length; i++) {
      if (!sp3[i].rx) sp3[i].ang = Math.max(A0, Math.min(A1, sp3[i].ang));
    }
  }
  for (i = 0; i < rows.length; i++) {
    var R0 = rows[i];
    R0.way = R0.pre.slice();
    if (R0.round) {
      /* Left half. Route round the OUTSIDE of the ring — over the crest if the
         anchor is already past 9 o'clock, under the throat if it is not — and
         come into the column from the right, so a leader never crosses the
         specimen it is annotating. Only the receiver can ever be here, and only
         because it goes all the way round the dial. */
      var up = R0.ang > Math.PI * 1.5;
      var tgt = up ? TAU + 0.40 : Math.PI - 0.40;
      for (q = 0; q <= 16; q++) R0.way.push(exitAt(R0.ang + (tgt - R0.ang) * (q / 16)));
    } else {
      R0.way.push(exitAt(R0.ang));
    }
    var last = R0.way[R0.way.length - 1];
    R0.y = last[1]; R0.o = last[1];
  }
  rows.sort(function (p, r) { return p.o - r.o; });
  /* Spread, then SHIFT THE WHOLE BLOCK rather than pinning its top. Pinning
     the top pushed the column down past the section on the small sections
     high on the neck, each label on a long diagonal to an anchor nowhere near
     it. Moving the block keeps every label as close to its own structure as
     the stack allows. The column cannot run out of room and collapse its own
     leading now: three gaps of 22 is 66 units against 250 of span. */
  /* ── NINE ROWS, AND THE GAP IS NOW PER PAIR ───────────────────────────────
     One constant gap had to be set by the worst neighbours the column can ever
     have — two two-line entries touching — and then EVERY pair paid for it. At
     the shoulder that was a real fault and not just wasted paper: five of the
     nine structures are on or near the dorsal midline, so five leaders leave
     the ring inside a 50-unit band of crest while their labels were being
     forced 100 units apart. A leader that has to fall twice as far as its
     neighbour arrives at a shallower angle, and two leaders at different
     angles into one column is how a fan crosses itself. Measured: at height 0
     with the strap at its loosest, six crossings.

     So the gap is what the two rows actually need. At 10.6 px a baseline
     carries 8.0 units of cap above it and 3.0 of descender below; a two-line
     entry straddles its own leader, which puts 10.0 above and 12.6 below. 3
     units of air between the two, and the rest is arithmetic:

         one over one   14      one over two   16
         two over one   23.6    two over two   25.6

     Nine rows now close up to about 135 units of the 236 the band holds, which
     is what puts every name beside its own structure instead of somewhere in a
     evenly-spaced list — and the fan tightens with it. */
  /* TOPY and BOTY are set from the TWO-LINE entry, not the one-line ones: its
     second baseline sits 11.6 units under the row's own y and its descender 3.0
     under that, so a bottom slot at 281 would have needed fitText to shove
     that line back up into the line above it. 275 and 39 are the numbers at
     which no row is ever clamped, so the leading is the leading everywhere. */
  var TOPY = SEC_Y0 + 12, BOTY = SEC_Y1 - 16, n = rows.length, sh;
  function gapAt(k) {
    return 14 + (rows[k].k.tx.length > 1 ? 9.6 : 0) +
                (rows[k + 1].k.tx.length > 1 ? 2.0 : 0);
  }
  for (i = 1; i < n; i++) rows[i].y = Math.max(rows[i].y, rows[i - 1].y + gapAt(i - 1));
  sh = rows[n - 1].y - BOTY;
  if (sh > 0) for (i = 0; i < n; i++) rows[i].y -= sh;
  sh = TOPY - rows[0].y;
  if (sh > 0) for (i = 0; i < n; i++) rows[i].y += sh;
  for (i = 1; i < n; i++) rows[i].y = Math.max(rows[i].y, rows[i - 1].y + gapAt(i - 1));
  /* ── AND THEN THE FAN IS MEASURED, BECAUSE ORDER IS NOT ENOUGH ────────────
     Sorting the rows by where their leaders leave the ring guarantees that the
     column is in ring order. It does NOT guarantee that the runs into the
     column stay apart, and the difference is not academic: two exits 31 units
     apart across and 27 down, going to rows 25 apart, cross by 1.2 units — a
     hairline crossing is still a crossing, and it is the sort of thing that is
     invisible in a screenshot and obvious in a demo.

     So every neighbouring pair is asked the only question that matters: where
     does the upper leader's run to the column actually sit when it passes the
     lower leader's exit? If it has already fallen past it, the block of rows
     ABOVE is lifted bodily by the deficit — bodily, so every gap inside the
     block is untouched and only the gap at the fault opens. The lift is capped
     by the slack above TOPY, which is what makes this terminate: it can only
     ever spend what the column has, and four passes take the worst fault each
     time. The mirror case, where the lower leader's run comes up past the
     upper's exit, pushes the block below down against BOTY the same way. */
  var pass, i2, A2, B2, pa, pb, f2, over, wi, wf, ws, lift;
  for (pass = 0; pass < 4; pass++) {
    wi = -1; wf = 0; ws = 0; over = 0.35;
    for (i = 0; i < n - 1; i++) {
      A2 = rows[i]; B2 = rows[i + 1];
      pa = A2.way[A2.way.length - 1]; pb = B2.way[B2.way.length - 1];
      f2 = (pb[0] - pa[0]) / (LEADX - pa[0]);
      if (f2 > 0.2 && f2 < 1) {
        var ov = (pa[1] + (A2.y - pa[1]) * f2) - (pb[1] - 2.4);
        if (ov > over) { over = ov; wi = i; wf = f2; ws = -1; }
      }
      f2 = (pa[0] - pb[0]) / (LEADX - pb[0]);
      if (f2 > 0.2 && f2 < 1) {
        var uv2 = (pa[1] + 2.4) - (pb[1] + (B2.y - pb[1]) * f2);
        if (uv2 > over) { over = uv2; wi = i; wf = f2; ws = 1; }
      }
    }
    if (wi < 0) break;
    if (ws < 0) {
      lift = Math.min(over / wf, rows[0].y - TOPY);
      if (lift <= 0.25) break;
      for (i2 = 0; i2 <= wi; i2++) rows[i2].y -= lift;
    } else {
      lift = Math.min(over / wf, BOTY - rows[n - 1].y);
      if (lift <= 0.25) break;
      for (i2 = wi + 1; i2 < n; i2++) rows[i2].y += lift;
    }
  }
  for (i = 0; i < rows.length; i++) {
    var R = rows[i], kk = R.k;
    /* The turn is at LEADX — one fixed x, the same for all five and at every
       state, which is what the last round's comment claimed and the geometry
       did not do (it turned at a fixed RADIUS, which measured anywhere from
       135.8 to 184.8). The last 4 units into the label are horizontal. */
    var ld = 'M' + n1(R.anc[0]) + ' ' + n1(R.anc[1]);
    for (q = 0; q < R.way.length; q++) ld += 'L' + n1(R.way[q][0]) + ' ' + n1(R.way[q][1]);
    ld += 'L' + n1(LEADX) + ' ' + n1(R.y) + 'L' + n1(LBLX - 3) + ' ' + n1(R.y);
    kk.ln.setAttribute('d', ld);
    kk.hal.setAttribute('d', ld);
    kk.dot.setAttribute('cx', n1(R.anc[0]));
    kk.dot.setAttribute('cy', n1(R.anc[1]));
    /* A two-line entry straddles its own leader, so the leader still arrives
       at the middle of the name it is pointing at. */
    /* The leading came down with the type: 11.6 units between baselines on a
       10.6 px face instead of 13.2 on a 12.4 one, so a two-line name still
       reads as one name and not as two rows of the key. */
    var nl = kk.tx.length, y0 = R.y + 3.8 - (nl - 1) * 5.8;
    for (q = 0; q < nl; q++) {
      kk.tx[q].setAttribute('x', LBLX);
      kk.tx[q].setAttribute('y', n1(y0 + q * 11.6));
      S.fits.push([kk.tx[q], LBLX, P1W, SEC_Y0, SEC_Y1]);
    }
  }

  /* The ring's legend, laid out by MEASUREMENT: the second swatch is set from
     where the first label actually ended, so a wording change cannot make it
     collide and cannot leave a hole. */
  /* lx starts at 3.2, not 0: the swatch is the zone arc's own stroke and that
     stroke is 5.4 units with a round cap, so a swatch drawn from x = 0 puts
     2.7 units of ink off the left edge of the sheet. Ink is what overflows,
     not coordinates. */
  var lx = 3.2;
  for (i = 0; i < S.legS.length; i++) {
    var LG = S.legS[i];
    LG.sw.setAttribute('x1', n1(lx));
    LG.sw.setAttribute('x2', n1(lx + 15));
    LG.tx.setAttribute('x', n1(lx + 21));
    var lb = null;
    try { lb = LG.tx.getBBox(); } catch (e5) { lb = null; }
    lx = lb && lb.width ? lb.x + lb.width + 18 : lx + 150;
  }

  // ── panel A ──────────────────────────────────────────────────────────────
  /* The strap is drawn sitting ON the coat with no gap, because this is the
     section AT the receiver — where the loop has rolled onto the housing and
     the strap is pressed in, not where you slide two fingers under it. The
     ring above is where the slack is, and it draws and measures it. */
  var coatH   = Math.max(3.5, eD * MAG);
  var postH   = pL * MAG;
  var coatTop = SKINY - coatH;
  var strapY  = coatTop - STRAPH;         // the strap lies on the coat
  var tipY    = Math.min(coatTop + postH, SKINY + 10);

  S.dCoat.setAttribute('y', n1(coatTop));
  S.dCoat.setAttribute('height', n1(coatH));
  S.dStrapL.setAttribute('y', n1(strapY));
  S.dStrapR.setAttribute('y', n1(strapY));
  S.dStitch.setAttribute('d',
    'M' + (DX0 + 3) + ' ' + n1(strapY + 4) + 'H' + (HOX - 2) +
    'M' + (DX0 + 3) + ' ' + n1(strapY + STRAPH - 4) + 'H' + (HOX - 2) +
    'M' + (HOX + HOW + 2) + ' ' + n1(strapY + 4) + 'H' + (DX1 - 3) +
    'M' + (HOX + HOW + 2) + ' ' + n1(strapY + STRAPH - 4) + 'H' + (DX1 - 3));
  S.dHouse.setAttribute('y', n1(coatTop - HOH));
  S.dHouseT.setAttribute('d',
    'M' + (HOX + 6) + ' ' + n1(coatTop - HOH + 6) + 'H' + (HOX + HOW - 6));

  var bd = '';
  if (coatH > 3) {
    for (i = 0; DX0 + i * 3.1 <= DX1; i++) {
      var hx = DX0 + i * 3.1;
      var hl = coatH * (0.66 + 0.34 * JIT[(i * 11) % 220]);
      bd += 'M' + n1(hx) + ' ' + n1(SKINY) +
            'L' + n1(hx + (JIT[(i * 5 + 3) % 220] - 0.5) * 3.2) + ' ' + n1(SKINY - hl);
    }
  }
  S.dHair.setAttribute('d', bd);

  /* THE SKIN DIMPLES UNDER A POINT THAT REACHES IT. Manual p.27 asks that the
     points "press firmly against the dog's skin" — a flat skin line under a
     point that has arrived says only that it touched. */
  /* ── THE LAYERS ARE COTERMINOUS, BECAUSE LAYERS ARE ───────────────────────
     Strap and coat spanned 20..90; skin and flesh spanned 12..98. Three
     different left edges in a section through layered material, about 22 units
     apart, which at x2.8 on a big screen is 40 px of ragged edge. In a real
     section every layer is cut by the same saw and they all end on the same
     line. They do now: DX0..DX1, all five bands. */
  var dip = Math.max(0, tipY - SKINY);
  var sd = 'M' + DX0 + ' ' + SKINY;
  for (i = 0; i < 2; i++) {
    sd += 'L' + n1(PX[i] - 11) + ' ' + SKINY +
          'Q' + n1(PX[i]) + ' ' + n1(SKINY + dip * 1.6) + ' ' + n1(PX[i] + 11) + ' ' + SKINY;
  }
  sd += 'L' + DX1 + ' ' + SKINY;
  S.dSkin.setAttribute('d', sd);
  S.dSkinB.setAttribute('d', sd + 'v' + SKIN_T + 'H' + DX0 + 'Z');
  S.dFlesh.setAttribute('d',
    'M' + DX0 + ' ' + (SKINY + SKIN_T) + 'H' + DX1 +
    'V' + FLOORY + 'H' + DX0 + 'Z');

  // the posts: shaft, lit edges, domed tip
  for (i = 0; i < 2; i++) {
    var px = PX[i] - POSTW / 2;
    var top = coatTop - 11;            // screwed into the housing's face
    var ty2 = tipY - POSTW * 0.34;
    S.dPost[i].sh.setAttribute('x', n1(px));
    S.dPost[i].sh.setAttribute('y', n1(top));
    S.dPost[i].sh.setAttribute('height', n1(Math.max(2, ty2 - top)));
    S.dPost[i].tip.setAttribute('d',
      'M' + n1(px) + ' ' + n1(ty2) +
      'Q' + n1(PX[i]) + ' ' + n1(tipY + POSTW * 0.24) + ' ' + n1(px + POSTW) + ' ' + n1(ty2) + 'Z');
    S.dPost[i].ed.setAttribute('d',
      'M' + n1(px) + ' ' + n1(top) + 'V' + n1(ty2) +
      'M' + n1(px + POSTW) + ' ' + n1(top) + 'V' + n1(ty2));
    /* The posts stay METAL whether they reach or not, because they are metal.
       The failure is already carried four other ways — the hatched band, the
       dimension, the sentence under it and the verdict on the footer — and a
       steel post that turns to plastic the moment it is in the wrong place is
       what makes a drawing look like a diagram. */
  }

  /* THE SHORTFALL, DIMENSIONED. Everything in the hatched band is coat the
     points never reach into, at any level on the dial. It is drawn the way a
     drawing draws one: extension lines off the two levels, a dimension line
     between them with arrowheads, and the value beside it. */
  show(S.dGapB, !rch, 'fs-gapband');
  show(S.dExt,  !rch, 'fs-ext');
  show(S.dDim,  !rch, 'fs-dim');
  show(S.dDimA, !rch, 'fs-dima');
  show(S.dDimV, !rch, 'fs-dimvn');
  show(S.dGapT, !rch, 'fs-never');
  show(S.dGapT2, !rch, 'fs-neverx');
  /* A hidden label keeps whatever it last said. display:none takes it out of
     the accessibility tree, but it also survives into any serialisation of
     this SVG, and a plate that carries "Never touched" on a fit where the
     points ARE on skin is the picture disagreeing with the score again. */
  S.dGapT.textContent = rch ? '' : 'Never touched';
  if (!rch) {
    S.dGapB.setAttribute('y', n1(tipY));
    S.dGapB.setAttribute('height', n1(Math.max(0.6, SKINY - tipY)));
    var DIMX = DX0 - 12;
    S.dExt.setAttribute('d',
      'M' + n1(DIMX - 3) + ' ' + n1(tipY) + 'H' + n1(PX[0] - POSTW / 2) +
      'M' + n1(DIMX - 3) + ' ' + SKINY + 'H' + DX0);
    if ((SKINY - tipY) >= 10) {
      S.dDim.setAttribute('d', 'M' + n1(DIMX) + ' ' + n1(tipY) + 'V' + SKINY);
      S.dDimA.setAttribute('d',
        head(DIMX, tipY, 0, -1, 5.4, 2.5) + head(DIMX, SKINY, 0, 1, 5.4, 2.5));
    } else {
      /* Too shallow to arrow from the inside, so arrow it from the outside —
         which is what a draughtsman does, and it keeps the arrowheads the
         same size at every coat depth instead of shrinking them to nothing. */
      S.dDim.setAttribute('d', 'M' + n1(DIMX) + ' ' + n1(tipY - 9) + 'V' + (SKINY + 9));
      S.dDimA.setAttribute('d',
        head(DIMX, tipY, 0, 1, 5.4, 2.5) + head(DIMX, SKINY, 0, -1, 5.4, 2.5));
    }
    /* The value is the share of the coat the points never cross. It is a
       ratio of two measured depths, so it is true whatever the model's scale
       is — no unit is invented — and it is the number that decides whether
       this dog can feel anything at all. */
    S.dDimV.textContent = Math.round(((eD - pL) / eD) * 100) + '%';
    S.dDimV.setAttribute('x', n1(DIMX + 5));
    S.dDimV.setAttribute('y', n1((tipY + SKINY) / 2 + 5));
    /* And what the 27% is a fraction OF, in words, on the line under the
       verdict. Measured at 12.4/400 it is 131.3 units against the 143 panel A
       has, so it sets on one line and is never squeezed. */
    S.dGapT2.textContent = S.dDimV.textContent + ' of the coat depth';
    S.fits.push([S.dDimV, 0, PX[0] - POSTW / 2 - 2, SEC_Y0, SEC_Y1]);
    S.fits.push([S.dGapT, 0, P2W, FLOORY + 4, SEC_Y1]);
    S.fits.push([S.dGapT2, 0, P2W, FLOORY + 22, SEC_Y1]);
  } else {
    S.dDimV.textContent = '';
    S.dGapT2.textContent = '';
  }

  /* Band names, on tick leaders, in their own column. The band a name belongs
     to can be three units deep, so they are walked apart by MEASURED boxes
     rather than pushed by a constant: the sizes live in the stylesheet, and a
     constant here goes stale the moment anybody touches them. */
  var anch = [strapY + STRAPH / 2, coatTop + coatH / 2, SKINY + SKIN_T / 2 + 1];
  var lys = [anch[0], anch[1], anch[2]], prevBot = -1e9;
  for (i = 0; i < S.bands.length; i++) {
    var Bn = S.bands[i];
    Bn.tx.setAttribute('x', DX1 + 13);
    Bn.tx.setAttribute('y', n1(lys[i] + 4.4));
    var bb = null;
    try { bb = Bn.tx.getBBox(); } catch (e3) { bb = null; }
    if (bb && bb.height) {
      if (bb.y < prevBot + 3) {
        var shf = prevBot + 3 - bb.y;
        lys[i] += shf;
        Bn.tx.setAttribute('y', n1(lys[i] + 4.4));
        prevBot = bb.y + bb.height + shf;
      } else {
        prevBot = bb.y + bb.height;
      }
    }
    Bn.ln.setAttribute('d',
      'M' + (DX1 + 2) + ' ' + n1(anch[i]) + 'H' + (DX1 + 7) +
      'L' + (DX1 + 11) + ' ' + n1(lys[i]) + 'H' + (DX1 + 13));
    S.fits.push([Bn.tx, DX1 + 13, P2W, SEC_Y0, SEC_Y1]);
  }

  /* WHAT THIS STACK IS A SECTION THROUGH — and it names the ACTION, not the
     animal. The coat is already named on the control directly above the plate
     and again in decision 4's readout, and its depth is drawn here to scale;
     what the student cannot otherwise see is which of the four things they
     chose to do about it, and that is what changes this drawing. Both would
     not fit on one line at this type size — measured, not guessed. */
  S.aState.textContent = set.groom === 'clip' ? 'Neck clipped'
                       : set.groom === 'part' ? 'Coat parted'
                       : set.groom === 'longp' ? 'Longer points'
                       : 'Coat as it lies';
  S.fits.push([S.aState, 0, P2W - 28, RULEY + 2, 45]);
  S.fits.push([S.aScale, P2W - 44, P2W - 6, RULEY + 2, 45]);
  S.fits.push([S.aTitle, 19, P2W - 5, 2, RULEY - 2]);
  S.fits.push([S.p1t, LEFTM, P1W, 2, RULEY - 2]);
  for (i = 0; i < S.legS.length; i++) {
    S.fits.push([S.legS[i].tx, LEFTM, P1W, FOOTY - 22, FOOTY - 2]);
  }

  // ── the footer ───────────────────────────────────────────────────────────
  var cdefs = [
    [clockLabel(a), vc],
    [vt === 'ok' ? 'Two fingers' : slack > SNUG[1] ? 'Loose' : 'Tight', vt],
    [rch ? 'Points on skin' : 'Points stop in the coat',
     rch ? (vco === 'near' ? 'near' : 'ok') : 'no']
  ];
  for (i = 0; i < 3; i++) {
    S.chips[i].tx.textContent = cdefs[i][0];
    S.chips[i].rect.setAttribute('class', 'fs-chip is-' + cdefs[i][1]);
    S.chips[i].tx.setAttribute('class', 'fs-chipt is-' + cdefs[i][1]);
    S.fits.push([S.chips[i].tx, S.chips[i].x0 + 7, S.chips[i].x1 - 7, CHIPY, CHIPY + CHIPH]);
  }

  /* ── AND NOW MEASURE IT ────────────────────────────────────────────────
     Nothing above this line is trusted to have fitted. Every string that was
     just set is read back from the browser and held inside the panel it
     belongs to. This is the check the previous build did not have, and it is
     why "coat / parted / skin" could walk off the edge of the sheet with
     nobody noticing: the root <svg> clips at the viewBox and says nothing. */
  for (i = 0; i < S.fits.length; i++) {
    fitText(S.fits[i][0], S.fits[i][1], S.fits[i][2], S.fits[i][3], S.fits[i][4]);
  }
  S.fits.length = 0;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MARKING
// ═══════════════════════════════════════════════════════════════════════════

/* Every row is: what you did, and what it COSTS. A tick and a cross tell a
   student they were wrong; they do not tell them why anybody cares.
   Every row also says WHOSE rule it is. Two of the four are Dogtra's own
   words; two are course doctrine, and a student who cannot tell
   them apart will be caught out by an examiner holding the manual. */
function grade() {
  var rows = [], vc = vClock(), vt = vTension(), vco = vCoat();
  var d = deg(), g = groomNow();

  var hb = hBand();
  rows.push(hb === 'ok'
    ? { k: 'Height on the neck', src: 'Course doctrine', v: 'ok',
        was: 'High on the neck, behind the ears.',
        say: 'The neck is narrowest here and the skin is thinnest, so the points sit where they can reach it. It is also the one place a strap will not walk to somewhere worse. The manual sets no height — this one is ours.' }
    : hb === 'high'
      ? { k: 'Height on the neck', src: 'Course doctrine', v: 'no',
          was: 'Past the neck — up on the jaw.',
          say: 'Behind the ears is the TOP of the neck, not the head. Look at the dog: the strap is across the cheek and the box is under the chin. There is no collar on that neck.',
          cost: 'The strap has nothing to sit on. The skull is wider than the neck, so it drops the moment the dog moves, and until it does the points are on jaw muscle and bone — nowhere near the skin beside the windpipe. Come back down until the strap is tucked up under the jaw and sitting on neck.' }
    : hb === 'mid'
      ? { k: 'Height on the neck', src: 'Course doctrine', v: 'near', was: 'Mid-neck.',
          say: 'It works this minute.',
          cost: 'It will not stay there. A collar this low migrates down onto the shoulder over a session, a few millimetres at a time, and you will not see it happen — you will see a dog that has stopped answering.' }
      : { k: 'Height on the neck', src: 'Course doctrine', v: 'no', was: 'Down on the shoulder.',
          say: 'The neck is at its thickest here and the points are on muscle and coat, not skin.',
          cost: 'The dog stops answering, so the handler winds the dial up. Then the collar shifts back up the neck at a shake and the level you built on a dog that could not feel it lands all at once.' });

  rows.push(vc === 'ok'
    ? { k: 'Position round the neck', src: 'Manual p.27', v: 'ok',
        was: clockLabel(set.clock) + ' — beside the windpipe.',
        say: 'Dogtra says one thing about location and you are on it: the best location is on either side of the dog’s windpipe (p.27). Staying off the crest as well is course doctrine, not the manual’s.' }
    : (d > Z_PIPE[0] && d < Z_PIPE[1])
      ? { k: 'Position round the neck', src: 'Manual p.27', v: 'no',
          was: clockLabel(set.clock) + ' — on the windpipe.',
          say: 'Never here. The housing is sitting on the trachea, and the manual puts it beside the windpipe, not under it.',
          cost: 'A dog that hits the end of a lead is hurt by the collar before any stimulation is involved. It will cough, then it will start fighting the collar, and you will spend a week undoing that.' }
      : inBands(d, Z_CREST)
        ? { k: 'Position round the neck', src: 'Course doctrine', v: 'no',
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
    'Four decisions. Two are Dogtra’s own words — two fingers under the strap, and beside the windpipe (p.27). Where on the neck is course doctrine: the manual sets no height. The fourth is how you actually meet the manual’s first target, points on skin.'));
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
  /* The caption has to say what the plate is measuring, or the anatomy reads
     as decoration and the percentage in panel A reads as a mystery. */
  /* The caption is short because the plate is sticky: every line of it is a
     line of slider the student cannot see while they work it. */
  fig.appendChild(el('figcaption', 'fit-cap',
    'Live, and measured off the model: the outline is this dog’s neck at the height you have set, and the anatomy is scaled to it. Panel A is the same numbers at eight times the size.'));
  inner.appendChild(fig);

  // the four decisions
  var ol = el('ol', 'fit-decs');

  var d1 = decision(1, 'Height on the neck', 'shoulder → behind the ears',
    { t: 'Course doctrine. The manual gives no height.', man: false });
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
  /* '28' was left behind when the opening height moved to 0.12. Start over put
     the model on the shoulder and the slider at 28, so the live section and
     the control that drives it disagreed until the student touched it — which
     is the same fault as a picture that disagrees with the score, just quieter. */
  ui.r1.value = '12'; ui.r2.value = '0'; ui.r3.value = '18';
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
