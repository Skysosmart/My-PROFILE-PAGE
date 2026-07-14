# Customization Guide — NONTHANAPHONG.EXE

This site is an **ASCII / retro-game academic portfolio**. Almost everything you
need to change lives in **one file**:

## 👉 Edit content in `data/portfolio.ts`

Open [`data/portfolio.ts`](data/portfolio.ts). Every section reads from it.
Placeholders to replace are marked with `// TODO`.

| What you want to change | Edit this export |
| --- | --- |
| Your name, boot-up log, tagline | `player` |
| The checkpoint menu (order / labels) | `checkpoints` |
| 01 Character Profile card + bio | `profile` |
| 02 Origin Story (inspiration) | `origin` |
| 03 Academic Stats (bars + data sheet) | `stats` |
| 04 Skill Inventory (item cards) | `skills` |
| 05 Quest Log (projects/activities) | `quests` |
| 06 Achievements Unlocked | `achievements` |
| 07 Final Mission (goals) | `mission` |
| 08 Contact NPC (email/links) | `contact` |

Notes:
- **Stat bars** (`stats.bars`) use a `value` from 0–100.
- **Skills / Achievements** use a `rarity` of `common | rare | epic | legendary`
  (changes the card color/glow). Achievements with `unlocked: false` render locked.
- **Quests** use a `status` of `Completed | In Progress | Upcoming` (colors the badge).
- To **add/remove a section**, update the matching export AND the `checkpoints`
  array (the `id` must match the section's `id`).

## Colors & theme

Palette and animations live in
[`tailwind.config.ts`](tailwind.config.ts) (`phosphor`, `cyan`, `lime`, `amber`…)
and base terminal styles in [`app/globals.css`](app/globals.css)
(scanlines, glow, grid background).

## ASCII assets

The PNG/TXT art lives in `public/ASCII-Art/` and `public/ASCII-Art-text/`
and is referenced from `assets` in `data/portfolio.ts`:
- `Fullname-ascii-art.png` → hero name / boot logo
- `Hand-ascii-art.png` → menu pointer + character avatar + NPC portrait
- `Sky-ascii-art.png` / `Sky-ASCII.txt` → ambient background atmosphere

## Structure (for reference)

- `app/page.tsx` → renders `components/Portfolio.tsx`
- `components/Portfolio.tsx` → boot screen → checkpoint HUD + all sections
- `components/BootScreen.tsx` → boot sequence + PRESS START
- `components/CheckpointMenu.tsx` → the quest menu (click + ↑/↓ keyboard nav)
- `components/sections/*` → one file per checkpoint
- `components/ui/*`, `components/effects/*` → shared building blocks

## Run it

```bash
bun run dev     # or: npm run dev   → http://localhost:3000
bun run build   # production build
```
