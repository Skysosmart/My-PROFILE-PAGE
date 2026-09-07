#!/usr/bin/env bash
# Split a line-art duck drawing into the two theme composites the site loads.
#
#   scripts/duck-split.sh <name> <source.png> [ink|cutout|print]
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
#   print    the spec label's treatment: the light composite taken to one
#            ink through an ordered dither (h4x4a), so the sticker prints
#            the way a real one does - a white body, black lines, and every
#            flat colour as its own density of dots.
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
# (the level cut is hard on the dark end so the grain inside a black shape,
# the sunglasses say, goes solid instead of speckling once recoloured white;
# no smoothing, which would thin the fine strokes and open the outline)
magick "$src" -alpha off "$tmp/sat.png" -compose Lighten -composite \
  -colorspace gray -negate -level 14%,60% "$tmp/lines-raw.png"
# keep only what lies within 3px of a solid stroke: the faint disc some of
# the drawings sit on is never solid, so it goes, while the soft edge of a
# real line stays with the line
magick "$tmp/lines-raw.png" -threshold 50% -morphology Dilate Disk:3 "$tmp/strong.png"
magick "$tmp/lines-raw.png" "$tmp/strong.png" -compose Multiply -composite "$tmp/lines-soft.png"

# --- silhouette. Two floods of the outside through the thickened outline:
# a loose one (4px) that closes nothing but stroke noise, and a tight one
# (34px) that closes every gap in the drawing and, with it, every pocket
# narrower than 68px (the gap between a speech bubble and the head, the
# hollow under a raised wing, the wedge between the legs). Where the two
# disagree is either a pocket or the body the loose flood leaked into
# through a real gap; the difference is what lies behind the opening: a
# pocket is a dead end, a leak opens onto the whole body. So of the regions
# the tight flood filled and the loose one did not, only a body-sized one
# is kept. The rest stays open, and the drawing keeps its hollows.
magick "$tmp/lines-soft.png" -threshold 45% "$tmp/lines-bin.png"
fill_at() { # <radius> <out>: the outside flooded through the outline thickened by <radius>, thinned back
  magick "$tmp/lines-bin.png" -morphology Dilate "Disk:$1" \
    -fill gray50 -draw 'color 0,0 floodfill' \
    -fill white +opaque gray50 -fill black -opaque gray50 \
    -morphology Erode "Disk:$(($1 + 1))" "$2"
}
fill_at 4 "$tmp/loose.png"
fill_at 34 "$tmp/tight.png"
magick "$tmp/lines-bin.png" -morphology Dilate Disk:3 "$tmp/lines3.png"
magick "$tmp/tight.png" "$tmp/loose.png" -compose Minus_Src -composite "$tmp/lines3.png" -compose Minus_Src -composite -threshold 50% "$tmp/diff.png"
# body-sized means 30% of the sealed silhouette: a leaked body measures 45-65%
# of it, the largest pocket seen (between a held trophy and the head) 24%
body_px=$(magick "$tmp/tight.png" -format '%[fx:round(mean*w*h*0.3)]' info:)
magick "$tmp/diff.png" -define connected-components:area-threshold="$body_px" -define connected-components:mean-color=true -connected-components 4 -threshold 50% "$tmp/body.png"
magick "$tmp/loose.png" "$tmp/body.png" -compose Lighten -composite "$tmp/mask.png"
magick "$tmp/mask.png" -morphology Dilate Disk:3 "$tmp/mask3.png"

if [[ $mode == cutout ]]; then
  # keep the pixels, drop the background
  magick "$tmp/mask3.png" "$tmp/lines-soft.png" -compose Lighten -composite "$tmp/alpha.png"
  for theme in dark light; do
    magick "$src" -alpha off "$tmp/alpha.png" -compose CopyOpacity -composite -trim +repage "$out/$name-$theme.png"
  done
  echo "wrote $out/$name-{dark,light}.png (cutout, $(magick identify -format '%wx%h' "$out/$name-dark.png"))"
  exit 0
fi

# the lines, wherever they are drawn: motion marks and sound effects sit
# outside the body and must survive (the paper's faint disc is below the
# level cut above, so it never makes it here)
magick -size "$(magick identify -format '%wx%h' "$src")" xc:black "$tmp/lines-soft.png" -alpha off -compose CopyOpacity -composite "$tmp/lines.png"
# the coloured parts, likewise
magick "$src" -alpha off "$tmp/sat.png" -compose CopyOpacity -composite "$tmp/colour.png"
# the body, as a flat silhouette to be tinted
magick -size "$(magick identify -format '%wx%h' "$src")" xc:white "$tmp/mask.png" -alpha off -compose CopyOpacity -composite "$tmp/fill.png"

if [[ $mode == print ]]; then
  # sized first, then dithered: a halftone resized afterwards turns to mush,
  # so the drawing is brought to its final width (PRINT_W, 480 by default)
  # while it is still continuous tone.
  # the light composite, then one ink: the paper's cream dithers to nearly
  # solid white, the lines stay black, and a mid-tone (a suit, a laptop)
  # becomes a halftone of its own weight. The alpha is carried across
  # untouched, so the sticker's own colour shows through around the drawing.
  magick "$tmp/fill.png" -fill '#f3f0e8' -colorize 100 "$tmp/colour.png" -composite "$tmp/lines.png" -composite -trim +repage -resize "${PRINT_W:-480}x" "$tmp/light.png"
  magick "$tmp/light.png" -alpha extract "$tmp/print-alpha.png"
  magick "$tmp/light.png" -alpha off -colorspace gray -ordered-dither h4x4a "$tmp/dots.png"
  magick "$tmp/dots.png" "$tmp/print-alpha.png" -compose CopyOpacity -composite "$out/$name-print.png"
  echo "wrote $out/$name-print.png (print, $(magick identify -format '%wx%h' "$out/$name-print.png"))"
  exit 0
fi

# dark: near-black body, white lines. light: paper body, black lines.
magick "$tmp/fill.png" -fill '#0d0d0f' -colorize 100 "$tmp/colour.png" -composite \( "$tmp/lines.png" -fill white -colorize 100 \) -composite -trim +repage "$out/$name-dark.png"
magick "$tmp/fill.png" -fill '#f3f0e8' -colorize 100 "$tmp/colour.png" -composite "$tmp/lines.png" -composite -trim +repage "$out/$name-light.png"
echo "wrote $out/$name-{dark,light}.png (ink, $(magick identify -format '%wx%h' "$out/$name-dark.png"))"
