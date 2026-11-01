/* ---------------------------------------------------------------------------
 *  CAD - the Engineering Workbench (components/workbench).
 *
 *  The models are built from Sky's own CAD files by scripts/cad/build.py,
 *  which writes public/cad/<slug>/model.glb (one node per part, mm, y up),
 *  public/cad/<slug>/sketch.json (the ink drawing in the opening view) and
 *  data/cad.generated.json (each part's centre and size). Part keys here
 *  must match the node names that script gives.
 *
 *  TODO(sky): every name, line and note below is a draft read off the files
 *  and the MakeX certificate. Correct them, and drop each project's photo of
 *  the real thing into public/cad/<slug>/ and name it in `photo`: the story
 *  then ends on it ("reality"); without one it ends on the finished model.
 * ------------------------------------------------------------------------- */
import generated from './cad.generated.json'

export type CadPart = {
  key: string
  label: string
  /** two or three short design notes, shown when the part is picked out */
  notes: string[]
}

export type CadProject = {
  slug: string
  name: string
  /** one or two lines: what it is and why it exists */
  blurb: string
  tool: string
  year: string
  kind: string
  /** how many times it was redrawn; omitted when unknown */
  iterations?: number
  /** the parts in the order they go together */
  parts: CadPart[]
  /** the built object, shot from roughly the opening view */
  photo?: { src: string; alt: string }
}

export const cadProjects: CadProject[] = [
  {
    slug: 'makex-board-holder',
    name: 'MakeX Board Holder',
    blurb: 'One printed frame that carries both control boards and the XT30 power connectors, so the electronics lift out of the robot as a single block.',
    tool: 'Fusion 360',
    year: '2025',
    kind: 'Competition robot',
    iterations: 3,
    parts: [
      { key: 'frame', label: 'Frame', notes: ['Printed in one piece', 'Two arms bolt it to the chassis', 'Open sides for the wiring'] },
      { key: 'main-board', label: 'Main board', notes: ['Stands in the frame on its own rails', 'Headers face out for the cables'] },
      { key: 'second-board', label: 'Second board', notes: ['Stacked beside the main board', 'Same rails, same screws'] },
      { key: 'xt30', label: 'XT30 connectors', notes: ['Battery power in', 'Held by the frame, not the boards'] },
    ],
  },
  {
    slug: 'vented-dome',
    name: 'Vented Dome',
    blurb: 'A two-part shell: a dome over a round base plate. The second version cut a field of vents into the base.',
    tool: 'Onshape',
    year: '2026',
    kind: 'Enclosure',
    iterations: 2,
    parts: [
      { key: 'base', label: 'Vented base', notes: ['v2 added the vent field', 'Locates the dome'] },
      { key: 'dome', label: 'Dome', notes: ['One printed shell', 'Sits over the base'] },
    ],
  },
  {
    slug: 'aero',
    name: 'Aero',
    blurb: 'A tapered frame on four legs under a vented hood, drawn to print in one piece.',
    tool: 'CAD',
    year: '2025',
    kind: '3D print',
    parts: [{ key: 'body', label: 'Body', notes: ['One piece, no supports inside', 'Vent patterns on every face of the hood'] }],
  },
  {
    slug: 'balm',
    name: 'Balm',
    blurb: 'A small round case, 24 mm across, drawn and printed in one go.',
    tool: 'CAD',
    year: '2026',
    kind: '3D print',
    parts: [{ key: 'body', label: 'Body', notes: ['24 mm across', 'Printed in one piece'] }],
  },
]

type Generated = Record<
  string,
  {
    size: [number, number, number]
    view: { yaw: number; pitch: number }
    parts: { key: string; center: [number, number, number]; size: [number, number, number]; triangles: number }[]
  }
>

/** the model's measured size and parts, from the build script */
export const cadGeometry = generated as unknown as Generated
