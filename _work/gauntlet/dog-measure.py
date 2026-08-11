#!/usr/bin/env python3
"""Measure the pastern (paw) joint off dog.glb, in the SAME normalised space
condition.js's RIG constants live in.

Normalised = (v - bbox_centre) / max(bbox_size).  Same as EC.normalise().
"""
import json, struct, sys
import numpy as np

GLB = '/Users/remidroux/Desktop/E-COLLAR-1900X/dog.glb'

# ---- constants copied verbatim out of condition.js RIG ---------------------
FWD  = np.array([-0.2294, 0.0, 0.9733])
SIDE = np.array([ 0.9733, 0.0, 0.2294])
GROUND  = -0.4546
LEG_CUT = -0.127
LEGS = [
    ('fl',  0.205, -0.039, 1),
    ('fr',  0.184, -0.204, 1),
    ('hl', -0.322,  0.081, 0),
    ('hr', -0.385, -0.140, 0),
]
JOINT_Y = {1: -0.020, 0: -0.045}
KNEE_Y  = {1: -0.235, 0: -0.215}
LEG_R   = 0.092


def read_glb(path):
    b = open(path, 'rb').read()
    magic, ver, total = struct.unpack_from('<III', b, 0)
    assert magic == 0x46546C67, 'not a glb'
    off, js, bin_ = 12, None, None
    while off < total:
        clen, ctype = struct.unpack_from('<II', b, off)
        data = b[off + 8: off + 8 + clen]
        if ctype == 0x4E4F534A:
            js = json.loads(data.decode('utf-8'))
        elif ctype == 0x004E4942:
            bin_ = data
        off += 8 + clen + ((-clen) % 4 if (off + 8 + clen) % 4 else 0)
        off += (4 - off % 4) % 4
    return js, bin_


CT = {5120: ('b', 1), 5121: ('B', 1), 5122: ('h', 2),
      5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def accessor(js, bin_, i):
    a = js['accessors'][i]
    bv = js['bufferViews'][a['bufferView']]
    fmt, sz = CT[a['componentType']]
    n = NC[a['type']]
    start = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride', 0) or n * sz
    out = np.empty((a['count'], n), dtype=np.float64)
    dt = np.dtype('<' + fmt)
    for k in range(a['count']):
        o = start + k * stride
        out[k] = np.frombuffer(bin_, dtype=dt, count=n, offset=o)
    return out


def node_matrix(nd):
    if 'matrix' in nd:
        return np.array(nd['matrix'], dtype=np.float64).reshape(4, 4).T
    m = np.eye(4)
    if 'scale' in nd:
        m = m @ np.diag(list(nd['scale']) + [1.0])
    if 'rotation' in nd:
        x, y, z, w = nd['rotation']
        r = np.array([
            [1-2*(y*y+z*z), 2*(x*y-z*w),   2*(x*z+y*w),   0],
            [2*(x*y+z*w),   1-2*(x*x+z*z), 2*(y*z-x*w),   0],
            [2*(x*z-y*w),   2*(y*z+x*w),   1-2*(x*x+y*y), 0],
            [0, 0, 0, 1]])
        m = r @ m
    if 'translation' in nd:
        t = np.eye(4); t[:3, 3] = nd['translation']
        m = t @ m
    return m


def collect(js, bin_):
    """world-space positions of every mesh primitive in the scene"""
    pts = []
    scene = js['scenes'][js.get('scene', 0)]

    def walk(idx, parent):
        nd = js['nodes'][idx]
        m = parent @ node_matrix(nd)
        if 'mesh' in nd:
            for prim in js['meshes'][nd['mesh']]['primitives']:
                p = accessor(js, bin_, prim['attributes']['POSITION'])
                h = np.hstack([p, np.ones((len(p), 1))])
                pts.append((h @ m.T)[:, :3])
        for c in nd.get('children', []):
            walk(c, m)

    for r in scene['nodes']:
        walk(r, np.eye(4))
    return np.vstack(pts)


js, bin_ = read_glb(GLB)
P = collect(js, bin_)
lo, hi = P.min(0), P.max(0)
ctr = (lo + hi) / 2
size = hi - lo
P = (P - ctr) / size.max()
print('vertices        %d' % len(P))
print('normalised bbox min %s  max %s' % (np.round(P.min(0), 4), np.round(P.max(0), 4)))
print('ground (min.y)  %.4f   RIG.ground %.4f   %s'
      % (P.min(0)[1], GROUND, 'MATCH' if abs(P.min(0)[1] - GROUND) < 0.02 else 'MISMATCH'))
print()

F = P @ FWD
S = P @ SIDE
Y = P[:, 1]

print('%-4s %7s %7s %7s %8s %8s %8s %8s' %
      ('leg', 'y', 'n', 'meanF', 'meanS', 'spanF', 'spanS', 'radius'))
results = {}
for (lid, lf, ls, fore) in LEGS:
    d = np.hypot(F - lf, S - ls)
    sel = (d < LEG_R) & (Y < LEG_CUT)
    print('--- %s  (%s)  n=%d  yrange %.4f .. %.4f'
          % (lid, 'fore' if fore else 'hind', sel.sum(), Y[sel].min(), Y[sel].max()))
    rows = []
    y0, y1 = Y[sel].min(), LEG_CUT
    steps = 28
    for k in range(steps):
        ya = y0 + (y1 - y0) * k / steps
        yb = y0 + (y1 - y0) * (k + 1) / steps
        s2 = sel & (Y >= ya) & (Y < yb)
        n = int(s2.sum())
        if n < 8:
            rows.append((ya, n, np.nan, np.nan, np.nan, np.nan, np.nan)); continue
        mf, ms = F[s2].mean(), S[s2].mean()
        spf = F[s2].max() - F[s2].min()
        sps = S[s2].max() - S[s2].min()
        rad = np.hypot(F[s2] - mf, S[s2] - ms).mean()
        rows.append((ya, n, mf, ms, spf, sps, rad))
        print('     %7.4f %6d %7.4f %8.4f %8.4f %8.4f %8.4f'
              % (ya, n, mf, ms, spf, sps, rad))
    results[lid] = rows
print()

# --- where does the paw start?  the metacarpus is a narrow column; the paw
#     widens fore-aft and its centroid steps FORWARD.  find the y at which
#     spanF grows fastest going down.
print('PASTERN DETECTION  (largest downward jump in fore-aft span)')
pastern = {}
for (lid, lf, ls, fore) in LEGS:
    rows = [r for r in results[lid] if not np.isnan(r[2])]
    best, besty, bestj = 0, None, None
    for i in range(1, len(rows)):
        lower, upper = rows[i - 1], rows[i]     # rows ascend in y
        dspan = lower[4] - upper[4]             # span grows going DOWN
        dcent = lower[2] - upper[2]             # centroid moves FORWARD going down
        score = dspan + 1.4 * max(dcent, 0)
        if upper[0] > GROUND + 0.16:            # a paw is near the ground
            continue
        if score > best:
            best, besty, bestj = score, upper[0], (lower, upper)
    pastern[lid] = besty
    toeF = None
    d = np.hypot(F - lf, S - ls)
    sel = (d < LEG_R) & (Y < besty)
    toeF = F[sel].max()
    print('  %s pastern y = %+.4f   score %.4f   toes reach f=%+.4f  '
          'paw height %.4f  toe ahead of pastern %.4f'
          % (lid, besty, best, toeF, besty - GROUND, toeF - results[lid][0][2]))

print()
print('SUMMARY for RIG')
fores = [pastern[l] for (l, _, _, f) in LEGS if f]
hinds = [pastern[l] for (l, _, _, f) in LEGS if not f]
print('  pasternY.fore  %.4f  (from %s)' % (np.mean(fores), np.round(fores, 4)))
print('  pasternY.hind  %.4f  (from %s)' % (np.mean(hinds), np.round(hinds, 4)))
print('  segment lengths, normalised units:')
for k, fore in (('fore', 1), ('hind', 0)):
    jy, ky = JOINT_Y[fore], KNEE_Y[fore]
    py = np.mean(fores if fore else hinds)
    print('    %s  L1 joint->knee %.4f   L2 knee->pastern %.4f   L3 pastern->ground %.4f   total %.4f'
          % (k, jy - ky, ky - py, py - GROUND, jy - GROUND))
# per-leg toe forward extent, for the toe-roll pivot
print('  toe pivot (fore-aft distance from the leg axis to the front of the pad):')
for (lid, lf, ls, fore) in LEGS:
    d = np.hypot(F - lf, S - ls)
    sel = (d < LEG_R) & (Y < pastern[lid])
    print('    %s  leg axis f=%+.4f  pad front f=%+.4f  -> %+.4f ahead;  pad back %+.4f'
          % (lid, lf, F[sel].max(), F[sel].max() - lf, F[sel].min() - lf))
