# Rishabh Arora — Space Portfolio v8.4

## What changed
- First content is no longer blocked by a full-screen loading overlay. The hero HTML and CSS render immediately, with a lightweight CSS starfield behind it.
- The Three.js experience starts after the browser has had a chance to paint the first screen.
- Three.js is now a local npm dependency and is bundled into hashed, minified production assets by Vite. No third-party CDN import is needed for the 3D engine.
- App/case-study scripts are bundled for deployment; source maps are disabled.
- Real planet surface maps are requested only as the camera approaches each planet. Procedural planet surfaces render immediately as placeholders.
- A 6.5-second safety timeout switches to the lightweight readable layout if the 3D engine has not initialized.
- No fullscreen loader is used.
- The existing portfolio, 1 / 100 / 10K / 1M Bonus Promotions architecture case study, contact actions, resume, journey navigation and styling remain.

## Build / deploy
Vercel is configured in `vercel.json` to run `npm run build` and publish `dist/`.

Requirements: Node.js 22.12+ and npm.

Local build:

```bash
npm install
npm run build
npm run preview
```

On GitHub push, Vercel will install `three` and Vite, bundle and minify the browser code, then deploy only the `dist/` output. Production source maps are disabled. The browser will still receive executable JavaScript bundles; client-side code cannot be made completely secret. The original source files remain in the repository, so keep the repository private if you do not want other GitHub users to read them.

## Technical notes
- Vite 8.3.8 builds the static site; Three.js 0.160.0 is bundled locally.
- Vite minifies production JavaScript/CSS and emits hashed assets; source maps are disabled.
- Hashed `/assets/*` files receive immutable one-year cache headers.
- Planet maps still use the existing Vercel rewrite to Solar System Scope, but are loaded progressively near each planet instead of all at startup.
- The first content paint is independent of WebGL startup. A sub-second first visual is the target on a normal connection/device; no website can guarantee a strict one-second full 3D load for every network/device.

## Deploy commands
```bash
git status
git add .
git commit -m "Optimize first paint and bundle portfolio assets"
git push origin main
```
