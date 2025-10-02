# Build Guide for VeriAPI

Quick reference for building and packaging VeriAPI across platforms.

## Prerequisites

- Node.js 18+
- npm 9+
- Platform-specific tools (see INSTALLERS.md for details)

## Quick Build Commands

```bash
# Install dependencies and rebuild native modules
npm install

# Build for development
npm run build

# Package for current platform
npm run package

# Build specific platform installers
npm run package:win      # Windows (APPX/MSIX for Windows Store)
npm run package:mac      # macOS (DMG, ZIP)
npm run package:linux    # Linux (AppImage, DEB, RPM, TAR.GZ)

# Build for all platforms (requires proper setup)
npm run package:all
```

## Successful Package Types Tested

### Linux (Confirmed Working)
- ✅ **TAR.GZ** - `apitester3-1.0.0.tar.gz` (~107MB)
- ✅ **AppImage** - `VeriAPI-1.0.0.AppImage` (~113MB)
- ✅ **DEB Package** - `apitester3_1.0.0_amd64.deb` (~77MB)

### Windows (Configuration Ready)
- 🔧 **APPX/MSIX Package** - `.appx` for Windows Store (x64 and x86/32-bit support)

### macOS (Configuration Ready)
- 🔧 **DMG Disk Image** - Standard macOS installer
- 🔧 **ZIP Archive** - Compressed .app bundle

## Package Outputs

All packages are created in the `release/` directory:

```
release/
├── VeriAPI-1.0.0.AppImage          # Linux AppImage (universal)
├── apitester3-1.0.0.tar.gz              # Linux TAR.GZ
├── apitester3_1.0.0_amd64.deb           # Linux DEB package
├── linux-unpacked/                      # Unpacked Linux build
└── latest-linux.yml                     # Auto-updater metadata
```

## Icon Requirements

The current setup uses placeholder icons. For production builds:

1. Replace `assets/icon.png` with a proper 512x512 PNG icon
2. For Windows: Create `assets/icon.ico` (multi-size)
3. For macOS: Create `assets/icon.icns` (multi-size)

See `assets/README.md` for icon generation instructions.

## Build Configuration

The build is configured in `package.json` under the `"build"` section with:

- **Cross-platform targets** for Windows, macOS, and Linux
- **Native module handling** with automatic dependency rebuilding
- **Icon and asset management** 
- **Platform-specific metadata** and signing configurations

## Native Dependencies

The project uses SQLite3 which requires native compilation. This is handled automatically by:

1. `postinstall` script runs `electron-builder install-app-deps`
2. Native modules are rebuilt for the Electron runtime
3. electron-builder skips rebuilding during packaging (`npmRebuild: false`)

## Troubleshooting

### Common Issues

**Native module build errors:**
```bash
# Manually rebuild native modules
./node_modules/.bin/electron-rebuild
```

**Icon format errors:**
```bash
# Ensure proper PNG icon exists
file assets/icon.png
# Should show: PNG image data
```

**Missing author email (for DEB packages):**
- Already configured in package.json with proper maintainer info

### Debug Mode

Enable verbose logging:
```bash
DEBUG=electron-builder npm run package
```

## Next Steps

1. **Test on target platforms** - Verify packages work on intended systems
2. **Replace placeholder icons** - Add proper application icons
3. **Code signing setup** - Configure certificates for Windows/macOS
4. **CI/CD integration** - Automate builds with GitHub Actions
5. **Package repository setup** - Configure APT/YUM repositories for Linux

For detailed configuration and platform-specific setup, see `docs/INSTALLERS.md`.