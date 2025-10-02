# Icon Assets for VerifyApi

This directory contains icon assets for different platforms:

## Files Generated
- `icon.ico` - Windows icon (multi-resolution)
- `icon.icns` - macOS icon (multi-resolution) 
- `icon.png` - Linux/general purpose PNG icon
- `icon.svg` - Source SVG icon

## Manual Icon Generation Required

To create proper platform-specific icons, use the following tools:

### Windows (.ico)
Use tools like:
- ImageMagick: `convert icon.svg -define icon:auto-resize=256,128,64,48,32,16 icon.ico`
- Online converters: convertio.co, icoconvert.com

### macOS (.icns)  
Use tools like:
- `iconutil` (macOS): Create iconset folder with proper sizes, then `iconutil -c icns icon.iconset`
- `png2icns`: `png2icns icon.icns icon-*.png`

### Linux (.png)
Use ImageMagick or similar:
- `convert icon.svg -resize 512x512 icon.png`

## Icon Requirements
- **Windows**: 256x256 recommended, supports multiple sizes in .ico
- **macOS**: 1024x1024 recommended for Retina displays
- **Linux**: 512x512 recommended for high-DPI displays

Replace the placeholder files with proper icons before building installers.
