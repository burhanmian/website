import * as T from './assets/three.module.js';
import { GLTFLoader } from './assets/GLTFLoader.js';
(() => {
const canvas=document.querySelector('#studio');
const scene=new T.Scene();scene.background=new T.Color('#111816');scene.fog=new T.Fog('#111816',16,35);
let renderer;try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});}catch{document.querySelector('#scene-caption').textContent='Explore the work below.';return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
const camera=new T.PerspectiveCamera(40,1,.05,70);const world=new T.Group();scene.add(world);
const mat=(color,roughness=.75,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const plaster=mat('#789480'),wood=mat('#a57e52'),dark=mat('#182522'),metal=mat('#46524a',.3,.6),bone=mat('#e5e1d8'),green=mat('#415b42'),skin=mat('#bb8a69'),hair=mat('#3d2c22');
// Subtle generated surfaces keep the scene lightweight and free of external image dependencies.
function surface(kind){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');let seed=kind==='wood'?4829:783;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};x.fillStyle=kind==='wood'?'#c7ac85':'#d6ded2';x.fillRect(0,0,512,512);if(kind==='wood'){for(let i=0;i<1200;i++){let y=rnd()*512;x.strokeStyle=`rgba(68,39,18,${rnd()*.10})`;x.lineWidth=.3+rnd()*1.4;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(150,y-5+rnd()*10,340,y-5+rnd()*10,512,y);x.stroke();}}else{for(let i=0;i<18000;i++){let a=rnd()*.075;x.fillStyle=`rgba(43,57,44,${a})`;x.fillRect(rnd()*512,rnd()*512,1+rnd()*2,1+rnd()*2)}}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.encoding=T.sRGBEncoding;return t}wood.map=surface('wood');wood.color.set('#483b2f');plaster.map=surface('plaster');plaster.color.set('#242c29');

function box(name,w,h,d,x,y,z,m=wood,parent=world){const r=Math.min(w,h,d,.12)*.22;const g=new T.BoxGeometry(w,h,d,3,3,3);const pos=g.attributes.position;const v=new T.Vector3(),inner=new T.Vector3(w/2-r,h/2-r,d/2-r);for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);const core=v.clone().clamp(inner.clone().negate(),inner);v.sub(core).normalize().multiplyScalar(r).add(core);pos.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();const o=new T.Mesh(g,m);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function ball(name,r,x,y,z,m=bone,parent=world){const o=new T.Mesh(new T.SphereGeometry(r,24,16),m);o.name=name;o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
function cyl(name,r,h,x,y,z,m=metal,parent=world){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),m);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function label(text,w,h,bg='#1d342b',fg='#e5e1d8'){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=fg;ctx.font='bold 85px Arial';ctx.textAlign='center';ctx.textBaseline='middle';text.split('\n').forEach((line,i,a)=>ctx.fillText(line,512,c.height/2+(i-(a.length-1)/2)*110,910));const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;return new T.MeshBasicMaterial({map:tx});}
box('floor',14,.16,16,0,-.08,0,wood);box('back-wall',7,3.6,.14,0,1.8,-2.5,plaster);box('side-wall',.14,3.6,5,-3.5,1.8,0,plaster);
for(let i=0;i<15;i++)box('floor-seam',.012,.003,5,-3.3+i*.46,.005,0,mat('#80633f'));
box('rug',3.5,.02,2.1,.35,.025,.55,mat('#18211c'));
box('desk',2.5,.11,.92,.8,.92,-1.42,wood);for(const x of[-.28,1.88])for(const z of[-1.75,-1.08])box('desk-leg',.08,.9,.08,x,.45,z,dark);
box('monitor-frame',1.38,.86,.09,.8,1.59,-1.7,dark);const screen=box('monitor-screen',1.28,.75,.015,.8,1.59,-1.645,label('BURHAN\nSelected work',1.28,.75));box('monitor-neck',.075,.22,.07,.8,1.06,-1.7,metal);box('monitor-foot',.4,.025,.24,.8,.987,-1.63,metal);box('keyboard',.58,.035,.2,.8,1.001,-1.18,dark);for(let i=0;i<10;i++)box('keys',.035,.006,.14,.55+i*.052,1.022,-1.18,metal);box('trackpad',.2,.018,.2,1.3,.993,-1.18,bone);
box('computer-tower',.3,.6,.45,1.61,1.27,-1.5,dark);ball('power-light',.014,1.61,1.4,-1.265,new T.MeshBasicMaterial({color:'#b9e5aa'}));
const chair=new T.Group();chair.position.set(1.65,0,-.25);chair.rotation.y=-.4;world.add(chair);box('chair-seat',.58,.12,.56,0,.52,0,dark,chair);box('chair-back',.58,.65,.10,0,.91,.24,dark,chair);cyl('chair-post',.045,.42,0,.25,0,metal,chair);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const leg=box('chair-base',.43,.04,.06,Math.sin(a)*.16,.07,Math.cos(a)*.16,metal,chair);leg.rotation.y=a+Math.PI/2;ball('wheel',.045,Math.sin(a)*.32,.06,Math.cos(a)*.32,dark,chair);}
for(const y of[.62,1.4,2.18])box('shelf',1.25,.07,.4,-2.45,y,-2.15,wood);for(let i=0;i<6;i++){const colors=['#c7a06f','#4c6b55','#d9d3b8'];box('book',.11,.36+(i%3)*.06,.23,-2.95+i*.15,.85,-2.15,mat(colors[i%3]));}
box('hardware-board',.56,.28,.12,-2.54,1.58,-2.14,green);for(let i=0;i<4;i++)box('chip',.07,.03,.06,-2.7+i*.11,1.75,-2.14,dark);cyl('sensor',.12,.2,-2.14,2.32,-2.15,bone);
box('game-poster-frame',1.0,1.3,.055,-.88,2.37,-2.395,dark);box('game-poster',.92,1.22,.015,-.88,2.37,-2.36,label('UNDAUNTED\nGame design',.92,1.22));
box('community-board',1.05,.72,.05,2.52,2.25,-2.4,wood);for(let i=0;i<3;i++){let note=box('community-note',.25,.3,.01,2.19+i*.31,2.23,-2.365,bone);note.rotation.z=(i-1)*.12;}box('community-heading',.87,.18,.015,2.52,2.46,-2.36,label('Community',.87,.18));
const football=ball('football',.22,-2.55,.23,.75,bone);for(let i=0;i<8;i++){let a=i*Math.PI/4;const patch=new T.Mesh(new T.CircleGeometry(.075,5),dark);patch.position.set(Math.sin(a)*.218,Math.cos(a)*.15,.12);patch.lookAt(patch.position.clone().multiplyScalar(2));football.add(patch);}
cyl('plant-pot',.25,.4,2.7,.2,-.5,mat('#beae89'));for(let i=0;i<9;i++){const a=i*2.4;const leaf=ball('leaf',.18,2.7+Math.sin(a)*.25,.65+i*.065,-.5+Math.cos(a)*.23,green);leaf.scale.set(.45,1.9,.7);leaf.rotation.z=Math.sin(a)*.6;}
// Additional original, editable studio props.
box('desk-drawer',.52,.22,.55,-.05,.77,-1.43,wood);box('drawer-handle',.2,.025,.025,-.05,.77,-1.14,metal);
box('tablet',.42,.025,.28,.05,1.0,-1.3,dark);box('tablet-glass',.37,.006,.23,.05,1.017,-1.3,mat('#31534e',.25));
const mug=cyl('mug',.09,.19,1.76,1.05,-1.1,bone);cyl('coffee',.072,.004,1.76,1.15,-1.1,mat('#3a281f'));
box('lamp-base',.28,.03,.28,-.18,.995,-1.7,dark);const lampStem=cyl('lamp-stem',.018,.5,-.18,1.25,-1.7,metal);lampStem.rotation.z=-.25;const lampShade=cyl('lamp-shade',.12,.13,-.11,1.5,-1.7,dark);lampShade.rotation.z=.25;
for(let i=0;i<5;i++){box('pinboard-note',.18,.17,.012,2.22+(i%3)*.26,2.15+Math.floor(i/3)*.2,-2.34,mat(i%2?'#c8d4bf':'#e4d7b3'));}
box('speaker-left',.2,.31,.18,.05,1.15,-1.76,dark);box('speaker-right',.2,.31,.18,1.55,1.15,-1.76,dark);ball('speaker-cone',.055,.05,1.16,-1.65,metal);ball('speaker-cone',.055,1.55,1.16,-1.65,metal);
box('window-frame',.04,1.8,1.85,-3.41,2.15,-.2,bone);box('window',.045,1.6,1.65,-3.38,2.15,-.2,new T.MeshBasicMaterial({color:'#758c91'}));box('window-cross',.06,1.7,.045,-3.32,2.15,-.2,bone);box('window-cross',.06,.045,1.7,-3.32,2.15,-.2,bone);
const person=new T.Group();person.name='temporary-articulated-character';world.add(person);person.position.set(-1.1,0,1.1);
box('torso',.48,.58,.25,0,1.15,0,green,person);cyl('neck',.08,.13,0,1.49,0,skin,person);ball('head',.19,0,1.69,0,skin,person);const top=ball('hair',.19,0,1.78,-.025,hair,person);top.scale.y=.65;box('headset',.37,.15,.15,0,1.72,.14,dark,person);box('headset-trim',.39,.03,.12,0,1.81,.1,bone,person);box('headset-strap',.04,.13,.3,0,1.88,-.01,bone,person);
const limbs={};for(const side of[-1,1]){const leg=new T.Group();leg.position.set(side*.14,.86,0);person.add(leg);box('trouser',.18,.66,.2,0,-.33,0,dark,leg);box('shoe',.2,.12,.32,0,-.78,.06,bone,leg);limbs['leg'+side]=leg;const arm=new T.Group();arm.position.set(side*.29,1.39,0);person.add(arm);box('sleeve',.14,.48,.17,0,-.24,0,green,arm);ball('hand',.077,0,-.53,0,skin,arm);limbs['arm'+side]=arm;}
// The supplied character stays local; the primitive figure is a fallback while it loads.
let avatar=null, mixer=null, walkAction=null, idleAction=null, spine=null;person.visible=false;
new GLTFLoader().load('./outputs/burhan-character.glb', gltf=>{
  avatar=gltf.scene;
  if(gltf.animations.length){mixer=new T.AnimationMixer(avatar);walkAction=mixer.clipAction(gltf.animations[0]);walkAction.play();
    // Derive a relaxed stance from the walk's average pose, then blend into locomotion.
    const tracks=gltf.animations[0].tracks.map(track=>{
      const size=track.getValueSize(), value=new Float32Array(size);
      const boneName=track.name.split('.')[0],bone=avatar.getObjectByName(boneName);
      if(bone && /Hips|Spine|neck|Head|UpLeg|Leg|Foot|Toe/.test(boneName)){
        const property=track.name.split('.').pop();
        if(property==='quaternion')bone.quaternion.toArray(value);else if(property==='position')bone.position.toArray(value);else if(property==='scale')bone.scale.toArray(value);
        return new track.constructor(track.name,[0,2],[...value,...value]);
      }
      if(size===4){const q=new T.Quaternion().fromArray(track.values,0);for(let i=1;i<track.times.length;i++)q.slerp(new T.Quaternion().fromArray(track.values,i*4),1/(i+1));q.toArray(value);}
      else for(let k=0;k<size;k++){for(let i=0;i<track.times.length;i++)value[k]+=track.values[i*size+k]/track.times.length;}
      return new track.constructor(track.name,[0,2],[...value,...value]);
    });
    idleAction=mixer.clipAction(new T.AnimationClip('Relaxed idle',2,tracks));idleAction.play();walkAction.weight=0;mixer.update(0);
    spine=avatar.getObjectByName('Spine02');}
  avatar.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(avatar, true), size=new T.Vector3();bounds.getSize(size);
  avatar.scale.setScalar(1);
  avatar.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  for(const child of [...person.children])child.visible=false;
  person.add(avatar);person.visible=true;
},undefined,()=>{document.querySelector('#scene-caption').textContent='Welcome to my studio.';});
// Soft cool fill, warm key and a rim separate the character from the room.
scene.add(new T.HemisphereLight('#b8cbc9','#151714',.32));
const sun=new T.DirectionalLight('#ffdfba',1.2);sun.position.set(-3,5,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5});sun.shadow.normalBias=.025;sun.shadow.bias=-.0001;sun.shadow.radius=4;scene.add(sun);
const rim=new T.DirectionalLight('#8cbac5',.85);rim.position.set(3,3,-2);scene.add(rim);
const lamp=new T.PointLight('#ffc58a',1.2,4,2);lamp.position.set(-.1,1.5,-1.5);scene.add(lamp);
const monitorLight=new T.PointLight('#b1cdd4',.5,3,2);monitorLight.position.set(.8,1.6,-1.25);scene.add(monitorLight);
// Slatted wall and flush acoustic panels give the studio a physical architectural rhythm.
for(let i=0;i<22;i++)box('walnut-slat',.055,3.5,.065,-3.3+i*.075,1.75,-2.37,wood);
box('acoustic-panel',1.6,1.03,.08,.8,2.85,-2.35,mat('#272e2a'));
for(let i=0;i<30;i++)box('panel-rib',.016,.96,.02,.06+i*.051,2.85,-2.295,dark);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused=reduced,progress=0,px=0,py=0,sx=0,sy=0,walkBlend=0,clock=0;
const intro=document.querySelector('.intro'),caption=document.querySelector('#scene-caption'),button=document.querySelector('#motion'),journey=document.querySelector('#journey');
button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Enable motion':'Pause motion';
button.addEventListener('click',()=>{paused=!paused;button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Resume motion':'Pause motion';});
window.addEventListener('pointermove',e=>{px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;},{passive:true});
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();
const clamp=T.MathUtils.clamp,lerp=T.MathUtils.lerp,smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const route=new T.CatmullRomCurve3([new T.Vector3(-.75,0,.9),new T.Vector3(-.4,0,.3),new T.Vector3(-.2,0,-.45),new T.Vector3(.05,0,-.72)]);
const routeLength=route.getLength();
const cameraPath=new T.CatmullRomCurve3([new T.Vector3(1.2,1.7,4.2),new T.Vector3(1.0,1.65,3.8),new T.Vector3(.15,1.65,2.5),new T.Vector3(.65,1.65,.4),new T.Vector3(.8,1.59,-.72)]);
const gazePath=new T.CatmullRomCurve3([new T.Vector3(-.55,1.1,.2),new T.Vector3(-.5,1.2,-.1),new T.Vector3(.05,1.4,-.9),new T.Vector3(.75,1.59,-1.7),new T.Vector3(.8,1.59,-1.7)]);
let last=performance.now(),previousDistance=0,walkTime=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;
const target=clamp(scrollY/Math.max(1,journey.offsetHeight-innerHeight),0,1);
if(!paused){clock+=dt;progress=lerp(progress,target,1-Math.exp(-dt*5));sx=lerp(sx,px,1-Math.exp(-dt*3));sy=lerp(sy,py,1-Math.exp(-dt*3));}
const p=progress,mobile=innerWidth<700;
const walk=smooth((p-.16)/.43),distance=walk*routeLength;
const speed=dt?Math.abs(distance-previousDistance)/dt:0;
if(!paused){walkBlend=lerp(walkBlend,clamp(speed/.35,0,1),1-Math.exp(-dt*7));walkTime+=(distance-previousDistance)/.95;}
previousDistance=distance;
person.position.copy(route.getPointAt(walk));
const tangent=route.getTangentAt(walk),heading=Math.atan2(tangent.x,tangent.z);
const turn=smooth((p-.04)/.13);person.rotation.y=lerp(0,heading,turn);
if(mixer&&walkAction&&idleAction){walkAction.time=walkTime*walkAction.getClip().duration;walkAction.weight=walkBlend;idleAction.weight=1-walkBlend;mixer.update(0);if(spine)spine.rotation.x+=Math.sin(clock*1.65)*.012*(1-walkBlend);}
const travel=smooth((p-.08)/.92),cam=cameraPath.getPoint(travel),gaze=gazePath.getPoint(travel);
if(mobile){cam.z+=.3*(1-travel);gaze.x-=.15*(1-travel);}
camera.position.copy(cam);camera.position.x+=sx*.035*(1-travel);camera.position.y-=sy*.025*(1-travel);camera.lookAt(gaze);camera.fov=mobile?57:47;camera.updateProjectionMatrix();
intro.style.opacity=String(1-smooth(p/.16));intro.style.visibility=p>.18?'hidden':'visible';
caption.textContent=p<.12?'Meet me in the studio.':p<.6?'From an idea to something you can experience.':p<.9?'Let’s take a closer look.':'Explore the work below.';
canvas.dataset.phase=p<.04?'idle':p<.16?'turn':p<.59?'walk':'arrive';
renderer.render(scene,camera);}
requestAnimationFrame(frame);
})();
