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

## Touch steering correction (v6.4)
- Touch pointer events no longer enter the mouse-look rotation handler.
- One-finger scene swipes translate the camera through 3D space: upward along the current view direction, downward in reverse, and left/right by strafing.
- Vertical swipes starting inside scrollable content panels remain native panel scrolling.


## Desktop top-down view (v6.7)
- Press `T` to toggle a top-down camera angle; press `T` again to restore the previous view.
- Hold `Shift` while using the mouse wheel or trackpad scroll to smoothly tilt toward/away from the top-down view.
- Ordinary scrolling remains forward/backward flight. Mouse drag can also look around.
- This feature is desktop-only; mobile swipe navigation and mobile layout are unchanged.

## Planet surface imagery

The 3D planet spheres now use image-based equirectangular surface maps instead of generated canvas patterns. The spheres, lighting, camera, desktop top-view control, and slow axial rotation remain in place. If a texture host is unavailable, the app falls back to its generated surface so the scene can still render.

Planet surface textures: Solar System Scope, https://www.solarsystemscope.com/textures/ — licensed under Creative Commons Attribution 4.0 International (CC BY 4.0). The texture pack states that its maps are based on spacecraft imagery and elevation data; some gas-giant maps are representative rather than current photographs. Credit: Solar System Scope.

## v7.2 planetary rendering corrections

- Planetary texture URLs now use the verified `play.solarsystemscope.com` texture download host (the previous `cdn.solarsystemscope.com` host was the cause of the texture requests failing in this build).
- Each planet assembly now rotates independently around its own local axis using frame delta time. This rotates the surface, atmosphere and ring assembly together instead of rotating only the first sphere mesh.
- Procedural canvas maps remain assigned immediately and are retained if an image request fails or returns an invalid image.
- Solar System Scope planetary texture maps are distributed under CC BY 4.0. Source: https://www.solarsystemscope.com/textures/ .
