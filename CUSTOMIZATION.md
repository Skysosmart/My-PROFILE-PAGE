# Customization Guide

Almost everything you would want to change is content, and content lives in
`data/`. The components read from it; nothing is typed twice.

## Content: `data/portfolio.ts` (English) and `data/portfolio.th.ts` (Thai)

| What you want to change              | Edit this export                                   |
| ------------------------------------ | -------------------------------------------------- |
| Name, handle, roles, boot log        | `player` (+ `playerTh`)                            |
| Header entries                       | `nav` (an entry with `href` is its own route)      |
| The spec label: MBTI, stack, status  | `profile` (+ `profileTh`); see the label note below |
| The two About paragraphs, facts      | `about` (+ `aboutTh`)                              |
| Statement of purpose (`sop` command) | `sop` (+ `sopTh`)                                  |
| Principles (`inspiration` command)   | `inspiration` (+ `inspirationTh`)                  |
| Projects, in film order              | `projects` (+ `projectsTh`, keyed by title)        |
| Photo albums for the personal stack  | `moments`, files in `public/moments/<key>/`        |
| Certificates                         | `certificates`, scans in `public/certificates/`    |
| Contact channels                     | `contact.channels`                                 |

Thai holds prose only; keys, files, URLs, tags and dates are shared with the
English file. A project's Thai entry is looked up by its English title, so
rename both together. Lines marked `// TODO(th-review)` are machine drafts
waiting for a native read.

Interface strings (buttons, labels, the hero's three lines, the ending) are
in `data/ui.ts`, both languages side by side. The marked terms with tooltips
are in `data/glossary.ts`.

## The spec label: `components/SpecLabel.tsx`

The System Profile is the label on the back of the device. Its rows read
`player`, `profile`, the certificate counts and the project count, so they
follow the data; the REV is the day of the build. The two codes on it are
real: `node scripts/codes.mjs` asks `zint` and `qrencode` (both installed
locally) for a Code 128 of the handle and a QR of `/resume.pdf` and writes
them to `data/codes.ts`. Run it again after changing the handle or the site
url in `lib/site.ts`. Two ducks are printed on it, both 1-bit halftones from
`duck-split.sh`'s `print` mode: `hacker-print.png` is the mark in the header,
and `suit-print.png` stands in the CORE row, floated so the MBTI description
wraps around it. The MBTI itself is `profile.mbti` (+ `profileTh.mbti`); the
serial under the barcode is built from it, so it follows along on its own -
only the handle and the site url are baked into the codes.

## Scrolling: `lib/smooth-scroll.ts`

The page has weight: Lenis eases the window toward where a gesture asked for
instead of jumping, and coasts to a stop. `lerp` is the dial - 0.06, well under
the library's 0.1 default, so it takes its time. For scale: one 300px
wheel notch is 90% travelled at ~630ms and settled by ~1.2s; at the 0.075
it started from, that was ~500ms and ~1.0s. It drives the real window
scroll, which is why the film's sticky stage, `useScroll` and every
`getBoundingClientRect` on the page are unaware of it.

Touch is left alone (`syncTouch` off): a phone already has momentum.
Reduced motion never starts it. `/certificates` is its own route and is not
covered - only the one-pager mounts it.

Two things to know before changing any of this:

- **The film keeps the wheel.** While its stage is pinned, Projects turns one
  gesture into one project and eats the inertia tail, the exact opposite of
  coasting, so it claims the wheel with `claimWheel(pinned)` and Lenis stands
  down. Standing down is `virtualScroll` returning false, *never* `stop()` -
  a stopped Lenis calls `preventDefault` on the wheel, which would seal the
  reader inside the film, and the film deliberately leaves both edges open.
- **Do not pass an offset to `lenis.scrollTo`.** It already subtracts the
  target's `scroll-margin-top`, the same thing `scrollIntoView` honours, so
  the `scroll-mt-*` on each section still clears the header. Passing it again
  lands every flight one header short.
- A pane that scrolls inside the page needs `data-lenis-prevent`; the cert
  lightbox, the About terminal and the personal filmstrip have it.
- The film is the only section that takes the wheel. The personal section is
  a filmstrip too, but it is dragged, swiped, arrowed or clicked and never
  touches the wheel - deliberately, so there is one owner of that gesture and
  not two.

## Phones and tablets

Everything that leans with the reader (the ducks, the orb's drift, the
torus's tilt) takes its lean from `lib/lean.ts`: the pointer on a computer,
the tilt of the device on a phone or tablet (iOS asks for motion access on
the first tap; until then, and where there is no gyroscope, the finger). A
finger dragged over the orb makes ripples. Tablets get the computer's
layout: `lib/viewport.ts` pins the viewport to 1024 (portrait) or 1280
(landscape) on a touch screen whose short side is 700px or more.

## Writeups: `content/writeups/*.mdx`

Copy `_template.mdx` to `<slug>.mdx`; the file name is the URL. Frontmatter:
`title`, `date`, `event`, `category`, `difficulty`, `tags`, `summary`, `draft`.
A draft shows locally and on Vercel previews, never in production. Code
blocks are highlighted (one shiki theme). Files starting with `_` never publish.

## The duck: `public/duck/`

Every pose is its own drawing in `assets/duck/<pose>-source.png` (black lines
and a few flat colours on cream). `scripts/duck-split.sh <pose> <pose>-source.png`
turns one into the composite the site loads, `public/duck/<pose>-light.png`
(paper body, black lines); coloured parts keep their colour. Pass `cutout` as the third
argument for a drawing that carries its own scene (hacker mode) to keep it
as drawn and only drop the background. Pass `print` for the spec label's
treatment instead: the drawing is brought to 480px wide (`PRINT_W` overrides)
and then taken to one ink through an ordered dither, giving
`public/duck/<pose>-print.png` - a white body, black lines, and every flat
colour as its own density of dots. Sizing before dithering is the point; a
halftone resized afterwards turns to mush. Then add the pose to the table in
`components/duck/Duck.tsx` with the size the script prints.

The twelve expressions come from one sheet (`emotes-source.png`), cropped to
`emote-<name>-source.png` and split the same way; `components/duck/Emote.tsx`
shows one as a sticker. The favicon (`app/icon.png`), the Apple icon and the
share card (`public/og.png`) are the standing duck.

## Theme and colours

One palette: the terminal on warm paper. Tokens are the `--bg`, `--fg`,
`--panel` RGB triplets at the top of `app/globals.css`, with the Tailwind
names (`fg`, `bg`, `panel`, `fg-dim`, `fg-muted`, `duck`) in the `@theme`
block right after. The duck's yellow (`--color-duck`) is the only colour in
the palette; use it sparingly.

There was a dark theme beside this one, with a toggle, a `theme` command and
a drawing of every duck pose in each. It was dropped; the history has all of
it if it is ever wanted back. What is left of it is the `-light` in the duck
file names and `lib/ink.ts`, which is only the two colour readers the orb and
the ASCII hand need.

`lang` is remembered in localStorage and applied before first paint by the
inline script in `app/layout.tsx`.

## Run it

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
```
