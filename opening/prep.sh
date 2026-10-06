#!/usr/bin/env bash
# Vector + raster assets the opening draws from the site's own art (ImageMagick + potrace).
#   bash prep.sh  ->  out/mark.json (the chest lettering as paths), out/duck-ink.png + out/duck-trace.json
set -euo pipefail
cd "$(dirname "$0")"
DUCK=../public/duck/hello-light.png
mkdir -p out/tmp
# The "ZaruTech" lettering on the duck's chest: crop, drop the body outline (it touches the crop's edge), trace at 4x.
magick "$DUCK" -crop 300x220+180+460 +repage -background white -alpha remove -colorspace gray -threshold 55% \
  -bordercolor black -border 1 -fill white -draw "color 0,0 floodfill" -shave 1x1 \
  -filter Lanczos -resize 400% -blur 0x3 -threshold 50% out/tmp/mark.pbm
potrace out/tmp/mark.pbm -s -o out/tmp/mark.svg --turdsize 20 --alphamax 1.1 --opttolerance 0.3
# The duck's ink alone (the black line work, alpha-keyed) and its traced contours, for the drawn-in reveal.
magick "$DUCK" \( +clone -alpha extract \) \( -clone 0 -background white -alpha remove -colorspace gray -negate -level 45%,80% \) \
  -delete 0 -compose multiply -composite out/tmp/ink-alpha.png
magick out/tmp/ink-alpha.png -background black -alpha remove -threshold 40% -negate -bordercolor white -border 2 out/tmp/ink.pbm
potrace out/tmp/ink.pbm -s -o out/tmp/ink.svg --turdsize 30 --alphamax 1.2 --opttolerance 0.5
magick -size 701x1006 xc:'#111111' out/tmp/ink-alpha.png -alpha off -compose copy-opacity -composite out/duck-ink.png
node prep-paths.mjs
