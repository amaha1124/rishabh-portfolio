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
for (let i = 0; i < starCount; i++) {
  const radius = 100 + Math.random() * 650;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = radius * Math.cos(phi);
  const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.16, 0.35, 0.65 + Math.random() * 0.3);
  starColors.set([color.r, color.g, color.b], i * 3);
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true }));
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
function makePlanet({ name, radius, position, base, accent, mode = 'bands', rough = 0.9, ring = false, ringColor = 0x9cb8d5, tilt = 0.2 }) {
  const group = new THREE.Group(); group.position.set(...position); scene.add(group);
  const material = new THREE.MeshStandardMaterial({ map: canvasTexture(base, accent, mode), roughness: rough, metalness: 0.015 });
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
let dragging = false, lastPointerX = 0, lastPointerY = 0;
const clock = new THREE.Clock();
let lastScrollAt = 0;
window.addEventListener('keydown', event => {
  if (keyBindings[event.code]) { pressed.add(keyBindings[event.code]); event.preventDefault(); }
  if (['ArrowRight', 'ArrowDown'].includes(event.key)) { velocity.z -= 12; event.preventDefault(); }
  if (['ArrowLeft', 'ArrowUp'].includes(event.key)) { velocity.z += 12; event.preventDefault(); }
  if (event.code === 'Space') { pressed.add('up'); event.preventDefault(); }
});
window.addEventListener('keyup', event => { if (keyBindings[event.code]) pressed.delete(keyBindings[event.code]); if (event.code === 'Space') pressed.delete('up'); });
window.addEventListener('blur', () => { pressed.clear(); dragging = false; });

// Wheel/trackpad input changes ship velocity proportionally, so the visitor chooses the pace.
window.addEventListener('wheel', event => {
  event.preventDefault();
  const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
  velocity.z -= event.deltaY * scale * 0.075;
  velocity.x += event.deltaX * scale * 0.055;
  velocity.z = THREE.MathUtils.clamp(velocity.z, -42, 42);
  velocity.x = THREE.MathUtils.clamp(velocity.x, -28, 28);
  lastScrollAt = performance.now();
}, { passive: false });

// Click-drag to steer the view. Mouse movement is not tied to the active content card.
window.addEventListener('pointerdown', event => { if (event.target.closest('a, button')) return; dragging = true; lastPointerX = event.clientX; lastPointerY = event.clientY; });
window.addEventListener('pointermove', event => {
  if (!dragging) return;
  const dx = event.clientX - lastPointerX, dy = event.clientY - lastPointerY;
  yaw -= dx * 0.0032; pitch = THREE.MathUtils.clamp(pitch - dy * 0.0025, -1.15, 1.15);
  lastPointerX = event.clientX; lastPointerY = event.clientY;
});
window.addEventListener('pointerup', () => { dragging = false; });
window.addEventListener('pointercancel', () => { dragging = false; });

// Touch-first exploration: one-finger swipe controls continuous flight across the scene.
// Text panels keep native vertical scrolling when their content overflows.
let touchX = 0, touchY = 0, touchActive = false;
let touchTargetIsCopy = false;
window.addEventListener('touchstart', event => {
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
    // Natural finger movement: swipe up = fly forward, swipe down = reverse.
    velocity.z += dy * 0.38;
    velocity.x -= dx * 0.28;
    velocity.z = THREE.MathUtils.clamp(velocity.z, -52, 52);
    velocity.x = THREE.MathUtils.clamp(velocity.x, -34, 34);
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
  planets.forEach((planet, index) => { planet.mesh.rotation.y += delta * (index % 2 ? 0.00055 : 0.00038); });
  updateChapter();
  renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(max-width: 760px)').matches ? 1.35 : 1.75)); renderer.setSize(innerWidth, innerHeight);
});
