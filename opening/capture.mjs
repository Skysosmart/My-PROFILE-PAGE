// Captures the real homepage hero, at each device's size (variants.mjs), as separate transparent layers, so the opening can build the
// hero piece by piece and land on the exact frame a visitor sees.
//   node capture.mjs [variant] [url]   variant: desktop (default) | tablet-l | tablet-p | phone
//   url defaults to https://www.zarutech.dev/; a local `next start` works too
// Writes out/hero[-variant]/*.png and layout.json (each layer's box in CSS px, plus the viewport).
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VARIANTS } from "./variants.mjs";

const NAME = process.argv[2] ?? "desktop";
const V = VARIANTS[NAME];
if (!V) throw new Error(`unknown variant ${NAME}`);
const OUT = join(dirname(fileURLToPath(import.meta.url)), "out", NAME === "desktop" ? "hero" : `hero-${NAME}`);
mkdirSync(OUT, { recursive: true });
const URL = process.argv[3] ?? "https://www.zarutech.dev/";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: V.w, height: V.h }, deviceScaleFactor: V.dpr, isMobile: V.w < 1024 && !V.desktopLayout, hasTouch: V.w < 1024 && !V.desktopLayout });
await p.addInitScript(() => sessionStorage.setItem("booted", "1"));   // skip the boot log: we want the hero
await p.goto(URL, { waitUntil: "networkidle" });
await p.mouse.move(V.w / 2, V.h / 2);   // the duck's parallax follows the pointer; park it in the middle
await p.waitForTimeout(4500);   // the hero's rise-in has finished by then

// Each layer: a name and the selector of the element it keeps.
const hero = "main > header";
const LAYERS = {
  wash: `${hero} span.rounded-\\[50\\%\\]`,
  duck: `${hero} img[src*="hello-light"]`,
  line1: `${hero} span.font-crt >> nth=0`,
  line2: `${hero} span.font-crt >> nth=1`,
  line3: `${hero} span.font-crt >> nth=2`,
  orb: `${hero} .liquid-orb >> xpath=..`,
  bubble: `${hero} .liquid-orb >> xpath=../span[contains(@class,'-top-16')]`,
  cue: `${hero} svg >> xpath=ancestor::div[contains(@class,'fixed')][1]`,
  ticker: `${hero} > div.absolute`,
  prompt: `body > header`,
  pill: `body > header > div`,
  name: `body > div.absolute`,
};
await p.screenshot({ path: join(OUT, "full.png") });
// the paper alone: everything else hidden
await p.addStyleTag({ content: `body > header, body > div.absolute, main, body > div.fixed:not(.page-tint) { visibility: hidden !important }` });
await p.screenshot({ path: join(OUT, "paper.png") });
// and without its 44px grid: the opening draws that grid itself, in world space, so it can move with the camera
const nogrid = await p.addStyleTag({ content: `body::after { display: none !important }` });
await p.screenshot({ path: join(OUT, "paper-nogrid.png") });
await nogrid.evaluate(e => e.remove());
await p.addStyleTag({ content: `
  html, body, .page-tint { background: transparent !important }
  * { visibility: hidden !important }
  [data-layer], [data-layer] * { visibility: visible !important }` });
const layout = {};
for (const [name, sel] of Object.entries(LAYERS)) {
  const el = p.locator(sel).first();
  await el.evaluate(e => e.setAttribute("data-layer", ""));
  const bb = await el.boundingBox();
  layout[name] = bb && [bb.x, bb.y, bb.width, bb.height].map(v => Math.round(v * 10) / 10);
  await p.screenshot({ path: join(OUT, `${name}.png`), omitBackground: true });
  await el.evaluate(e => e.removeAttribute("data-layer"));
}
writeFileSync(join(OUT, "layout.json"), JSON.stringify({ ...layout, viewport: V }, null, 2));
console.log(layout);
await b.close();
