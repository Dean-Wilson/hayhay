#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FONT_PATH="$ROOT_DIR/public/fonts/figuratika/figuratika.ttf"
OUTPUT_DIR="$ROOT_DIR/public/images/branding"
FAVICON_OUTPUT="$ROOT_DIR/public/favicon.ico"
FAVICON_SVG_OUTPUT="$ROOT_DIR/public/favicon.svg"
APPLE_TOUCH_ICON_OUTPUT="$ROOT_DIR/public/apple-touch-icon.png"
WEB_APP_ICON_OUTPUT="$ROOT_DIR/public/icon-512.png"
STACKED_LINE_GAP=-114

mkdir -p "$OUTPUT_DIR"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick ('magick') is required to generate logo assets." >&2
  exit 1
fi

if [[ ! -f "$FONT_PATH" ]]; then
  echo "Missing font at $FONT_PATH" >&2
  exit 1
fi

INLINE_OUTPUT="$OUTPUT_DIR/hay-hay-design-logo-inline.png"
STACKED_OUTPUT="$OUTPUT_DIR/hay-hay-design-logo-stacked.png"
STACKED_BLUE_OUTPUT="$OUTPUT_DIR/hay-hay-design-logo-bright-stacked.jpg"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

render_centered_stacked_text() {
  local fill_color="$1"
  local output_path="$2"
  local hay_path="$TMP_DIR/hay-${fill_color//[^a-zA-Z0-9]/}.png"
  local design_path="$TMP_DIR/design-${fill_color//[^a-zA-Z0-9]/}.png"
  local canvas_width
  local canvas_height
  local hay_width
  local hay_height
  local design_width
  local design_height
  local design_offset_y

  magick \
    -background none \
    -fill "$fill_color" \
    -font "$FONT_PATH" \
    -pointsize 640 \
    -kerning 0 \
    label:'hay-hay' \
    -trim \
    +repage \
    "PNG32:$hay_path"

  magick \
    -background none \
    -fill "$fill_color" \
    -font "$FONT_PATH" \
    -pointsize 640 \
    -kerning 0 \
    label:'design' \
    -trim \
    +repage \
    "PNG32:$design_path"

  read -r hay_width hay_height <<<"$(magick identify -format '%w %h' "$hay_path")"
  read -r design_width design_height <<<"$(magick identify -format '%w %h' "$design_path")"

  if (( hay_width > design_width )); then
    canvas_width=$hay_width
  else
    canvas_width=$design_width
  fi

  design_offset_y=$((hay_height + STACKED_LINE_GAP))
  canvas_height=$((design_offset_y + design_height))

  magick \
    -size "${canvas_width}x${canvas_height}" \
    xc:none \
    \( "$hay_path" \) \
    -gravity north \
    -geometry +0+0 \
    -composite \
    \( "$design_path" \) \
    -gravity north \
    -geometry "+0+${design_offset_y}" \
    -composite \
    "PNG32:$output_path"
}

magick \
  -background none \
  -fill black \
  -font "$FONT_PATH" \
  -pointsize 640 \
  -kerning 0 \
  label:'hay-hay design' \
  -trim \
  +repage \
  "PNG32:$INLINE_OUTPUT"

render_centered_stacked_text 'black' "$STACKED_OUTPUT"

render_centered_stacked_text '#edff00' "$TMP_DIR/bright-stacked-text.png"

magick \
  "$TMP_DIR/bright-stacked-text.png" \
  -bordercolor '#2007ea' \
  -border 240x120 \
  -quality 95 \
  "JPEG:$STACKED_BLUE_OUTPUT"

magick \
  -size 1024x1024 \
  xc:none \
  -fill '#2007ea' \
  -draw 'circle 512,512 512,0' \
  -fill '#edff00' \
  -font "$FONT_PATH" \
  -pointsize 792 \
  -kerning 0 \
  -gravity center \
  -annotate +0+20 'h' \
  -strip \
  "PNG32:$TMP_DIR/favicon-master.png"

magick "$TMP_DIR/favicon-master.png" -resize 16x16 "PNG32:$TMP_DIR/favicon-16.png"
magick "$TMP_DIR/favicon-master.png" -resize 32x32 "PNG32:$TMP_DIR/favicon-32.png"
magick "$TMP_DIR/favicon-master.png" -resize 48x48 "PNG32:$TMP_DIR/favicon-48.png"
magick "$TMP_DIR/favicon-16.png" "$TMP_DIR/favicon-32.png" "$TMP_DIR/favicon-48.png" "$FAVICON_OUTPUT"
magick "$TMP_DIR/favicon-master.png" -resize 180x180 "PNG32:$APPLE_TOUCH_ICON_OUTPUT"
magick "$TMP_DIR/favicon-master.png" -resize 512x512 "PNG32:$WEB_APP_ICON_OUTPUT"

cat > "$FAVICON_SVG_OUTPUT" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="32" fill="#2007ea"/>
  <text x="50%" y="50%" dy=".36em" text-anchor="middle" fill="#edff00" font-family="Figuratika, serif" font-size="51">h</text>
</svg>
SVG

echo "Generated:"
echo "  $INLINE_OUTPUT"
echo "  $STACKED_OUTPUT"
echo "  $STACKED_BLUE_OUTPUT"
echo "  $FAVICON_OUTPUT"
echo "  $FAVICON_SVG_OUTPUT"
echo "  $APPLE_TOUCH_ICON_OUTPUT"
echo "  $WEB_APP_ICON_OUTPUT"
