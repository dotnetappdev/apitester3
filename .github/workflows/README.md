# GitHub Actions Workflows

This directory contains the CI/CD workflows for VerifyApi.

## build.yml

Comprehensive multi-platform build workflow that builds VerifyApi for Windows, macOS, and Linux.

### Features

- **Multi-platform builds**: Builds on Windows, macOS, and Linux runners in parallel
- **Multiple installer formats**:
  - **Windows**: NSIS installer (x64, ia32), Portable executable, ZIP archive
  - **macOS**: Universal DMG (Intel + Apple Silicon), ZIP archive
  - **Linux**: AppImage, DEB, RPM, TAR.GZ
- **Organized artifacts**: Automatically organizes build outputs into platform-specific folders
- **GitHub Releases integration**: Automatically attaches installers to GitHub releases
- **Build summaries**: Provides detailed summaries of artifacts in the Actions tab

### Triggers

The workflow runs on:

- **Push** to `main` or `develop` branches
- **Pull Requests** to `main` or `develop` branches
- **Releases** (published)
- **Manual dispatch** (via GitHub Actions UI)

### Artifacts

After a successful workflow run, artifacts are available for download:

1. Go to the **Actions** tab in GitHub
2. Click on the workflow run
3. Scroll to the **Artifacts** section at the bottom
4. Download the artifact for your platform:
   - `windows-artifacts` - Windows installers and executables
   - `mac-artifacts` - macOS DMG and ZIP files
   - `linux-artifacts` - Linux AppImage, DEB, RPM, and TAR.GZ files

### Artifact Contents

#### windows-artifacts
```
VerifyApi Setup 1.0.0.exe           # NSIS installer (64-bit)
VerifyApi Setup 1.0.0-ia32.exe      # NSIS installer (32-bit)
VerifyApi 1.0.0.exe                 # Portable executable (64-bit)
VerifyApi-1.0.0-win.zip             # ZIP archive (64-bit)
```

#### mac-artifacts
```
VerifyApi-1.0.0-universal.dmg       # Universal DMG (Intel + Apple Silicon)
VerifyApi-1.0.0-mac.zip             # Universal ZIP archive
```

#### linux-artifacts
```
VerifyApi-1.0.0.AppImage            # Universal Linux binary
verifyapi_1.0.0_amd64.deb           # Debian/Ubuntu package
verifyapi-1.0.0.x86_64.rpm          # Red Hat/Fedora package
verifyapi-1.0.0.tar.gz              # Generic TAR.GZ archive
```

### GitHub Releases

When a release is published on GitHub, the workflow automatically:

1. Builds installers for all three platforms
2. Attaches the installers to the GitHub release
3. Makes them available for download on the release page

### Manual Workflow Dispatch

To manually trigger the workflow:

1. Go to the **Actions** tab
2. Select the **Build VerifyApi** workflow
3. Click **Run workflow**
4. Select the branch to build from
5. Click **Run workflow** button

### Build Time

Typical build times:
- **Windows**: ~5-10 minutes
- **macOS**: ~8-15 minutes (Universal binary takes longer)
- **Linux**: ~5-10 minutes

Total parallel execution: ~10-15 minutes for all platforms

### Requirements

The workflow requires:
- Node.js 18+ (automatically installed)
- Platform-specific build tools (automatically available on GitHub runners)
- No additional secrets or configuration needed for basic builds

### Code Signing

For production releases, you may want to add code signing:

- **Windows**: Add `CSC_LINK` and `CSC_KEY_PASSWORD` secrets for code signing certificate
- **macOS**: Add `APPLE_ID`, `APPLE_ID_PASSWORD`, and certificates for notarization
- **Linux**: No code signing typically required

See [electron-builder documentation](https://www.electron.build/code-signing) for details.

### Troubleshooting

If builds fail:

1. Check the workflow logs in the Actions tab
2. Look for platform-specific build errors
3. Verify that all dependencies are correctly specified in `package.json`
4. Ensure native dependencies (like sqlite3) are properly configured

### Local Testing

To test the build locally before pushing:

```bash
# Install dependencies
npm ci

# Build and package for your platform
npm run package

# Or build for a specific platform
npm run package:win
npm run package:mac
npm run package:linux
```

### Related Documentation

- [docs/BUILD.md](../../docs/BUILD.md) - Detailed build instructions
- [docs/INSTALLERS.md](../../docs/INSTALLERS.md) - Installer configuration details
- [README.md](../../README.md) - Main project documentation
