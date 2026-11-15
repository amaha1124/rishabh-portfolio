import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Continuous free-flight portfolio: no page-by-page snapping.
const container = document.querySelector('#scene');
if (!container) throw new Error('Missing #scene container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030611);
scene.fog = new THREE.FogExp2(0x030611, 0.0018);
const camera = new THREE.PerspectiveCamera(matchMedia('(max-width: 760px)').matches ? 58 : 48, innerWidth / innerHeight, 0.1, 1800);
camera.position.set(0, 0, 23);
const isSmallScreen = matchMedia('(max-width: 760px)').matches;
const isLowPower = isSmallScreen || matchMedia('(max-width: 1100px)').matches;
const renderer = new THREE.WebGLRenderer({ antialias: !isSmallScreen, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isSmallScreen ? 1.35 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = !isLowPower;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9aadd0, 0x080b18, 0.34));
const keyLight = new THREE.DirectionalLight(0xffe7cf, 2.25);
keyLight.position.set(-18, 18, 28);
keyLight.castShadow = true;
scene.add(keyLight);
const fillLight = new THREE.PointLight(0x526fbd, 32, 420);
fillLight.position.set(20, -8, -35);
scene.add(fillLight);

// Deep star field.
const starGeometry = new THREE.BufferGeometry();
const starCount = isSmallScreen ? 1500 : isLowPower ? 2200 : 3200;
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);
const starTwinklePhases = new Float32Array(starCount);
for (let i = 0; i < starCount; i++) {
  const radius = 100 + Math.random() * 650;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = radius * Math.cos(phi);
  const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.16, 0.35, 0.65 + Math.random() * 0.3);
  starColors.set([color.r, color.g, color.b], i * 3);
  starTwinklePhases[i] = Math.random() * Math.PI * 2;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
starGeometry.setAttribute('aTwinklePhase', new THREE.BufferAttribute(starTwinklePhases, 1));
// A radial sprite gives stars a natural circular point instead of square pixels.
const starSpriteCanvas = document.createElement('canvas');
starSpriteCanvas.width = starSpriteCanvas.height = 64;
const starSpriteContext = starSpriteCanvas.getContext('2d');
const starGlow = starSpriteContext.createRadialGradient(32, 32, 0, 32, 32, 32);
starGlow.addColorStop(0, 'rgba(255,255,255,1)');
starGlow.addColorStop(0.16, 'rgba(255,255,255,0.92)');
starGlow.addColorStop(0.42, 'rgba(225,235,255,0.34)');
starGlow.addColorStop(1, 'rgba(180,205,255,0)');
starSpriteContext.fillStyle = starGlow;
starSpriteContext.fillRect(0, 0, 64, 64);
const starSprite = new THREE.CanvasTexture(starSpriteCanvas);
const starMaterial = new THREE.PointsMaterial({ map: starSprite, size: 2.0, vertexColors: true, transparent: true, opacity: 0.96, sizeAttenuation: true, depthWrite: false, alphaTest: 0.025 });
// Twinkle in the CPU-updated vertex colours rather than patching Three.js shaders.
// This is deliberately simple and reliable across desktop and mobile WebGL drivers.
const baseStarColors = starColors.slice();
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

function canvasTexture(base, accent, mode = 'bands') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
  gradient.addColorStop(0, base); gradient.addColorStop(0.5, accent); gradient.addColorStop(1, base);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 512);
  if (mode === 'bands') for (let i = 0; i < 28; i++) {
    ctx.globalAlpha = 0.08 + Math.random() * 0.15; ctx.fillStyle = i % 2 ? '#fff' : '#080b22';
    ctx.fillRect(0, Math.random() * 512, 1024, 8 + Math.random() * 24);
  }
  if (mode === 'earth') for (let i = 0; i < 55; i++) {
    ctx.globalAlpha = 0.25; ctx.fillStyle = i % 3 ? '#8cc18b' : '#d9e8c0'; ctx.beginPath();
    ctx.ellipse(Math.random() * 1024, Math.random() * 512, 15 + Math.random() * 60, 8 + Math.random() * 35, Math.random() * 3, 0, Math.PI * 2); ctx.fill();
  }
  if (mode === 'ice') for (let i = 0; i < 80; i++) {
    ctx.globalAlpha = 0.14; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1 + Math.random() * 4; ctx.beginPath();
    const x = Math.random() * 1024, y = Math.random() * 512; ctx.moveTo(x, y); ctx.lineTo(x + Math.random() * 140 - 70, y + Math.random() * 90 - 45); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
// Real equirectangular planetary surface maps (Solar System Scope, CC BY 4.0).
// TextureLoader keeps the 3D spheres, lighting and slow axial rotation, but replaces
// the synthetic canvas-painted surfaces with image-based planetary maps.
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');
const planetTextureUrls = {
  Earth: '/planet-textures/2k_earth_daymap.jpg',
  Moon: '/planet-textures/2k_moon.jpg',
  Saturn: '/planet-textures/2k_saturn.jpg',
  Mars: '/planet-textures/2k_mars.jpg',
  Ice: '/planet-textures/2k_neptune.jpg',
  Portal: '/planet-textures/2k_jupiter.jpg'
};
function loadPlanetTexture(name, fallback, material) {
  const url = planetTextureUrls[name];
  // The procedural surface is applied immediately, so a slow, blocked or offline
  // texture request can never leave a black planet on screen.
  material.map = fallback;
  material.needsUpdate = true;
  if (!url) return;
  textureLoader.load(url, loaded => {
    if (!loaded || !loaded.image || !loaded.image.width || !loaded.image.height) {
      console.warn(`Invalid planetary texture for ${name}; keeping procedural fallback.`);
      material.map = fallback;
      material.needsUpdate = true;
      return;
    }
    loaded.colorSpace = THREE.SRGBColorSpace;
    loaded.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    loaded.wrapS = THREE.RepeatWrapping;
    loaded.wrapT = THREE.ClampToEdgeWrapping;
    material.map = loaded;
    material.needsUpdate = true;
    console.info(`Loaded real planetary texture: ${name}`, url);
  }, undefined, error => {
    console.warn(`Planet texture unavailable for ${name}; keeping procedural fallback.`, error);
    material.map = fallback;
    material.needsUpdate = true;
  });
}
function makePlanet({ name, radius, position, base, accent, mode = 'bands', rough = 0.9, ring = false, ringColor = 0x9cb8d5, tilt = 0.2 }) {
  const group = new THREE.Group(); group.position.set(...position); scene.add(group);
  const fallbackTexture = canvasTexture(base, accent, mode);
  const material = new THREE.MeshStandardMaterial({ map: fallbackTexture, color: 0xffffff, roughness: rough, metalness: 0.015 });
  loadPlanetTexture(name, fallbackTexture, material);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), material); group.add(mesh);
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.006, 64, 48), new THREE.MeshStandardMaterial({ color: 0xddeeff, transparent: true, opacity: name === 'Earth' ? 0.025 : 0.008, roughness: 1 })); group.add(atmosphere);
  if (ring) {
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(radius * 1.28, radius * 1.85, 160), new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, transparent: true, opacity: 0.42 }));
    ringMesh.rotation.x = Math.PI / 2.35; ringMesh.rotation.y = tilt; group.add(ringMesh);
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(radius * 1.9, radius * 2.03, 160), new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, transparent: true, opacity: 0.13 }));
    outerRing.rotation.copy(ringMesh.rotation); group.add(outerRing);
  }
  return { group, mesh };
}
const planets = [
  makePlanet({ name: 'Earth', radius: 5.1, position: [8, 1, -14], base: '#16446b', accent: '#3f9b9d', mode: 'earth' }),
  makePlanet({ name: 'Moon', radius: 4.5, position: [-9, 0, -55], base: '#b9c1ce', accent: '#56647b', rough: 1 }),
  makePlanet({ name: 'Saturn', radius: 5.4, position: [9, 0, -98], base: '#b68e78', accent: '#75627c', ring: true, ringColor: 0xc9b4d5 }),
  makePlanet({ name: 'Mars', radius: 4.6, position: [-9, 0, -142], base: '#b95f4b', accent: '#633c53' }),
  makePlanet({ name: 'Ice', radius: 5.2, position: [9, 0, -185], base: '#77b7ca', accent: '#345a83', mode: 'ice', ring: true, ringColor: 0x91c9db }),
  makePlanet({ name: 'Portal', radius: 5.7, position: [0, 0, -232], base: '#4b3b83', accent: '#2d6386', ring: true, ringColor: 0x9e91ff })
];
const nebulae = [];
for (let i = 0; i < 9; i++) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random() * 7, 20, 16), new THREE.MeshBasicMaterial({ color: [0x443a8e, 0x145c70, 0x753d72][i % 3], transparent: true, opacity: 0.018 }));
  mesh.position.set((Math.random() - 0.5) * 110, (Math.random() - 0.5) * 70, -Math.random() * 260); scene.add(mesh); nebulae.push(mesh);
}

// The content anchors are landmarks in one continuous world, not separate pages.
const chapters = [...document.querySelectorAll('.chapter')];
const dots = [...document.querySelectorAll('.dots button')];
const names = ['DEEP SPACE', 'THE ORIGIN', 'SYSTEMS PLANET', 'FIELD MISSIONS', 'THE NEXT FRONTIER', 'OPEN CHANNEL'];
const anchors = [23, -35, -78, -121, -164, -210];
let currentChapter = 0;
let journeyRunning = false;
let returningToTop = false;
let journeyStopIndex = 0;
let journeyDwellUntil = 0;
let journeyLastFrame = 0;
const journeyButton = document.querySelector('#journeyTourBtn');
const journeyStopDuration = 2600;
function stopJourney() {
  if (!journeyRunning) return;
  journeyRunning = false;
  if (journeyButton) { journeyButton.textContent = 'SEE MY JOURNEY'; journeyButton.setAttribute('aria-pressed', 'false'); }
}
function startJourney() {
  journeyRunning = true; journeyStopIndex = 0; journeyDwellUntil = 0; journeyLastFrame = performance.now();
  velocity.set(0, 0, 0);
  if (journeyButton) { journeyButton.textContent = 'PAUSE JOURNEY'; journeyButton.setAttribute('aria-pressed', 'true'); }
}
journeyButton?.addEventListener('click', () => { returningToTop = false; if (journeyRunning) stopJourney(); else startJourney(); });
const returnTopButton = document.querySelector('#returnTopBtn');
returnTopButton?.addEventListener('click', () => {
  stopJourney();
  returningToTop = true;
  pressed.clear();
  velocity.set(0, 0, 0);
  topViewEnabled = false;
  topViewTargetPitch = 0;
});
function updateChapter() {
  let nearest = 0, best = Infinity;
  anchors.forEach((z, i) => { const distance = Math.abs(camera.position.z - z); if (distance < best) { best = distance; nearest = i; } });
  if (nearest === currentChapter) return;
  currentChapter = nearest;
  chapters.forEach((chapter, i) => chapter.classList.toggle('active', i === currentChapter));
  dots.forEach((dot, i) => dot.classList.toggle('selected', i === currentChapter));
  const label = document.querySelector('#sectorLabel'); if (label) label.textContent = `SECTOR 0${currentChapter} · ${names[currentChapter]}`;
  const number = document.querySelector('#captionNumber'); if (number) number.textContent = `0${currentChapter}`;
  const caption = document.querySelector('#captionName'); if (caption) caption.textContent = names[currentChapter];
  const progress = document.querySelector('#progress'); if (progress) progress.style.width = `${currentChapter / 5 * 100}%`;
}

// Flight controls work globally, regardless of which content landmark is visible.
const pressed = new Set();
const keyBindings = { KeyW: 'forward', KeyS: 'back', KeyA: 'left', KeyD: 'right', KeyQ: 'down', KeyE: 'up' };
const velocity = new THREE.Vector3();
let yaw = 0, pitch = 0;
let topViewEnabled = false;
let pitchBeforeTopView = 0;
let topViewTargetPitch = 0;
const desktopTopView = !isSmallScreen;
let dragging = false, lastPointerX = 0, lastPointerY = 0;
const clock = new THREE.Clock();
let lastScrollAt = 0;
window.addEventListener('keydown', event => {
  if (keyBindings[event.code] || event.code === 'Space' || event.key.startsWith('Arrow')) { if (journeyRunning) stopJourney(); returningToTop = false; }
  if (desktopTopView && event.code === 'KeyT') {
    topViewEnabled = !topViewEnabled;
    if (topViewEnabled) { pitchBeforeTopView = pitch; topViewTargetPitch = 1.48; }
    else { topViewTargetPitch = pitchBeforeTopView; }
    event.preventDefault();
  }
  if (keyBindings[event.code]) { pressed.add(keyBindings[event.code]); event.preventDefault(); }
  if (['ArrowRight', 'ArrowDown'].includes(event.key)) { velocity.z -= 12; event.preventDefault(); }
  if (['ArrowLeft', 'ArrowUp'].includes(event.key)) { velocity.z += 12; event.preventDefault(); }
  if (event.code === 'Space') { pressed.add('up'); event.preventDefault(); }
});
window.addEventListener('keyup', event => { if (keyBindings[event.code]) pressed.delete(keyBindings[event.code]); if (event.code === 'Space') pressed.delete('up'); });
window.addEventListener('blur', () => { pressed.clear(); dragging = false; });

// Wheel/trackpad input changes ship velocity proportionally, so the visitor chooses the pace.
window.addEventListener('wheel', event => {
  if (journeyRunning) stopJourney();
  returningToTop = false;
  event.preventDefault();
  // On desktop, Shift + trackpad/mouse-wheel tilts the camera toward a top-down view.
  // Ordinary scrolling continues to control forward flight. Mobile behaviour is untouched.
  if (desktopTopView && event.shiftKey) {
    topViewTargetPitch = THREE.MathUtils.clamp(topViewTargetPitch - event.deltaY * 0.0025, -0.15, 1.48);
    topViewEnabled = topViewTargetPitch > 0.2;
    lastScrollAt = performance.now();
    return;
  }
  const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
  velocity.z -= event.deltaY * scale * 0.075;
  velocity.x += event.deltaX * scale * 0.055;
  velocity.z = THREE.MathUtils.clamp(velocity.z, -42, 42);
  velocity.x = THREE.MathUtils.clamp(velocity.x, -28, 28);
  lastScrollAt = performance.now();
}, { passive: false });

// Click-drag to steer the view. Mouse movement is not tied to the active content card.
window.addEventListener('pointerdown', event => { if (journeyRunning) stopJourney(); returningToTop = false; if (event.pointerType === 'touch' || event.target.closest('a, button')) return; dragging = true; lastPointerX = event.clientX; lastPointerY = event.clientY; });
window.addEventListener('pointermove', event => {
  if (!dragging || event.pointerType === 'touch') return;
  const dx = event.clientX - lastPointerX, dy = event.clientY - lastPointerY;
  yaw -= dx * 0.0032; pitch = THREE.MathUtils.clamp(pitch - dy * 0.0025, -1.15, 1.48);
  if (desktopTopView) topViewTargetPitch = pitch;
  lastPointerX = event.clientX; lastPointerY = event.clientY;
});
window.addEventListener('pointerup', () => { dragging = false; });
window.addEventListener('pointercancel', () => { dragging = false; });

// Touch-first exploration: one-finger swipe controls continuous flight across the scene.
// Text panels keep native vertical scrolling when their content overflows.
let touchX = 0, touchY = 0, touchActive = false;
let touchTargetIsCopy = false;
window.addEventListener('touchstart', event => {
  if (journeyRunning) stopJourney();
  returningToTop = false;
  if (event.touches.length !== 1) { touchActive = false; return; }
  const t = event.touches[0];
  touchX = t.clientX; touchY = t.clientY; touchActive = true;
  touchTargetIsCopy = !!(event.target.closest && event.target.closest('.copy'));
}, { passive: true });
window.addEventListener('touchmove', event => {
  if (!touchActive || event.touches.length !== 1) return;
  const t = event.touches[0];
  const dx = t.clientX - touchX, dy = t.clientY - touchY;
  const copy = touchTargetIsCopy ? (event.target.closest && event.target.closest('.copy')) : null;
  const canScrollCopy = copy && copy.scrollHeight > copy.clientHeight + 2;
  const movingWithinCopy = canScrollCopy && Math.abs(dy) > Math.abs(dx);
  if (!movingWithinCopy) {
    // Translate the ship through 3D space; do not rotate the view on touch.
    // Swipe up moves along the camera's forward vector; horizontal swipe strafes.
    const forward = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    const right = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
    velocity.addScaledVector(forward, -dy * 1.05);
    velocity.addScaledVector(right, -dx * 0.68);
    velocity.clampLength(0, 88);
    lastScrollAt = performance.now();
    if (event.cancelable) event.preventDefault();
  }
  touchX = t.clientX; touchY = t.clientY;
}, { passive: false });
window.addEventListener('touchend', () => { touchActive = false; }, { passive: true });
window.addEventListener('touchcancel', () => { touchActive = false; }, { passive: true });

// HUD landmarks are shortcuts that set a gentle cruise velocity, not page transitions.
dots.forEach((dot, index) => dot.addEventListener('click', () => {
  const distance = anchors[index] - camera.position.z;
  velocity.z = THREE.MathUtils.clamp(distance * 0.42, -15, 15);
}));
document.querySelector('#prevScene')?.addEventListener('click', () => { velocity.z = 10; });
document.querySelector('#nextScene')?.addEventListener('click', () => { velocity.z = -10; });
document.querySelector('#year').textContent = new Date().getFullYear();

// Original ambient soundtrack. Playback begins only after the visitor presses the control.
const soundButton = document.querySelector('#soundBtn');
const ambientTrack = document.querySelector('#ambientTrack');
if (ambientTrack) ambientTrack.volume = 0.24;
soundButton?.addEventListener('click', async () => {
  if (!ambientTrack) return;
  if (ambientTrack.paused) {
    try { await ambientTrack.play(); soundButton.textContent = 'SOUND ON'; soundButton.setAttribute('aria-label', 'Pause ambient soundtrack'); }
    catch (error) { soundButton.textContent = 'AUDIO UNAVAILABLE'; console.error('Could not play soundtrack:', error); }
  } else {
    ambientTrack.pause(); soundButton.textContent = 'PLAY SOUND'; soundButton.setAttribute('aria-label', 'Play ambient soundtrack');
  }
});

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.04), elapsed = clock.elapsedTime;
  if (desktopTopView) pitch = THREE.MathUtils.damp(pitch, topViewTargetPitch, 3.2, delta);
  if (returningToTop) {
    const dx = -camera.position.x, dy = -camera.position.y, dz = anchors[0] - camera.position.z;
    const distance = Math.hypot(dx, dy, dz);
    if (distance > 0.8) {
      const step = Math.min(distance, 24 * delta);
      camera.position.x += dx / distance * step;
      camera.position.y += dy / distance * step;
      camera.position.z += dz / distance * step;
      yaw = THREE.MathUtils.damp(yaw, 0, 3.5, delta);
      pitch = THREE.MathUtils.damp(pitch, 0, 3.5, delta);
      velocity.set(0, 0, 0);
    } else {
      camera.position.set(0, 0, anchors[0]);
      yaw = 0; pitch = 0; velocity.set(0, 0, 0);
      returningToTop = false;
    }
  }
  if (journeyRunning) {
    const now = performance.now();
    const targetZ = anchors[journeyStopIndex];
    const targetX = journeyStopIndex === 2 || journeyStopIndex === 4 ? 8 : journeyStopIndex === 3 ? -7 : 0;
    const targetY = 0;
    const dz = targetZ - camera.position.z;
    const dx = targetX - camera.position.x;
    const dy = targetY - camera.position.y;
    const distance = Math.hypot(dx, dy, dz);
    if (distance > 1.15) {
      const step = Math.min(distance, Math.max(7, distance * 0.72) * delta);
      camera.position.x += dx / distance * step;
      camera.position.y += dy / distance * step;
      camera.position.z += dz / distance * step;
      velocity.set(0, 0, 0);
    } else if (journeyDwellUntil === 0) {
      journeyDwellUntil = now + journeyStopDuration;
    } else if (now >= journeyDwellUntil) {
      if (journeyStopIndex < anchors.length - 1) { journeyStopIndex++; journeyDwellUntil = 0; }
      else { journeyRunning = false; if (journeyButton) { journeyButton.textContent = 'REPLAY JOURNEY'; journeyButton.setAttribute('aria-pressed', 'false'); } }
    }
  }
  const forward = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  const right = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
  const desired = new THREE.Vector3();
  if (pressed.has('forward')) desired.add(forward);
  if (pressed.has('back')) desired.sub(forward);
  if (pressed.has('right')) desired.add(right);
  if (pressed.has('left')) desired.sub(right);
  if (pressed.has('up')) desired.y += 1;
  if (pressed.has('down')) desired.y -= 1;
  if (desired.lengthSq() > 0) desired.normalize().multiplyScalar(20);
  velocity.addScaledVector(desired.clone().sub(velocity), Math.min(1, delta * 5.5));
  if (desired.lengthSq() === 0) velocity.multiplyScalar(Math.pow(0.965, delta * 60));
  camera.position.addScaledVector(velocity, delta);
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -65, 65);
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, -35, 35);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -290, 35);
  camera.lookAt(camera.position.clone().add(forward));
  stars.rotation.y = elapsed * 0.00012;
  // Independent, restrained brightness variation makes stars visibly twinkle.
  for (let i = 0; i < starCount; i++) {
    const twinkle = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(elapsed * 1.35 + starTwinklePhases[i]));
    const offset = i * 3;
    starColors[offset] = baseStarColors[offset] * twinkle;
    starColors[offset + 1] = baseStarColors[offset + 1] * twinkle;
    starColors[offset + 2] = baseStarColors[offset + 2] * twinkle;
  }
  starGeometry.attributes.color.needsUpdate = true;
  // Rotate each complete planetary assembly around its own local axis. Using delta-based
  // increments avoids coupling rotation to camera movement or a shared absolute angle.
  // Speeds are intentionally visible in a portfolio scene while remaining restrained.
  const axialSpinRates = [0.075, 0.035, 0.055, 0.065, 0.045, 0.085];
  planets.forEach((planet, index) => {
    // Rotate each sphere mesh directly; this guarantees every body's visible surface spins
    // even if its parent assembly is later reoriented for rings or orbital presentation.
    planet.mesh.rotation.y += delta * axialSpinRates[index];
  });
  updateChapter();
  renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(max-width: 760px)').matches ? 1.35 : 1.75)); renderer.setSize(innerWidth, innerHeight);
});
