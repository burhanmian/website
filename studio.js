import {isProjectOpen} from './project-view.js?v=32';
import {createHardwareProjects} from './hardware-projects.js?v=32';
import { createMonitorPortfolio } from './monitor-portfolio.js?v=32';
import * as T from './assets/three.module.js';
import { GLTFLoader } from './assets/GLTFLoader.js';
import { journeyState, advanceProgress, deskSeatState, leavingSeat, blendAngle, ease, phase, WALK_METRES_PER_SECOND } from './journey-motion.mjs?v=31';
(() => {
const canvas=document.querySelector('#studio');
const scene=new T.Scene();scene.background=new T.Color('#070b0a');scene.fog=new T.Fog('#070b0a',12,30);
let renderer;try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});}catch{document.querySelector('#scene-caption').textContent='Explore the work below.';return;}
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
// Image-based light from a small dark room with one cool window and one warm lamp, so metal and varnish have something to reflect.
{const pm=new T.PMREMGenerator(renderer),es=new T.Scene();es.add(new T.Mesh(new T.BoxGeometry(12,6,12),new T.MeshBasicMaterial({color:'#0b100e',side:T.BackSide})));
const card=(w,h,c,k,x,y,z,ry,rx=0)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(k),side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx,ry,0);es.add(m);};
card(2.6,2.2,'#a9c3dd',5,-5.8,.4,-.2,Math.PI/2);card(3,1.2,'#ffcf9a',2.6,0,2.95,0,0,Math.PI/2);card(1.2,.8,'#7fe0cc',2.2,2,.2,-5.8,0);card(1.4,.6,'#ffd1a0',1.8,5.8,.8,1,Math.PI/2);
scene.environment=pm.fromScene(es,.03).texture;pm.dispose();}
const camera=new T.PerspectiveCamera(40,1,.05,70);const world=new T.Group();scene.add(world);
const mat=(color,roughness=.75,metalness=0)=>{const m=new T.MeshStandardMaterial({color,roughness,metalness});m.envMapIntensity=.4;return m;};
const plaster=mat('#5a6f60',.9),wood=mat('#a57e52'),dark=mat('#182522'),metal=mat('#46524a',.3,.6),bone=mat('#e5e1d8'),green=mat('#415b42'),skin=mat('#bb8a69'),hair=mat('#3d2c22');
// Subtle generated surfaces keep the scene lightweight and free of external image dependencies.
function surface(kind){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');let seed=kind==='wood'?4829:783;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};x.fillStyle=kind==='wood'?'#c7ac85':'#d6ded2';x.fillRect(0,0,512,512);if(kind==='wood'){for(let i=0;i<1200;i++){let y=rnd()*512;x.strokeStyle=`rgba(68,39,18,${rnd()*.10})`;x.lineWidth=.3+rnd()*1.4;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(150,y-5+rnd()*10,340,y-5+rnd()*10,512,y);x.stroke();}}else{for(let i=0;i<18000;i++){let a=rnd()*.075;x.fillStyle=`rgba(43,57,44,${a})`;x.fillRect(rnd()*512,rnd()*512,1+rnd()*2,1+rnd()*2)}}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.encoding=T.sRGBEncoding;return t}wood.map=surface('wood');wood.color.set('#483b2f');plaster.map=surface('plaster');plaster.color.set('#242c29');

function box(name,w,h,d,x,y,z,m=wood,parent=world){const r=Math.min(w,h,d,.12)*.22;const g=new T.BoxGeometry(w,h,d,3,3,3);const pos=g.attributes.position;const v=new T.Vector3(),inner=new T.Vector3(w/2-r,h/2-r,d/2-r);for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);const core=v.clone().clamp(inner.clone().negate(),inner);v.sub(core).normalize().multiplyScalar(r).add(core);pos.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();const o=new T.Mesh(g,m);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function ball(name,r,x,y,z,m=bone,parent=world){const o=new T.Mesh(new T.SphereGeometry(r,48,32),m);o.name=name;o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
function cyl(name,r,h,x,y,z,m=metal,parent=world){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,56),m);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function label(text,w,h,bg='#1d342b',fg='#e5e1d8'){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=fg;ctx.font='bold 85px Arial';ctx.textAlign='center';ctx.textBaseline='middle';text.split('\n').forEach((line,i,a)=>ctx.fillText(line,512,c.height/2+(i-(a.length-1)/2)*110,910));const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;return new T.MeshBasicMaterial({map:tx});}
function plankTexture(){const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');let seed=91;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
for(let p=0;p<4;p++){let y=0;while(y<1024){const len=260+rnd()*520,tone=.42+rnd()*.18;x.fillStyle=`hsl(${24+rnd()*6},${34+rnd()*8}%,${tone*34}%)`;x.fillRect(p*256,y,256,len);
for(let i=0;i<22;i++){x.strokeStyle=`rgba(20,10,4,${.04+rnd()*.07})`;x.lineWidth=.4+rnd()*1.6;const gx=p*256+8+rnd()*240;x.beginPath();x.moveTo(gx,y);x.bezierCurveTo(gx+rnd()*12-6,y+len*.3,gx+rnd()*12-6,y+len*.7,gx+rnd()*6-3,y+len);x.stroke();}
x.fillStyle='rgba(0,0,0,.55)';x.fillRect(p*256,y,256,2);y+=len;}x.fillStyle='rgba(0,0,0,.6)';x.fillRect(p*256,0,2.5,1024);}
const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(7,8);t.anisotropy=8;t.encoding=T.sRGBEncoding;return t;}
const floorMat=new T.MeshPhysicalMaterial({map:plankTexture(),roughness:.52,clearcoat:.3,clearcoatRoughness:.45,envMapIntensity:.7});
box('floor',18,.16,16,1.5,-.08,0,floorMat);box('back-wall',12,3.6,.14,2.5,1.8,-2.5,plaster);box('front-wall',12,3.6,.14,2.5,1.8,5.5,plaster);box('side-wall-low',.14,1.35,8,-3.5,.675,1.5,plaster);box('side-wall-high',.14,.65,8,-3.5,3.275,1.5,plaster);box('side-wall-a',.14,2.25,1.475,-3.5,2.15,-1.7625,plaster);box('side-wall-b',.14,2.25,4.875,-3.5,2.15,3.0625,plaster);
box('right-wall',.14,3.6,8,8.5,1.8,1.5,plaster);box('ceiling',12.2,.14,8.2,2.5,3.67,1.5,mat('#1a211e'));
box('skirting-back',12,.14,.03,2.5,.07,-2.41,mat('#2a211a'));box('skirting-side',.03,.14,8,-3.41,.07,1.5,mat('#2a211a'));box('skirting-right',.03,.14,8,8.41,.07,1.5,mat('#2a211a'));
box('rug',3.5,.02,2.1,.35,.025,.55,mat('#18211c'));
box('desk',2.2,.055,.92,.8,.9475,-1.42,wood);box('desk-apron',2.1,.07,.04,.8,.885,-.99,wood);box('desk-apron',2.1,.07,.04,.8,.885,-1.85,wood);for(const x of[-.28,1.88])for(const z of[-1.75,-1.08])box('desk-leg',.08,.9,.08,x,.45,z,dark);
box('monitor-frame',.74,.44,.035,.8,1.31,-1.69,dark);const screen=box('monitor-screen',.7,.4,.006,.8,1.31,-1.669,(m=>{m.color.multiplyScalar(1.7);return m})(label('BURHAN\nSelected work',.7,.4)));box('monitor-neck',.05,.15,.03,.8,1.04,-1.7,metal);box('monitor-foot',.26,.012,.17,.8,.987,-1.66,metal);
box('keyboard',.44,.022,.14,.8,.9875,-1.2,dark);for(let row=0;row<4;row++){
  for(let col=0;col<12;col++){
    const space=row===3&&col===3;
    if(row===3&&col>3&&col<8)continue;
    const x=.8+(col-5.5+(space?2:0))*.034;
    box('keycap',space?.163:.029,.008,.023,x,1.002,-1.2+(row-1.5)*.029,metal);
  }
}
box('mouse',.06,.03,.1,1.15,.99,-1.2,bone);

const chair=new T.Group();chair.position.set(1.0,0,-.55);chair.rotation.y=-.2;world.add(chair);contact(0,0,1.1,1.1,.5,chair);
{const fabric=new T.MeshStandardMaterial({color:'#1b2220',roughness:.88});fabric.envMapIntensity=.3;const plastic=mat('#0d1110',.45),chrome=mat('#8d968f',.25,.9);
const rr=(w,h,r)=>{const sh=new T.Shape();sh.moveTo(-w/2+r,-h/2);sh.lineTo(w/2-r,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);sh.lineTo(w/2,h/2-r);sh.quadraticCurveTo(w/2,h/2,w/2-r,h/2);sh.lineTo(-w/2+r,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);sh.lineTo(-w/2,-h/2+r);sh.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return sh;};
const slab=(w,h,t,r,m,bend)=>{const g=new T.ExtrudeGeometry(rr(w,h,r),{depth:t,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:5,curveSegments:14});g.translate(0,0,-t/2);const p=g.attributes.position;for(let k=0;k<p.count;k++){const x=p.getX(k);p.setZ(k,p.getZ(k)+bend*x*x);}g.computeVertexNormals();const o=new T.Mesh(g,m);o.castShadow=o.receiveShadow=true;return o;};
const seat=slab(.5,.48,.07,.09,fabric,.35);seat.rotation.x=Math.PI/2;seat.position.set(0,.5,0);chair.add(seat);
const pan=slab(.46,.44,.03,.08,plastic,0);pan.rotation.x=Math.PI/2;pan.position.set(0,.455,0);chair.add(pan);
const back=slab(.46,.5,.05,.1,fabric,-.9);back.rotation.y=Math.PI;back.position.set(0,.84,.26);back.rotation.x=-.12;chair.add(back);
const lumbar=slab(.34,.16,.04,.05,plastic,-.8);lumbar.rotation.y=Math.PI;lumbar.position.set(0,.66,.285);lumbar.rotation.x=-.12;chair.add(lumbar);
for(const sx2 of[-1,1]){cyl('arm-post',.014,.2,sx2*.27,.55,.06,plastic,chair);const pad=slab(.07,.26,.03,.03,plastic,0);pad.rotation.x=Math.PI/2;pad.position.set(sx2*.27,.66,.0);chair.add(pad);}
cyl('chair-lift',.032,.3,0,.31,0,chrome,chair);cyl('chair-hub',.05,.06,0,.17,0,plastic,chair);
for(let i=0;i<5;i++){const a=i*Math.PI*2/5,len=.3;const arm=box('chair-leg',len,.035,.055,Math.sin(a)*len/2,.1,Math.cos(a)*len/2,plastic,chair);arm.rotation.y=a-Math.PI/2;
cyl('caster-stem',.008,.04,Math.sin(a)*len,.075,Math.cos(a)*len,chrome,chair);const w=ball('wheel',.032,Math.sin(a)*len,.035,Math.cos(a)*len,plastic,chair);w.scale.set(1,1,.7);}}
for(const y of[.62,1.4,2.18])box('shelf',1.25,.07,.4,-2.45,y,-2.15,wood);for(let i=0;i<6;i++){const colors=['#c7a06f','#4c6b55','#d9d3b8'];box('book',.11,.36+(i%3)*.06,.23,-2.95+i*.15,.85,-2.15,mat(colors[i%3]));}
box('hardware-board',.56,.28,.12,-2.54,1.58,-2.14,green);for(let i=0;i<4;i++)box('chip',.07,.03,.06,-2.7+i*.11,1.75,-2.14,dark);cyl('sensor',.12,.2,-2.14,2.32,-2.15,bone);
box('game-poster-frame',.74,1.0,.04,-.88,2.2,-2.395,dark);box('game-poster',.68,.94,.01,-.88,2.2,-2.37,label('UNDAUNTED\nGame design',.68,.94));
const football=ball('football',.11,2.35,.11,1.5,bone);for(let i=0;i<8;i++){let a=i*Math.PI/4;const patch=new T.Mesh(new T.CircleGeometry(.037,5),dark);patch.position.set(Math.sin(a)*.109,Math.cos(a)*.075,.06);patch.lookAt(patch.position.clone().multiplyScalar(2));football.add(patch);}
cyl('plant-pot',.25,.4,2.9,.2,-2.0,mat('#beae89'));for(let i=0;i<9;i++){const a=i*2.4;const leaf=ball('leaf',.18,2.9+Math.sin(a)*.25,.65+i*.065,-2.0+Math.cos(a)*.23,green);leaf.scale.set(.45,1.9,.7);leaf.rotation.z=Math.sin(a)*.6;}
// Additional original, editable studio props.
box('desk-drawer',.52,.22,.55,-.05,.77,-1.43,wood);box('drawer-handle',.2,.025,.025,-.05,.77,-1.14,metal);
box('tablet',.25,.008,.17,.05,.982,-1.25,dark);box('tablet-glass',.23,.003,.15,.05,.987,-1.25,mat('#31534e',.25));
const mug=cyl('mug',.04,.095,1.6,1.023,-1.05,bone);cyl('coffee',.034,.003,1.6,1.068,-1.05,mat('#3a281f'));
box('lamp-base',.18,.02,.18,-.1,.985,-1.7,dark);const lampStem=cyl('lamp-stem',.01,.4,-.1,1.18,-1.7,metal);lampStem.rotation.z=-.25;const lampShade=cyl('lamp-shade',.07,.09,-.04,1.38,-1.7,dark);lampShade.rotation.z=.25;
box('speaker-left',.13,.22,.13,.3,1.085,-1.78,dark);box('speaker-right',.13,.22,.13,1.3,1.085,-1.78,dark);ball('speaker-cone',.035,.3,1.09,-1.71,metal);ball('speaker-cone',.035,1.3,1.09,-1.71,metal);

function contact(x,z,w,d,o=.55,parent=world){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,8,64,64,64);gr.addColorStop(0,'rgba(0,0,0,'+o+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.008,z);parent.add(m);}
contact(.8,-1.42,3.1,1.8,.6);contact(4.15,-2.05,3.3,1.5,.55);contact(-2.45,-2.1,1.9,.9,.5);contact(2.7,-.5,.9,.9,.5);
// Right bay: gaming PC, hardware bench, pegboard and an idea on the bench.
const glow=c=>new T.MeshBasicMaterial({color:c,toneMapped:false}),rgbMats=[],rgb=()=>{const m=glow('#6cf');rgbMats.push(m);return m;};
const steel=mat('#59635d',.35,.7),benchWood=mat('#8a6a48',.6),BX=6.6;
const pc=new T.Group();pc.position.set(1.72,1.255,-1.5);world.add(pc);
box('pc-case',.26,.56,.5,0,0,0,mat('#10151a',.4,.5),pc);box('pc-glass',.01,.5,.44,-.131,0,0,new T.MeshPhysicalMaterial({color:'#0c1a22',transparent:true,opacity:.4,roughness:.1,metalness:.2}),pc);
for(let k=0;k<3;k++){const ring=new T.Mesh(new T.TorusGeometry(.07,.007,8,28),rgb());ring.rotation.y=Math.PI/2;ring.position.set(-.128,.17-k*.17,-.13);pc.add(ring);const hub=ball('fan-hub',.018,-.126,.17-k*.17,-.13,rgb(),pc);}
box('pc-gpu',.06,.05,.26,-.085,-.12,.07,dark,pc);box('pc-gpu-strip',.004,.012,.24,-.119,-.12,.07,rgb(),pc);cyl('pc-tube',.011,.4,-.12,.02,.2,rgb(),pc);
box('pc-board',.015,.4,.3,.1,.02,.06,mat('#1b2a24'),pc);
box('desk-underglow',2.4,.012,.03,.8,.865,-1.0,rgb());
const rgbLight=new T.PointLight('#66ccff',.5,1.6,2);rgbLight.position.set(1.5,1.3,-1.5);world.add(rgbLight);
// Desk hardware: anti-static mat with a ground stud and a dev board he touches before building.
box('esd-mat',.5,.004,.34,1.3,.977,-1.1,mat('#1f4a35',.8));ball('esd-stud',.01,1.5,.985,-1.2,metal);box('dev-board',.08,.008,.052,1.22,.983,-1.1,green);box('dev-chip',.02,.006,.02,1.23,.99,-1.1,dark);box('dev-servo',.04,.035,.02,1.38,.995,-1.02,mat('#3f7cc4',.5));
const ledMat=glow('#ff4d4d');ball('dev-led',.005,1.2,.99,-1.12,ledMat);
// Pegboard
function pegTexture(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#34413b';x.fillRect(0,0,512,512);x.fillStyle='#141a17';for(let i=0;i<16;i++)for(let j=0;j<16;j++){x.beginPath();x.arc(i*32+16,j*32+16,5,0,7);x.fill();}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(4.4,3);t.encoding=T.sRGBEncoding;t.anisotropy=8;return t;}
box('pegboard',2.2,1.5,.04,BX,2.2,-2.43,new T.MeshStandardMaterial({map:pegTexture(),roughness:.8}));
box('pegboard-edge',2.28,.04,.07,BX,2.96,-2.41,benchWood);box('pegboard-edge',2.28,.04,.07,BX,1.44,-2.41,benchWood);
box('hardware-plaque',1.0,.15,.02,BX,3.18,-2.4,label('Hardware lab',1.0,.15));
box('peg-led',2.2,.02,.04,BX,3.06,-2.39,glow('#d7e8ff'));
const pegLight=new T.PointLight('#dbeaff',.9,3.6,2);pegLight.position.set(BX,2.9,-1.9);world.add(pegLight);
const toolCols=['#d4553d','#e3b341','#3f7cc4','#5a9a5c','#c98040','#8b6cc1'];
toolCols.forEach((c,i)=>{const x=BX-.85+i*.12;cyl('sd-handle',.017,.11,x,2.74,-2.38,mat(c,.5));cyl('sd-shaft',.0045,.15,x,2.6,-2.38,metal);});
for(const d of[-.12,.12]){const h=box('pliers-handle',.022,.17,.012,BX-.1+d*.4,2.6,-2.385,mat('#c8453a',.5));h.rotation.z=d;}
box('pliers-jaw',.05,.07,.014,BX-.1,2.48,-2.385,metal);
box('wrench-shaft',.032,.26,.01,BX+.28,2.58,-2.385,metal);box('wrench-head',.08,.05,.01,BX+.28,2.72,-2.385,metal);
box('hammer-handle',.02,.26,.02,BX+.55,2.56,-2.385,benchWood);box('hammer-head',.1,.045,.035,BX+.55,2.7,-2.375,dark);
[['#c8453a',-.75],['#171d1b',-.53],['#e3b341',-.31]].forEach(([c,dx])=>{const coil=new T.Mesh(new T.TorusGeometry(.062,.02,10,24),mat(c,.6));coil.position.set(BX+dx,2.02,-2.385);coil.castShadow=true;world.add(coil);});
const tape=cyl('tape-measure',.05,.035,BX+.2,2.02,-2.375,mat('#e3b341',.5));tape.rotation.x=Math.PI/2;
box('peg-shelf',2.0,.03,.11,BX,1.62,-2.37,benchWood);
['#d4553d','#3f7cc4','#5a9a5c','#e3b341','#8b6cc1'].forEach((c,i)=>box('parts-bin',.2,.11,.09,BX-.8+i*.4,1.69,-2.37,mat(c,.55)));
// Bench
box('bench-top',2.5,.07,.82,BX,.95,-2.05,benchWood);for(const dx of[-1.18,1.18])for(const dz of[-.34,.34])box('bench-leg',.07,.91,.07,BX+dx,.455,-2.05+dz,steel);
box('bench-shelf',2.4,.035,.7,BX,.32,-2.05,benchWood);box('toolbox',.5,.22,.28,BX-.7,.45,-2.05,mat('#a23d30',.5));box('toolbox-handle',.3,.03,.03,BX-.7,.58,-2.05,metal);box('crate',.4,.25,.32,BX+.3,.46,-2.05,mat('#2f3c36'));box('crate',.34,.2,.3,BX+.8,.44,-2.05,mat('#40513f'));
const sbx=BX-.8;
box('solder-base',.2,.07,.16,sbx,1.02,-2.12,dark);box('solder-display',.06,.025,.005,sbx-.03,1.03,-2.037,glow('#ff5a3c'));cyl('solder-knob',.018,.02,sbx+.05,1.03,-2.037,metal).rotation.x=Math.PI/2;
box('iron-stand',.06,.06,.06,sbx+.3,1.015,-2.0,dark);const iron=cyl('iron-handle',.011,.18,sbx+.32,1.06,-2.0,mat('#2c3a46',.6));iron.rotation.z=Math.PI/2;const tip=cyl('iron-tip',.004,.07,sbx+.44,1.06,-2.0,metal);tip.rotation.z=Math.PI/2;ball('iron-heat',.006,sbx+.48,1.06,-2.0,glow('#ff8040'));
cyl('helper-base',.05,.015,sbx-.12,.995,-1.85,dark);cyl('helper-post',.004,.24,sbx-.12,1.11,-1.85,metal);const lens=new T.Mesh(new T.TorusGeometry(.055,.005,8,24),metal);lens.position.set(sbx-.12,1.26,-1.8);lens.castShadow=true;world.add(lens);
const glass=new T.Mesh(new T.CircleGeometry(.05,24),new T.MeshBasicMaterial({color:'#bfe3ff',transparent:true,opacity:.18}));glass.position.copy(lens.position);world.add(glass);
const spool=cyl('solder-spool',.045,.05,sbx+.2,1.01,-2.3,mat('#9aa39b',.35,.6));
const scopeScreen=(()=>{const c=document.createElement('canvas');c.width=256;c.height=170;const x=c.getContext('2d');x.fillStyle='#07140c';x.fillRect(0,0,256,170);x.strokeStyle='rgba(120,255,160,.18)';for(let i=1;i<8;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32,170);x.stroke();}for(let j=1;j<6;j++){x.beginPath();x.moveTo(0,j*28);x.lineTo(256,j*28);x.stroke();}x.strokeStyle='#6dff9b';x.lineWidth=2.5;x.beginPath();for(let i=0;i<=256;i++){const y=85+Math.sin(i/256*Math.PI*6)*30*(i%64<32?1:.55);i?x.lineTo(i,y):x.moveTo(i,y);}x.stroke();const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;})();
box('scope',.36,.26,.28,BX,1.12,-2.25,mat('#2a3b45',.5));const scr=new T.Mesh(new T.PlaneGeometry(.24,.16),new T.MeshBasicMaterial({map:scopeScreen,toneMapped:false}));scr.position.set(BX-.04,1.14,-2.108);world.add(scr);
for(let i=0;i<3;i++){const k=cyl('scope-knob',.016,.02,BX+.1,1.2-i*.06,-2.1,metal);k.rotation.x=Math.PI/2;}
box('breadboard',.17,.016,.055,BX+.6,.995,-1.9,bone);box('mcu-board',.068,.01,.05,BX+.48,.995,-1.78,green);box('mcu-chip',.02,.006,.02,BX+.48,1.002,-1.78,dark);
['#ff4d4d','#5dff8a','#5aa8ff','#ffd24d'].forEach((c,i)=>ball('led',.005,BX+.55+i*.03,1.006,-1.9,glow(c)));
['#e3b341','#d4553d','#3f7cc4'].forEach((c,i)=>{const w=box('jumper',.05,.003,.003,BX+.56+i*.03,1.01,-1.9,mat(c,.5));w.rotation.y=i*.6;});
const meter=box('multimeter',.11,.18,.04,BX+1.05,1.08,-2.2,mat('#e3b341',.5));meter.rotation.set(-.3,-.3,0);box('multimeter-screen',.07,.04,.005,BX+1.05,1.12,-2.17,glow('#9fe29a')).rotation.set(-.3,-.3,0);
// The idea: a bulb that floats above the bench, ringed by small parts.
const idea=new T.Group();idea.name='prototype';idea.position.set(BX,1.3,-1.72);world.add(idea);cyl('idea-plinth',.05,.07,BX,1.02,-1.72,metal);
const bulb=new T.Mesh(new T.SphereGeometry(.095,24,16),new T.MeshBasicMaterial({color:'#ffe6a8',transparent:true,opacity:.92,toneMapped:false}));idea.add(bulb);cyl('idea-base',.035,.06,0,-.12,0,metal,idea);
const fil=new T.Mesh(new T.TorusGeometry(.03,.004,6,20),glow('#fff7d8'));idea.add(fil);
const ideaChips=[];for(let i=0;i<5;i++){const c=box('idea-chip',.04,.012,.04,0,0,0,mat(['#d4553d','#3f7cc4','#5a9a5c','#e3b341','#8b6cc1'][i],.5),idea);ideaChips.push(c);}
const ideaLight=new T.PointLight('#ffd896',.9,2.6,2);idea.add(ideaLight);
const frameM=mat('#d9d3c3',.6);
box('window-top',.08,.07,1.74,-3.4,2.96,-.2,frameM);box('window-bottom',.1,.07,1.74,-3.39,1.34,-.2,frameM);box('window-l',.08,1.6,.07,-3.4,2.15,-1.04,frameM);box('window-r',.08,1.6,.07,-3.4,2.15,.64,frameM);
box('window-cross-v',.05,1.6,.04,-3.43,2.15,-.2,frameM);box('window-cross-h',.05,.04,1.65,-3.43,2.15,-.2,frameM);
const sky=(()=>{const c=document.createElement('canvas');c.width=8;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#33587a');g.addColorStop(.6,'#9fb7c7');g.addColorStop(1,'#f0c48e');x.fillStyle=g;x.fillRect(0,0,8,256);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;})();
const skyPane=new T.Mesh(new T.PlaneGeometry(1.9,1.9),new T.MeshBasicMaterial({map:sky,toneMapped:false,color:'#ffffff'}));skyPane.position.set(-3.8,2.15,-.2);skyPane.rotation.y=Math.PI/2;world.add(skyPane);
const person=new T.Group();person.name='Burhan';world.add(person);person.visible=false;
const shoeVertices={Left:[],Right:[]},solePoint=new T.Vector3();
let avatar=null,poseTracks=[],walkDuration=4.2,spine=null,spineRest=null,loadFailed=false,lastAvatarShadowState=null;
const hologram={solid:{value:0},time:{value:0},visibility:{value:1},head:{value:new T.Vector3()},headR:{value:0}};
const padMat=new T.MeshBasicMaterial({color:'#4fd8ff',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
const pad=new T.Group();[[.38,.42],[.62,.64],[.9,.915]].forEach(([i,o])=>{const r=new T.Mesh(new T.RingGeometry(i,o,72),padMat);r.rotation.x=-Math.PI/2;pad.add(r);});pad.position.y=.035;world.add(pad);
const MOTES=140,motePos=new Float32Array(MOTES*3),moteSeed=Array.from({length:MOTES},()=>[Math.random()*6.28,.15+Math.random()*.5,Math.random()]);
const moteGeo=new T.BufferGeometry();moteGeo.setAttribute('position',new T.BufferAttribute(motePos,3));
const moteMat=new T.PointsMaterial({color:'#8fe6ff',size:.022,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
const motes=new T.Points(moteGeo,moteMat);motes.frustumCulled=false;world.add(motes);
const scanLight=new T.PointLight('#71d9ee',0,2.5,2);world.add(scanLight);
new GLTFLoader().load('./outputs/burhan-fingers.glb', gltf=>{
  avatar=gltf.scene;
  const clip=gltf.animations[0];
  if(clip){
    walkDuration=clip.duration;
    poseTracks=clip.tracks.map(track=>{
      const dot=track.name.lastIndexOf('.'),name=track.name.slice(0,dot),property=track.name.slice(dot+1);
      const bone=avatar.getObjectByName(name);if(!bone)return null;
      const rest=bone[property].clone(),idle=rest.clone(),interpolant=track.createInterpolant();
      // The torso and lower body retain the upright bind pose. Arms relax at the sides.
      if(/Arm|Shoulder|Hand/.test(name) && property==='quaternion'){
        idle.fromArray(track.values,0);
        for(let i=1;i<track.times.length;i++)idle.slerp(new T.Quaternion().fromArray(track.values,i*4),1/(i+1));
      }
      return {bone,property,idle,interpolant,sample:rest.clone()};
    }).filter(Boolean);
  }
  spine=avatar.getObjectByName('Spine02');spineRest=spine?.quaternion.clone();
  avatar.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=false;o.castShadow=true;o.receiveShadow=false;
    const materials=(Array.isArray(o.material)?o.material:[o.material]).map(original=>{
      const headIndex=o.skeleton?.bones.findIndex(b=>b.name==='Head')??-1;
      const m=original.clone();m.transparent=true;m.side=T.DoubleSide;
      m.onBeforeCompile=shader=>{
        shader.uniforms.uSolid=hologram.solid;shader.uniforms.uTime=hologram.time;shader.uniforms.uVisibility=hologram.visibility;shader.uniforms.uHead=hologram.head;shader.uniforms.uHeadR=hologram.headR;
        shader.vertexShader='uniform float uSolid; uniform float uTime; varying vec3 vHoloPosition; varying float vHeadMask;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
          vHeadMask=dot(skinWeight,vec4(equal(skinIndex,vec4(${headIndex.toFixed(1)}))));
          float band=step(.94,sin(transformed.y*23.0+uTime*5.0)*sin(transformed.y*7.0-uTime*2.3));
          transformed.x+=band*.006*(1.0-uSolid);`);
        shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvHoloPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
        shader.fragmentShader='uniform float uSolid; uniform float uTime; uniform float uVisibility; uniform vec3 uHead; uniform float uHeadR; varying vec3 vHoloPosition; varying float vHeadMask;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <output_fragment>',`
          if(uHeadR>0.0&&vHeadMask>.15&&length(vHoloPosition-uHead)<uHeadR)discard;
          float h=uSolid*2.1,front=vHoloPosition.y-h;
          float real=1.0-smoothstep(-.02,.05,front);
          // Preserve the underlying face, fabric and visor shading within the projection.
          float rim=pow(clamp(1.0-abs(dot(normalize(vNormal),normalize(vViewPosition))),0.0,1.0),2.0);
          float scanWave=0.5+0.5*cos(vHoloPosition.y*114.0-uTime*1.8);
          float lines=pow(scanWave,6.0)/(1.0+fwidth(vHoloPosition.y)*114.0);
          float value=dot(outgoingLight,vec3(.2126,.7152,.0722));
          vec3 glass=mix(vec3(.018,.09,.13),vec3(.30,.74,.75),value/(value+.17));
          float seam=exp(-abs(front)*49.0);
          vec3 holo=glass+outgoingLight*.22+vec3(.13,.61,.72)*(rim*.95+lines*.13)
            +vec3(.65,.97,.86)*seam*1.35;
          float holoA=clamp(.69+rim*.24+lines*.05,0.,1.);
          outgoingLight=mix(holo,outgoingLight,real);
          diffuseColor.a*=mix(holoA,1.0,real)*uVisibility;
          #include <output_fragment>`);
      };
      return m;
    });o.material=Array.isArray(o.material)?materials:materials[0];
  });
  person.add(avatar);
  // Keep a small mesh-space sole sample, so contact is based on the shoe, not an assumed ankle height.
  avatar.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;
    const indices=mesh.geometry.attributes.skinIndex,weights=mesh.geometry.attributes.skinWeight;
    if(!indices||!weights)return;
    for(const side of ['Left','Right']){
      const joints=new Set(mesh.skeleton.bones.map((b,i)=>b.name===side+'Foot'||b.name===side+'ToeBase'?i:-1).filter(i=>i>=0));
      const vertices=[];
      for(let i=0;i<indices.count;i++){let influence=0;for(let k=0;k<4;k++)if(joints.has(indices.getComponent?indices.getComponent(i,k):indices.array[i*4+k]))influence+=weights.array[i*4+k];if(influence>.8)vertices.push(i);}
      shoeVertices[side].push({mesh,vertices});
    }
  });
  person.visible=true;canvas.dataset.loaded='true';
},undefined,()=>{loadFailed=true;canvas.dataset.loaded='failed';});
// Every frame starts from an absolute pose. No rotations accumulate between frames.
const secEuler=new T.Euler(),secQuat=new T.Quaternion(),breathQuaternion=new T.Quaternion(),breathAxis=new T.Vector3(1,0,0);
function samplePose(time,weight,breathing){
  for(const t of poseTracks){
    t.sample.fromArray(t.interpolant.evaluate(time));
    t.bone[t.property].copy(t.idle);
    if(t.property==='quaternion')t.bone.quaternion.slerp(t.sample,weight);
    else t.bone[t.property].lerp(t.sample,weight);
  }
  if(weight>.001&&walkDuration){
    // Secondary motion: pelvis roll, counter-rotating torso, forward lean and a steadied head.
    const ph=time/walkDuration*Math.PI*2,w=weight;
    const hp=avatar.getObjectByName('Hips'),sp=avatar.getObjectByName('Spine01'),hd=avatar.getObjectByName('Head');
    const add=(bone,x,y,z)=>{if(!bone)return;secEuler.set(x,y,z);secQuat.setFromEuler(secEuler);bone.quaternion.multiply(secQuat);};
    add(hp,0,0,0);
    add(sp,0,-Math.sin(ph)*.025*w,0);
    add(spine,0,0,0);
    add(hd,0,0,0);
  }
  if(spine&&spineRest){
    breathQuaternion.setFromAxisAngle(breathAxis,Math.sin(breathing*1.65)*.006*(1-weight));
    spine.quaternion.multiply(breathQuaternion);
  }
}
// Two-bone arm IK: hands settle on the keyboard and type once the walk ends.
const ikA=new T.Vector3(),ikB=new T.Vector3(),ikC=new T.Vector3(),ikE=new T.Vector3(),ikU=new T.Vector3(),ikP=new T.Vector3(),ikT=new T.Vector3(),ikQ=new T.Quaternion(),ikPQ=new T.Quaternion();
function aim(bone,from,to){bone.updateWorldMatrix(true,false);bone.getWorldQuaternion(ikQ);ikQ.premultiply(new T.Quaternion().setFromUnitVectors(from,to));bone.parent.getWorldQuaternion(ikPQ);bone.quaternion.copy(ikPQ.invert().multiply(ikQ));bone.updateMatrixWorld(true);}
function solveArm(side,target,pole,weight,names=['Arm','ForeArm','Hand']){
  const up=avatar.getObjectByName(side+names[0]),fo=avatar.getObjectByName(side+names[1]),ha=avatar.getObjectByName(side+names[2]);if(!up||!fo||!ha)return;
  up.getWorldPosition(ikA);fo.getWorldPosition(ikB);ha.getWorldPosition(ikC);
  const l1=ikA.distanceTo(ikB),l2=ikB.distanceTo(ikC);
  ikT.copy(ikC).lerp(target,weight);
  const d=Math.min(Math.max(ikA.distanceTo(ikT),.05),(l1+l2)*.995);ikU.subVectors(ikT,ikA).normalize();
  const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));
  ikP.copy(pole).addScaledVector(ikU,-pole.dot(ikU)).normalize();
  ikE.copy(ikA).addScaledVector(ikU,a).addScaledVector(ikP,h);
  aim(up,ikB.clone().sub(ikA).normalize(),ikE.clone().sub(ikA).normalize());
  fo.getWorldPosition(ikB);ha.getWorldPosition(ikC);
  ikT.copy(ikA).addScaledVector(ikU,d);
  aim(fo,ikC.clone().sub(ikB).normalize(),ikT.clone().sub(ikB).normalize());
}
// Seated: hips drop to the chair seat and both legs fold under the desk.
const SEAT_HIP=.66,footL=new T.Vector3(),footR=new T.Vector3(),kneePole=new T.Vector3(),headEye=new T.Vector3();let headBone=null;
function sitAt(weight,hipY=SEAT_HIP){
  if(weight<=0||!avatar)return;const hips=avatar.getObjectByName('Hips');if(!hips)return;
  person.updateMatrixWorld(true);hips.getWorldPosition(tmpV);tmpV.y+=(hipY-tmpV.y)*weight;hips.position.copy(hips.parent.worldToLocal(tmpV));hips.updateMatrixWorld(true);
  const l=avatar.getObjectByName('LeftUpLeg'),r=avatar.getObjectByName('RightUpLeg');if(!l||!r)return;
  l.getWorldPosition(ikA);r.getWorldPosition(ikB);
  const fx=Math.sin(person.rotation.y),fz=Math.cos(person.rotation.y),off=hipY===SEAT_HIP?.46:.40;
  // Plant the feet relative to the seat while the pelvis settles into it.
  const contactX=hipY===SEAT_HIP?.8:person.position.x;
  footL.set(contactX+.13*fz+fx*off,.15,person.position.z-.13*fx+fz*off);footR.set(contactX-.13*fz+fx*off,.15,person.position.z+.13*fx+fz*off);kneePole.set(fx,.35,fz);
  for(const [side,target] of [['Left',footL],['Right',footR]]){
    const foot=avatar.getObjectByName(side+'Foot');
    const level=foot.getWorldQuaternion(new T.Quaternion());
    solveArm(side,target,kneePole,weight,['UpLeg','Leg','Foot']);
    const parentRotation=foot.parent.getWorldQuaternion(new T.Quaternion());
    foot.quaternion.slerp(parentRotation.invert().multiply(level),weight);
    // Correct actual sole penetration after IK; ankle origin alone is not a contact point.
    for(let pass=0;pass<2;pass++){
      person.updateMatrixWorld(true);let lowest=Infinity;
      for(const {mesh,vertices} of shoeVertices[side]){
        mesh.skeleton.update();
        for(const index of vertices){solePoint.fromBufferAttribute(mesh.geometry.attributes.position,index);mesh.boneTransform(index,solePoint);solePoint.applyMatrix4(mesh.matrixWorld);lowest=Math.min(lowest,solePoint.y);}
      }
      const lift=.022-lowest;if(!(lift>.001))break;
      target.y+=Math.min(.08,lift/Math.max(weight,.1));
      solveArm(side,target,kneePole,weight,['UpLeg','Leg','Foot']);
      foot.parent.getWorldQuaternion(parentRotation);
      foot.quaternion.copy(parentRotation.invert().multiply(level));
    }

  }
}
const UPV=new T.Vector3(0,1,0),touchT=new T.Vector3(),restL=new T.Vector3(.72,1,-1.05);
function groundAt(p,t){
  if(!avatar)return;
  const weight=phase(p,.675,.69)*(1-phase(p,.70,.72));
  if(weight>0){
    touchT.set(1.22,.995+Math.sin(t*7)*.008,-1.1);
    handsTo(weight,restL,touchT,poleL.set(-.5,-1,.5),poleR.set(.5,-1,.5));
  }
  ledMat.color.set(p>.69?'#5dff8a':'#ff4d4d');
}
const keyL=new T.Vector3(),keyR=new T.Vector3(),poleL=new T.Vector3(),poleR=new T.Vector3(),tmpV=new T.Vector3();
function handsTo(weight,a,b,pa,pb){
  const lw=avatar.getObjectByName('LeftArm'),rw=avatar.getObjectByName('RightArm');if(!lw||!rw)return;
  lw.getWorldPosition(ikA);rw.getWorldPosition(ikB);const swap=ikA.x>ikB.x;
  solveArm('Left',swap?b:a,swap?pb:pa,weight);solveArm('Right',swap?a:b,swap?pa:pb,weight);
}
// The hand bones are wrists. Fingertips extend about 19 cm along local +Y.
const typingRotation=new T.Quaternion(),wristParent=new T.Quaternion();
function typeAt(weight,t){
  if(weight<=0||!avatar)return;
  person.updateMatrixWorld(true);
  for(const [side,x,beat] of [['Left',.70,0],['Right',.90,2.7]]){
    const lift=(1-Math.cos(t*8+beat))*.5;
    const wrist=side==='Left'?keyL:keyR;
    wrist.set(x+.016*Math.sin(t*1.6+beat),1.052+.009*lift,-1.015);
    const outward=side==='Left'?-1:1;
    solveArm(side,wrist,tmpV.set(outward*.55,-1,.4),weight);
    const hand=avatar.getObjectByName(side+'Hand');
    if(!hand)continue;
    // Aim fingers over the keys; keep the orientation stable while the elbow bends.
    typingRotation.setFromEuler(secEuler.set(-Math.PI/2-.125+.035*lift,0,0));
    hand.parent.getWorldQuaternion(wristParent);
    // Share axial rotation with the forearm rather than wringing the wrist mesh.
    const relative=wristParent.clone().invert().multiply(typingRotation);
    const twist=new T.Quaternion(0,relative.y,0,relative.w).normalize();
    hand.parent.quaternion.multiply(new T.Quaternion().slerp(twist,weight*.85));
    hand.parent.updateMatrixWorld(true);
    hand.parent.getWorldQuaternion(wristParent);
    hand.quaternion.slerp(wristParent.invert().multiply(typingRotation),weight);
  }
}
// Support the seated pose with hands resting over the thighs, clear of armrests.
function seatedHands(weight,height=.69){
  if(weight<=0||!avatar)return;
  person.updateMatrixWorld(true);
  for(const [side,sign] of [['Left',1],['Right',-1]]){
    handA.set(sign*.15,height,.10);person.localToWorld(handA);
    tmpV.set(sign*.5,-1,.1).applyAxisAngle(UPV,person.rotation.y);
    solveArm(side,handA,tmpV,weight);
    const hand=avatar.getObjectByName(side+'Hand');if(!hand)continue;
    typingRotation.setFromAxisAngle(UPV,person.rotation.y-Math.PI).multiply(secQuat.setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2));
    hand.parent.getWorldQuaternion(wristParent);hand.quaternion.slerp(wristParent.invert().multiply(typingRotation),weight);
  }
}
// Finger angles are absolute, so reversing the tour always releases the keys.
const fingerNames=['Little','Ring','Middle','Index','Thumb'];
const fingerKeys=['a','s','d','f',' ',';','l','k','j',' '];
const heldKeys=new Set(),keycaps=world.children.filter(o=>o.name==='keycap');
const ray=new T.Raycaster(),tapPoint=new T.Vector2();
let manualUntil=0,touchFinger=-1,touchEnd=0;
const keyPulse=new Map(),bend=new Float32Array(10);
canvas.addEventListener('pointerdown',event=>{
  if(dest!=='desk'||progress<.94||paused)return;
  const rect=canvas.getBoundingClientRect();
  tapPoint.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
  ray.setFromCamera(tapPoint,camera);
  const hit=ray.intersectObjects(keycaps,false)[0];
  if(!hit)return;
  const key=hit.object;
  touchFinger=key.geometry.parameters.width>.1?4:Math.min(7,Math.floor((key.position.x-.595)/.052));
  touchFinger=[0,1,2,3,8,7,6,5][Math.max(0,touchFinger)];
  if(key.geometry.parameters.width>.1)touchFinger=4;
  touchEnd=clock+.24;manualUntil=clock+1;
});
window.addEventListener('keydown',e=>{
  if(isProjectOpen()||e.ctrlKey||e.metaKey||e.altKey||dest!=='desk'||progress<.75||paused)return;
  if(e.target.closest('input,textarea,select,[contenteditable=true]'))return;
  if(e.key===' '&&e.target.closest('button,a'))return;
  const key=e.key.toLowerCase();
  if(fingerKeys.includes(key)){e.preventDefault();heldKeys.add(key);keyPulse.set(key,clock+.16);manualUntil=clock+2;}
});
window.addEventListener('keyup',e=>heldKeys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>heldKeys.clear());
let fingers=null;
function animateFingers(weight,t,dt){
  if(!avatar)return;
  if(!fingers)fingers=['Left','Right'].flatMap(side=>fingerNames.map(name=>[
    avatar.getObjectByName(side+name+'Base'),avatar.getObjectByName(side+name+'Tip')
  ]));
  fingers.forEach(([base,tip],i)=>{
    if(!base||!tip)return;
    const manual=heldKeys.size>0||clock<manualUntil;
    const tap=manual?Number(heldKeys.has(fingerKeys[i])||t<(keyPulse.get(fingerKeys[i])||0)||(i===touchFinger&&clock<touchEnd)):Math.pow(Math.max(0,Math.cos(t*6+i*2.39)),4);
    bend[i]+= (tap-bend[i])*(1-Math.exp(-dt*22));
    base.rotation.x=-weight*(.035+.12*bend[i]);tip.rotation.x=-weight*(.035+.20*bend[i]);
  });
}
// Idle: he works the headset with air gestures, hands lifted in front of his chest.
function gestureAt(weight,t){
  if(weight<=0||!avatar)return;person.updateMatrixWorld(true);
  // This rig's left side is local +X. Keep each wrist on its own side
  // even when the seated actor faces across the room.
  const shoulder=avatar.getObjectByName('RightArm');
  if(!shoulder)return;
  shoulder.getWorldPosition(tmpV);
  const shoulderHeight=person.worldToLocal(tmpV).y;
  const reach=.018*Math.sin(t*1.6);
  keyR.set(-.235,shoulderHeight-.13+reach,.36+reach);
  keyL.set(.19,shoulderHeight-.45,.20);
  person.localToWorld(keyL);person.localToWorld(keyR);
  const yaw=person.rotation.y;
  poleL.set(.65,-1,-.18).applyAxisAngle(UPV,yaw);
  poleR.set(-.65,-1,-.18).applyAxisAngle(UPV,yaw);
  solveArm('Left',keyL,poleL,weight);
  solveArm('Right',keyR,poleR,weight);
}
const VP=[[-1.15,1.5,.8,'Unreal Engine',['Digital twins','Animation','Real-time VFX']],[1.15,1.62,.78,'AI',['Assistants','Voice','Interaction']],[1.7,1.2,.66,'Hardware',['Sensors','Medtech','Prototypes']]].map(([ang,y,r,title,rows])=>{
  const c=document.createElement('canvas');c.width=512;c.height=340;const x=c.getContext('2d');
  x.fillStyle='rgba(12,34,44,.78)';x.beginPath();x.roundRect(4,4,504,332,28);x.fill();x.strokeStyle='rgba(120,225,255,.9)';x.lineWidth=4;x.stroke();
  x.fillStyle='#bff3ff';x.font='500 44px "Libre Franklin",Arial';x.fillText(title,34,78);
  rows.forEach((t,i)=>{x.fillStyle='rgba(120,225,255,.25)';x.beginPath();x.roundRect(34,112+i*68,444,50,14);x.fill();x.fillStyle='#e8fbff';x.font='28px "Libre Franklin",Arial';x.fillText(t,54,147+i*68);});
  const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;
  const m=new T.Mesh(new T.PlaneGeometry(.5,.33),new T.MeshBasicMaterial({map:tx,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));m.userData={ang,y,r};m.visible=false;world.add(m);return m;});
function floatWindows(weight,t){
  VP.forEach((m,i)=>{m.visible=weight>.01;if(!m.visible)return;const {ang,y,r}=m.userData;
    m.position.set(person.position.x+Math.sin(ang)*r,y+Math.sin(t*1.2+i*2)*.025,person.position.z+Math.cos(ang)*r);
    m.rotation.y=ang*.55;m.material.opacity=Math.min(1,weight*1.6)*.92;m.scale.setScalar(.6+.4*Math.min(1,weight*2));});
}
// Soft cool fill, warm key and a rim separate the character from the room.
// One window key through a real opening, low ambient, warm lamp: the room is lit by the same light the shafts show.
scene.add(new T.HemisphereLight('#aebfd2','#2a2218',.16));
const sun=new T.DirectionalLight('#bcd2e3',1.15);sun.position.set(-7.5,4.8,-1.2);sun.target.position.set(.8,0,-.5);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-6,right:7,top:6,bottom:-6,near:1,far:20});sun.shadow.normalBias=.02;sun.shadow.bias=-.0002;scene.add(sun);
const fill=new T.DirectionalLight('#9db6d0',.16);fill.position.set(1.5,2.5,6);scene.add(fill);
const rim=new T.DirectionalLight('#ffdeb4',.16);rim.position.set(3,3,-3);scene.add(rim);
const lamp=new T.SpotLight('#ffd19d',3.0,4.5,.8,.9,2);lamp.position.set(-.04,1.4,-1.7);lamp.target.position.set(.35,.98,-1.25);lamp.castShadow=true;lamp.shadow.mapSize.set(1024,1024);lamp.shadow.bias=-.0004;lamp.shadow.normalBias=.01;scene.add(lamp,lamp.target);
const lampBounce=new T.PointLight('#ffb870',.25,3,2);lampBounce.position.set(-.1,1.5,-1.4);scene.add(lampBounce);
const portfolio=createMonitorPortfolio({screen,camera,canvas});
const hardwareProjects=createHardwareProjects({world,camera,canvas});
const monitorLight=new T.PointLight('#8fe3c8',.55,2.4,2);monitorLight.position.set(.8,1.3,-1.25);scene.add(monitorLight);
const roomLight=new T.PointLight('#eedbc4',.48,14,1.8);roomLight.position.set(1.2,3.2,1.4);scene.add(roomLight);
// Slatted wall and flush acoustic panels give the studio a physical architectural rhythm.
for(let i=0;i<22;i++)box('walnut-slat',.055,3.5,.065,-3.3+i*.075,1.75,-2.37,wood);
box('acoustic-panel',1.6,1.03,.08,.8,2.85,-2.35,mat('#272e2a'));
for(let i=0;i<30;i++)box('panel-rib',.016,.96,.02,.06+i*.051,2.85,-2.295,dark);
// Drifting dust catches the lamp light and gives the air depth.
const DUST=240,dustPos=new Float32Array(DUST*3),dustSeed=new Float32Array(DUST);
for(let i=0;i<DUST;i++){dustPos.set([(Math.random()-.5)*6,.2+Math.random()*2.8,-2+Math.random()*6.5],i*3);dustSeed[i]=Math.random()*6.28;}
const dustGeo=new T.BufferGeometry();dustGeo.setAttribute('position',new T.BufferAttribute(dustPos,3));
const dustMat=new T.PointsMaterial({color:'#ffd9a8',size:.014,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending,fog:true});
const dust=new T.Points(dustGeo,dustMat);dust.frustumCulled=false;scene.add(dust);
function driftDust(t){const a=dustGeo.attributes.position;for(let i=0;i<DUST;i++){a.setXYZ(i,dustPos[i*3]+Math.sin(t*.12+dustSeed[i])*.25,dustPos[i*3+1]+Math.sin(t*.09+dustSeed[i]*2)*.18,dustPos[i*3+2]+Math.cos(t*.1+dustSeed[i])*.2);}a.needsUpdate=true;}
const chapterItems=[...document.querySelectorAll('.chapters li')],chapterOf={hologram:0,turn:1,walk:2,ground:3,type:3,'pov-transition':3,pov:3};let lastPhase='';
// Rain falls outside the window, behind the wall, so it is only visible through the opening.
const RAIN=140,rainPos=new Float32Array(RAIN*6),rainSpeed=new Float32Array(RAIN),rainLen=new Float32Array(RAIN);
for(let i=0;i<RAIN;i++){rainSpeed[i]=1.6+Math.random()*1.4;rainLen[i]=.06+Math.random()*.14;rainPos[i*6+1]=1.3+Math.random()*1.7;rainPos[i*6]=rainPos[i*6+3]=-3.5-Math.random()*.28;rainPos[i*6+2]=rainPos[i*6+5]=-1.0+Math.random()*1.6;}
const rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(rainPos,3));
const rainMat=new T.LineBasicMaterial({color:'#a9c8d8',transparent:true,opacity:0});scene.add(new T.LineSegments(rainGeo,rainMat));
function runRain(dt){for(let i=0;i<RAIN;i++){let y=rainPos[i*6+1]-rainSpeed[i]*dt;if(y<1.3)y=3.0;rainPos[i*6+1]=y;rainPos[i*6+4]=y+rainLen[i];}rainGeo.attributes.position.needsUpdate=true;}
// Towers-style build reveal: a rising cut plane finishes the room from the floor up.
const cutPlane=new T.Plane(new T.Vector3(0,-1,0),0),roomMaterials=new Set();
world.children.forEach(c=>{if(c!==person)c.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>roomMaterials.add(m));});});
const cutter=new T.Mesh(new T.PlaneGeometry(9,9),new T.MeshBasicMaterial({color:'#7fe3f2',transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));cutter.rotation.x=-Math.PI/2;cutter.visible=false;scene.add(cutter);
let revealT=1,revealDone=true;
function setReveal(on){roomMaterials.forEach(m=>{m.clippingPlanes=on?[cutPlane]:null;m.needsUpdate=true;});}
// Furnishing: nightstand, sofa and coffee table, floor lamp, rugs, wall art and shelves so the room reads lived-in.
{const oak=mat('#7b5a3c',.55),fabricG=mat('#4a5d57',.92),fabricC=mat('#b9a98a',.93),blk=mat('#15191a',.5),brass=mat('#b89a5a',.35,.85);
box('nightstand',.42,.5,.4,-1.78,.25,.7,oak);box('nightstand-drawer',.36,.14,.02,-1.57,.34,.7,blk);
cyl('ns-lamp-base',.06,.03,-1.78,.52,.7,brass);cyl('ns-lamp-stem',.012,.22,-1.78,.64,.7,brass);{const sh=new T.Mesh(new T.CylinderGeometry(.09,.14,.16,32,1,true),new T.MeshStandardMaterial({color:'#f2dfba',side:T.DoubleSide,emissive:'#ffd9a0',emissiveIntensity:.6,roughness:.9}));sh.position.set(-1.78,.8,.7);world.add(sh);const nl=new T.PointLight('#ffcf8a',.5,3,2);nl.position.set(-1.78,.8,.7);world.add(nl);}

box('sofa-base',2.0,.4,.9,3.1,.2,3.9,fabricG);box('sofa-back',2.0,.55,.22,3.1,.65,4.3,fabricG);box('sofa-arm-l',.22,.3,.9,2.0,.55,3.9,fabricG);box('sofa-arm-r',.22,.3,.9,4.2,.55,3.9,fabricG);
for(const cx of[2.65,3.55])box('sofa-cushion',.82,.14,.7,cx,.47,3.9,fabricC);for(const [cx,cc] of[[2.5,'#c9663f'],[3.8,'#e3b341']]){const pl=box('sofa-pillow',.34,.34,.1,cx,.74,4.1,mat(cc,.9));pl.rotation.z=.15;pl.rotation.x=-.25;}
cyl('coffee-table-top',.5,.05,3.1,.42,2.6,oak);for(const [ox,oz] of[[-.28,-.28],[.28,-.28],[-.28,.28],[.28,.28]])cyl('ct-leg',.02,.4,3.1+ox,.2,2.6+oz,blk);
box('coffee-book',.3,.04,.22,3.0,.47,2.6,mat('#3f7cc4',.8));box('coffee-book2',.26,.03,.19,3.02,.505,2.6,mat('#d4553d',.8));cyl('coffee-cup',.04,.08,3.3,.51,2.65,mat('#e5e1d8',.4));
cyl('floor-lamp-base',.14,.03,4.6,.015,4.1,blk);cyl('floor-lamp-pole',.012,1.6,4.6,.82,4.1,blk);{const sh=new T.Mesh(new T.CylinderGeometry(.16,.24,.3,32,1,true),new T.MeshStandardMaterial({color:'#f2dfba',side:T.DoubleSide,emissive:'#ffd9a0',emissiveIntensity:.7,roughness:.9}));sh.position.set(4.6,1.7,4.1);world.add(sh);const fl=new T.PointLight('#ffcf8a',.7,5,2);fl.position.set(4.6,1.65,4.1);world.add(fl);}
const rug=box('sofa-rug',2.6,.015,1.9,3.1,.008,3.1,mat('#7a4f3c',.95));
const frames=[[2.55,2.15,'Kage','#2d4a52'],[3.3,1.9,'Seijaku','#52432d'],[3.95,2.3,'Unreal','#2d3f52']];for(const [fx,fy,ft,fc] of frames){box('wall-frame',.5,.65,.04,fx,fy,-2.4,mat('#1b1b1b',.4));box('wall-art',.42,.57,.01,fx,fy,-2.375,mat(fc,.8));}
box('wall-shelf-r',1.2,.04,.24,8.38,1.9,1.0,oak).rotation.y=Math.PI/2;box('wall-shelf-r2',1.2,.04,.24,8.38,1.45,1.0,oak).rotation.y=Math.PI/2;
for(let k=0;k<5;k++){box('shelf-book',.05,.24+(k%3)*.04,.17,8.36,2.04+(k%3)*.02,.6+k*.07,mat(['#d4553d','#3f7cc4','#5a9a5c','#e3b341','#8b6cc1'][k],.8));}
ball('globe',.1,8.36,1.6,1.2,mat('#3f7cc4',.5));cyl('globe-stand',.015,.1,8.36,1.5,1.2,brass);
cyl('plant2-pot',.16,.3,-1.4,.15,4.7,mat('#bfb08b'));for(let i=0;i<7;i++){const a=i*2.5;const lf=ball('leaf2',.14,-1.4+Math.sin(a)*.15,.5+i*.07,4.7+Math.cos(a)*.15,green);lf.scale.set(.5,1.8,.7);}
box('curtain-l',.06,1.8,.35,-3.42,2.25,-1.2,mat('#6b7f73',.95));box('curtain-r',.06,1.8,.35,-3.42,2.25,.8,mat('#6b7f73',.95));
cyl('beanbag',.42,.5,5.9,.25,3.6,mat('#a8553b',.95)).scale.set(1,.8,1);
}
// Bed against the left wall under the window: slatted frame, mattress, duvet and pillows. He sits on the foot edge.
{const frameWood=mat('#6b4a31',.55),headFab=mat('#3a4a44',.9),sheet=mat('#cfd2c8',.92),duvet=mat('#5c7480',.95),pillow=mat('#e4e2da',.9),mattressM=mat('#d8d6cc',.9);
const bx0=-2.8,z0=.4,z1=2.52,len=z1-z0,zc=(z0+z1)/2;
box('bed-plinth',1.56,.16,len+.12,bx0,.09,zc,mat('#2b2b2b',.7));
box('bed-frame',1.62,.12,len+.14,bx0,.22,zc,frameWood);
box('bed-headboard',1.7,.95,.1,bx0,.78,z0-.08,headFab);
for(let k=-3;k<=3;k++)box('bed-channel',.2,.8,.03,bx0+k*.23,.8,z0-.01,headFab);
box('bed-mattress',1.5,.24,len-.02,bx0,.4,zc,mattressM);
box('bed-sheet',1.52,.012,len,bx0,.525,zc,sheet);
box('bed-duvet',1.62,.09,1.4,bx0,.55,z0+.9,duvet);
box('bed-duvet-side-l',.08,.3,1.4,bx0-.8,.4,z0+.9,duvet);box('bed-duvet-side-r',.08,.3,1.4,bx0+.8,.4,z0+.9,duvet);
box('bed-throw',1.5,.03,.45,bx0,.6,z1-.35,mat('#b08a5a',.95));
for(const px2 of[-.38,.38]){const pl=box('bed-pillow',.62,.16,.4,bx0+px2,.62,z0+.28,pillow);pl.rotation.x=-.15;}
}
renderer.localClippingEnabled=true;if(!revealDone)setReveal(true);
// Keep the procedural prop visible until its textured replacement is ready.
const propLoader=new GLTFLoader();
function placeProp(name, height, x, y, z, yaw, originals){
  propLoader.load('./assets/models/'+name+'/'+name+'_1k.gltf',({scene:model})=>{
    const bounds=new T.Box3().setFromObject(model);
    const center=bounds.getCenter(new T.Vector3());
    const scale=height/(bounds.max.y-bounds.min.y);
    const mount=new T.Group();
    mount.position.set(x,y,z);
    mount.rotation.y=yaw;
    model.scale.multiplyScalar(scale);
    model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    model.traverse(mesh=>{
      if(!mesh.isMesh)return;
      mesh.castShadow=mesh.receiveShadow=true;
      for(const material of [].concat(mesh.material)){
        roomMaterials.add(material);
        if(!revealDone){material.clippingPlanes=[cutPlane];material.needsUpdate=true;}
      }
    });
    mount.add(model);world.add(mount);
    for(const object of world.children){if(originals.includes(object.name))object.visible=false;}
  },undefined,()=>console.warn('Using built-in studio prop:',name));
}
placeProp('football',.22,2.35,0,1.5,.3,['football']);
placeProp('desk_lamp_arm_01',.55,-.10,.975,-1.67,1.0,['lamp-base','lamp-stem','lamp-shade']);
placeProp('modern_coffee_table_01',.445,3.1,0,2.6,Math.PI/2,['coffee-table-top','ct-leg']);
// Ender 3 (m3org, CC-BY-4.0) on the bench; its baked animation grows the print.
let printerMixer=null;
new GLTFLoader().load('./assets/ender3/scene.gltf',g=>{const pr=g.scene;pr.scale.setScalar(.5);pr.position.set(BX+.8,.95,-1.95);pr.rotation.y=-.12;
pr.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;const m=o.material;if(m.envMapIntensity!==undefined)m.envMapIntensity=.5;roomMaterials.add(m);if(!revealDone){m.clippingPlanes=[cutPlane];m.needsUpdate=true;}}});
pr.name='project-printer';world.add(pr);printerMixer=new T.AnimationMixer(pr);g.animations.forEach(c=>printerMixer.clipAction(c).play());});
// Restrained bloom: bright-pass, blur at quarter resolution, then tone-map in the composite.
let bloom=null;
try{
  const opt={type:T.HalfFloatType,format:T.RGBAFormat,minFilter:T.LinearFilter,magFilter:T.LinearFilter};
  const sceneRT=new T.WebGLRenderTarget(4,4,{...opt,samples:4}),bufA=new T.WebGLRenderTarget(4,4,{...opt,depthBuffer:false}),bufB=new T.WebGLRenderTarget(4,4,{...opt,depthBuffer:false});
  const quad=new T.Mesh(new T.PlaneGeometry(2,2));quad.frustumCulled=false;const pass=new T.Scene();pass.add(quad);const ortho=new T.OrthographicCamera(-1,1,1,-1,0,1);
  const vert='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const mk=(frag,uniforms)=>new T.ShaderMaterial({uniforms,vertexShader:vert,fragmentShader:'varying vec2 vUv;'+frag,depthTest:false,depthWrite:false});
  const bright=mk('uniform sampler2D t;void main(){vec3 c=texture2D(t,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));gl_FragColor=vec4(c*smoothstep(.65,1.3,l),1.);}',{t:{value:null}});
  const blur=mk('uniform sampler2D t;uniform vec2 d;void main(){vec3 c=texture2D(t,vUv).rgb*.227;c+=(texture2D(t,vUv+d*1.38).rgb+texture2D(t,vUv-d*1.38).rgb)*.316;c+=(texture2D(t,vUv+d*3.23).rgb+texture2D(t,vUv-d*3.23).rgb)*.07;gl_FragColor=vec4(c,1.);}',{t:{value:null},d:{value:new T.Vector2()}});
  const comp=mk('uniform sampler2D base;uniform sampler2D glow;uniform float seed;void main(){vec3 c=texture2D(base,vUv).rgb+texture2D(glow,vUv).rgb*.55;vec2 q=vUv-.5;c*=1.-smoothstep(.28,.85,length(q*vec2(1.15,1.)))*.55;gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\ngl_FragColor.rgb+=(fract(sin(dot(vUv*1234.5+seed,vec2(12.9898,78.233)))*43758.5453)-.5)*.03;\n}',{base:{value:null},glow:{value:null},seed:{value:0}});
  const run=(m,src,dst)=>{quad.material=m;m.uniforms.t&&(m.uniforms.t.value=src);renderer.setRenderTarget(dst);renderer.render(pass,ortho);};
  bloom={resize(){const v=renderer.getDrawingBufferSize(new T.Vector2());sceneRT.setSize(v.x,v.y);const w=Math.max(2,v.x>>2),h=Math.max(2,v.y>>2);bufA.setSize(w,h);bufB.setSize(w,h);blur.uniforms.d.value.set(1/w,1/h);},
  render(){renderer.setRenderTarget(sceneRT);renderer.render(scene,camera);run(bright,sceneRT.texture,bufA);
    const d=blur.uniforms.d.value,x=d.x,y=d.y;for(let i=0;i<2;i++){d.set(x,0);run(blur,bufA.texture,bufB);d.set(0,y);run(blur,bufB.texture,bufA);}d.set(x,y);
    comp.uniforms.base.value=sceneRT.texture;comp.uniforms.glow.value=bufA.texture;comp.uniforms.seed.value=(performance.now()*.001)%7;quad.material=comp;renderer.setRenderTarget(null);renderer.render(pass,ortho);}};
  bloom.resize();
}catch(e){bloom=null;renderer.setRenderTarget(null);}
function renderScene(){if(bloom){try{bloom.render();return;}catch(e){bloom=null;renderer.setRenderTarget(null);}}renderer.render(scene,camera);}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused=reduced,progress=0,px=0,py=0,sx=0,sy=0,clock=0;
const intro=document.querySelector('.intro'),caption=document.querySelector('#scene-caption'),button=document.querySelector('#motion'),journey=document.querySelector('#journey');
button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Enable motion':'Pause motion';
button.addEventListener('click',()=>{paused=!paused;button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Resume motion':'Pause motion';});
window.addEventListener('pointermove',e=>{px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;},{passive:true});
function resize(){const pixelRatioCap=innerWidth<=700?1.2:1.5;renderer.setPixelRatio(Math.min(devicePixelRatio,pixelRatioCap));renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',()=>{resize();bloom?.resize();});resize();bloom?.resize();
const lerp=T.MathUtils.lerp;
let route=new T.CatmullRomCurve3([new T.Vector3(-1.6,.025,1.65),new T.Vector3(-.8,.025,1.2),new T.Vector3(-.25,.025,.05),new T.Vector3(-.05,.025,-.25),new T.Vector3(.35,.025,-.25)]);
let routeLength=route.getLength();const eyeHeight=1.6;
const arc=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(-.55,.22,-.35),new T.Vector3(-.45,.12,-.1),new T.Vector3(0,0,0)]);
const opening=new T.Vector3(.5,1.75,4.5),monitorTarget=new T.Vector3(.8,1.31,-1.67);
const cameraPosition=new T.Vector3(),gaze=new T.Vector3(),eye=new T.Vector3(),behind=new T.Vector3();
const dollyPts=[new T.Vector3(),new T.Vector3(-.35,1.55,.65),new T.Vector3(.25,1.46,.05),new T.Vector3(.58,1.42,-.5),new T.Vector3(.8,1.6,-.84)],dolly=new T.CatmullRomCurve3(dollyPts.slice(),false,'centripetal');
const gazePts=[new T.Vector3(),new T.Vector3(.62,1.05,-.95),new T.Vector3(.75,1.15,-1.35),monitorTarget.clone()],gazePath=new T.CatmullRomCurve3(gazePts,false,'centripetal');
let last=performance.now();
let facingS=null,prevDist=null,backing=0,walkAcc=0,locomotionBlend=0;
document.querySelectorAll('a[href="#work"]').forEach(l=>l.addEventListener('click',e=>{e.preventDefault();scrollTo({top:journey.offsetHeight*.3,behavior:'smooth'});}));const zonesEl=document.querySelector('#zones'),zonesLabel=zonesEl?.querySelector('span');let dest='desk',transfer=null;
const deskRoute=route.points.map(v=>v.clone()),benchRoute=[new T.Vector3(-1.6,.025,1.65),new T.Vector3(-.9,.025,1.6),new T.Vector3(.4,.025,1.5),new T.Vector3(2.6,.025,1.1),new T.Vector3(4.8,.025,.2),new T.Vector3(BX-.45,.025,-1.25)];
const deskBase=dollyPts.map(v=>v.clone()),benchCam=new T.Vector3(BX-.9,1.75,1.1),benchLook=new T.Vector3(BX+.1,1.15,-2.0),deskCam=new T.Vector3(2.6,1.7,1.4),deskLook=new T.Vector3(.8,1.2,-1.5);
function setDest(d){dest=d;chapterItems[3].textContent=d==='bench'?'Hardware':'Desk';route=new T.CatmullRomCurve3((d==='bench'?benchRoute:deskRoute).map(v=>v.clone()));routeLength=route.getLength();
const bench=d==='bench';portfolio.setScreen(screen,'Computer');monitorTarget.set(bench?BX-.2:.8,bench?1.13:1.31,bench?-2.0:-1.67);gazePts[2].set(bench?BX-.3:.75,bench?1.25:1.15,bench?-2.15:-1.35);gazePts[3].copy(monitorTarget);gazePts[1].set(bench?BX-.35:.62,bench?1.1:1.05,bench?-1.7:-.95);
const dx=bench?BX-.45-.8:0,dz=bench?-.45:0;for(let k=1;k<4;k++){dollyPts[k].copy(deskBase[k]);dollyPts[k].x+=dx;dollyPts[k].z+=dz;dolly.points[k]=dollyPts[k];}dollyPts[4].x=bench?BX-.45:.8;dollyPts[4].z=bench?-1.45:-.84;dolly.points[4]=dollyPts[4];}
const handA=new T.Vector3(),handB=new T.Vector3();
// At the hardware bench he works on a board with small, alternating hand movements.
function benchWork(w,t){
  if(w<=0||!avatar)return;
  person.updateMatrixWorld(true);
  for(const [side,x,beat] of [['Left',BX-.63,0],['Right',BX-.28,2.2]]){
    const lift=Math.max(0,Math.sin(t*2.2+beat))*.008;
    handA.set(x,1.047+lift,-1.70);
    solveArm(side,handA,tmpV.set(side==='Left'?-.5:.5,-1,.3),w);
    const hand=avatar.getObjectByName(side+'Hand');if(!hand)continue;
    typingRotation.setFromEuler(secEuler.set(-Math.PI/2-.08,0,side==='Left'?-.08:.08));
    hand.parent.getWorldQuaternion(wristParent);
    const relative=wristParent.clone().invert().multiply(typingRotation);
    const twist=new T.Quaternion(0,relative.y,0,relative.w).normalize();
    hand.parent.quaternion.multiply(new T.Quaternion().slerp(twist,w*.85));
    hand.parent.updateMatrixWorld(true);hand.parent.getWorldQuaternion(wristParent);
    hand.quaternion.slerp(wristParent.invert().multiply(typingRotation),w);
  }
}

zonesEl?.addEventListener('click',e=>{const b=e.target.closest('button[data-zone]');if(!b)return;const z=b.dataset.zone,atStart=progress<.3;if(atStart){if(z!==dest)setDest(z);}else if(z!==dest&&!transfer){transfer={to:z,stage:'leave'};heldKeys.clear();}zonesEl.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.zone===z)));});
let frameId=0;
function scheduleFrame(){if(!frameId&&!document.hidden&&!isProjectOpen())frameId=requestAnimationFrame(frame);}
function frame(now){frameId=0;if(document.hidden||isProjectOpen())return;scheduleFrame();const dt=Math.min((now-last)/1000,.05);last=now;if(printerMixer&&!paused)printerMixer.update(dt);
let travelHeading=null,departingSeat=false;
let target=T.MathUtils.clamp(scrollY/Math.max(1,journey.offsetHeight-innerHeight),0,1);
if(!paused&&transfer?.stage==='leave'){
  target=.66;
  if(progress<=.6601){
    const start=route.getPointAt(1);
    setDest(transfer.to);
    const end=route.getPointAt(1);
    route=new T.CatmullRomCurve3([start,new T.Vector3(start.x-.8,.025,.7),
      new T.Vector3(3.25,.025,.60),new T.Vector3(end.x-1,.025,dest==='desk'?.15:.1),end]);
    routeLength=route.getLength();progress=.34;prevDist=0;transfer.stage='cross';
  }
}
if(transfer?.stage==='cross')target=1;
if(!paused&&transfer?.stage==='cross'&&progress>.999){
  setDest(dest);prevDist=routeLength;transfer=null;
}
if(!paused){clock+=dt;if(avatar||loadFailed){
  let next=advanceProgress(progress,target,dt);
  const current=journeyState(progress,routeLength,walkDuration);
  const upcoming=journeyState(next,routeLength,walkDuration);
  let delta=upcoming.distance-current.distance;
  departingSeat=leavingSeat(progress,next);
  if(Math.abs(delta)>dt*1.05){
    let lo=0,hi=1;
    for(let i=0;i<12;i++){const f=(lo+hi)/2;
      if(Math.abs(journeyState(lerp(progress,next,f),routeLength,walkDuration).distance-current.distance)>dt*1.05)hi=f;else lo=f;
    }
    next=lerp(progress,next,lo);delta=journeyState(next,routeLength,walkDuration).distance-current.distance;
  }
  let aligned=true;
  if(Math.abs(delta)>1e-8){
    backing=delta<0?1:0;
    const tangent=route.getTangentAt(current.travel);
    const desired=Math.atan2(tangent.x,tangent.z)+backing*Math.PI;
    travelHeading=desired;
    const gap=desired-(facingS??desired);
    aligned=Math.abs(Math.atan2(Math.sin(gap),Math.cos(gap)))<.6;
  }
  if(aligned)progress=next;
}sx=lerp(sx,px,1-Math.exp(-dt*3));sy=lerp(sy,py,1-Math.exp(-dt*3));}
if(window.__p!==undefined){progress=window.__p;revealT=1;}const p=progress,mobile=innerWidth<700,state=journeyState(p,routeLength,walkDuration);
person.position.copy(route.getPointAt(state.travel));
const seatState=deskSeatState(dest==='desk'?p:0),sitting=seatState.sit;
chair.position.set(.8,0,seatState.chairZ);chair.rotation.y=seatState.chairYaw;
person.position.x+=seatState.personOffsetX;person.position.z+=seatState.personOffsetZ;const bedW=p<.5?1-phase(p,.17,.23):0;person.position.x-=.57*bedW;
if(prevDist===null)prevDist=state.distance;const dd=state.distance-prevDist;prevDist=state.distance;walkAcc+=Math.abs(dd);const wt=(walkAcc/WALK_METRES_PER_SECOND)%Math.max(walkDuration,.01);
if(!paused){const moving=phase(Math.abs(dd)/Math.max(dt,.001),.015,.22);locomotionBlend+=(moving-locomotionBlend)*(1-Math.exp(-dt*12));}
const gaitWeight=state.walkWeight*locomotionBlend;
const tangent=route.getTangentAt(state.travel),heading=Math.atan2(tangent.x,tangent.z);
// Turn before taking the first step; settle facing the monitor at the end of the walk.
if(p<.23){backing=0;facingS=heading;}
const arrivalHeading=Math.atan2(monitorTarget.x-person.position.x,monitorTarget.z-person.position.z);
const traveling=p>=.335&&p<=.665;
const facing=departingSeat?travelHeading:dest==='desk'&&p>.66?blendAngle(heading,seatState.personYaw,phase(p,.66,.695)):travelHeading??(traveling||p<.335?heading+backing*Math.PI:arrivalHeading);
if(facingS===null)facingS=facing;let dF=facing-facingS;dF=Math.atan2(Math.sin(dF),Math.cos(dF));if(!paused)facingS+=dF*(1-Math.exp(-dt*5));
const bedYaw=Math.PI/2;const fromBed=Math.atan2(Math.sin(facingS-bedYaw),Math.cos(facingS-bedYaw));person.rotation.y=bedYaw+fromBed*state.turn;person.position.y+=Math.abs(Math.sin(wt/Math.max(walkDuration,.01)*Math.PI*2))*.012*gaitWeight;
// Once contact begins, chair and body share the same absolute swivel; no lag/snap at its boundary.
if(dest==='desk'&&p>.66&&!departingSeat)person.rotation.y=blendAngle(person.rotation.y,seatState.personYaw,phase(p,.66,.695));
samplePose(wt,gaitWeight,clock);if(dest==='desk'&&spine){spine.quaternion.multiply(secQuat.setFromAxisAngle(breathAxis,seatState.lean));}const idleW=phase(p,.04,.12)*(1-phase(p,.2,.3));floatWindows(0,clock);{const on=ease(phase(p,.68,.76));screen.material.color.setScalar(.03+on*1.67);monitorLight.intensity=.55*on;}const sitW=sitting;sitAt(p<.5?bedW:sitW,p<.5?.715:SEAT_HIP);if(p<.23)seatedHands(bedW,.745);if(dest==='desk')seatedHands(sitting*(1-state.type));if(dest==='desk')typeAt(state.type,clock);else benchWork(state.type,clock);animateFingers(dest==='desk'?state.type:state.type*.45,clock,paused?0:dt);headBone=headBone||avatar?.getObjectByName('Head');if(headBone){headBone.getWorldPosition(headEye);headEye.y+=.1;headEye.z-=.14;}
hologram.solid.value=reduced?1:state.solid;hologram.time.value=clock;
const holo=1-hologram.solid.value;pad.position.x=person.position.x;pad.position.z=person.position.z;padMat.opacity=0;
moteMat.opacity=holo>.01?.9*Math.min(1,holo*2.5):0;if(moteMat.opacity>0){const front=hologram.solid.value*2.1;for(let i=0;i<MOTES;i++){const [a,r,k]=moteSeed[i],y=(k*2.3+clock*.18*(.4+k))%2.3,ang=a+clock*.5*(1-k*.5);motePos[i*3]=person.position.x+Math.cos(ang)*(r+.06*Math.sin(clock+k*9));motePos[i*3+1]=y;motePos[i*3+2]=person.position.z+Math.sin(ang)*(r+.06*Math.sin(clock+k*9));}moteGeo.attributes.position.needsUpdate=true;}

scanLight.position.copy(person.position).add(new T.Vector3(0,.8,.3));scanLight.intensity=(1-hologram.solid.value)*.6;
// Follow camera, then one continuous over-the-shoulder dolly past the typing hands into the monitor.
eye.copy(person.position).add(new T.Vector3(0,eyeHeight,0));
const seatFrame=dest==='desk'?phase(p,.59,.72):0;
behind.copy(eye).add(new T.Vector3(-.35-1.0*seatFrame,.13-.18*seatFrame,2.35+.65*seatFrame));
const orbit=transfer?1:phase(p,.23,.48);
cameraPosition.copy(opening).lerp(behind,orbit).add(arc.getPoint(orbit));
if(mobile)cameraPosition.z+=.35*(1-orbit);
gaze.copy(person.position).add(new T.Vector3(.1,1.1-.25*seatFrame-(mobile?.55*(1-orbit):0),0));
const u=state.pov;
if(u>0){dollyPts[0].copy(behind);dolly.points[0]=dollyPts[0];if(headBone){dollyPts[4].copy(headEye);dollyPts[4].x=person.position.x;if(dest==='bench'){dollyPts[4].set(BX-.45,1.68,-1.27);}dolly.points[4]=dollyPts[4];}cameraPosition.copy(dolly.getPoint(u));gazePts[0].copy(person.position).add(new T.Vector3(.1,1.1-.25*seatFrame,0));gaze.copy(gazePath.getPoint(u));if(dest==='desk'){gaze.y-=.10*u;gaze.z+=.17*u;}}
const lookAmount=state.screen*(mobile?.015:.06);
gaze.x+=sx*lookAmount;gaze.y-=sy*lookAmount*.5;
hologram.head.value.copy(headBone?headEye:eye);hologram.headR.value=.31*(1-phase(cameraPosition.distanceTo(hologram.head.value),.15,.5));
person.visible=!!avatar;
const avatarCastsShadow=state.solid>.95;
if(avatar&&avatarCastsShadow!==lastAvatarShadowState){avatar.traverse(o=>{if(o.isMesh)o.castShadow=avatarCastsShadow;});lastAvatarShadowState=avatarCastsShadow;}
// Camera remains still when scrolling stops; movement is owned by the dolly.
if(zonesEl){
  const atStart=p<.3,atEnd=state.pov>.95;
  zonesEl.hidden=!!transfer||!(atStart||atEnd);
  zonesLabel.textContent=atStart?'Choose your path':'Visit another station';
  zonesEl.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.zone===dest)));
}
camera.position.copy(cameraPosition);camera.lookAt(gaze);if(window.__cam){camera.position.set(...window.__cam.slice(0,3));camera.lookAt(...window.__cam.slice(3));}const mobileLens=Math.min(116,T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(dest==='desk'?60:70)/2)/camera.aspect)));camera.fov=lerp(mobile?57:47,mobile?mobileLens:(dest==='desk'?62:74),state.pov);camera.updateProjectionMatrix();
intro.closest('.stage').classList.toggle('is-intro',p<.12);intro.style.opacity=String(1-phase(p,.025,.11));intro.style.visibility=p>.12?'hidden':'visible';
caption.textContent=state.pov>.96?(dest==='desk'?'Swipe the display or use ← → · Click a project to open it.':'Select the printer, circuit board or prototype to explore a project.'):loadFailed?'The studio is ready. Explore the work below.':!avatar?'Preparing the studio…':state.phase==='hologram'?'From a digital presence to the real world.':state.phase==='turn'?'Let’s step into the studio.':state.phase==='walk'?'Follow me to the work.':state.phase==='ground'?(dest==='desk'?'Take a seat. Let’s explore the work.':'Let’s take a closer look at the hardware.'):state.phase==='type'?'Let me show you what I’ve been building.':state.phase==='pov-transition'?'See it from my perspective.':'You’re in my place. Look around, then explore the work.';
if(state.phase!==lastPhase){lastPhase=state.phase;chapterItems.forEach((li,i)=>i===chapterOf[state.phase]?li.setAttribute('aria-current','step'):li.removeAttribute('aria-current'));caption.classList.remove('swap');void caption.offsetWidth;caption.classList.add('swap');}
if(!revealDone&&!paused&&!document.hidden){revealT=Math.min(1,revealT+dt/3.8);const h=ease(revealT)*4.2;cutPlane.constant=h;cutter.position.y=h+.012;cutter.visible=h>.05&&revealT<1;if(revealT>=1){revealDone=true;setReveal(false);}}
if(!paused){driftDust(clock);runRain(dt);}rainMat.opacity=revealDone?.5:0;dustMat.opacity=.55*(1-state.pov*.6);
rgbMats.forEach((m,i)=>m.color.setHSL((clock*.12+i*.05)%1,.9,.58));rgbLight.color.setHSL((clock*.12)%1,.9,.55);idea.position.y=1.3+Math.sin(clock*1.4)*.025;idea.rotation.y=clock*.4;ideaChips.forEach((c,i)=>{const a=clock*.9+i*Math.PI*2/5;c.position.set(Math.cos(a)*.2,Math.sin(a*1.3)*.05,Math.sin(a)*.2);c.rotation.set(a,a*.7,0);});canvas.dataset.phase=state.phase;canvas.dataset.progress=p.toFixed(4);
portfolio.update(dt,dest==='desk'&&state.pov>.96&&!transfer,reduced);
hardwareProjects.update(dest==='bench'&&state.pov>.96&&!transfer);
renderScene();}
document.addEventListener('visibilitychange',scheduleFrame);
document.addEventListener('projectviewchange',scheduleFrame);
scheduleFrame();
})();
