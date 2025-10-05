# Build Guide for VerifyApi

Quick reference for building and packaging VerifyApi across platforms.

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
npm run package:win      # Windows (NSIS, Portable, ZIP)
npm run package:mac      # macOS (DMG, ZIP with Universal binary)
npm run package:linux    # Linux (AppImage, DEB, RPM, TAR.GZ)

# Build for all platforms (requires proper setup)
npm run package:all
```

## GitHub Actions CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/build.yml`) that automatically builds VerifyApi for all three platforms:

- **Triggered on**: Push to main/develop, Pull Requests, Releases, or manually
- **Platforms**: Windows, macOS, Linux
- **Artifacts**: Automatically organized into platform-specific folders in `release/`
- **Output structure**:
  ```
  release/
  ├── windows/
  │   ├── VerifyApi Setup 1.0.0.exe      # NSIS installer (x64)
  │   ├── VerifyApi Setup 1.0.0-ia32.exe # NSIS installer (32-bit)
  │   ├── VerifyApi 1.0.0.exe            # Portable executable
  │   └── VerifyApi-1.0.0-win.zip        # Windows ZIP
  ├── mac/
  │   ├── VerifyApi-1.0.0-universal.dmg  # Universal DMG (Intel + Apple Silicon)
  │   └── VerifyApi-1.0.0-mac.zip        # macOS ZIP
  └── linux/
      ├── VerifyApi-1.0.0.AppImage       # Linux AppImage (universal)
      ├── verifyapi_1.0.0_amd64.deb      # Debian/Ubuntu package
      ├── verifyapi-1.0.0.x86_64.rpm     # Red Hat/Fedora package
      └── verifyapi-1.0.0.tar.gz         # Generic TAR.GZ
  ```

### Using Artifacts

After a successful workflow run:
1. Go to the Actions tab in GitHub
2. Click on the latest workflow run
3. Download artifacts for your platform from the Artifacts section
4. On release, installers are automatically attached to the GitHub release

## Successful Package Types Tested

### Linux (Confirmed Working)
- ✅ **TAR.GZ** - `verifyapi-1.0.0.tar.gz` (~107MB)
- ✅ **AppImage** - `VerifyApi-1.0.0.AppImage` (~113MB)
- ✅ **DEB Package** - `verifyapi_1.0.0_amd64.deb` (~77MB)
- ✅ **RPM Package** - `verifyapi-1.0.0.x86_64.rpm` (~77MB)

### Windows (Fully Supported)
- ✅ **NSIS Installer** - `VerifyApi Setup 1.0.0.exe` (x64 and ia32)
- ✅ **Portable Executable** - `VerifyApi 1.0.0.exe` (x64)
- ✅ **ZIP Archive** - `VerifyApi-1.0.0-win.zip` (x64)

### macOS (Fully Supported)
- ✅ **DMG Disk Image** - `VerifyApi-1.0.0-universal.dmg` (Universal: Intel + Apple Silicon)
- ✅ **ZIP Archive** - `VerifyApi-1.0.0-mac.zip` (Universal)

## Package Outputs

All packages are created in the `release/` directory, organized by platform:

```
release/
├── windows/
│   ├── VerifyApi Setup 1.0.0.exe      # NSIS installer (x64)
│   ├── VerifyApi Setup 1.0.0-ia32.exe # NSIS installer (32-bit)
│   ├── VerifyApi 1.0.0.exe            # Portable executable
│   └── VerifyApi-1.0.0-win.zip        # Windows ZIP
├── mac/
│   ├── VerifyApi-1.0.0-universal.dmg  # Universal DMG (Intel + Apple Silicon)
│   └── VerifyApi-1.0.0-mac.zip        # macOS ZIP
├── linux/
│   ├── VerifyApi-1.0.0.AppImage       # Linux AppImage (universal)
│   ├── verifyapi_1.0.0_amd64.deb      # Debian/Ubuntu package
│   ├── verifyapi-1.0.0.x86_64.rpm     # Red Hat/Fedora package
│   ├── verifyapi-1.0.0.tar.gz         # Generic TAR.GZ
│   └── linux-unpacked/                # Unpacked Linux build
└── latest-*.yml                        # Auto-updater metadata files
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
4. **GitHub Actions is ready** - The CI/CD workflow automatically builds all platforms
5. **Package repository setup** - Configure APT/YUM repositories for Linux

For detailed configuration and platform-specific setup, see `docs/INSTALLERS.md`.