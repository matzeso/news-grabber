# Release Instructions

## Automated Release (Recommended)

Releases are automated via GitHub Actions. Simply create and push a new tag:

```bash
# Update version in package.json first
npm version patch  # or minor, or major

# Push the tag
git push origin main --tags
```

GitHub Actions will automatically:
1. Build executables for all platforms
2. Create a GitHub release
3. Upload all binaries

## Manual Release (if needed)

If you prefer to build and release manually:

```bash
# 1. Build executables
npm run build:exe

# 2. Find executables in build/ directory:
# - build/news-grabber-macos-x64
# - build/news-grabber-macos-arm64
# - build/news-grabber-linux-x64
# - build/news-grabber-win-x64.exe

# 3. Create GitHub release manually and upload these files
```

## Testing Before Release

```bash
# Test development version
npm start

# Build and test executable
npm run build:exe
./build/news-grabber-macos-arm64  # or appropriate for your system
```

## Version Numbering

Follow semantic versioning (semver):
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes
