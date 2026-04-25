#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FONT_PATH="$ROOT_DIR/public/fonts/figuratika/figuratika.ttf"
OUTPUT_DIR="$ROOT_DIR/public/images/branding"
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

echo "Generated:"
echo "  $INLINE_OUTPUT"
echo "  $STACKED_OUTPUT"
echo "  $STACKED_BLUE_OUTPUT"
