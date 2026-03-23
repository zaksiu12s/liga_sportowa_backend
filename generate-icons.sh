#!/bin/bash

# PWA Icon Generator using ImageMagick
# This script generates all required PWA icons from a source image

SOURCE_IMAGE="${1:-logo.png}"
OUTPUT_DIR="public"

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image not found: $SOURCE_IMAGE"
    echo "Usage: ./generate-icons.sh <source-image.png>"
    exit 1
fi

echo "Generating PWA icons from: $SOURCE_IMAGE"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed"
    echo "Install it with: sudo apt install imagemagick"
    exit 1
fi

# Create icons
echo "Creating icon files..."

# Standard icons
echo "  → icon-96x96.png"
convert "$SOURCE_IMAGE" -resize 96x96 -background white -gravity center -extent 96x96 "$OUTPUT_DIR/icon-96x96.png"

echo "  → icon-192x192.png"
convert "$SOURCE_IMAGE" -resize 192x192 -background white -gravity center -extent 192x192 "$OUTPUT_DIR/icon-192x192.png"

echo "  → icon-512x512.png"
convert "$SOURCE_IMAGE" -resize 512x512 -background white -gravity center -extent 512x512 "$OUTPUT_DIR/icon-512x512.png"

echo "  → apple-touch-icon.png"
convert "$SOURCE_IMAGE" -resize 180x180 -background white -gravity center -extent 180x180 "$OUTPUT_DIR/apple-touch-icon.png"

# Maskable icons (adaptive icons with padding)
echo "  → icon-192x192-maskable.png"
convert "$SOURCE_IMAGE" -resize 163x163 -background transparent -gravity center -extent 192x192 "$OUTPUT_DIR/icon-192x192-maskable.png"

echo "  → icon-512x512-maskable.png"
convert "$SOURCE_IMAGE" -resize 435x435 -background transparent -gravity center -extent 512x512 "$OUTPUT_DIR/icon-512x512-maskable.png"

echo ""
echo "✅ All icons generated successfully!"
echo ""
echo "Files created:"
ls -lh "$OUTPUT_DIR"/icon-*.png "$OUTPUT_DIR"/apple-touch-icon.png 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo "Next steps:"
echo "1. Build the app: npm run build"
echo "2. Test locally: npm run preview"
echo "3. Check PWA installability in Chrome DevTools"
