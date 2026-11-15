import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const container=document.querySelector('#scene');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x030611); scene.fog=new THREE.FogExp2(0x030611,0.0018);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,1800);
camera.position.set(0,0,23);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.18; container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x8296c9,.48));
const key=new THREE.PointLight(0xffffff,145,500); key.position.set(-18,18,28);scene.add(key);
const fill=new THREE.PointLight(0x6888ff,70,350);fill.position.set(20,-8,-35);scene.add(fill);

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
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:rough,metalness:.03});
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,96,64),mat);group.add(mesh);
 const cloud=new THREE.Mesh(new THREE.SphereGeometry(radius*1.006,64,48),new THREE.MeshStandardMaterial({color:0xddeeff,transparent:true,opacity:name==='Earth'?.09:.035,roughness:1,wireframe:false}));group.add(cloud);
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
for(let i=0;i<18;i++){const geo=new THREE.SphereGeometry(2+Math.random()*6,16,12);const m=new THREE.MeshBasicMaterial({color:[0x443a8e,0x145c70,0x753d72][i%3],transparent:true,opacity:.045,wireframe:true});const o=new THREE.Mesh(geo,m);o.position.set((Math.random()-.5)*90,(Math.random()-.5)*60,-Math.random()*260);scene.add(o);nebulae.push(o)}
const stops=[
 {cam:[0,0,23],look:[0,0,-14],planet:0},
 {cam:[-1,0,-35],look:[-9,0,-55],planet:1},
 {cam:[-1,0,-78],look:[9,0,-98],planet:2},
 {cam:[1,0,-121],look:[-9,0,-142],planet:3},
 {cam:[-1,0,-164],look:[9,0,-185],planet:4},
 {cam:[0,0,-210],look:[0,0,-232],planet:5}
];
let current=0,transition=false,targetCam=new THREE.Vector3(...stops[0].cam),targetLook=new THREE.Vector3(...stops[0].look),look=new THREE.Vector3(...stops[0].look),touchY=0;
let wheelAccumulator=0,wheelResetTimer=null,lastWheelMove=0;
const chapters=[...document.querySelectorAll('.chapter')],dots=[...document.querySelectorAll('.dots button')];
const names=['DEEP SPACE','THE ORIGIN','SYSTEMS PLANET','FIELD MISSIONS','THE NEXT FRONTIER','OPEN CHANNEL'];
function go(n){n=Math.max(0,Math.min(5,n));if(n===current||transition)return;transition=true;current=n;targetCam.set(...stops[n].cam);targetLook.set(...stops[n].look);chapters.forEach((c,i)=>c.classList.toggle('active',i===n));dots.forEach((d,i)=>d.classList.toggle('selected',i===n));document.querySelector('#sectorLabel').textContent=`SECTOR 0${n} · ${names[n]}`;document.querySelector('#captionNumber').textContent=`0${n}`;document.querySelector('#captionName').textContent=names[n];document.querySelector('#progress').style.width=`${n/5*100}%`;setTimeout(()=>transition=false,850)}
// Accumulate small trackpad deltas; a single mouse-wheel notch also advances one scene.
window.addEventListener('wheel',e=>{
  e.preventDefault();
  if(transition || performance.now()-lastWheelMove<850)return;
  wheelAccumulator += e.deltaY;
  clearTimeout(wheelResetTimer);
  wheelResetTimer=setTimeout(()=>wheelAccumulator=0,180);
  if(Math.abs(wheelAccumulator)>=24){
    const direction=wheelAccumulator>0?1:-1;
    wheelAccumulator=0;lastWheelMove=performance.now();go(current+direction);
  }
},{passive:false});
window.addEventListener('keydown',e=>{if(['ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1)}else if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(5)}});
window.addEventListener('touchstart',e=>touchY=e.changedTouches[0].clientY,{passive:true});
window.addEventListener('touchend',e=>{const d=touchY-e.changedTouches[0].clientY;if(Math.abs(d)>30)go(current+(d>0?1:-1))},{passive:true});
dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));
document.querySelector('#prevScene').addEventListener('click',()=>go(current-1));
document.querySelector('#nextScene').addEventListener('click',()=>go(current+1));
document.querySelector('#year').textContent=new Date().getFullYear();
document.querySelector('#soundBtn').addEventListener('click',()=>{document.querySelector('#soundBtn').textContent='SOUND OFF';document.querySelector('#soundBtn').title='Ambient audio can be added in a later iteration.'});

const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();camera.position.lerp(targetCam,.035);look.lerp(targetLook,.04);camera.lookAt(look);stars.rotation.y=t*.0015;stars.rotation.x=Math.sin(t*.04)*.012;planets.forEach((p,i)=>{p.mesh.rotation.y=t*(i%2?.025:.012);p.cloud.rotation.y=-t*.008;p.group.rotation.z=Math.sin(t*.12+i)*.012});nebulae.forEach((o,i)=>{o.rotation.x=t*.003*(i%3+1);o.rotation.y=t*.002});renderer.render(scene,camera)}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight)});
