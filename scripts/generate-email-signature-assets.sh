#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/public/assets/email"
LOGO_SOURCE="$ROOT_DIR/public/images/branding/hay-hay-design-logo-inline.png"
TMP_DIR="$(mktemp -d)"

trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUTPUT_DIR"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick ('magick') is required to generate email signature assets." >&2
  exit 1
fi

if [[ ! -f "$LOGO_SOURCE" ]]; then
  echo "Missing logo source at $LOGO_SOURCE" >&2
  exit 1
fi

magick \
  -size 720x192 \
  xc:none \
  -fill '#333333' \
  -font Arial \
  -pointsize 76 \
  -gravity northwest \
  -annotate +0+20 'Haley Dillon' \
  -fill '#555555' \
  -font Arial \
  -pointsize 40 \
  -annotate +4+116 'Founder' \
  -trim \
  -bordercolor none \
  -border 4x4 \
  "PNG32:$OUTPUT_DIR/email-name-haley-dillon.png"

magick \
  "$LOGO_SOURCE" \
  -resize 300x \
  -strip \
  "PNG32:$OUTPUT_DIR/logo-hay-hay-design.png"

magick \
  -size 28x28 \
  xc:none \
  -fill none \
  -stroke '#2007ea' \
  -strokewidth 2 \
  -draw 'roundrectangle 4,7 24,21 2,2' \
  -draw 'line 5,8 14,15' \
  -draw 'line 23,8 14,15' \
  -draw 'line 5,20 12,14' \
  -draw 'line 23,20 16,14' \
  -strip \
  "PNG32:$OUTPUT_DIR/icon-email.png"

magick \
  -size 28x28 \
  xc:none \
  -fill none \
  -stroke '#2007ea' \
  -strokewidth 2 \
  -draw 'circle 14,14 14,4' \
  -draw 'line 4,14 24,14' \
  -draw 'bezier 14,4 20,10 20,18 14,24' \
  -draw 'bezier 14,4 8,10 8,18 14,24' \
  -strip \
  "PNG32:$OUTPUT_DIR/icon-web.png"

magick \
  -size 28x28 \
  xc:none \
  -fill none \
  -stroke '#2007ea' \
  -strokewidth 2 \
  -draw 'path "M 8 4 L 11 9 L 9 11 C 11 15 13 17 17 19 L 19 17 L 24 20 C 25 21 25 22 24 23 C 23 25 21 25 20 25 C 11 25 3 17 3 8 C 3 7 3 5 5 4 C 6 3 7 3 8 4 Z"' \
  -strip \
  "PNG32:$OUTPUT_DIR/icon-phone.png"

echo "Generated:"
echo "  $OUTPUT_DIR/email-name-haley-dillon.png"
echo "  $OUTPUT_DIR/logo-hay-hay-design.png"
echo "  $OUTPUT_DIR/icon-email.png"
echo "  $OUTPUT_DIR/icon-web.png"
echo "  $OUTPUT_DIR/icon-phone.png"
