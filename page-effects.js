// Paper-like project pages: a brass magnifier over the artwork and a page-turn when a project opens.
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (fine && !calm) {
  const ZOOM = 2.2, SIZE = 150;
  const lens = document.createElement('div');
  lens.className = 'lens';
  lens.setAttribute('aria-hidden', 'true');
  const inner = document.createElement('div');
  inner.className = 'lens-inner';
  lens.append(inner);
  document.body.append(lens);

  let active = null;
  const attach = art => {
    art.addEventListener('pointerenter', () => {
      const r = art.getBoundingClientRect();
      const copy = art.cloneNode(true);
      copy.removeAttribute('role');
      copy.removeAttribute('aria-label');
      copy.style.cssText = `width:${r.width}px;height:${r.height}px;aspect-ratio:auto;position:absolute;left:0;top:0;margin:0;transform-origin:0 0;`;
      inner.replaceChildren(copy);
      active = { art, copy };
      lens.classList.add('on');
    });
    art.addEventListener('pointermove', e => {
      if (!active || active.art !== art) return;
      const r = art.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      lens.style.transform = `translate(${e.clientX - SIZE / 2}px,${e.clientY - SIZE / 2}px)`;
      active.copy.style.transform = `translate(${SIZE / 2 - x * ZOOM}px,${SIZE / 2 - y * ZOOM}px) scale(${ZOOM})`;
    });
    art.addEventListener('pointerleave', () => {
      active = null;
      lens.classList.remove('on');
    });
  };
  document.querySelectorAll('.game-art').forEach(attach);
}

// Re-trigger the page-turn each time a project is opened.
document.querySelectorAll('.work details').forEach(d => {
  d.addEventListener('toggle', () => {
    if (!d.open) return;
    d.classList.remove('turn');
    void d.offsetWidth;
    d.classList.add('turn');
  });
});

if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-rise');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.section-intro > *, .work details, .about > *, footer').forEach((el, i) => {
    el.classList.add('rise');
    el.style.transitionDelay = `${(i % 3) * 90}ms`;
    io.observe(el);
  });
}
