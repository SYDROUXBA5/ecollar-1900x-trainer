/* man-rigged.glb builder.
   Takes the unrigged photogrammetry scan trainer.glb and produces a properly
   skinned humanoid: 22-bone skeleton fitted to the scan's own geometry,
   the fused trouser column cut open along the crotch plane, and per-vertex
   weights solved by heat diffusion over the welded mesh graph. */
const fs = require('fs');
const { readGLB, accessor } = require('./man-rig-glb');

const SRC = '/Users/remidroux/Desktop/E-COLLAR-1900X/trainer.glb';
const OUT = '/Users/remidroux/Desktop/E-COLLAR-1900X/_work/gauntlet/man-rigged.glb';

const { json: G, bin: BIN } = readGLB(SRC);
const prim = G.meshes[0].primitives[0];

let POS = Array.from(accessor(G, BIN, prim.attributes.POSITION));
let NRM = Array.from(accessor(G, BIN, prim.attributes.NORMAL));
let UV = Array.from(accessor(G, BIN, prim.attributes.TEXCOORD_0));
let IDX = Array.from(accessor(G, BIN, prim.indices));
let NV = POS.length / 3;
console.log('in: verts', NV, 'tris', IDX.length / 3);

/* ─────────────────────────────── 1. measure ─────────────────────────────── */
let minY = 1e9, maxY = -1e9;
for (let i = 0; i < NV; i++) { const y = POS[i * 3 + 1]; if (y < minY) minY = y; if (y > maxY) maxY = y; }
const GROUND = minY;
const STATURE = 1.875;                 // maxY-minY is 1.8985 but includes the cap
const f2y = f => GROUND + f * STATURE; // fraction of stature -> world y

// centroid of vertices inside a y band, optionally restricted in x
function band(y0, y1, xtest) {
  let sx = 0, sy = 0, sz = 0, n = 0, zmin = 1e9, zmax = -1e9, xmin = 1e9, xmax = -1e9;
  for (let i = 0; i < NV; i++) {
    const x = POS[i * 3], y = POS[i * 3 + 1], z = POS[i * 3 + 2];
    if (y < y0 || y > y1) continue;
    if (xtest && !xtest(x)) continue;
    sx += x; sy += y; sz += z; n++;
    if (z < zmin) zmin = z; if (z > zmax) zmax = z;
    if (x < xmin) xmin = x; if (x > xmax) xmax = x;
  }
  return { x: sx / n, y: sy / n, z: sz / n, n, zmin, zmax, xmin, xmax };
}

// split plane between the legs, measured where they are genuinely separate
const XSPLIT = 0.1055;
const legR = x => x < XSPLIT, legL = x => x >= XSPLIT;

const calfR = band(f2y(0.16), f2y(0.24), legR);
const calfL = band(f2y(0.16), f2y(0.24), legL);
const torso = band(f2y(0.60), f2y(0.68), x => Math.abs(x - 0.09) < 0.19);
const headB = band(f2y(0.90), f2y(0.95));
console.log('calfR', calfR.x.toFixed(3), calfR.z.toFixed(3), ' calfL', calfL.x.toFixed(3), calfL.z.toFixed(3));
console.log('torso', torso.x.toFixed(3), torso.z.toFixed(3), ' head', headB.x.toFixed(3), headB.z.toFixed(3));

const MIDX = (calfR.x + calfL.x) / 2;                 // pelvis midline
const ZC = torso.z;                                    // torso depth centre

// feet: z extent of each boot
const bootR = band(GROUND, f2y(0.06), legR);
const bootL = band(GROUND, f2y(0.06), legL);
console.log('bootR z', bootR.zmin.toFixed(3), bootR.zmax.toFixed(3), 'bootL z', bootL.zmin.toFixed(3), bootL.zmax.toFixed(3));

// knee centroids on the real geometry
const kneeR = band(f2y(0.265), f2y(0.305), legR);
const kneeL = band(f2y(0.265), f2y(0.305), legL);

/* Arms. The torso plus the flared jacket reaches 0.21 either side of the
   body midline, so anything past 0.30 is unambiguously forearm or hand and
   is safe to search for the fingertip; 0.20 is the wider set used to take
   slab centroids once the arm axis is known. */
const BODYX = 0.098;
function armVerts(sign, thresh) {
  const out = [];
  for (let i = 0; i < NV; i++) {
    const y = POS[i * 3 + 1];
    if (y < f2y(0.45) || y > f2y(0.85)) continue;
    if ((POS[i * 3] - BODYX) * sign > thresh) out.push(i);
  }
  return out;
}
// his left is +X (he faces +Z), his right is -X
const tipLv = armVerts(+1, 0.30), tipRv = armVerts(-1, 0.30);
const armLv = armVerts(+1, 0.20), armRv = armVerts(-1, 0.20);
console.log('arm verts  L', armLv.length, '(tip set', tipLv.length + ')  R', armRv.length, '(tip set', tipRv.length + ')');

const SH = 0.200;                                       // glenohumeral half-width
const shoulderL = { x: 0.085 + SH, y: f2y(0.812), z: ZC };
const shoulderR = { x: 0.085 - SH, y: f2y(0.812), z: ZC };

function tipOf(vs, sh) {
  let best = -1, bd = -1;
  for (const i of vs) {
    const dx = POS[i * 3] - sh.x, dy = POS[i * 3 + 1] - sh.y, dz = POS[i * 3 + 2] - sh.z;
    const d = dx * dx + dy * dy + dz * dz;
    if (d > bd) { bd = d; best = i; }
  }
  return { x: POS[best * 3], y: POS[best * 3 + 1], z: POS[best * 3 + 2], d: Math.sqrt(bd) };
}
// centroid of the arm slab at fraction t along shoulder->tip
function armAt(vs, sh, tip, t, half) {
  const ax = tip.x - sh.x, ay = tip.y - sh.y, az = tip.z - sh.z;
  const L = Math.hypot(ax, ay, az), ux = ax / L, uy = ay / L, uz = az / L;
  let sx = 0, sy = 0, sz = 0, n = 0;
  for (const i of vs) {
    const p = (POS[i * 3] - sh.x) * ux + (POS[i * 3 + 1] - sh.y) * uy + (POS[i * 3 + 2] - sh.z) * uz;
    if (Math.abs(p / L - t) > half) continue;
    sx += POS[i * 3]; sy += POS[i * 3 + 1]; sz += POS[i * 3 + 2]; n++;
  }
  return n ? { x: sx / n, y: sy / n, z: sz / n } : null;
}
const tipL = tipOf(tipLv, shoulderL), tipR = tipOf(tipRv, shoulderR);
console.log('tipL', JSON.stringify(tipL), '\ntipR', JSON.stringify(tipR));
const elbowL = armAt(armLv, shoulderL, tipL, 0.44, 0.05);
const elbowR = armAt(armRv, shoulderR, tipR, 0.44, 0.05);
const wristL = armAt(armLv, shoulderL, tipL, 0.78, 0.05);
const wristR = armAt(armRv, shoulderR, tipR, 0.78, 0.05);
console.log('elbowL', JSON.stringify(elbowL), 'wristL', JSON.stringify(wristL));
console.log('elbowR', JSON.stringify(elbowR), 'wristR', JSON.stringify(wristR));

/* ───────────────────────────── 2. cut the crotch ────────────────────────── */
/* The scan welded both trouser legs into one column from mid-thigh to the
   hips. Split every triangle that crosses the plane x=XSPLIT inside that
   band, offset the two new surfaces apart so a later weld cannot rejoin
   them, then fan each opening shut toward the leg axis. */
/* Only the genuinely fused span. The calves also brush together around 15%
   of his height; cutting there sliced the shins open and left a flap of
   trouser hanging between the boots. */
const CUT_LO = f2y(0.010), CUT_HI = f2y(0.468);       // ground .. crotch
const EPS = 0.0016;
const CUTV = new Map();                                // new vertex -> which leg

/* joint heights, needed here as well as by the skeleton below */
const HIPY = f2y(0.530), KNEEY = f2y(0.285), ANKY = f2y(0.052), HIPDX = 0.089;
const ankleOf = (boot, cx) => ({ x: cx, y: ANKY, z: boot.zmin + (boot.zmax - boot.zmin) * 0.34 });
function chainOf(sx, knee, boot, calf) {
  const hip = { x: MIDX + sx * HIPDX, y: HIPY, z: ZC + 0.004 };
  const kn = { x: knee.x, y: KNEEY, z: knee.z + 0.012 };
  const an = ankleOf(boot, calf.x);
  const to = { x: calf.x, y: GROUND + 0.022, z: boot.zmax - 0.028 };
  return [[hip, kn], [kn, an], [an, to]];
}
const CHAIN_L = chainOf(+1, kneeL, bootL, calfL);
const CHAIN_R = chainOf(-1, kneeR, bootR, calfR);
function closestOn(px, py, pz, a, c) {
  const ax = c.x - a.x, ay = c.y - a.y, az = c.z - a.z;
  const L2 = ax * ax + ay * ay + az * az;
  let t = ((px - a.x) * ax + (py - a.y) * ay + (pz - a.z) * az) / (L2 || 1);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return { x: a.x + ax * t, y: a.y + ay * t, z: a.z + az * t };
}

function lerpV(a, b, t, arr, n) {
  const o = [];
  for (let k = 0; k < n; k++) o.push(arr[a * n + k] + (arr[b * n + k] - arr[a * n + k]) * t);
  return o;
}
function pushVert(p, nn, uv) {
  POS.push(p[0], p[1], p[2]); NRM.push(nn[0], nn[1], nn[2]); UV.push(uv[0], uv[1]);
  return (POS.length / 3) - 1;
}
/* The cut surface is NOT a plane. The trouser legs are welded at the crotch,
   but the calves also touch lower down, and that contact does not sit on the
   same x as the crotch — so a single plane leaves those triangles joined and
   they stretch into a blade between his knees. Instead the cut follows the
   boundary between the two legs: the set of points equidistant from the left
   and right leg bone chains. Every triangle that straddles it gets split. */
function chainDist(x, y, z, s) {
  const c = s > 0 ? CHAIN_L : CHAIN_R;
  let d = 1e9;
  for (const g of c) d = Math.min(d, segDistRaw(x, y, z, g[0], g[1]));
  return d;
}
function segDistRaw(px, py, pz, a, c) {
  const ax = c.x - a.x, ay = c.y - a.y, az = c.z - a.z;
  const L2 = ax * ax + ay * ay + az * az;
  let t = ((px - a.x) * ax + (py - a.y) * ay + (pz - a.z) * az) / (L2 || 1);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = px - (a.x + ax * t), dy = py - (a.y + ay * t), dz = pz - (a.z + az * t);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
// >0 means "belongs to his left leg"
const legField = (x, y, z) => chainDist(x, y, z, -1) - chainDist(x, y, z, 1);
const FIELD = new Float32Array(NV);
for (let i = 0; i < NV; i++) FIELD[i] = legField(POS[i * 3], POS[i * 3 + 1], POS[i * 3 + 2]);

const newIdx = [];
const cutEdges = [];
let nCut = 0;
const ORIG = IDX.length;
for (let t = 0; t < ORIG; t += 3) {
  const a = IDX[t], b = IDX[t + 1], c = IDX[t + 2];
  const ys = [POS[a * 3 + 1], POS[b * 3 + 1], POS[c * 3 + 1]];
  const inBand = Math.max(ys[0], ys[1], ys[2]) < CUT_HI;
  const xs = [FIELD[a], FIELD[b], FIELD[c]];
  const pos = xs.filter(v => v > 0).length;
  if (!inBand || pos === 0 || pos === 3) { newIdx.push(a, b, c); continue; }
  nCut++;
  // rotate so the odd-one-out is vertex 0
  let tri = [a, b, c], sx = xs.slice();
  const lone = pos === 1 ? sx.findIndex(v => v > 0) : sx.findIndex(v => v <= 0);
  tri = [tri[lone], tri[(lone + 1) % 3], tri[(lone + 2) % 3]];
  sx = [sx[lone], sx[(lone + 1) % 3], sx[(lone + 2) % 3]];
  const [v0, v1, v2] = tri;
  const t01 = sx[0] / (sx[0] - sx[1]), t02 = sx[0] / (sx[0] - sx[2]);
  const mk = (p, q, tt, side) => {
    const P = lerpV(p, q, tt, POS, 3), N = lerpV(p, q, tt, NRM, 3), U = lerpV(p, q, tt, UV, 2);
    /* pull the new vertex a hair into its own leg, so the two cut surfaces
       cannot be welded back together and do not z-fight */
    const ch = side > 0 ? CHAIN_L : CHAIN_R;
    let bd = 1e9, bp = null;
    for (const g of ch) {
      const q2 = closestOn(P[0], P[1], P[2], g[0], g[1]);
      const d = Math.hypot(P[0] - q2.x, P[1] - q2.y, P[2] - q2.z);
      if (d < bd) { bd = d; bp = q2; }
    }
    if (bp && bd > 1e-6) {
      P[0] += (bp.x - P[0]) / bd * EPS; P[1] += (bp.y - P[1]) / bd * EPS; P[2] += (bp.z - P[2]) / bd * EPS;
    }
    const v = pushVert(P, N, U);
    CUTV.set(v, side);
    return v;
  };
  const s0 = sx[0] > 0 ? 1 : -1, sO = -s0;
  const A0 = mk(v0, v1, t01, s0), A1 = mk(v0, v2, t02, s0);      // lone side
  const B0 = mk(v0, v1, t01, sO), B1 = mk(v0, v2, t02, sO);      // pair side
  newIdx.push(v0, A0, A1);
  newIdx.push(B0, v1, v2, B0, v2, B1);
  cutEdges.push([A0, A1, s0], [B1, B0, sO]);
}
console.log('cut: split', nCut, 'triangles ->', POS.length / 3, 'verts');

/* No cap. The plane only clips the column's surface at two places per slice —
   a point at the front and a point at the back — so fanning those stubs to
   the leg's axis does not close a hole, it grows a long thin blade out of
   the inside of the thigh, which is exactly what it looked like. The two cut
   surfaces sit 3 mm apart and the material is already double-sided, so the
   seam reads as the inside of a trouser leg and nothing protrudes. */
void cutEdges;
IDX = newIdx; NV = POS.length / 3;
console.log('after cap:', NV, 'verts', IDX.length / 3, 'tris');

/* ─────────────────────────────── 3. skeleton ────────────────────────────── */
const zKnee = z => z + 0.012;
const B = [];
function bone(name, parent, p) { B.push({ name, parent, p }); return B.length - 1; }

const iHips = bone('Hips', -1, { x: MIDX, y: HIPY, z: ZC + 0.005 });
const iSpine = bone('Spine', iHips, { x: 0.088, y: f2y(0.615), z: ZC });
const iChest = bone('Chest', iSpine, { x: 0.086, y: f2y(0.720), z: ZC - 0.002 });
const iNeck = bone('Neck', iChest, { x: 0.085, y: f2y(0.845), z: ZC - 0.012 });
const iHead = bone('Head', iNeck, { x: 0.085, y: f2y(0.885), z: ZC - 0.004 });
bone('HeadTop', iHead, { x: 0.085, y: f2y(1.0), z: ZC });

function arm(sfx, sh, el, wr, tip) {
  const cl = bone('Clav' + sfx, iChest, { x: 0.085 + (sh.x - 0.085) * 0.22, y: f2y(0.828), z: ZC - 0.01 });
  const ua = bone('UpperArm' + sfx, cl, sh);
  const fa = bone('ForeArm' + sfx, ua, el);
  const hd = bone('Hand' + sfx, fa, wr);
  bone('HandEnd' + sfx, hd, tip);
  return { cl, ua, fa, hd };
}
const AL = arm('L', shoulderL, elbowL, wristL, tipL);
const AR = arm('R', shoulderR, elbowR, wristR, tipR);

function leg(sfx, sx, knee, boot, calf) {
  const up = bone('UpperLeg' + sfx, iHips, { x: MIDX + sx * HIPDX, y: HIPY, z: ZC + 0.004 });
  const lo = bone('LowerLeg' + sfx, up, { x: knee.x, y: KNEEY, z: zKnee(knee.z) });
  const ft = bone('Foot' + sfx, lo, ankleOf(boot, calf.x));
  const to = bone('Toe' + sfx, ft, { x: calf.x, y: GROUND + 0.022, z: boot.zmax - 0.028 });
  bone('ToeEnd' + sfx, to, { x: calf.x, y: GROUND + 0.012, z: boot.zmax });
  return { up, lo, ft, to };
}
const LL = leg('L', +1, kneeL, bootL, calfL);
const LR = leg('R', -1, kneeR, bootR, calfR);
console.log('bones', B.length);
B.forEach((b, i) => console.log('  ', String(i).padStart(2), b.name.padEnd(12), 'p', String(b.parent).padStart(2),
  b.p.x.toFixed(3), b.p.y.toFixed(3), b.p.z.toFixed(3)));

/* How thick the body is around each bone. Raw distance to the nearest bone
   segment is the wrong score for an A-pose scan: the upper-arm bone runs
   alongside the ribcage and ends up closer to the middle of the back than the
   spine is, so the arms swallow the torso. Dividing by the segment's own
   radius asks the right question — "how many body-thicknesses away is this?" */
const RADIUS = {
  Hips: 0.155, Spine: 0.185, Chest: 0.20, Neck: 0.075, Head: 0.115, HeadTop: 0.115,
  Clav: 0.095, UpperArm: 0.078, ForeArm: 0.062, Hand: 0.058, HandEnd: 0.058,
  UpperLeg: 0.125, LowerLeg: 0.082, Foot: 0.098, Toe: 0.06, ToeEnd: 0.06
};
const radiusOf = n => RADIUS[n.replace(/[LR]$/, '')] || 0.1;

/* segments used for skin seeding */
const SEG = [];
for (let i = 0; i < B.length; i++) {
  const kids = B.filter(x => x.parent === i);
  if (!kids.length) continue;
  for (const k of kids) SEG.push({ b: i, a: B[i].p, c: k.p, r: radiusOf(B[i].name) });
}
// give the hips a stub so pelvis verts have something to latch onto
SEG.push({ b: iHips, a: B[iHips].p, c: { x: MIDX, y: HIPY - 0.10, z: ZC }, r: RADIUS.Hips });

/* ──────────────────────── 4. weld + adjacency + heat ────────────────────── */
const key = i => (Math.round(POS[i * 3] * 8000) + ',' + Math.round(POS[i * 3 + 1] * 8000) + ',' + Math.round(POS[i * 3 + 2] * 8000));
const map = new Map(); const canon = new Int32Array(NV); let NC = 0;
for (let i = 0; i < NV; i++) { const k = key(i); let c = map.get(k); if (c === undefined) { c = NC++; map.set(k, c); } canon[i] = c; }
console.log('welded', NV, '->', NC, 'unique positions');

const CP = new Float32Array(NC * 3);
for (let i = 0; i < NV; i++) { const c = canon[i]; CP[c * 3] = POS[i * 3]; CP[c * 3 + 1] = POS[i * 3 + 1]; CP[c * 3 + 2] = POS[i * 3 + 2]; }

// adjacency (CSR)
const deg = new Int32Array(NC);
const eSet = new Set();
function addE(u, v) { if (u === v) return; const k = u < v ? u * NC + v : v * NC + u; if (eSet.has(k)) return; eSet.add(k); deg[u]++; deg[v]++; }
for (let t = 0; t < IDX.length; t += 3) {
  const a = canon[IDX[t]], b = canon[IDX[t + 1]], c = canon[IDX[t + 2]];
  addE(a, b); addE(b, c); addE(c, a);
}
const off = new Int32Array(NC + 1);
for (let i = 0; i < NC; i++) off[i + 1] = off[i] + deg[i];
const adj = new Int32Array(off[NC]); const fill = off.slice(0, NC);
for (const k of eSet) { const u = Math.floor(k / NC), v = k % NC; adj[fill[u]++] = v; adj[fill[v]++] = u; }
console.log('graph edges', eSet.size);

// distance point -> segment
function segDist(px, py, pz, a, c) {
  const ax = c.x - a.x, ay = c.y - a.y, az = c.z - a.z;
  const L2 = ax * ax + ay * ay + az * az;
  let t = ((px - a.x) * ax + (py - a.y) * ay + (pz - a.z) * az) / (L2 || 1);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = px - (a.x + ax * t), dy = py - (a.y + ay * t), dz = pz - (a.z + az * t);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

const NB = B.length;
const W = new Float32Array(NC * NB);
const pin = new Float32Array(NC);
const seedB = new Int32Array(NC);
const perBone = new Float64Array(NB);
for (let v = 0; v < NC; v++) {
  const x = CP[v * 3], y = CP[v * 3 + 1], z = CP[v * 3 + 2];
  perBone.fill(1e9);
  for (const s of SEG) {
    const d = segDist(x, y, z, s.a, s.c) / s.r;
    if (d < perBone[s.b]) perBone[s.b] = d;
  }
  let d1 = 1e9, b1 = 0;
  for (let b = 0; b < NB; b++) if (perBone[b] < d1) { d1 = perBone[b]; b1 = b; }
  let d2 = 1e9;
  for (let b = 0; b < NB; b++) if (b !== b1 && perBone[b] < d2) d2 = perBone[b];
  seedB[v] = b1;
  /* Confidence: strong where one bone clearly owns the vertex, weak at the
     joints where the blend has to happen. The 0.14 floor caps the diffusion
     length at roughly three edges — without it the strongly-pinned limbs act
     as sources and flood the torso, which is what leaked the chest away. */
  const rel = (d2 - d1) / (d2 + d1 + 1e-6);
  pin[v] = Math.min(0.95, Math.max(0.14, rel * 2.4));
  W[v * NB + b1] = 1;
}

// diffuse: w <- lerp(neighbour average, seed, pin)
const T = new Float32Array(NC * NB);
const ITER = 56;
for (let it = 0; it < ITER; it++) {
  for (let v = 0; v < NC; v++) {
    const s = off[v], e = off[v + 1], n = e - s;
    const base = v * NB;
    if (!n) { for (let b = 0; b < NB; b++) T[base + b] = W[base + b]; continue; }
    for (let b = 0; b < NB; b++) T[base + b] = 0;
    for (let k = s; k < e; k++) { const nb = adj[k] * NB; for (let b = 0; b < NB; b++) T[base + b] += W[nb + b]; }
    const p = pin[v], q = 1 - p, inv = q / n;
    for (let b = 0; b < NB; b++) T[base + b] *= inv;
    T[base + seedB[v]] += p;
  }
  W.set(T);
}

/* keep 4 strongest, normalise */
const SI = new Uint8Array(NV * 4), SW = new Float32Array(NV * 4);
let maxInf = 0;
for (let i = 0; i < NV; i++) {
  const c = canon[i], base = c * NB;
  const top = [];
  for (let b = 0; b < NB; b++) { const w = W[base + b]; if (w > 0.008) top.push([b, w]); }
  top.sort((a, b) => b[1] - a[1]);
  maxInf = Math.max(maxInf, top.length);
  const use = top.slice(0, 4);
  let sum = 0; for (const u of use) sum += u[1];
  if (!sum) { use.length = 0; use.push([seedB[c], 1]); sum = 1; }
  for (let k = 0; k < 4; k++) {
    SI[i * 4 + k] = k < use.length ? use[k][0] : 0;
    SW[i * 4 + k] = k < use.length ? use[k][1] / sum : 0;
  }
}
console.log('max influences before prune:', maxInf);

/* The vertices the cut created sit right on the plane between the legs, so
   diffusion gives them a share of BOTH thighs and they stretch into a sail
   the moment the legs part. Each one instead takes the weights of the
   nearest vertex that was already unambiguously on its own leg. */
let fixed = 0;
const donors = [];
for (let i = 0; i < NV; i++) {
  if (CUTV.has(i)) continue;
  const y = POS[i * 3 + 1];
  if (y < CUT_LO - 0.12 || y > CUT_HI + 0.12) continue;
  donors.push(i);
}
const LEGB = {};
[[LL.up, 1], [LL.lo, 1], [LL.ft, 1], [LL.to, 1], [LR.up, -1], [LR.lo, -1], [LR.ft, -1], [LR.to, -1]]
  .forEach(([b, s]) => LEGB[b] = s);
for (const [v, side] of CUTV) {
  const x = POS[v * 3], y = POS[v * 3 + 1], z = POS[v * 3 + 2];
  let best = -1, bd = 1e9;
  for (const d of donors) {
    /* same side of the leg boundary, and only donors that are themselves
       unambiguous — copying a donor that is already half the other leg
       would just launder the problem */
    if (Math.sign(legField(POS[d * 3], POS[d * 3 + 1], POS[d * 3 + 2])) !== side) continue;
    const db = LEGB[SI[d * 4]];
    if (db !== undefined && db !== side) continue;
    const dx = POS[d * 3] - x, dy = POS[d * 3 + 1] - y, dz = POS[d * 3 + 2] - z;
    const dd = dx * dx + dy * dy + dz * dz;
    if (dd < bd) { bd = dd; best = d; }
  }
  if (best < 0) continue;
  for (let k = 0; k < 4; k++) { SI[v * 4 + k] = SI[best * 4 + k]; SW[v * 4 + k] = SW[best * 4 + k]; }
  fixed++;
}
console.log('cut vertices re-weighted to their own leg:', fixed, 'of', CUTV.size);

/* report: how much of each bone's territory exists */
const share = new Float64Array(NB);
for (let i = 0; i < NV; i++) for (let k = 0; k < 4; k++) share[SI[i * 4 + k]] += SW[i * 4 + k];
B.forEach((b, i) => { if (share[i] > 1) console.log('   weight', b.name.padEnd(12), (100 * share[i] / NV).toFixed(1) + '%'); });

/* ─────────────── 4b. weight map render, to eyeball the skin ─────────────── */
const BCOL = {};
[[iHips, [230, 90, 90]], [iSpine, [235, 150, 70]], [iChest, [230, 205, 70]], [iNeck, [150, 220, 90]],
[iHead, [70, 200, 120]], [AL.cl, [90, 200, 220]], [AL.ua, [70, 140, 235]], [AL.fa, [140, 110, 235]],
[AL.hd, [215, 110, 220]], [AR.cl, [90, 200, 220]], [AR.ua, [70, 140, 235]], [AR.fa, [140, 110, 235]],
[AR.hd, [215, 110, 220]], [LL.up, [235, 120, 160]], [LL.lo, [120, 235, 200]], [LL.ft, [250, 250, 250]],
[LR.up, [235, 120, 160]], [LR.lo, [120, 235, 200]], [LR.ft, [250, 250, 250]]].forEach(([b, c]) => BCOL[b] = c);
function wcol(i) {
  const c = [24, 26, 30];
  for (let k = 0; k < 4; k++) {
    const col = BCOL[SI[i * 4 + k]]; if (!col) continue;
    const w = SW[i * 4 + k];
    for (let j = 0; j < 3; j++) c[j] += col[j] * w;
  }
  return c;
}
function weightRender(name, yawDeg) {
  const Wd = 400, Ht = 780, img = Buffer.alloc(Wd * Ht * 3, 250);
  const yaw = yawDeg * Math.PI / 180, cy = Math.cos(yaw), sy = Math.sin(yaw);
  const tx = i => POS[i * 3] * cy + POS[i * 3 + 2] * sy, tz = i => -POS[i * 3] * sy + POS[i * 3 + 2] * cy;
  let mh = 1e9, Mh = -1e9;
  for (let i = 0; i < NV; i++) { const h = tx(i); if (h < mh) mh = h; if (h > Mh) Mh = h; }
  const H = maxY - GROUND, sc = (Ht - 30) / H, cm = (mh + Mh) / 2;
  const zb = new Float32Array(Wd * Ht).fill(1e9);
  for (let t = 0; t < IDX.length; t += 3) {
    const px = [], py = [], pz = [], cc = [];
    for (let k = 0; k < 3; k++) {
      const i = IDX[t + k];
      px.push(Wd / 2 + (tx(i) - cm) * sc); py.push(Ht - 15 - (POS[i * 3 + 1] - GROUND) * sc); pz.push(tz(i)); cc.push(wcol(i));
    }
    const x0 = Math.max(0, Math.floor(Math.min(...px))), x1 = Math.min(Wd - 1, Math.ceil(Math.max(...px)));
    const y0 = Math.max(0, Math.floor(Math.min(...py))), y1 = Math.min(Ht - 1, Math.ceil(Math.max(...py)));
    const d = (px[1] - px[0]) * (py[2] - py[0]) - (px[2] - px[0]) * (py[1] - py[0]); if (Math.abs(d) < 1e-12) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const w0 = ((px[1] - x) * (py[2] - y) - (px[2] - x) * (py[1] - y)) / d,
        w1 = ((px[2] - x) * (py[0] - y) - (px[0] - x) * (py[2] - y)) / d, w2 = 1 - w0 - w1;
      if (w0 < -0.004 || w1 < -0.004 || w2 < -0.004) continue;
      const z = w0 * pz[0] + w1 * pz[1] + w2 * pz[2], zi = y * Wd + x;
      if (z > zb[zi]) continue; zb[zi] = z;
      for (let j = 0; j < 3; j++) img[zi * 3 + j] = Math.min(255, w0 * cc[0][j] + w1 * cc[1][j] + w2 * cc[2][j]);
    }
  }
  // bones over the top
  for (const s of SEG) {
    const proj = p => [Wd / 2 + (p.x * cy + p.z * sy - cm) * sc, Ht - 15 - (p.y - GROUND) * sc];
    const [ax, ay] = proj(s.a), [bx, by] = proj(s.c);
    const n = Math.ceil(Math.hypot(bx - ax, by - ay));
    for (let k = 0; k <= n; k++) {
      const x = Math.round(ax + (bx - ax) * k / n), y = Math.round(ay + (by - ay) * k / n);
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const xx = x + ox, yy = y + oy; if (xx < 0 || yy < 0 || xx >= Wd || yy >= Ht) continue;
        const zi = (yy * Wd + xx) * 3; img[zi] = 10; img[zi + 1] = 10; img[zi + 2] = 10;
      }
    }
  }
  fs.writeFileSync(name + '.ppm', Buffer.concat([Buffer.from(`P6\n${Wd} ${Ht}\n255\n`), img]));
}
const HERE = '/private/tmp/claude-501/-Users-remidroux-Desktop/cee7ae18-a882-449a-b896-0326cf5af49c/scratchpad/rig/';
weightRender(HERE + 'w_front', 0);
weightRender(HERE + 'w_side', 90);

/* ────────────────────────────── 5. write GLB ────────────────────────────── */
const chunks = []; let blen = 0;
function push(buf, align) {
  const a = align || 4; const pad = (a - (blen % a)) % a;
  if (pad) { chunks.push(Buffer.alloc(pad)); blen += pad; }
  const o = blen; chunks.push(buf); blen += buf.length; return o;
}
const views = [], accs = [];
function view(buf, target) { const o = push(buf); views.push({ buffer: 0, byteOffset: o, byteLength: buf.length, ...(target ? { target } : {}) }); return views.length - 1; }
function acc(buf, compType, type, count, target, extra) {
  const v = view(buf, target);
  accs.push({ bufferView: v, componentType: compType, count, type, ...(extra || {}) });
  return accs.length - 1;
}
function mm(arr, n) {
  const mn = new Array(n).fill(Infinity), mx = new Array(n).fill(-Infinity);
  for (let i = 0; i < arr.length; i += n) for (let k = 0; k < n; k++) { const v = arr[i + k]; if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v; }
  return { min: mn, max: mx };
}
const aPos = acc(Buffer.from(new Float32Array(POS).buffer), 5126, 'VEC3', NV, 34962, mm(POS, 3));
const aNrm = acc(Buffer.from(new Float32Array(NRM).buffer), 5126, 'VEC3', NV, 34962);
const aUv = acc(Buffer.from(new Float32Array(UV).buffer), 5126, 'VEC2', NV, 34962);
const aJnt = acc(Buffer.from(SI.buffer), 5121, 'VEC4', NV, 34962);
const aWgt = acc(Buffer.from(SW.buffer), 5126, 'VEC4', NV, 34962);
const aIdx = acc(Buffer.from(new Uint32Array(IDX).buffer), 5125, 'SCALAR', IDX.length, 34963);

// inverse bind matrices: bind rotations are identity, so it is just -position
const ibm = new Float32Array(NB * 16);
for (let i = 0; i < NB; i++) {
  const m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -B[i].p.x, -B[i].p.y, -B[i].p.z, 1];
  ibm.set(m, i * 16);
}
const aIbm = acc(Buffer.from(ibm.buffer), 5126, 'MAT4', NB);

// image
const im = G.images[0], ibv = G.bufferViews[im.bufferView];
const imgBuf = BIN.slice(ibv.byteOffset || 0, (ibv.byteOffset || 0) + ibv.byteLength);
const vImg = view(imgBuf);

const nodes = [];
for (let i = 0; i < NB; i++) {
  const p = B[i].parent;
  const rel = p < 0 ? B[i].p : { x: B[i].p.x - B[p].p.x, y: B[i].p.y - B[p].p.y, z: B[i].p.z - B[p].p.z };
  nodes.push({ name: B[i].name, translation: [rel.x, rel.y, rel.z], children: [] });
}
for (let i = 0; i < NB; i++) if (B[i].parent >= 0) nodes[B[i].parent].children.push(i);
for (const n of nodes) if (!n.children.length) delete n.children;
const nMesh = nodes.push({ name: 'Trainer', mesh: 0, skin: 0 }) - 1;

const out = {
  asset: { version: '2.0', generator: 'man-rig (gauntlet) — skeleton fitted to the scan, heat-diffusion skin' },
  scene: 0,
  scenes: [{ nodes: [iHips, nMesh] }],
  nodes,
  meshes: [{ name: 'TrainerSkinned', primitives: [{ attributes: { POSITION: aPos, NORMAL: aNrm, TEXCOORD_0: aUv, JOINTS_0: aJnt, WEIGHTS_0: aWgt }, indices: aIdx, material: 0 }] }],
  skins: [{ inverseBindMatrices: aIbm, skeleton: iHips, joints: B.map((_, i) => i) }],
  materials: [{ pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.85, baseColorTexture: { index: 0 } }, doubleSided: true }],
  textures: [{ sampler: 0, source: 0 }],
  images: [{ bufferView: vImg, mimeType: 'image/jpeg' }],
  samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }],
  bufferViews: views,
  accessors: accs,
  buffers: [{ byteLength: blen }]
};
const binBuf = Buffer.concat(chunks);
let jsonStr = JSON.stringify(out);
while (jsonStr.length % 4) jsonStr += ' ';
const jsonBuf = Buffer.from(jsonStr, 'utf8');
const header = Buffer.alloc(12);
header.write('glTF', 0); header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + binBuf.length, 8);
const jh = Buffer.alloc(8); jh.writeUInt32LE(jsonBuf.length, 0); jh.writeUInt32LE(0x4E4F534A, 4);
const bh = Buffer.alloc(8); bh.writeUInt32LE(binBuf.length, 0); bh.writeUInt32LE(0x004E4942, 4);
fs.writeFileSync(OUT, Buffer.concat([header, jh, jsonBuf, bh, binBuf]));
console.log('\nwrote', OUT, (fs.statSync(OUT).size / 1048576).toFixed(2), 'MB');

/* hand out the numbers the runtime needs */
const meta = {
  ground: GROUND, stature: STATURE, midX: MIDX, zc: ZC,
  bones: B.map((b, i) => ({ i, name: b.name, parent: b.parent, p: [b.p.x, b.p.y, b.p.z] })),
  hand: { L: [tipL.x, tipL.y, tipL.z], R: [tipR.x, tipR.y, tipR.z] }
};
fs.writeFileSync('/private/tmp/claude-501/-Users-remidroux-Desktop/cee7ae18-a882-449a-b896-0326cf5af49c/scratchpad/rig/meta.json', JSON.stringify(meta, null, 1));
