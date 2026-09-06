#!/usr/bin/env bash
# Split a line-art duck drawing into the two theme composites the site loads.
#
#   scripts/duck-split.sh <name> <source.png> [ink|cutout]
#
# Reads assets/duck/<source>, writes public/duck/<name>-dark.png and
# public/duck/<name>-light.png. Needs ImageMagick 7 (`magick`).
#
# The drawings arrive as black lines and a few flat colours on a cream
# background, with the body the same cream as the paper. Colour alone cannot
# separate body from background, so the silhouette comes from topology: the
# outline is thickened until every gap closes, the outside is flood-filled
# from a corner, and the result is thinned back to the outline's outer edge.
#
#   ink      the site's monochrome treatment: the body becomes the panel
#            colour, the lines the ink colour, and every coloured part
#            (beak, feet, blanket, laptop) keeps its colour. Dark gets white
#            lines on a near-black body; light gets black lines on paper.
#   cutout   keeps the drawing exactly as drawn and only removes the
#            background, for illustrations that carry their own scene.
set -euo pipefail
name=$1
src=assets/duck/$2
mode=${3:-ink}
out=public/duck
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# --- a transparent source (the emote sheet) is laid on paper first, so the
#     background is the same cream the other drawings arrive on
magick "$src" -background '#f3f0e8' -flatten "$tmp/src.png"
src=$tmp/src.png

# --- colour layer: anything saturated is a deliberate colour, not a line
# HSB, not HSL: HSL saturation runs high on near-white paper, HSB stays near zero
magick "$src" -alpha off -colorspace HSB -channel G -separate +channel -threshold 22% "$tmp/sat.png"

# --- lines: darkness, with the coloured parts painted out first
# (Lighten with the mask = per-channel max, so a coloured pixel becomes white)
magick "$src" -alpha off "$tmp/sat.png" -compose Lighten -composite \
  -colorspace gray -negate -level 8%,92% "$tmp/lines-soft.png"

# --- silhouette: seal the outline, flood the outside, thin back
magick "$tmp/lines-soft.png" -threshold 45% -morphology Dilate Disk:24 \
  -fill gray50 -draw 'color 0,0 floodfill' \
  -fill white +opaque gray50 -fill black -opaque gray50 \
  -morphology Erode Disk:22 "$tmp/mask.png"
magick "$tmp/mask.png" -morphology Dilate Disk:3 "$tmp/mask3.png"

if [[ $mode == cutout ]]; then
  # keep the pixels, drop the background
  for theme in dark light; do
    magick "$src" -alpha off "$tmp/mask3.png" -compose CopyOpacity -composite -trim +repage "$out/$name-$theme.png"
  done
  echo "wrote $out/$name-{dark,light}.png (cutout, $(magick identify -format '%wx%h' "$out/$name-dark.png"))"
  exit 0
fi

# lines clipped to the silhouette (drops any faint ring around the drawing)
magick "$tmp/lines-soft.png" "$tmp/mask3.png" -compose Multiply -composite "$tmp/lines-a.png"
magick -size "$(magick identify -format '%wx%h' "$src")" xc:black "$tmp/lines-a.png" -alpha off -compose CopyOpacity -composite "$tmp/lines.png"
# the coloured parts, clipped the same way
magick "$tmp/sat.png" "$tmp/mask3.png" -compose Multiply -composite "$tmp/sat-a.png"
magick "$src" -alpha off "$tmp/sat-a.png" -compose CopyOpacity -composite "$tmp/colour.png"
# the body, as a flat silhouette to be tinted
magick -size "$(magick identify -format '%wx%h' "$src")" xc:white "$tmp/mask.png" -alpha off -compose CopyOpacity -composite "$tmp/fill.png"

# dark: near-black body, white lines. light: paper body, black lines.
magick "$tmp/fill.png" -fill '#0d0d0f' -colorize 100 "$tmp/colour.png" -composite \( "$tmp/lines.png" -fill white -colorize 100 \) -composite -trim +repage "$out/$name-dark.png"
magick "$tmp/fill.png" -fill '#f3f0e8' -colorize 100 "$tmp/colour.png" -composite "$tmp/lines.png" -composite -trim +repage "$out/$name-light.png"
echo "wrote $out/$name-{dark,light}.png (ink, $(magick identify -format '%wx%h' "$out/$name-dark.png"))"
