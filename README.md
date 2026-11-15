# Rishabh Arora — Space Portfolio v8.12

## v8.12 — Recruiter Mode + Technology Constellation

### Recruiter Mode
- Added a persistent `RECRUITER MODE` action in the header (compact `PROFILE` label on narrow mobile screens).
- Opens a lightweight, accessible professional-profile dialog with a summary, selected portfolio metrics, career history, engineering focus, education, resume download, email and profile links.
- Includes a shortcut from the profile to the existing Bonus Promotions case study.
- Does not state job availability or add unsupported personal details.

### Technology Constellation
- Added an `OPEN TECHNOLOGY CONSTELLATION` action in the Systems chapter.
- Added a selectable, grouped map of languages/frameworks, distributed systems, data/infrastructure, and AI/quality/observability technologies.
- Selecting a technology updates its description, related work and connected technologies.
- Technologies linked to Bonus Promotions can open the existing case study directly.
- Implemented with HTML, CSS and small DOM interactions; no new canvas, WebGL scene, external images or dependencies.

### Compatibility and accessibility
- Both experiences work in desktop 3D mode and mobile lightweight mode.
- Dialogs include accessible names, focus management, Tab focus trapping, Escape-to-close, backdrop close and return focus to the opener.
- Dialog gestures are prevented from being interpreted as 3D flight inputs.
- Existing Career Orbit, Bonus Promotions scale selector, contact shortcuts, mobile fallback and desktop scene are retained.

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
git commit -m "Add recruiter mode and technology constellation"
git push origin main
```
