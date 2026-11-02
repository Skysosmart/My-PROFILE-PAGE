"""
Builds the Engineering Workbench's models from Sky's CAD files.

    ~/.venv/bin/pip install cascadio trimesh networkx scipy fast-simplification
    ~/.venv/bin/python scripts/cad/build.py

For every project in PROJECTS it writes

    public/cad/<slug>/model.glb    one node per part, in millimetres, y up,
                                   standing on y = 0 and centred on x/z
    public/cad/<slug>/sketch.json  the part's feature edges projected in the
                                   workbench's opening view: the ink drawing
                                   the transition draws and the no-WebGL
                                   fallback shows
    data/cad.generated.json        per part: centre, size, triangle count;
                                   per project: size, the view the sketch was
                                   drawn from

The source files stay where Sky keeps them (outside the repo); the STEP
exports are in metres and z or y up, the STLs in millimetres and z up, so
each project says how to bring it to millimetres, y up.
"""
from __future__ import annotations

import json
import math
import os
import sys
import tempfile
from pathlib import Path

import numpy as np
import trimesh

HOME = Path.home()
ROOT = Path(__file__).resolve().parents[2]
CADDIR = HOME / 'ฺCAD model'  # the folder's name starts with a stray Thai mark

# the opening view: turned 35 degrees round, looking 24 degrees down. The
# workbench's camera starts here, so the sketch lies exactly on the model.
YAW, PITCH = math.radians(-35), math.radians(24)

Z_UP = trimesh.transformations.rotation_matrix(-math.pi / 2, [1, 0, 0])


def step_parts(path: Path) -> list[tuple[str, trimesh.Trimesh]]:
    """every solid in a STEP file, placed, with its node name"""
    import cascadio

    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, 'm.glb')
        cascadio.step_to_glb(str(path), out, tol_linear=0.01, tol_angular=0.25)
        sc = trimesh.load(out)
    parts = []
    for node in sc.graph.nodes_geometry:
        T, g = sc.graph[node]
        m = sc.geometry[g].copy()
        m.apply_transform(T)
        parts.append((f'{node}|{g}', m))
    return parts


def makex() -> list[tuple[str, trimesh.Trimesh]]:
    """The MakeX board holder, as the STEP's own assembly tree has it:

        makex_boardholder v3 v1          [0:1:1:9]  the printed holder
        NOVA PI BY EARN v1
          nova pi mount v1               [0:1:1:8]  the printed tray the board sits in
          NOVA PI v3                     [0:1:1:5]  the Makeblock NovaPi controller
          XT30 2+2 v1, XT30 2+2 v1 (1)              the power connectors

    Copies of the XT30 housings (each under 16 mm) are also baked into the
    mount's and the board's own bodies; they go with the connectors."""
    raw = step_parts(HOME / 'Documents/makex_boardholder v3 v1 v1.step')
    groups: dict[str, list[trimesh.Trimesh]] = {'frame': [], 'mount': [], 'novapi': [], 'xt30': []}
    for name, m in raw:
        m.apply_scale(1000)
        if 'XT30' in name or max(m.extents) < 16:
            groups['xt30'].append(m)
        elif '[0:1:1:9]' in name:
            groups['frame'].append(m)
        elif '[0:1:1:8]' in name:
            groups['mount'].append(m)
        else:
            groups['novapi'].append(m)
    # each XT30 "2+2" mesh already holds a pair of housings, so the
    # connectors stay one part: they go in together, last
    return [(k, trimesh.util.concatenate(v)) for k, v in groups.items()]


def robot_arm() -> list[tuple[str, trimesh.Trimesh]]:
    """The INOVEDEX arm's printed parts in their places, from the Fusion
    world export (metres, z up), in the order they go together"""
    raw = dict(step_parts(HOME / 'Documents/robot-arm/assembly_world.step'))
    names = {k.split('|')[0]: m for k, m in raw.items()}
    order = [('forearm', 'Forearm'), ('gripper', 'Gripper body'), ('pinion', 'Pinion'),
             ('finger-a', 'Finger A'), ('finger-b', 'Finger B'), ('camera-mount', 'Camera mount')]
    parts = []
    for key, name in order:
        m = names[name]
        m.apply_scale(1000)
        m.apply_transform(Z_UP)
        parts.append((key, m))
    return parts


def dome() -> list[tuple[str, trimesh.Trimesh]]:
    """the Onshape part studio's second iteration: the dome and the vented base"""
    parts = []
    for key, f in (('base', 'Part Studio 1 - Part 2(1).step'), ('dome', 'Part Studio 1 - Part 1(1).step')):
        ms = [m for _, m in step_parts(CADDIR / f)]
        m = trimesh.util.concatenate(ms)
        m.apply_scale(1000)
        m.apply_transform(Z_UP)
        parts.append((key, m))
    return parts


def stl_bodies(path: Path) -> list[trimesh.Trimesh]:
    """the separate solids in a binary STL. Fusion's STL export keeps no part
    names, so an assembly arrives as one soup of triangles; the solids are
    its connected pieces"""
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components

    rec = np.dtype([('n', '<f4', 3), ('v', '<f4', 9), ('a', '<u2')])
    raw = path.read_bytes()
    count = int(np.frombuffer(raw, '<u4', 1, 80)[0])
    v = np.frombuffer(raw, rec, count, 84)['v'].reshape(-1, 3).astype(np.float64)
    verts, inv = np.unique(np.round(v, 3), axis=0, return_inverse=True)
    faces = inv.reshape(-1, 3)
    n = len(verts)
    g = coo_matrix((np.ones(2 * len(faces)), (np.r_[faces[:, 0], faces[:, 1]], np.r_[faces[:, 1], faces[:, 2]])), shape=(n, n))
    _, label = connected_components(g, directed=False)
    face_label = label[faces[:, 0]]
    order = np.argsort(face_label, kind='stable')
    cuts = np.flatnonzero(np.diff(face_label[order])) + 1
    out = []
    for idx in np.split(order, cuts):
        used, local = np.unique(faces[idx], return_inverse=True)
        out.append(trimesh.Trimesh(verts[used], local.reshape(-1, 3), process=False))
    return out


def decimate(m: trimesh.Trimesh, target: int) -> trimesh.Trimesh:
    if len(m.faces) <= target:
        return m
    import fast_simplification

    v, f = fast_simplification.simplify(
        m.vertices.astype(np.float32), m.faces.astype(np.int32), target_reduction=1 - target / len(m.faces)
    )
    m = trimesh.Trimesh(v, f)
    # extrusions drilled with a hole every few millimetres don't simplify:
    # every hole is a ring of edges the decimator must keep. Snap the
    # vertices to a grid instead, coarser until it fits; at the workbench's
    # scale a 4 mm hole reads the same either way
    # (only these stubborn solids get it: they are straight, axis-aligned
    # beams, which stay square on the grid where curved parts would not)
    for cell in (0.8, 1.6, 3.2):
        if len(m.faces) <= target * 1.3:
            break
        m = cluster(m, cell)
    return m


def cluster(m: trimesh.Trimesh, cell: float) -> trimesh.Trimesh:
    key = np.floor(m.vertices / cell).astype(np.int64)
    _, idx, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    inv = inv.reshape(-1)
    verts = np.zeros((len(idx), 3))
    np.add.at(verts, inv, m.vertices)
    verts /= np.bincount(inv, minlength=len(idx))[:, None]
    faces = inv[m.faces]
    faces = faces[(faces[:, 0] != faces[:, 1]) & (faces[:, 1] != faces[:, 2]) & (faces[:, 0] != faces[:, 2])]
    _, keep = np.unique(np.sort(faces, axis=1), axis=0, return_index=True)
    return trimesh.Trimesh(verts, faces[np.sort(keep)], process=False)


def stl_assembly(path: Path, rules, budget=90_000, floor=0.2):
    """an assembly exported as one STL: each solid goes to the first part
    whose rule takes its centre and size (source mm, z up); a rule keyed
    None drops the solid. The parts come out in the rules' order, cut down
    to about `budget` triangles in all"""

    def load():
        groups: dict[str, list[trimesh.Trimesh]] = {k: [] for k, _ in rules if k}
        for b in stl_bodies(path):
            lo, hi = b.bounds
            c, s = (lo + hi) / 2, hi - lo
            key = next(k for k, rule in rules if rule(c, s))
            if key:
                groups[key].append(b)
        # cut each solid down on its own: decimating a whole group at once
        # lets the simplifier fold thin walls of neighbouring solids together
        total = sum(len(m.faces) for v in groups.values() for m in v)
        keep = min(1.0, max(floor, budget / total))
        out = []
        for k, v in groups.items():
            if not v:
                continue
            m = trimesh.util.concatenate([decimate(b, max(200, int(len(b.faces) * keep))) for b in v])
            m.apply_transform(Z_UP)
            out.append((k, m))
        return out

    return load


def cube20(s) -> bool:
    return bool(np.all(np.abs(s - 20) < 2))


ARCH = HOME / 'Documents/arch'  # Sky's Fusion exports, copied off the Windows drive


def stl(path: Path, key: str):
    def load():
        m = trimesh.load(path)
        m.apply_transform(Z_UP)
        return [(key, m)]

    return load


PROJECTS = {
    'makex-board-holder': makex,
    # the whole robot: base, turntable column, upper arm, the forearm and
    # gripper (robot_arm() above has those alone, from the STEP), the cubes
    'inovedex': stl_assembly(ARCH / 'INOVEDEX.stl', [
        ('cubes', lambda c, s: cube20(s) and c[1] > 50),
        ('base', lambda c, s: c[2] < 40),
        ('upper-arm', lambda c, s: c[2] > 145),
        ('hand', lambda c, s: c[1] > 0),
        ('shoulder', lambda c, s: True),
    ]),
    # the export has the field's table and its box beside the robot: dropped
    'prometeus': stl_assembly(ARCH / 'PROMETEUS_ROBOT_BODY_V3_assembly.stl', [
        (None, lambda c, s: c[1] < -390),
        ('drive', lambda c, s: c[2] < 235),
        ('lift', lambda c, s: c[2] <= 615 and not (c[1] < -200 and s[2] < 200)),
        ('arm', lambda c, s: c[2] <= 615),
        ('carriage', lambda c, s: True),
    ], budget=150_000, floor=0.05),
    'rmrc': stl_assembly(ARCH / 'Untitled.stl', [
        ('tracks', lambda c, s: c[2] < 75 and (c[0] < -85 or c[0] > 28) and c[1] < 200),
        ('chassis', lambda c, s: c[2] < 80 and c[1] <= 240),
        ('body', lambda c, s: c[1] <= 100),
        ('arm', lambda c, s: c[1] <= 240),
        ('gripper', lambda c, s: True),
    ]),
    'pdlite': stl_assembly(ARCH / 'PDLite.stl', [
        ('housing', lambda c, s: s[0] > 200 or (s[1] > 190 and s[2] > 150)),
        ('board', lambda c, s: not (c[0] < 30 and c[1] < 0) and not (c[0] > 30 and c[1] < 0) and not (c[0] > 40 and c[1] > 0)),
        ('cup', lambda c, s: c[0] < 30 and c[1] < 0 and c[2] < 80),
        ('dispenser', lambda c, s: c[0] < 30 and c[1] < 0),
        ('tray', lambda c, s: c[0] > 30 and c[1] < 0),
        ('screen', lambda c, s: True),
    ]),
    'aevur': stl_assembly(ARCH / 'Aevur V!.stl', [
        ('case', lambda c, s: s[0] > 80),
        ('board', lambda c, s: c[1] < 70 and c[2] <= 18),
        ('display', lambda c, s: c[1] < 70),
        ('sensors', lambda c, s: c[2] < 15),
        ('lid', lambda c, s: True),
    ]),
    'vented-dome': dome,
    'desktop-locker': stl(ARCH / 'Desktop Locker V2.stl', 'body'),
    'aero': stl(HOME / 'Documents/aero.stl', 'body'),
    'pacman': stl(ARCH / 'pacman.stl', 'body'),
    'balm': stl(HOME / 'Documents/Balm.stl', 'body'),
}

# the outline is drawn only where the form is curved: on the boxy parts it
# adds nothing, and through aero's vent holes it draws every bore as a tube
OUTLINE = {'vented-dome', 'balm'}


def view_matrix() -> np.ndarray:
    """world -> view for the opening view (x right, y up, z towards us)"""
    ry = trimesh.transformations.rotation_matrix(YAW, [0, 1, 0])
    rx = trimesh.transformations.rotation_matrix(PITCH, [1, 0, 0])
    return rx @ ry


def feature_lines(m: trimesh.Trimesh, eye: np.ndarray | None, angle=35.0, min_len=0.35) -> np.ndarray:
    """edges where the surface turns by more than `angle`, the outline as
    seen from `eye` (a curved surface has no sharp edge to draw, so without
    it a dome is a few rings in the air), and open edges"""
    m = m.copy()
    m.merge_vertices(digits_vertex=4)
    sharp_mask = m.face_adjacency_angles > math.radians(angle)
    if eye is not None:
        adj = m.face_adjacency
        facing = m.face_normals @ eye
        sharp_mask |= facing[adj[:, 0]] * facing[adj[:, 1]] < 0
    sharp = m.face_adjacency_edges[sharp_mask]
    # open boundary edges: edges used by one face only
    e = np.sort(m.edges, axis=1)
    uniq, counts = np.unique(e, axis=0, return_counts=True)
    open_edges = uniq[counts == 1]
    edges = np.vstack([sharp, open_edges]) if len(open_edges) else sharp
    segs = m.vertices[edges]
    keep = np.linalg.norm(segs[:, 0] - segs[:, 1], axis=1) >= min_len
    return segs[keep]


def chain(segs2d: np.ndarray, digits=1) -> list[list[tuple[float, float]]]:
    """join 2D segments that share ends into polylines, longest first"""
    key = lambda p: (round(float(p[0]), digits), round(float(p[1]), digits))
    adj: dict[tuple, list[int]] = {}
    for i, (a, b) in enumerate(segs2d):
        adj.setdefault(key(a), []).append(i)
        adj.setdefault(key(b), []).append(i)
    used = np.zeros(len(segs2d), bool)
    lines = []
    for i in range(len(segs2d)):
        if used[i]:
            continue
        used[i] = True
        a, b = key(segs2d[i][0]), key(segs2d[i][1])
        line = [a, b]
        for end in (1, 0):  # grow from the tail, then from the head
            while True:
                tip = line[-1] if end else line[0]
                nxt = next((j for j in adj.get(tip, []) if not used[j]), None)
                if nxt is None:
                    break
                used[nxt] = True
                p, q = key(segs2d[nxt][0]), key(segs2d[nxt][1])
                other = q if p == tip else p
                if end:
                    line.append(other)
                else:
                    line.insert(0, other)
        lines.append(line)
    lines.sort(key=lambda l: -sum(math.dist(l[k], l[k + 1]) for k in range(len(l) - 1)))
    return lines


def build(slug: str, load) -> dict:
    parts = load()
    allm = trimesh.util.concatenate([m for _, m in parts])
    lo, hi = allm.bounds
    # stand it on y = 0, centred on x and z
    shift = np.array([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2])
    for _, m in parts:
        m.apply_translation(shift)
        m.merge_vertices(digits_vertex=4)
    size = (hi - lo).round(2)

    out = ROOT / 'public/cad' / slug
    out.mkdir(parents=True, exist_ok=True)
    scene = trimesh.Scene()
    for key, m in parts:
        clean = trimesh.Trimesh(vertices=m.vertices.astype(np.float32), faces=m.faces, process=False)
        scene.add_geometry(clean, node_name=key, geom_name=key)
    scene.export(out / 'model.glb')

    # the sketch: every part's feature lines in the opening view, in mm
    V = view_matrix()
    eye = np.linalg.inv(V)[:3, :3] @ np.array([0, 0, 1.0])  # towards the viewer, in world
    drawn = []
    pts_all = []
    for key, m in parts:
        # on a metre-long robot a 0.35 mm edge is a hole's facet, not a line
        segs = feature_lines(m, eye if slug in OUTLINE else None, min_len=max(0.35, float(max(size)) / 400))
        if not len(segs):
            continue
        flat = segs.reshape(-1, 3)
        v = trimesh.transformations.transform_points(flat, V)
        s2 = np.stack([v[:, 0], -v[:, 1]], axis=1).reshape(-1, 2, 2)
        pts_all.append(s2.reshape(-1, 2))
        drawn.append((key, s2))
    pts = np.vstack(pts_all)
    mn, mx = pts.min(axis=0), pts.max(axis=0)
    pad = 0.04 * float(max(mx - mn))
    paths = []
    for key, s2 in drawn:
        lines = chain(s2 - mn + pad)
        d = ''.join('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in l) for l in lines)
        paths.append({'part': key, 'd': d})
    w, h = (mx - mn + 2 * pad).round(1)
    (out / 'sketch.json').write_text(json.dumps({'w': float(w), 'h': float(h), 'paths': paths}, separators=(',', ':')))

    # the thumbnail on the project tabs: the longest lines only, so it reads
    # at 40 px and stays a few KB. It is used as a CSS mask, so its colour
    # comes from the tab
    every = [l for _, s2 in drawn for l in chain(s2 - mn + pad)]
    length = lambda l: sum(math.dist(l[k], l[k + 1]) for k in range(len(l) - 1))
    every.sort(key=lambda l: -length(l))
    keep = every[:140]
    d = ''.join('M' + 'L'.join(f'{x:.0f} {y:.0f}' for x, y in l) for l in keep)
    sw = max(w, h) / 70
    (out / 'thumb.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}">'
        f'<path d="{d}" fill="none" stroke="#000" stroke-width="{sw:.1f}" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    )

    meta = {
        'size': size.tolist(),
        'view': {'yaw': YAW, 'pitch': PITCH},
        'parts': [
            {
                'key': key,
                'center': (m.bounds.mean(axis=0)).round(2).tolist(),
                'size': (m.bounds[1] - m.bounds[0]).round(2).tolist(),
                'triangles': int(len(m.faces)),
            }
            for key, m in parts
        ],
    }
    kb = (out / 'model.glb').stat().st_size // 1024, (out / 'sketch.json').stat().st_size // 1024
    print(f'{slug}: {len(parts)} parts, {sum(p["triangles"] for p in meta["parts"])} tris, glb {kb[0]} KB, sketch {kb[1]} KB')
    return meta


if __name__ == '__main__':
    only = set(sys.argv[1:])
    gen = ROOT / 'data/cad.generated.json'
    data = json.loads(gen.read_text()) if gen.exists() else {}
    for slug, load in PROJECTS.items():
        if not only or slug in only:
            data[slug] = build(slug, load)
    gen.write_text(json.dumps(data, indent=2) + '\n')
