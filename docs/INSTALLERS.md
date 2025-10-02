# Installer Setup for VeriAPI

This document describes how to build and distribute installers for VeriAPI across Windows, macOS, and Linux platforms.

## Overview

VeriAPI uses **electron-builder** as the primary packaging tool with platform-specific enhancements:

- **Windows**: NSIS installer + Inno Setup script + Portable executable + ZIP archive
- **macOS**: DMG disk image + ZIP archive (with universal binaries for Intel/Apple Silicon)
- **Linux**: AppImage + DEB package + RPM package + Snap package + TAR.GZ archive

## Quick Start

```bash
# Install dependencies
npm install

# Generate icon placeholders (replace with actual icons)
npm run generate-icons

# Build installers for current platform
npm run installer:prepare
npm run package

# Build for specific platforms
npm run installer:win     # Windows installers
npm run installer:mac     # macOS installers
npm run installer:linux   # Linux installers
npm run installer:all     # All platforms (requires proper setup)
```

## Platform-Specific Setup

### Windows Installers

#### APPX/MSIX Package (Primary - Windows Store)
- **Built by**: electron-builder with APPX target (generates MSIX packages)
- **Output**: `VeriAPI-{version}.appx` (MSIX format)
- **Architecture**: Both x64 and x86 (32-bit) support
- **Features**: 
  - Windows Store distribution ready
  - Modern MSIX packaging format
  - Automatic updates through Microsoft Store
  - Sandboxed execution for security
  - Digital signature validation
  - Universal Windows Platform (UWP) integration

### macOS Installers

#### DMG Disk Image (Primary)
- **Output**: `VeriAPI-{version}.dmg`
- **Features**:
  - Custom background image
  - Drag-to-Applications layout
  - Universal binary (Intel + Apple Silicon)
  - Code signing ready

#### Requirements
- **Development**: macOS 10.15+ with Xcode Command Line Tools
- **Signing**: Apple Developer account for distribution
- **Notarization**: Required for distribution outside Mac App Store

### Linux Installers

#### AppImage (Universal)
- **Output**: `VeriAPI-{version}.AppImage`
- **Features**: 
  - Runs on any Linux distribution
  - No installation required
  - Desktop integration

#### DEB Package (Debian/Ubuntu)
- **Output**: `api-tester-3_{version}_amd64.deb`
- **Installation**: `sudo dpkg -i api-tester-3_{version}_amd64.deb`
- **Features**: APT repository integration ready

#### RPM Package (Red Hat/CentOS/Fedora)
- **Output**: `api-tester-3-{version}.x86_64.rpm`
- **Installation**: `sudo rpm -i api-tester-3-{version}.x86_64.rpm`
- **Features**: YUM/DNF repository integration ready

#### Snap Package
- **Output**: `api-tester-3_{version}_amd64.snap`
- **Installation**: `sudo snap install api-tester-3_{version}_amd64.snap --dangerous`
- **Features**: Sandboxed execution, auto-updates

## Configuration Files

### Electron Builder (`package.json`)
Main configuration for all platforms:
- Application metadata
- File inclusion/exclusion rules
- Platform-specific targets
- Signing and notarization settings

### Platform-Specific Files

#### Windows
- `build/installer.iss` - Inno Setup script
- `build/installer.nsh` - NSIS additional configuration

#### macOS
- `build/entitlements.mac.plist` - Security entitlements
- `assets/dmg-background.png` - DMG background image

#### Linux
- `build/linux-post-install.sh` - Post-installation script

## Icon Assets

### Required Icon Files
- `assets/icon.ico` - Windows (multi-size)
- `assets/icon.icns` - macOS (multi-size)
- `assets/icon.png` - Linux (512x512 recommended)
- `assets/icon.svg` - Source vector icon

### Icon Generation
Use the provided script to generate icon placeholders:
```bash
npm run generate-icons
```

For production, replace placeholders with proper icons using:
- **ImageMagick**: `convert icon.svg -resize 512x512 icon.png`
- **Windows ICO**: `convert icon.svg -define icon:auto-resize=256,128,64,48,32,16 icon.ico`
- **macOS ICNS**: Use `iconutil` or `png2icns`

## Build Requirements

### Development Dependencies
- Node.js 18+
- npm 9+
- electron-builder (included in devDependencies)

### Platform-Specific Tools

#### Windows
- **APPX/MSIX Packaging Tools**: Included with electron-builder
- **Windows 10 SDK**: Required for APPX/MSIX packaging (automatically handled)
- **Code Signing**: Optional, requires certificate

#### macOS
- **Xcode Command Line Tools**: `xcode-select --install`
- **Apple Developer Account**: For signing and notarization
- **macOS 10.15+**: For building universal binaries

#### Linux
- **Build tools**: `build-essential` (Ubuntu/Debian) or equivalent
- **System libraries**: As specified in DEB/RPM dependencies
- **Docker**: Optional, for cross-platform building

## Continuous Integration

### GitHub Actions Example
```yaml
name: Build Installers
on:
  release:
    types: [published]

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    runs-on: \${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      - run: npm run package
      
      - uses: actions/upload-artifact@v3
        with:
          name: installers-\${{ runner.os }}
          path: release/
```

## Distribution

### GitHub Releases
Upload installer files to GitHub Releases:
- Windows: `.exe`, `.zip`, portable `.exe`
- macOS: `.dmg`, `.zip`
- Linux: `.AppImage`, `.deb`, `.rpm`, `.snap`, `.tar.gz`

### Package Repositories

#### Linux Repositories
- **DEB**: Upload to APT repository or use GitHub Package Registry
- **RPM**: Upload to YUM/DNF repository
- **Snap**: Publish to Snap Store
- **AppImage**: List on AppImageHub

#### Windows Package Managers
- **Chocolatey**: Create package manifest
- **Winget**: Submit to winget-pkgs repository
- **Scoop**: Create bucket or submit to main bucket

#### macOS Package Managers
- **Homebrew**: Create cask formula
- **MacPorts**: Create port file

## Troubleshooting

### Common Issues

#### Icon Files Missing
```
Error: Cannot find icon file assets/icon.ico
```
**Solution**: Run `npm run generate-icons` and replace placeholders with actual icons

#### Code Signing (macOS)
```
Error: App is not signed
```
**Solution**: Add signing configuration or disable with `CSC_IDENTITY_AUTO_DISCOVERY=false`

#### Linux Dependencies
```
Error: Package dependencies not satisfied
```
**Solution**: Install required system libraries listed in `build.linux.deb.depends`

### Debug Mode
Enable electron-builder debug output:
```bash
DEBUG=electron-builder npm run package
```

## Security Considerations

### Code Signing
- **Windows**: Authenticode certificate required for SmartScreen bypass
- **macOS**: Apple Developer certificate required, notarization recommended
- **Linux**: GPG signing for repository packages

### Permissions
- Request minimal permissions in installers
- Document network access requirements
- Use sandboxing where possible (Snap, Mac App Store)

## Maintenance

### Version Updates
1. Update version in `package.json`
2. Update installer scripts if needed
3. Test on all target platforms
4. Update documentation

### Icon Updates
1. Update source SVG in `assets/icon.svg`
2. Regenerate platform-specific icons
3. Test installer appearance

### Build Configuration Updates
1. Test changes on all platforms
2. Update CI/CD pipelines
3. Document breaking changes

## Support

For installer-related issues:
1. Check this documentation
2. Review electron-builder documentation
3. Test on target platforms
4. File issues with detailed error logs

---

**Happy Packaging!** 🚀