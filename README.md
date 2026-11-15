# Rishabh Arora — Space Portfolio v8.5

## What changed
- Added a mobile-first performance profile: mobile/touch devices render at a capped 30 FPS, use a reduced pixel ratio, lower polygon counts, fewer stars and asteroids, smaller procedural fallback textures, and lower texture anisotropy.
- Removed the extra point light and CPU-driven star colour animation on mobile; the cinematic desktop lighting and animation profile remains intact.
- Removed costly grain and backdrop blur compositing on touch/mobile screens.
- The first visible planet (Earth) texture request now starts immediately as the scene is created, and an HTML image preload starts fetching it before the JavaScript scene initialization completes. Other planet maps remain proximity-loaded.
- Reduced per-frame DOM work by caching navigation/progress elements and only updating the progress bar when its value changes meaningfully.
- First content is no longer blocked by a full-screen loading overlay. The hero HTML and CSS render immediately, with a lightweight CSS starfield behind it.
- The Three.js experience starts after the browser has had a chance to paint the first screen.
- Three.js is now a local npm dependency and is bundled into hashed, minified production assets by Vite. No third-party CDN import is needed for the 3D engine.
- App/case-study scripts are bundled for deployment; source maps are disabled.
- Earth is requested immediately and preloaded from the document head; the other real planet maps remain proximity-loaded. Procedural surfaces are available immediately as fallbacks.
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
- Mobile/touch profile is intended to reduce GPU fill cost, WebGL work per frame and main-thread animation work; desktop scene settings are preserved.
- The first Earth map is preloaded from `/planet-textures/2k_earth_daymap.jpg`; the procedural Earth map remains visible until the real map is decoded and uploaded.
- Vite 8.3.8 builds the static site; Three.js 0.160.0 is bundled locally.
- Vite minifies production JavaScript/CSS and emits hashed assets; source maps are disabled.
- Hashed `/assets/*` files receive immutable one-year cache headers.
- Planet maps still use the existing Vercel rewrite to Solar System Scope, but are loaded progressively near each planet instead of all at startup.
- The first content paint is independent of WebGL startup. A sub-second first visual is the target on a normal connection/device; no website can guarantee a strict one-second full 3D load for every network/device.

## Deploy commands
```bash
git status
git add .
git commit -m "Improve mobile rendering performance and eagerly preload first planet"
git push origin main
```
