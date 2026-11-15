# Rishabh Arora — Space Journey Portfolio (3D prototype)

A cinematic, scroll-driven portfolio built as a static site using Three.js. The wheel/swipe input moves between six scenes; the camera travels through a 3D starfield to different planets while the story content changes. Desktop visitors can use WASD/QE for free-flight movement, the mouse to look around, and left/right arrows to change sectors. An original low-volume ambient synth pad is available from the MUSIC control and starts only after the visitor clicks it.

## Files
- `index.html` — content and scene structure
- `style.css` — HUD, typography, responsive overlays
- `app.js` — Three.js scene, procedural planet textures, camera travel and navigation

## Before publishing
Edit `index.html` and replace:
- `YOUR_EMAIL@example.com`
- `YOUR_LINKEDIN`
- `YOUR_GITHUB`

Review all project descriptions for accuracy. The Bonus Promotions work is described at a high level; do not add confidential details. The AI Log Analyzer and CareerPilot should be updated to accurately reflect their current status.

## Run locally
Because `app.js` imports Three.js as an ES module, serve the folder over HTTP:
```bash
python3 -m http.server 8000
```
Open http://localhost:8000.

## Deploy to Vercel
1. Upload these files to a GitHub repository.
2. Import the repository in Vercel.
3. Framework preset: Other.
4. Build command: leave blank.
5. Output directory: `.` (or leave the default if Vercel detects the static files).
6. Deploy.
7. Attach `www.rishabh-arora.in` and `rishabh-arora.in` in Vercel Domains.

Three.js is loaded from jsDelivr at runtime, so the first visit requires internet access. No local build step is required.

## Notes
- This is an interactive visual prototype, not yet a final polished production site.
- Test on a mid-range mobile phone and desktop before public launch. WebGL performance varies by device.
- The scroll experience intentionally advances one scene per wheel/swipe gesture.
- The ambient soundtrack is synthesized in-browser with Web Audio; it is opt-in and starts only after the visitor clicks MUSIC. Planet motion is intentionally restrained to avoid a screensaver-like feel.
