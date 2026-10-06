// Renders compose.html frame by frame and encodes the opening.
//   node render.mjs [variant]                      # 60 fps with motion blur -> out/zarutech-opening[-variant].mp4 + .webm
//   node render.mjs [variant] --preview 0.5,2.4    # just those seconds, as PNG stills -> out/preview[-variant]/
//   SUB=1 node render.mjs                          # no motion blur (4x faster)
// variant: desktop (default) | tablet-l | tablet-p | phone (variants.mjs); each needs its `node capture.mjs <variant>`
// Motion blur: each output frame averages SUB/2 of SUB evenly spaced sub-frames (a 180° shutter).
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { VARIANTS } from "./variants.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "out");
const FPS = 60, SUB = Number(process.env.SUB ?? 4);
const NAME = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "desktop";
const V = VARIANTS[NAME];
if (!V) throw new Error(`unknown variant ${NAME}`);
const SUFFIX = NAME === "desktop" ? "" : `-${NAME}`, HERO = `hero${SUFFIX}`;
for (const f of [`${HERO}/full.png`, `${HERO}/layout.json`, "mark.json", "duck-trace.json"])
  if (!existsSync(join(OUT, f))) throw new Error(`missing out/${f}: run \`node capture.mjs ${NAME}\` and \`bash prep.sh\` first`);

const i = process.argv.indexOf("--preview");
const preview = i > 0 ? process.argv[i + 1].split(",").map(Number) : null;
const dir = join(OUT, (preview ? "preview" : "frames") + SUFFIX);
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });

const browser = await chromium.launch({ args: ["--allow-file-access-from-files", "--force-color-profile=srgb"] });
const page = await browser.newPage({ viewport: { width: V.w, height: V.h }, deviceScaleFactor: V.dpr });
const json = f => JSON.parse(readFileSync(join(OUT, f), "utf8"));
await page.addInitScript(([a, v]) => { window.ASSETS = a; window.VARIANT = v; },
  [[json("mark.json"), json("duck-trace.json")], { name: NAME, w: V.w, h: V.h, hero: `out/${HERO}`, layout: json(`${HERO}/layout.json`) }]);
page.on("pageerror", e => console.error("page:", e.message));
await page.goto(pathToFileURL(join(ROOT, "compose.html")).href + "?still");
await page.waitForFunction(() => window.render, null, { timeout: 60000 });
const DUR = await page.evaluate(() => window.DURATION);

const times = preview ?? Array.from({ length: Math.round(DUR * FPS * SUB) }, (_, k) => k / (FPS * SUB));
const t0 = Date.now();
for (const [n, t] of times.entries()) {
  await page.evaluate(t => window.render(t), t);
  const name = preview ? `t${t.toFixed(2)}.png` : `${String(n).padStart(5, "0")}.png`;
  await page.screenshot({ path: join(dir, name), type: "png" });
  if (!preview && n % 240 === 0) console.log(`${n}/${times.length}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
if (preview) process.exit(0);

const wav = join(OUT, `sound${SUFFIX}.wav`), mp4 = join(OUT, `zarutech-opening${SUFFIX}.mp4`), webm = join(OUT, `zarutech-opening${SUFFIX}.webm`);
execFileSync(process.env.PYTHON ?? "python3", [join(ROOT, "sound.py"), wav, String(DUR)], { stdio: "inherit" });
// sub-frames -> 60 fps: average the first SUB/2 of every SUB (shutter open half the frame), keep one per frame
const blur = SUB > 1 ? `tmix=frames=${SUB / 2}:weights=1,select='not(mod(n\\,${SUB}))',` : "";
const vf = `${blur}setpts=N/${FPS}/TB,format=yuv420p`;
const input = ["-framerate", String(FPS * SUB), "-i", join(dir, "%05d.png"), "-i", wav];
execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...input, "-vf", vf, "-r", String(FPS),
  "-c:v", "libx264", "-preset", "slow", "-crf", process.env.CRF ?? "23", "-tune", "film", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", mp4], { stdio: "inherit" });
execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...input, "-vf", vf, "-r", String(FPS),
  "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", process.env.VP9_CRF ?? "40", "-row-mt", "1", "-c:a", "libopus", "-b:a", "112k", "-shortest", webm], { stdio: "inherit" });
console.log("wrote", mp4, "and", webm);
