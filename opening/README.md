# Opening

A 10.8 s, 60 fps opening title for zarutech.dev, built from the site itself. It is rendered once per screen shape, and each version ends on the hero exactly as that device lays it out:

| variant | size (CSS px × density) | hero it lands on |
| --- | --- | --- |
| `desktop` | 1920×1080 ×1 | desktop |
| `tablet-l` | 1280×892 ×1.5 | iPad landscape, which the site pins to a 1280-wide desktop layout (`lib/viewport.ts`) |
| `tablet-p` | 1024×1468 ×1.5 | iPad portrait, pinned to a 1024-wide desktop layout |
| `phone` | 390×844 ×2 | the stacked phone layout |

Portrait versions use a stacked arrangement of the same world. `components/OpeningFilm.tsx` plays the version whose shape is closest to the screen.

The opening is one continuous move:

1. The boot cursor collapses to a point.
2. The point routes PCB-style traces out to five systems: a browser holding a wireframe of the hero, the hero's own source, a QFP chip, the wireframe torus, and the site's prompt.
3. Prints of the real projects land on the beat. Each print is wired back to the system it came from.
4. The prints snap into a contact sheet and implode into the point.
5. The point writes the hand-lettered ZaruTech from the duck's chest.
6. That lettering flies onto the duck's chest at the exact pixel where the homepage hero draws it. The duck inks in around it and the hero builds: "I build it. / I break it. / Then I ship it."
7. The last frames hand over to a capture of the live page, so a cut to the real site is seamless.

| file | job |
| --- | --- |
| `variants.mjs` | The four devices: size, pixel density, layout. |
| `capture.mjs` | Screenshots the real hero for one variant (live site by default, or any URL you pass) as transparent layers: paper, duck, three lines, orb, bubble, chrome. Writes `out/hero[-variant]/`. |
| `prep.sh` | Uses potrace to trace the chest lettering and the duck's ink line work from `public/duck/hello-light.png`. Writes `out/mark.json`, `out/duck-trace.json` and `out/duck-ink.png`. |
| `compose.html` | The opening itself. `render(t)` is a pure function of time. Open it in a browser and it loops, or add `?t=7.3` to freeze one frame. |
| `sound.py` | Synthesises the soundtrack with numpy, every hit on a moment in `compose.html`. |
| `render.mjs` | Steps the page for one variant at 240 sub-frames per second, blends them into 60 fps with a 180° shutter, muxes the sound, and writes `out/zarutech-opening[-variant].mp4` and `.webm`. |

```sh
cd opening && bun install
for v in desktop tablet-l tablet-p phone; do node capture.mjs $v; done   # or: node capture.mjs phone http://localhost:3000/
bash prep.sh
node render.mjs phone --preview 1.8,4.8,7.3,9.4             # stills -> out/preview-phone/
for v in desktop tablet-l tablet-p phone; do PYTHON=~/.venv/bin/python node render.mjs $v; done   # ~5-10 min each
cp out/zarutech-opening*.mp4 out/zarutech-opening*.webm ../public/film/
# to view it live: python3 -m http.server -d . 8080, then open /compose.html
```

Re-run the captures and renders whenever the hero changes, so the last frame still matches the site. `out/` and `node_modules/` are git-ignored.
