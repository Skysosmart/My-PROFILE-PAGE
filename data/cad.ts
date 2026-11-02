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
  /** omitted when unknown */
  year?: string
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
    slug: 'inovedex',
    name: 'INOVEDEX',
    blurb: 'A pick-and-place robot arm on its own control base. A Pi camera ahead of the gripper finds the coloured cubes, and the rack-and-pinion jaws open 12 to 45 mm to lift them.',
    tool: 'Fusion 360',
    year: '2026',
    kind: 'Robot arm',
    parts: [
      { key: 'base', label: 'Base', notes: ['Holds the electronics', 'Turntable bearing set into the lid'] },
      { key: 'shoulder', label: 'Turntable & column', notes: ['Turns the whole arm', 'Shoulder servo at the top'] },
      { key: 'upper-arm', label: 'Upper arm', notes: ['Elbow servo at the far end', 'Lightening holes along its length'] },
      { key: 'hand', label: 'Forearm & gripper', notes: ['Rack-and-pinion jaws, 12 to 45 mm', 'Pi Camera Module 3 ahead of the jaws'] },
      { key: 'cubes', label: 'Cubes', notes: ['20 mm, one per colour', 'What the camera looks for'] },
    ],
  },
  {
    slug: 'prometeus',
    name: 'PROMETEUS',
    blurb: 'A competition robot on four mecanum wheels with a slide-rail lift: a carriage runs up the frame on rail sliders and carries the arm out over the field.',
    tool: 'Fusion 360',
    year: '2025',
    kind: 'Competition robot',
    iterations: 3,
    parts: [
      { key: 'drive', label: 'Mecanum drive', notes: ['Four mecanum wheels on encoder motors', 'Drives sideways without turning'] },
      { key: 'lift', label: 'Slide-rail lift', notes: ['Beam frame, 496 mm tall', 'Sliders ride the rails, pulled by a timing belt'] },
      { key: 'arm', label: 'Arm', notes: ['Reaches out from the lift', 'Servo hubs at the joints'] },
      { key: 'carriage', label: 'Top carriage', notes: ['Crossbeam over the lift', 'Timing pulleys for the belt'] },
    ],
  },
  {
    slug: 'rmrc',
    name: 'RMRC Rescue Robot',
    blurb: 'A tracked robot for the RoboCup Rapidly Manufactured Robot Challenge: four track pods carry it over rubble, and an arm out front reaches into the test lanes.',
    tool: 'Fusion 360',
    year: '2025',
    kind: 'Rescue robot',
    parts: [
      { key: 'tracks', label: 'Track pods', notes: ['Four independent pods', 'Printed treads'] },
      { key: 'chassis', label: 'Chassis', notes: ['Motors and drive shafts', 'Low, between the pods'] },
      { key: 'body', label: 'Body', notes: ['Electronics deck', 'Camera mast at the back'] },
      { key: 'arm', label: 'Arm', notes: ['Folds over the body', 'Two links'] },
      { key: 'gripper', label: 'Gripper', notes: ['At the end of the arm', 'Servo-driven jaws'] },
    ],
  },
  {
    slug: 'pdlite',
    name: 'P-DLite',
    blurb: 'A desktop device for saliva-based Parkinson\'s pre-screening: it runs the sample through the reagents and reads the colour change with a camera, then shows the result on its own screen.',
    tool: 'Fusion 360',
    year: '2026',
    kind: 'Medical device',
    parts: [
      { key: 'housing', label: 'Housing', notes: ['One sloped shell', 'P-DLite name cut into the front'] },
      { key: 'dispenser', label: 'Dispenser', notes: ['Tower over the sample cup', 'Drives the reagent tubes'] },
      { key: 'cup', label: 'Sample cup', notes: ['Saliva goes in here', 'Sits under the dispenser'] },
      { key: 'tray', label: 'Tray', notes: ['Slides in on the slope', 'Holds the test card'] },
      { key: 'screen', label: 'Screen', notes: ['Shows the result', 'Bezel printed separately'] },
      { key: 'board', label: 'Electronics', notes: ['Controller board at the back', 'Wired to the screen and the camera'] },
    ],
  },
  {
    slug: 'aevur',
    name: 'Aevur V1',
    blurb: 'A handheld sensor box: a microcontroller board, a screen in the lid and a row of sensor modules, all in one printed case.',
    tool: 'Fusion 360',
    year: '2026',
    kind: 'Electronics enclosure',
    parts: [
      { key: 'case', label: 'Case', notes: ['Printed in one piece', 'Cut-outs for the ports'] },
      { key: 'board', label: 'Main board', notes: ['The microcontroller', 'Headers for the modules'] },
      { key: 'display', label: 'Display', notes: ['Sits under the lid', 'Read through a window'] },
      { key: 'sensors', label: 'Sensors', notes: ['Gas sensor module', 'Second board beside it'] },
      { key: 'lid', label: 'Lid details', notes: ['LED ring', 'Raised lettering'] },
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
    slug: 'desktop-locker',
    name: 'Desktop Locker',
    blurb: 'A hook-shaped latch drawn to print flat in one piece. This is the second version.',
    tool: 'Fusion 360',
    kind: '3D print',
    iterations: 2,
    parts: [{ key: 'body', label: 'Body', notes: ['189 mm long', 'Printed in one piece'] }],
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
    slug: 'pacman',
    name: 'Pac-Man',
    blurb: 'A 100 mm Pac-Man, mouth open, drawn for fun and printed in two colours.',
    tool: 'Fusion 360',
    kind: '3D print',
    parts: [{ key: 'body', label: 'Body', notes: ['100 mm across', 'Two-colour print'] }],
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
