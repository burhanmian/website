export const projectsReady=fetch('./demo-projects.json').then(r=>{if(!r.ok)throw Error('Project catalogue unavailable');return r.json();});
const dialog=document.createElement('dialog');dialog.className='project-dialog';dialog.setAttribute('aria-label','Portfolio');
dialog.innerHTML='<div class="project-toolbar"><button type="button" data-back>← Back to studio</button><button type="button" data-all>All work</button></div><div class="project-body"></div>';
document.body.append(dialog);
const content=dialog.querySelector('.project-body');let lastFocus=null,previousOverflow='',filter='All';
export const isProjectOpen=()=>dialog.open;
function show(){if(!dialog.open){lastFocus=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}dialog.scrollTop=0;}
function close(){dialog.close();}
dialog.querySelector('[data-back]').addEventListener('click',close);
dialog.querySelector('[data-all]').addEventListener('click',()=>openArchive());
dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;lastFocus?.focus({preventScroll:true});});
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function openArchive(){dialog.setAttribute('aria-label','All projects');show();content.innerHTML='<p>Loading projects…</p>';try{const all=await projectsReady;
 content.innerHTML='<p class="project-eyebrow">Selected work</p><h1>Inside the work.</h1><p class="demo-notice">Demo projects for previewing the portfolio. Final project content is coming next.</p><div class="project-filters" role="group" aria-label="Filter projects"></div><div class="project-grid"></div>';
 const filters=content.querySelector('.project-filters'),grid=content.querySelector('.project-grid');
 const render=()=>{grid.innerHTML=all.filter(p=>filter==='All'||p.category===filter).map(p=>`<button class="project-card" data-project="${p.id}"><img src="${p.image}" alt="${escapeHTML(p.title)} concept preview"><span>${escapeHTML(p.category)} · Demo</span><h2>${escapeHTML(p.title)}</h2><span class="project-open">Explore project ↗</span></button>`).join('');filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===filter)));};
 ['All',...new Set(all.map(p=>p.category))].forEach(label=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{filter=label;render();});filters.append(b);});
 grid.addEventListener('click',e=>{const id=e.target.closest('[data-project]')?.dataset.project;if(id)openProject(id);});render();
 }catch{content.innerHTML='<h1>Projects could not load.</h1><p>Close this panel and try again.</p>';}}
export async function openProject(id){show();content.innerHTML='<p>Opening project…</p>';try{const p=(await projectsReady).find(p=>p.id===id);if(!p){openArchive();return;}
 dialog.setAttribute('aria-label',p.title);
 content.innerHTML=`<p class="project-eyebrow">${escapeHTML(p.category)} · Demo concept</p><h1>${escapeHTML(p.title)}</h1><p class="demo-notice">Illustrative content and simulated demo. Replace with your real project story.</p><div class="case-demo"><div class="demo-preview"><img src="${p.image}" alt="Illustrative ${escapeHTML(p.category)} prototype"><div class="demo-output"><span>Simulated output</span><output>50%</output><div class="demo-meter"><i style="width:50%"></i></div></div></div><div class="demo-control"><h2>Try the concept</h2><p>${escapeHTML(p.hint)}</p><label for="project-input">${escapeHTML(p.control)}</label><input id="project-input" type="range" min="0" max="100" value="50"><p class="project-small">Interactive placeholder — no real device or service is connected.</p></div></div><div class="case-copy"><section><span>01 / OVERVIEW</span><h2>The idea</h2><p>${escapeHTML(p.overview)}</p></section><section><span>02 / CONTRIBUTION</span><h2>My contribution</h2><p>${escapeHTML(p.contribution)}</p></section><section><span>03 / PROCESS</span><h2>From question to prototype</h2><ol>${p.process.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol></section><section><span>04 / RESULTS</span><h2>What changed</h2><p>${escapeHTML(p.results)}</p></section></div><button class="case-return" type="button">← Back to studio</button>`;
 const title=content.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true});
 content.querySelector('input').addEventListener('input',e=>{const n=e.target.value;content.querySelector('output').textContent=n+'%';content.querySelector('.demo-meter i').style.width=n+'%';content.querySelector('.demo-preview img').style.filter=`saturate(${.3+n/70}) brightness(${.7+n/180})`;});content.querySelector('.case-return').addEventListener('click',close);
 }catch{content.innerHTML='<h1>Project could not load.</h1><p>Please try All work.</p>';}}
document.querySelectorAll('[data-open-work]').forEach(b=>b.addEventListener('click',openArchive));
