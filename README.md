# Rishabh Arora — Space Portfolio (v8.0)

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
- Previous / Next controls: smoothly travel to the adjacent chapter
- `Alt + Arrow Left/Right` (or `Alt + Arrow Up/Down`): previous / next chapter
- `Escape`: stop the guided tour or automatic chapter navigation
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
- Mobile panels remain visually uncluttered; one-finger swipes control flight and horizontal swipes strafe.
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

## v7.5 visual atmosphere pass

- Added locally generated, softly layered nebula clouds; no additional background image downloads are required.
- Added restrained additive atmospheric glow shells around the planets, with distinct hues for Earth, Mars, Neptune and the final portal.
- Added a sparse, low-poly asteroid field positioned outside the main flight corridor. It uses instanced rendering and a reduced count on small screens.
- Added gradual warm-to-cool lighting changes as the camera travels deeper into the experience.
- Added a subtle breathing glow to the final portal near the contact destination.
- Kept the existing top progress bar, guided journey, Return to Top control, planet texture loading and responsive flight controls unchanged.


## v8.0 functional, navigation and accessibility release

- Added a one-click **Copy Email** action with accessible success/failure feedback and a fallback for browsers without Clipboard API support.
- The top progress bar now follows camera position continuously between all six chapter anchors; its progress value is exposed to assistive technology.
- Previous/Next chapter controls now guide the camera to the adjacent chapter anchor instead of applying a fixed movement impulse. `Alt + Arrow` keys provide the same chapter navigation; `Escape` stops the guided tour or an automatic chapter move.
- Clicking the RA brand smoothly returns to the opening chapter.
- Added a first-frame loading screen and a simplified readable page fallback if the Three.js module or WebGL initialization fails.
- Rendering pauses while the browser tab is hidden. Decorative star twinkle, planet spin, asteroid rotation and portal pulsing respect `prefers-reduced-motion`.
- Added stronger keyboard focus indicators, semantic progress and status announcements, button labels/pressed states, and a skip-to-contact link.
- Graphics pixel ratio and shadow usage are reduced on smaller or lower-power devices. The 3D scene remains dependent on browser WebGL support and an internet connection for the Three.js module and remote planet textures.
- No employer project repository links were added; personal repository links can be added when those URLs are available.

## v8.1 interactive Bonus Promotions case study

- Added an interactive case study to **Mission 01 — Bonus Promotions Platform**.
- Visitors can switch between **1 user**, **100 users**, **10K users** and **1M users**. Each selection updates the architecture topology, component responsibilities and scale-specific design notes.
- The architecture illustrates a stateless Spring Boot service tier, Redis-backed hot-read acceleration, PostgreSQL as the durable transaction system of record, and Kafka as the asynchronous event path.
- The 10M+ RPM transaction figure reuses the scale metric already displayed in this portfolio. The selector is an illustrative architecture walkthrough, not a live benchmark or a representation of exact production node counts.
- Redis is deliberately described as the cache / hot-path layer rather than the durable transaction ledger. Actual capacity and topology must be confirmed with workload profiling and load testing.
- Case-study interactions are in a standalone `case-study.js` file so the experience also works when the Three.js / WebGL scene cannot initialize.
- The modal supports keyboard focus containment, Escape to close, touch scrolling, and isolation from the background 3D flight controls.

## v8.2 interactive request-flow simulator

- Extended the Bonus Promotions case study with a client-side request-flow simulator.
- Visitors can run three illustrative scenarios: eligibility cache hit (Spring Boot → Redis → response), eligibility cache miss (Spring Boot → Redis miss → PostgreSQL fallback → response), and a bonus lifecycle write (Spring Boot → PostgreSQL durable commit → asynchronous Kafka / consumer path).
- Each simulation advances step-by-step through a route trace, highlights the matching architecture component, and provides an accessible execution log and completion status.
- The selected load profile (1, 100, 10K or 1M concurrent users) updates the component labels shown in the trace.
- The simulator sends no live requests and reports no latency or throughput measurements. It is a front-end teaching visualization of request sequencing and component responsibility.
- Reduced-motion preferences shorten the trace animation; the route remains available as a readable step list.
