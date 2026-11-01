"""
Builds the Engineering Workbench's models from Sky's CAD files.

    ~/.venv/bin/pip install cascadio trimesh networkx
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
    """The MakeX board holder: a printed frame, two boards and four XT30
    power connectors (each a housing and its pins). The STEP groups them by
    component: [0:1:1:9] is the frame, [0:1:1:5] the main board with its
    headers, [0:1:1:8] the second board; the XT30 meshes are recognised by
    their triangle counts, since two of them sit inside the board groups."""
    raw = step_parts(HOME / 'Documents/makex_boardholder v3 v1 v1.step')
    xt30_faces = {2474, 6180, 5768, 8908}
    groups: dict[str, list[trimesh.Trimesh]] = {'frame': [], 'main-board': [], 'second-board': [], 'xt30': []}
    for name, m in raw:
        m.apply_scale(1000)
        if len(m.faces) in xt30_faces or 'XT30' in name:
            groups['xt30'].append(m)
        elif '[0:1:1:9]' in name:
            groups['frame'].append(m)
        elif '[0:1:1:8]' in name:
            groups['second-board'].append(m)
        else:
            groups['main-board'].append(m)
    # each XT30 "2+2" mesh already holds a pair of housings, so the
    # connectors stay one part: they go in together, last
    out = [(k, trimesh.util.concatenate(v)) for k, v in groups.items()]
    return out


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


def stl(path: Path, key: str):
    def load():
        m = trimesh.load(path)
        m.apply_transform(Z_UP)
        return [(key, m)]

    return load


PROJECTS = {
    'makex-board-holder': makex,
    'vented-dome': dome,
    'aero': stl(HOME / 'Documents/aero.stl', 'body'),
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
        segs = feature_lines(m, eye if slug in OUTLINE else None)
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
