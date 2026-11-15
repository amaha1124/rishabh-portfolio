# Rishabh Arora — Space Portfolio (v6)

A continuous Three.js space-exploration portfolio. This is a static site; no build step is required.

## Files
- `index.html` — portfolio content and UI
- `style.css` — responsive styling
- `app.js` — Three.js scene and global flight controls
- `assets/ambient.mp3` — original ambient soundtrack
- `resume.pdf` — downloadable resume

## Controls
- `W / A / S / D`: fly forward, left, backward and right
- `Q / E`: descend / ascend
- Arrow keys: forward / backward cruise impulse
- Mouse drag: look around
- Mouse wheel / trackpad: continuous forward/backward and lateral travel
- HUD dots: accelerate toward a landmark (no page snap)
- `PLAY SOUND`: start/pause the ambient soundtrack (requires a click due to browser autoplay policy)

## Run locally
Serve this folder over HTTP (ES modules and module imports should be tested from a local server, not `file://`). For example:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000.

## Deploy to Vercel
Import the GitHub repository as a static project. Framework preset: Other; Build Command: empty; Output Directory: `.`. Keep all files, including `assets/ambient.mp3` and `resume.pdf`, at the project root / listed paths.

## Notes
- The resume download points to `resume.pdf` in the site root.
- Music is intentionally not autoplayed. Visitors start it with the sound control.
- Three.js is loaded from jsDelivr, so the site needs internet access.

## Responsive release (v6.1)
- Responsive layouts for desktop, laptop, tablet, portrait mobile, and landscape mobile.
- Mobile content panels can scroll internally without scrolling the document.
- Touch swipes outside content panels control flight; horizontal swipes strafe.
- Reduced WebGL pixel ratio, star count, antialiasing, and shadow cost on smaller devices.
- Desktop keyboard, mouse, wheel, and trackpad navigation remain available.


Mobile interaction update: mobile directional pads are removed. Swipe vertically on the scene to fly forward/backward and horizontally to strafe. Text panels retain native vertical scrolling when their content overflows. Mobile scene shortcut buttons are hidden.
