# Customization Guide

Almost everything you would want to change is content, and content lives in
`data/`. The components read from it; nothing is typed twice.

## Content: `data/portfolio.ts` (English) and `data/portfolio.th.ts` (Thai)

| What you want to change              | Edit this export                                   |
| ------------------------------------ | -------------------------------------------------- |
| Name, handle, roles, boot log        | `player` (+ `playerTh`)                            |
| Header entries                       | `nav` (an entry with `href` is its own route)      |
| System-profile cards, MBTI, stack    | `profile` (+ `profileTh`)                          |
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

## Writeups: `content/writeups/*.mdx`

Copy `_template.mdx` to `<slug>.mdx`; the file name is the URL. Frontmatter:
`title`, `date`, `event`, `category`, `difficulty`, `tags`, `summary`, `draft`.
A draft shows locally and on Vercel previews, never in production. Code
blocks are highlighted in both themes. Files starting with `_` never publish.

## The duck: `public/duck/`

Every pose is its own drawing in `assets/duck/<pose>-source.png` (black lines
and a few flat colours on cream). `scripts/duck-split.sh <pose> <pose>-source.png`
turns one into the two composites the site loads, `public/duck/<pose>-dark.png`
(near-black body, white lines) and `<pose>-light.png` (paper body, black
lines); coloured parts keep their colour in both. Pass `cutout` as the third
argument for a drawing that carries its own scene (hacker mode) to keep it
as drawn and only drop the background. Then add the pose to the table in
`components/duck/Duck.tsx` with the size the script prints.

The twelve expressions come from one sheet (`emotes-source.png`), cropped to
`emote-<name>-source.png` and split the same way; `components/duck/Emote.tsx`
shows one as a sticker. The favicon (`app/icon.png`), the Apple icon and the
share card (`public/og.png`) are the standing duck.

## Theme and colours

Dark is the design; light is the same terminal on warm paper. Tokens are the
`--bg`, `--fg`, `--panel` RGB triplets at the top of `app/globals.css`, with
the Tailwind names (`fg`, `bg`, `panel`, `fg-dim`, `fg-muted`, `duck`) in the
`@theme` block right after. The duck's yellow (`--color-duck`) is the only
colour in the palette; use it sparingly.

`theme` and `lang` are remembered in localStorage and applied before first
paint by the two inline scripts in `app/layout.tsx`.

## Run it

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
```
