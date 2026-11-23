# Junction Quest

An original route-connection puzzle game prototype. This repository is independent from the other game projects.

## Current prototype
- Interactive Three.js 3D board rendered with WebGL.
- Touch-friendly track tiles with rotation and tap feedback.
- Deterministic campaign generator for 5,000 levels across 50 named worlds.
- Board size scales as the campaign progresses; boss encounters appear every 100 levels.
- Coins, hint spending, level progression, and local save data.
- Automated tests covering all 5,000 generated levels.

## Run locally
Requires Node.js 20 or newer.

```sh
npm install
npm test
npm run dev
```

## Build web bundle
```sh
npm run build
```

## Android debug APK
The workflow `.github/workflows/android-apk.yml` can build a debug APK on demand. Open **Actions → Android debug APK → Run workflow** in GitHub. The resulting APK is uploaded as the `junction-quest-debug-apk` artifact.

## Status
This is an in-development prototype, not a store-ready release. Audio, accessibility, more varied level mechanics, device testing, and production QA remain to be completed. The Android workflow produces a debug APK, not a Play Store release.
