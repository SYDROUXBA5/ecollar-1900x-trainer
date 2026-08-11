#!/usr/bin/env python3
"""Second pass: where the leg column's centroid actually IS at each joint
height, so the bone chain can follow the limb instead of a straight vertical
line through it.

condition.js places `up` at (L.f, L.s, jointY) and then `lo` directly below it
and (in the gauntlet rig) the paw directly below that.  The scan's limb does
not run straight down: a hind column steps back as it descends and the pad
comes forward again.  Rotating the hock 49 degrees about a pivot that is 2-6 cm
off the real hock throws the lower leg sideways, which is the wedge of stretched
skin on the near hind leg.

Output: f/s of the column centroid at jointY, kneeY and pasternY per leg.
"""
import json, struct
import numpy as np

GLB = '/Users/remidroux/Desktop/E-COLLAR-1900X/dog.glb'
FWD = np.array([-0.2294, 0.0, 0.9733])
SIDE = np.array([0.9733, 0.0, 0.2294])
GROUND, LEG_CUT, LEG_R = -0.4546, -0.127, 0.092
LEGS = [('fl', 0.205, -0.039, 1), ('fr', 0.184, -0.204, 1),
        ('hl', -0.322, 0.081, 0), ('hr', -0.385, -0.140, 0)]
JOINT_Y = {1: -0.020, 0: -0.045}
KNEE_Y = {1: -0.235, 0: -0.215}
PAST_Y = {1: -0.4077, 0: -0.4194}
PAD_MID = {1: 0.051, 0: -0.052}
PAD_R = 0.072


def read_glb(path):
    b = open(path, 'rb').read()
    _, _, total = struct.unpack_from('<III', b, 0)
    off, js, bin_ = 12, None, None
    while off < total:
        clen, ctype = struct.unpack_from('<II', b, off)
        data = b[off + 8: off + 8 + clen]
        if ctype == 0x4E4F534A:
            js = json.loads(data.decode('utf-8'))
        elif ctype == 0x004E4942:
            bin_ = data
        off += 8 + clen
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
    dt = np.dtype('<' + fmt)
    out = np.empty((a['count'], n))
    for k in range(a['count']):
        out[k] = np.frombuffer(bin_, dtype=dt, count=n, offset=start + k * stride)
    return out


def node_matrix(nd):
    if 'matrix' in nd:
        return np.array(nd['matrix']).reshape(4, 4).T
    m = np.eye(4)
    if 'scale' in nd:
        m = m @ np.diag(list(nd['scale']) + [1.0])
    if 'rotation' in nd:
        x, y, z, w = nd['rotation']
        r = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w), 0],
                      [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w), 0],
                      [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y), 0],
                      [0, 0, 0, 1]])
        m = r @ m
    if 'translation' in nd:
        t = np.eye(4); t[:3, 3] = nd['translation']; m = t @ m
    return m


js, bin_ = read_glb(GLB)
pts = []
scene = js['scenes'][js.get('scene', 0)]


def walk(idx, parent):
    nd = js['nodes'][idx]
    m = parent @ node_matrix(nd)
    if 'mesh' in nd:
        for prim in js['meshes'][nd['mesh']]['primitives']:
            p = accessor(js, bin_, prim['attributes']['POSITION'])
            pts.append((np.hstack([p, np.ones((len(p), 1))]) @ m.T)[:, :3])
    for c in nd.get('children', []):
        walk(c, m)


for r in scene['nodes']:
    walk(r, np.eye(4))
P = np.vstack(pts)
lo, hi = P.min(0), P.max(0)
P = (P - (lo + hi) / 2) / (hi - lo).max()
F, S, Y = P @ FWD, P @ SIDE, P[:, 1]
assert abs(P.min(0)[1] - GROUND) < 0.02

BAND = 0.016          # +-, the slab averaged at each joint height


def centroid(lf, ls, fore, y0, pad=False):
    d = np.hypot(F - lf, S - ls)
    sel = (d < LEG_R) & (np.abs(Y - y0) < BAND)
    if pad:
        dp = np.hypot(F - (lf + PAD_MID[fore]), S - ls)
        sel = ((d < LEG_R) | (dp < PAD_R)) & (np.abs(Y - y0) < BAND)
    n = int(sel.sum())
    if n < 10:
        return None, None, n
    return F[sel].mean(), S[sel].mean(), n


print('%-4s %-8s %8s %8s %6s   %8s %8s' %
      ('leg', 'joint', 'f', 's', 'n', 'df(axis)', 'ds(axis)'))
res = {}
for (lid, lf, ls, fore) in LEGS:
    res[lid] = {}
    for nm, yy, pad in (('shoulder', JOINT_Y[fore], False),
                        ('knee', KNEE_Y[fore], False),
                        ('pastern', PAST_Y[fore], True)):
        f, s, n = centroid(lf, ls, fore, yy, pad)
        if f is None:
            print('  %-4s %-8s  (too few vertices, n=%d)' % (lid, nm, n)); continue
        res[lid][nm] = (f, s)
        print('%-4s %-8s %8.4f %8.4f %6d   %+8.4f %+8.4f'
              % (lid, nm, f, s, n, f - lf, s - ls))
    print()

print('\nBONE OFFSETS relative to the leg axis (L.f, L.s), normalised units')
print('  these go straight into buildSkeleton():')
for k, fore in (('fore', 1), ('hind', 0)):
    ids = [l for l in LEGS if l[3] == fore]
    dkf = np.mean([res[i[0]]['knee'][0] - i[1] for i in ids])
    dks = np.mean([res[i[0]]['knee'][1] - i[2] for i in ids])
    dpf = np.mean([res[i[0]]['pastern'][0] - i[1] for i in ids])
    dps = np.mean([res[i[0]]['pastern'][1] - i[2] for i in ids])
    jy, ky, py = JOINT_Y[fore], KNEE_Y[fore], PAST_Y[fore]
    L1 = np.hypot(dkf, ky - jy)
    L2 = np.hypot(dpf - dkf, py - ky)
    a1 = np.arctan2(-dkf, -(ky - jy))
    a2 = np.arctan2(-(dpf - dkf), -(py - ky))
    print('  %s  kneeOff  f%+0.4f s%+0.4f   pasternOff f%+0.4f s%+0.4f' %
          (k, dkf, dks, dpf, dps))
    print('        segment lengths  L1 %.4f  L2 %.4f   (was %.4f / %.4f straight)'
          % (L1, L2, jy - ky, ky - py))
    print('        rest angles      a1 %+0.4f rad (%+0.1f deg)   a2 %+0.4f rad (%+0.1f deg)'
          % (a1, np.degrees(a1), a2, np.degrees(a2)))
    print('        straight-line joint->pastern %.4f, chain length %.4f, slack %.1f%%'
          % (np.hypot(dpf, py - jy), L1 + L2,
             100 * (1 - np.hypot(dpf, py - jy) / (L1 + L2))))
