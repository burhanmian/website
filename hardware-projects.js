import * as T from './assets/three.module.js';
import {openProject,isProjectOpen} from './project-view.js?v=32';
export function createHardwareProjects({world,camera,canvas}){
 const entries=[{name:'project-printer',id:'form',label:'Printer',offset:new T.Vector3(0,.35,0)},{name:'mcu-board',id:'sense',label:'Circuit board',offset:new T.Vector3(0,.12,0)},{name:'prototype',id:'light',label:'Prototype',offset:new T.Vector3(0,.18,0)}];
 const layer=document.createElement('div');layer.className='hardware-hotspots';layer.hidden=true;layer.setAttribute('aria-label','Hardware projects');document.querySelector('.stage').append(layer);
 const ray=new T.Raycaster(),pointer=new T.Vector2(),pos=new T.Vector3();let active=false,down=null;
 for(const e of entries){e.button=document.createElement('button');e.button.type='button';e.button.textContent=e.label+' ↗';e.button.addEventListener('click',()=>openProject(e.id));layer.append(e.button);}
 function pick(event){const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);const targets=entries.map(e=>e.object).filter(Boolean);for(const h of ray.intersectObjects(targets,true)){let o=h.object;while(o){const e=entries.find(e=>e.object===o);if(e)return e;o=o.parent;}}return null;}
 canvas.addEventListener('pointerdown',e=>{if(active&&!isProjectOpen())down={x:e.clientX,y:e.clientY};});
 canvas.addEventListener('pointerup',e=>{if(!down)return;const distance=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(active&&distance<10){const target=pick(e);if(target)openProject(target.id);}});
 canvas.addEventListener('pointermove',e=>{if(active)canvas.style.cursor=pick(e)?'pointer':'';});
 canvas.addEventListener('pointercancel',()=>{down=null;});
 return {update(enabled){active=enabled&&!isProjectOpen();layer.hidden=!active;if(!active)return;for(const e of entries){e.object=e.object||world.getObjectByName(e.name);e.button.hidden=!e.object;if(!e.object)continue;e.object.getWorldPosition(pos);pos.add(e.offset).project(camera);e.button.hidden=pos.z>1||pos.z< -1||Math.abs(pos.x)>1||Math.abs(pos.y)>1;e.button.style.left=((pos.x+1)*50)+'%';e.button.style.top=((1-pos.y)*50)+'%';}}};
}
