// Turns potrace's SVGs into plain path lists in image pixels (potrace writes in 0.1pt, y flipped).
import { readFileSync, writeFileSync } from "node:fs";
const paths = f => [...readFileSync(f, "utf8").matchAll(/<path d="([^"]+)"/g)].map(m => m[1].replace(/\s+/g, " "));
const g = (f, scale, h, pad = 0) => ({ transform: `translate(${-pad} ${-pad}) scale(${scale}) translate(0 ${h}) scale(0.1 -0.1)`, paths: paths(f) });
// potrace path order for this crop: 0 h, 1 T, 2 c, 3 e, 4 Zaru, 5 swoosh -> written in reading order
const m = g("out/tmp/mark.svg", 0.25, 880);
writeFileSync("out/mark.json", JSON.stringify({
  crop: [180, 460, 300, 220], transform: m.transform,
  letters: [4, 1, 3, 2, 0].map(i => m.paths[i]), swoosh: m.paths[5],
}));
const ink = g("out/tmp/ink.svg", 1, 1010, 2);
writeFileSync("out/duck-trace.json", JSON.stringify(ink));
console.log("mark letters", m.paths.length, "duck contours", ink.paths.length, ink.paths.reduce((n, d) => n + d.length, 0), "chars");
