#!/usr/bin/env bash
# scripts/convert_images.sh
# Usage: place original images in assets/images/original/ then run this script.

set -euo pipefail
mkdir -p assets/images/products
mkdir -p assets/images/brand

echo "Converting images to WebP variants..."
for file in assets/images/original/*.{jpg,jpeg,png}; do
  [ -e "$file" ] || continue
  filename=$(basename -- "$file")
  name="${filename%.*}"
  # 400, 800, 1200 widths
  cwebp -q 80 "$file" -resize 400 0 -o "assets/images/products/${name}-400.webp" || true
  cwebp -q 80 "$file" -resize 800 0 -o "assets/images/products/${name}-800.webp" || true
  cwebp -q 80 "$file" -resize 1200 0 -o "assets/images/products/${name}-1200.webp" || true
done

echo "Done. Optimized images are in assets/images/products/"
