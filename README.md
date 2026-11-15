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


## v8.8 mobile visual fix
- Replaces the mobile SVG background image with lightweight CSS-rendered star points to avoid background-image scaling/compositing artifacts.
- Uses a high-resolution 1440x1440 lossless WebP Earth image via a normal `<img>` element instead of an SVG CSS background.
- Updates the homepage role headline to “Senior Software Engineer.”
- Updates the About section intro to use the same role wording; employer timeline continues to show the supplied SDE II designation.


## v8.8 mobile visual fix
- Replaces the mobile SVG background image with CSS-rendered star points to avoid SVG background scaling/compositing artifacts on mobile browsers.
- Replaces the mobile planet CSS background with a normal `<img>` element backed by a 960x960 lossless WebP asset.
- Preloads the mobile planet image at high priority.
- Removes the previous v8.7 mobile SVG image assets and references.
- Updates the homepage headline and About introduction to “Senior Software Engineer”; the employment timeline retains the SDE II designation as the role recorded for that period.
