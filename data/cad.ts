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
    blurb: 'A printed holder for the robot\'s NovaPi controller. The board sits in its own mount with the XT30 power connectors beside it, and the whole stack lifts out of the robot as one block.',
    tool: 'Fusion 360',
    year: '2025',
    kind: 'Competition robot',
    iterations: 3,
    parts: [
      { key: 'frame', label: 'Holder', notes: ['Printed in one piece', 'Bolts to the chassis', 'Open sides for the wiring'] },
      { key: 'mount', label: 'NovaPi mount', notes: ['Printed tray the board sits in', 'Locates it in the holder'] },
      // TODO(sky): the STEP names this assembly "NOVA PI BY EARN": credit Earn here if they modelled it
      { key: 'novapi', label: 'NovaPi controller', notes: ['Makeblock\'s MakeX controller board', 'Screws down onto its mount'] },
      { key: 'xt30', label: 'XT30 connectors', notes: ['Battery power in', 'Held by the mount, not the board'] },
    ],
  },
  {
    slug: 'robot-arm',
    name: 'INOVEDEX Robot Arm',
    blurb: 'The forearm and gripper of a pick-and-place arm that finds coloured cubes with a Pi camera. The rack-and-pinion jaws open 12 to 45 mm, and the arm folds to fit the 350 mm start frame.',
    tool: 'Fusion 360',
    year: '2026',
    kind: 'Robot arm',
    parts: [
      { key: 'forearm', label: 'Forearm', notes: ['120 mm, elbow to wrist', 'Pockets for the DS3218MG and MG90S servos', 'Cable channel with zip-tie slots'] },
      { key: 'gripper', label: 'Gripper body', notes: ['Palm and wrist clevis in one print', 'Wrist pivot held on both sides'] },
      { key: 'pinion', label: 'Pinion', notes: ['Module 1, 24 teeth', 'Servo horn pressed into the back'] },
      { key: 'finger-a', label: 'Finger A', notes: ['Upper rack on a dovetail rail', 'Jaws open 12 to 45 mm'] },
      { key: 'finger-b', label: 'Finger B', notes: ['Lower rack, opposite finger A', 'Recess for a 1 mm TPU pad'] },
      { key: 'camera-mount', label: 'Camera mount', notes: ['Pi Camera Module 3 ahead of the jaws', 'Tilts 0 to 45° on one M3 screw'] },
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
