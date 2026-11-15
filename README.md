# Rishabh Arora — Space Portfolio v8.7

## Mobile visual-quality pass
- Replaces the lightweight mobile starfield with a local, resolution-independent SVG background.
- Replaces the CSS-gradient Earth with a local vector Earth illustration.
- Removes `background-attachment: fixed` from the mobile fallback path to avoid mobile-browser repaint tearing.
- Removes mobile blur from the case-study backdrop.
- Optional mobile 3D mode now renders at a minimum of 1.0 device-pixel ratio, with antialiasing enabled and slightly smoother planet geometry.
- Desktop scene, layout and interaction remain unchanged.

## Build and deploy
Requires Node.js 22.12 or later.

```bash
npm install
npm run build
```

Deploy the generated `dist` directory through Vercel.

## Git commands
```bash
git add .
git commit -m "Improve mobile visual sharpness and rendering quality"
git push origin main
```
