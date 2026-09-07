# NONTHANAPHONG.EXE

The portfolio of Nonthanaphong "Sky" Saechua: full-stack developer, penetration
tester, 3D and graphic designer. Live at [nonthanaphong.vercel.app](https://nonthanaphong.vercel.app).

A terminal-themed one-pager with the ZaruTech duck as its mascot: a boot
screen, a command-line header (`Ctrl/Cmd+K`, `theme light|dark|system`,
`lang th|en`), an ASCII hand and a liquid sky orb in the hero, a system-profile
card grid, an interactive About terminal in front of a 3D torus, fifty-six
certificates on a wall, a scroll-driven film of projects, CTF writeups, a
photo stack, and an ending that says so. English and Thai, dark and paper.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript 5
- Tailwind CSS 4 (CSS-first config in `app/globals.css`)
- Motion 13 for the reveals, `three` for the About torus, `ogl` for the orb
- `@react-pdf/renderer` builds the one-page CV at `/resume.pdf` at deploy time
- `next-mdx-remote` + `rehype-pretty-code` for the writeups
- Resend for the contact form, Vercel Analytics and Speed Insights

## Run it

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

Node 20.9 or newer. The GitHub Actions workflow runs lint, typecheck and build
on every push and pull request.

## Environment

Copy `.env.example` to `.env.local`. Only the contact form needs anything:

| Variable         | What it does                                                                 |
| ---------------- | ---------------------------------------------------------------------------- |
| `RESEND_API_KEY` | Enables the contact form. Without it the ending shows a mailto button.       |
| `CONTACT_FROM`   | The From address Resend sends as; must be on a domain verified in Resend.    |

Set the same two on Vercel (Production and Preview).

## Where things live

```
app/                  routes: /, /certificates, /writeups, /writeups/[slug], /resume.pdf, 404
  actions/contact.ts  the contact form's server action
  globals.css         theme tokens, Tailwind theme, writeup prose, cursor, dither
components/
  sections/           one file per section, in page order (see Portfolio.tsx)
  duck/Duck.tsx       the mascot and its poses
  effects/            hand, orb sky, torus, cursor, walls
  ui/                 GlassSection, cards, lightbox, terminal, codes
  writeups/           chrome and list for the MDX pages
content/writeups/     the writeups, one .mdx each (see _template.mdx)
data/portfolio.ts     every word of content, in English
data/portfolio.th.ts  the same prose in Thai
data/ui.ts            interface strings, both languages
lib/                  certs, resume, theme, lang, content, writeups
public/duck/          the duck, split into theme-aware layers
assets/               fonts for the PDF, the duck's source drawing
```

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for how to change the content.

## License

MIT
