import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const container=document.querySelector('#scene');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x030611); scene.fog=new THREE.FogExp2(0x030611,0.0018);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,1800);
camera.position.set(0,0,23);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; container.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9aadd0,0x080b18,.34));
const key=new THREE.DirectionalLight(0xffe7cf,2.25); key.position.set(-18,18,28); key.castShadow=true; scene.add(key);
const fill=new THREE.PointLight(0x526fbd,32,420);fill.position.set(20,-8,-35);scene.add(fill);

const starGeo=new THREE.BufferGeometry(), count=2600, positions=new Float32Array(count*3), colors=new Float32Array(count*3);
for(let i=0;i<count;i++){const radius=100+Math.random()*650,theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);positions[i*3]=radius*Math.sin(phi)*Math.cos(theta);positions[i*3+1]=radius*Math.sin(phi)*Math.sin(theta);positions[i*3+2]=radius*Math.cos(phi);const c=new THREE.Color().setHSL(.55+Math.random()*.16,.35,.65+Math.random()*.3);colors.set([c.r,c.g,c.b],i*3)}
starGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));starGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({size:.8,vertexColors:true,transparent:true,opacity:.9,sizeAttenuation:true}));scene.add(stars);

function canvasTexture(base,accent,mode='bands'){
 const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');
 const g=x.createLinearGradient(0,0,1024,512);g.addColorStop(0,base);g.addColorStop(.5,accent);g.addColorStop(1,base);x.fillStyle=g;x.fillRect(0,0,1024,512);
 if(mode==='bands'){for(let i=0;i<28;i++){x.globalAlpha=.08+Math.random()*.15;x.fillStyle=i%2?'#fff':'#080b22';const y=Math.random()*512;x.fillRect(0,y,1024,8+Math.random()*24)}}
 if(mode==='earth'){for(let i=0;i<55;i++){x.globalAlpha=.25;x.fillStyle=i%3?'#8cc18b':'#d9e8c0';x.beginPath();const px=Math.random()*1024,py=Math.random()*512;x.ellipse(px,py,15+Math.random()*60,8+Math.random()*35,Math.random()*3,0,Math.PI*2);x.fill()}}
 if(mode==='ice'){for(let i=0;i<80;i++){x.globalAlpha=.14;x.strokeStyle='#fff';x.lineWidth=1+Math.random()*4;x.beginPath();let px=Math.random()*1024,py=Math.random()*512;x.moveTo(px,py);x.lineTo(px+Math.random()*140-70,py+Math.random()*90-45);x.stroke()}}
 x.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function makePlanet({name,radius,position,base,accent,mode='bands',rough=.9,ring=false,ringColor=0x9cb8d5,tilt=.2}){
 const group=new THREE.Group();group.position.set(...position);scene.add(group);
 const tex=canvasTexture(base,accent,mode);
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:rough,metalness:.015});
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,96,64),mat);group.add(mesh);
 const cloud=new THREE.Mesh(new THREE.SphereGeometry(radius*1.006,64,48),new THREE.MeshStandardMaterial({color:0xddeeff,transparent:true,opacity:name==='Earth'?.025:.008,roughness:1,wireframe:false}));group.add(cloud);
 if(ring){const ringMesh=new THREE.Mesh(new THREE.RingGeometry(radius*1.28,radius*1.85,160),new THREE.MeshBasicMaterial({color:ringColor,side:THREE.DoubleSide,transparent:true,opacity:.42}));ringMesh.rotation.x=Math.PI/2.35;ringMesh.rotation.y=tilt;group.add(ringMesh);const ring2=new THREE.Mesh(new THREE.RingGeometry(radius*1.9,radius*2.03,160),new THREE.MeshBasicMaterial({color:ringColor,side:THREE.DoubleSide,transparent:true,opacity:.13}));ring2.rotation.copy(ringMesh.rotation);group.add(ring2)}
 const glow=new THREE.Mesh(new THREE.SphereGeometry(radius*1.035,48,32),new THREE.MeshBasicMaterial({color:accent==='blue'?0x4b8ecb:0x9b83db,transparent:true,opacity:.035,side:THREE.BackSide}));group.add(glow);
 return {group,mesh,cloud};
}
const planets=[
 makePlanet({name:'Earth',radius:5.1,position:[8,1,-14],base:'#16446b',accent:'#3f9b9d',mode:'earth',rough:.85}),
 makePlanet({name:'Moon',radius:4.5,position:[-9,0,-55],base:'#b9c1ce',accent:'#56647b',rough:1}),
 makePlanet({name:'Saturn',radius:5.4,position:[9,0,-98],base:'#b68e78',accent:'#75627c',mode:'bands',ring:true,ringColor:0xc9b4d5}),
 makePlanet({name:'Mars',radius:4.6,position:[-9,0,-142],base:'#b95f4b',accent:'#633c53',mode:'bands'}),
 makePlanet({name:'Ice',radius:5.2,position:[9,0,-185],base:'#77b7ca',accent:'#345a83',mode:'ice',ring:true,ringColor:0x91c9db}),
 makePlanet({name:'Portal',radius:5.7,position:[0,0,-232],base:'#4b3b83',accent:'#2d6386',mode:'bands',ring:true,ringColor:0x9e91ff})
];
const nebulae=[];
for(let i=0;i<9;i++){const geo=new THREE.SphereGeometry(3+Math.random()*7,20,16);const m=new THREE.MeshBasicMaterial({color:[0x443a8e,0x145c70,0x753d72][i%3],transparent:true,opacity:.018,wireframe:false});const o=new THREE.Mesh(geo,m);o.position.set((Math.random()-.5)*110,(Math.random()-.5)*70,-Math.random()*260);scene.add(o);nebulae.push(o)}
const stops=[
 {cam:[0,0,23],look:[0,0,-14],planet:0},
 {cam:[-1,0,-35],look:[-9,0,-55],planet:1},
 {cam:[-1,0,-78],look:[9,0,-98],planet:2},
 {cam:[1,0,-121],look:[-9,0,-142],planet:3},
 {cam:[-1,0,-164],look:[9,0,-185],planet:4},
 {cam:[0,0,-210],look:[0,0,-232],planet:5}
];
let current=0,transition=false,targetCam=new THREE.Vector3(...stops[0].cam),targetLook=new THREE.Vector3(...stops[0].look),look=new THREE.Vector3(...stops[0].look),touchY=0;
const chapters=[...document.querySelectorAll('.chapter')],dots=[...document.querySelectorAll('.dots button')];
const names=['DEEP SPACE','THE ORIGIN','SYSTEMS PLANET','FIELD MISSIONS','THE NEXT FRONTIER','OPEN CHANNEL'];
function go(n){n=Math.max(0,Math.min(5,n));if(n===current||transition)return;transition=true;current=n;targetCam.set(...stops[n].cam);targetLook.set(...stops[n].look);chapters.forEach((c,i)=>c.classList.toggle('active',i===n));dots.forEach((d,i)=>d.classList.toggle('selected',i===n));document.querySelector('#sectorLabel').textContent=`SECTOR 0${n} · ${names[n]}`;document.querySelector('#captionNumber').textContent=`0${n}`;document.querySelector('#captionName').textContent=names[n];document.querySelector('#progress').style.width=`${n/5*100}%`;setTimeout(()=>transition=false,850)}
// Scroll advances chapters. WASD provides free-flight movement within each sector.
let wheelAccumulator=0,wheelResetTimer=null,lastWheelMove=0;
const keys=new Set(), flightOffset=new THREE.Vector3(), flightVelocity=new THREE.Vector3();
const pointerLook=new THREE.Vector2(), pointerTarget=new THREE.Vector2();
const keyMap={KeyW:'forward',KeyS:'back',KeyA:'left',KeyD:'right',KeyQ:'down',KeyE:'up'};
window.addEventListener('wheel',e=>{
  e.preventDefault();
  if(transition || performance.now()-lastWheelMove<850)return;
  wheelAccumulator += e.deltaY; clearTimeout(wheelResetTimer);
  wheelResetTimer=setTimeout(()=>wheelAccumulator=0,180);
  if(Math.abs(wheelAccumulator)>=24){const direction=wheelAccumulator>0?1:-1;wheelAccumulator=0;lastWheelMove=performance.now();go(current+direction)}
},{passive:false});
window.addEventListener('keydown',e=>{
  if(keyMap[e.code]){keys.add(keyMap[e.code]);e.preventDefault();return;}
  if(['ArrowRight','ArrowDown','PageDown'].includes(e.key)){e.preventDefault();go(current+1)}
  else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}
  else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(5)}
});
window.addEventListener('keyup',e=>{if(keyMap[e.code])keys.delete(keyMap[e.code])});
window.addEventListener('blur',()=>keys.clear());
window.addEventListener('pointermove',e=>{pointerTarget.x=(e.clientX/innerWidth-.5)*.12;pointerTarget.y=(e.clientY/innerHeight-.5)*.08});
window.addEventListener('touchstart',e=>touchY=e.changedTouches[0].clientY,{passive:true});
window.addEventListener('touchend',e=>{const d=touchY-e.changedTouches[0].clientY;if(Math.abs(d)>30)go(current+(d>0?1:-1))},{passive:true});
dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));
document.querySelector('#prevScene').addEventListener('click',()=>go(current-1));
document.querySelector('#nextScene').addEventListener('click',()=>go(current+1));
document.querySelector('#year').textContent=new Date().getFullYear();

// A quiet, original ambient synth pad. Browsers only start audio after a visitor opts in.
let audioContext=null, audioNodes=[], soundOn=false;
const soundBtn=document.querySelector('#soundBtn');
function startAmbient(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
  audioContext=audioContext||new AudioCtx();audioContext.resume();
  const master=audioContext.createGain();master.gain.value=.0001;master.connect(audioContext.destination);
  const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=520;filter.Q.value=.4;filter.connect(master);
  [55,82.41,110].forEach((hz,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=hz;gain.gain.value=[.24,.11,.055][i];osc.connect(gain);gain.connect(filter);osc.start();audioNodes.push(osc,gain)});
  master.gain.setTargetAtTime(.12,audioContext.currentTime,.9);audioNodes.push(filter,master);
}
function stopAmbient(){if(!audioContext)return;const master=audioNodes[audioNodes.length-1];if(master?.gain)master.gain.setTargetAtTime(.0001,audioContext.currentTime,.35);setTimeout(()=>{audioNodes.filter(n=>n instanceof OscillatorNode).forEach(n=>{try{n.stop()}catch{}});audioNodes=[]},1400)}
soundBtn.addEventListener('click',()=>{soundOn=!soundOn;if(soundOn){startAmbient();soundBtn.textContent='SOUND ON';soundBtn.setAttribute('aria-label','Mute ambient music')}else{stopAmbient();soundBtn.textContent='SOUND OFF';soundBtn.setAttribute('aria-label','Play ambient music')}});
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();
 const speed=keys.has('forward')?1:0,back=keys.has('back')?1:0,left=keys.has('left')?1:0,right=keys.has('right')?1:0,up=keys.has('up')?1:0,down=keys.has('down')?1:0;
 const desired=new THREE.Vector3(right-left,up-down,back-speed).multiplyScalar(.11);flightVelocity.lerp(desired,.08);flightOffset.add(flightVelocity);flightOffset.x=THREE.MathUtils.clamp(flightOffset.x,-8,8);flightOffset.y=THREE.MathUtils.clamp(flightOffset.y,-5,5);flightOffset.z=THREE.MathUtils.clamp(flightOffset.z,-10,10);
 const base=new THREE.Vector3(...stops[current].cam);camera.position.lerp(base.add(flightOffset),.045);look.lerp(targetLook,.04);pointerLook.lerp(pointerTarget,.035);camera.lookAt(look.x+pointerLook.x*18,look.y-pointerLook.y*18,look.z);
 // Keep celestial bodies almost still: only slow axial rotation remains.
 stars.rotation.y=t*.00012;planets.forEach((p,i)=>{p.mesh.rotation.y=t*(i%2?.0018:.0012)});
 renderer.render(scene,camera)}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight)});
