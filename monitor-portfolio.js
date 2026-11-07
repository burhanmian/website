import {projectsReady,openProject,isProjectOpen} from './project-view.js?v=32';
import * as T from './assets/three.module.js';

// One local content catalogue drives both the 3D screen and accessible controls.
export function createMonitorPortfolio({screen,camera,canvas}) {
  const surface=document.createElement('canvas');surface.width=1400;surface.height=800;
  const ctx=surface.getContext('2d');
  const texture=new T.CanvasTexture(surface);texture.encoding=T.sRGBEncoding;
  screen.material.map=texture;screen.material.toneMapped=false;
  const controls=document.createElement('nav');controls.className='project-controls';controls.hidden=true;
  controls.setAttribute('aria-label','Monitor portfolio');
  controls.innerHTML='<button type="button" aria-label="Previous project">←</button><a href="#project">Loading projects…</a><button type="button" aria-label="Next project">→</button><span aria-live="polite"></span>';
  document.querySelector('.stage').append(controls);
  const [previous,next]=controls.querySelectorAll('button'),link=controls.querySelector('a'),status=controls.querySelector('span');
  let projects=[],images=[],index=0,position=0,active=false,dirty=true,drag=null,lastWheel=0,station='Computer',hover=0,hoverTarget=0;
  const ray=new T.Raycaster(),point=new T.Vector2();
  const hit=e=>{const r=canvas.getBoundingClientRect();point.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(point,camera);return ray.intersectObject(screen,false)[0];};
  function sync(){const p=projects[index];if(!p)return;link.textContent=p.title+' ↗';link.href='#project-'+p.id;status.textContent=`${index+1} / ${projects.length}`;previous.disabled=index===0;next.disabled=index===projects.length-1;canvas.dataset.project=p.title;}
  link.addEventListener('click',e=>{e.preventDefault();if(projects[index])openProject(projects[index].id);});
  function move(by){index=Math.max(0,Math.min(projects.length-1,index+by));sync();dirty=true;}
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  canvas.addEventListener('pointerdown',e=>{if(!active||isProjectOpen()||!hit(e))return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointerup',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(Math.abs(dx)>28)move(dx<0?1:-1);else if(Math.abs(dy)<12&&hit(e)&&projects[index]){const u=hit(e).uv.x;if(u<.15)move(-1);else if(u>.85)move(1);else openProject(projects[index].id);}});
  canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('pointermove',e=>{const h=active&&!isProjectOpen()&&hit(e);canvas.style.cursor=h?'pointer':'';hoverTarget=h?(h.uv.x-.5)*2:0;});
  canvas.addEventListener('wheel',e=>{if(!active||isProjectOpen()||!hit(e))return;e.preventDefault();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(delta)>8&&performance.now()-lastWheel>360){move(delta>0?1:-1);lastWheel=performance.now();}},{passive:false});
  window.addEventListener('keydown',e=>{if(!active||isProjectOpen()||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable]'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
  function wrap(text,x,y,width){let line='',row=0;for(const word of text.split(' ')){const test=line+word+' ';if(ctx.measureText(test).width>width&&line){ctx.fillText(line,x,y+row*68);row++;line=word+' ';}else line=test;}ctx.fillText(line,x,y+row*68);}
  function draw(){
    ctx.fillStyle='#101d19';ctx.fillRect(0,0,1400,800);
    ctx.fillStyle='#9bb1a1';ctx.font='22px Arial';ctx.fillText('Burhan’s studio',48,54);
    ctx.textAlign='right';ctx.fillText('Selected work',1352,54);ctx.textAlign='left';
    ctx.fillStyle='#e9ecdf';ctx.font='46px Arial';ctx.fillText('Inside the work.',48,122);
    if(!projects.length){ctx.font='25px Arial';ctx.fillText('Opening the portfolio…',48,400);texture.needsUpdate=true;return;}
    ctx.save();ctx.beginPath();ctx.rect(0,155,1400,550);ctx.clip();
    // A focused visual window with neighbouring work visible at either edge.
    for(let i=Math.max(0,Math.floor(position)-1);i<=Math.min(projects.length-1,Math.ceil(position)+1);i++){
      const x=250+(i-position)*940,im=images[i],focused=1-Math.min(1,Math.abs(i-position));
      ctx.save();ctx.translate(x,170);ctx.fillStyle='#294034';ctx.fillRect(0,0,900,510);
      ctx.save();ctx.beginPath();ctx.rect(0,0,900,510);ctx.clip();
      if(im?.complete&&im.naturalWidth){const scale=Math.max(900/im.naturalWidth,510/im.naturalHeight)*(1+.025*focused),w=im.naturalWidth*scale,h=im.naturalHeight*scale;ctx.drawImage(im,(900-w)/2+hover*8*focused,(510-h)/2,w,h);}
      const shade=ctx.createLinearGradient(0,190,0,510);shade.addColorStop(0,'rgba(6,17,12,0)');shade.addColorStop(1,'rgba(6,17,12,.97)');ctx.fillStyle=shade;ctx.fillRect(0,0,900,510);ctx.restore();
      
      ctx.fillStyle='#e3edce';ctx.font='22px Arial';ctx.fillText(projects[i].category,30,42);
      ctx.font='38px Arial';ctx.fillText('↗',837,48);
      ctx.font='44px Arial';ctx.fillStyle='#fffdf2';wrap(projects[i].title,30,425,800);
      ctx.restore();
    }
    ctx.restore();ctx.font='23px Arial';ctx.fillStyle='#afc2b2';ctx.fillText('←  Explore sideways  →',48,754);
    ctx.textAlign='right';ctx.fillText(`${String(index+1).padStart(2,'0')} / ${projects.length}    ·    Open project ↗`,1352,754);ctx.textAlign='left';texture.needsUpdate=true;
  }
  projectsReady.then(all=>all.filter(p=>p.station==='computer')).then(data=>{projects=data;images=data.map(p=>{const im=new Image();im.onload=()=>{dirty=true;};im.src=p.image;return im;});sync();dirty=true;}).catch(()=>{link.textContent='Visit the portfolio ↗';link.href='https://burhanaftabmian.com/portfolio/';ctx.fillStyle='#101d19';ctx.fillRect(0,0,1400,800);ctx.fillStyle='#f0eee4';ctx.font='48px Arial';ctx.fillText('Explore my portfolio ↗',80,400);texture.needsUpdate=true;dirty=false;});
  return {setScreen(target,label='Computer'){station=label;controls.setAttribute('aria-label',label+' portfolio');dirty=true;screen=target;screen.material.map=texture;screen.material.toneMapped=false;},update(dt,enabled,reduced){active=enabled;const nextHover=reduced?0:hover+(hoverTarget-hover)*(1-Math.exp(-dt*8));if(Math.abs(nextHover-hover)>.0001){hover=nextHover;dirty=true;}controls.hidden=!enabled;if(!enabled)canvas.style.cursor='';const distance=index-position;if(Math.abs(distance)>.0005){position=reduced?index:position+distance*(1-Math.exp(-dt*10));dirty=true;}else if(position!==index){position=index;dirty=true;}if(dirty){draw();dirty=false;}}};
}
