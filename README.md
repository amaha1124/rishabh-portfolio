# Rishabh Arora — Space Portfolio v8.6

## Mobile-first reliability change
- Phones and small touch devices now open in a lightweight, vertically scrollable portfolio view by default. This keeps the content usable immediately without relying on WebGL.
- The initial mobile HTML/CSS includes a lightweight CSS-rendered Earth-like visual; no planet texture image is needed for the first screen.
- Three.js and the full six-planet WebGL scene are not downloaded or initialized on mobile until the visitor explicitly chooses **LAUNCH 3D FLIGHT**.
- The 1 / 100 / 10K / 1M Bonus Promotions case study, email copy interaction, audio control and resume link remain available in lightweight mode.
- Shared UI code was separated into `site-ui.js`; the case study remains a small independent module.
- Desktop behavior remains the full continuous 3D experience and loads the 3D modules after the first HTML/CSS paint.
- On a mobile 3D opt-in, a 9-second safety timeout restores the lightweight content if the WebGL experience cannot start.
- The CSS-only mobile mode also activates for WebGL fallback cases, preserving readable content and scroll access.

## Build and deploy
Vercel uses `npm run build` and publishes `dist/`. Node.js 22.12+ is required by the configured Vite version.

```bash
npm install
npm run build
npm run preview
```

The frontend uses Vite and Three.js. Production source maps are disabled and generated assets are minified. Browser JavaScript cannot be made fully secret; keep the GitHub repository private if the original source should not be public.

## Mobile behavior
Mobile's default view is intentionally lightweight and scroll-based to avoid startup GPU and WebGL failures on phones. The visitor can opt into the full 3D experience with the hero button. This is a deliberate reliability trade-off; desktop remains unchanged.

## Validation performed
- `node --check` passed for `boot.js`, `main.js`, `site-ui.js`, `case-study.js` and `app.js`.
- HTML IDs were checked for duplicates; required UI controls are present.
- The mobile bootstrap path was inspected to ensure it imports `site-ui.js` and `case-study.js` only; it does not request `main.js` or `app.js` until the visitor selects 3D mode.
- A full Vite production build and live Vercel/mobile-device verification were not possible in this environment because the package registry and live domain are not reachable here.

## Deploy commands
```bash
git status
git add .
git commit -m "Add lightweight mobile mode and defer 3D scene"
git push origin main
```
