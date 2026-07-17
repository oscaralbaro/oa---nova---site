document.getElementById('year').textContent=new Date().getFullYear();
const h=document.getElementById('header');
addEventListener('scroll',()=>h.classList.toggle('scrolled',scrollY>12),{passive:true});

const o=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    e.target.classList.add('visible');
    o.unobserve(e.target);
  }
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>o.observe(e));



// Entrada suave do conteúdo principal
const heroItems = document.querySelectorAll('.hero .kicker, .hero h1, .hero .lead, .hero .actions, .hero .trust');
heroItems.forEach((item, index) => {
  item.style.setProperty('--hero-delay', `${index * 90}ms`);
  item.classList.add('hero-enter');
});

// Movimento sutil das partículas no Hero
const hero = document.querySelector('.hero');
if (hero && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    hero.style.setProperty('--hero-x', `${x * 18}px`);
    hero.style.setProperty('--hero-y', `${y * 18}px`);
  });
}


// Malha abstrata animada do Hero
(() => {
  const canvas = document.getElementById('heroMesh');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0, height = 0, dpr = 1, raf = 0;
  let mouseX = .5, mouseY = .5;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const parent = canvas.closest('.hero-full') || canvas.parentElement;
  parent?.addEventListener('pointermove', e => {
    const r = parent.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / r.width;
    mouseY = (e.clientY - r.top) / r.height;
  }, { passive:true });

  const draw = (time = 0) => {
    ctx.clearRect(0, 0, width, height);

    const cols = width < 520 ? 42 : 58;
    const rows = width < 520 ? 24 : 30;
    const stepX = width / (cols - 1);
    const stepY = height / (rows - 1);
    const t = time * 0.00045;
    const points = [];

    for (let y = 0; y < rows; y++) {
      points[y] = [];
      for (let x = 0; x < cols; x++) {
        const nx = x / (cols - 1);
        const ny = y / (rows - 1);
        const wave =
          Math.sin(nx * 9.5 + t * 2.1) * 19 +
          Math.cos(ny * 8.2 - t * 1.6) * 14 +
          Math.sin((nx + ny) * 8 + t) * 11;
        const focus = Math.exp(-(
          Math.pow(nx - (.55 + (mouseX - .5) * .08), 2) / .16 +
          Math.pow(ny - (.55 + (mouseY - .5) * .08), 2) / .18
        ));
        const px = x * stepX + Math.sin(ny * 5 + t) * 8;
        const py = y * stepY + wave * (0.25 + focus * .82);
        points[y][x] = { x:px, y:py, focus };
      }
    }

    ctx.lineWidth = .8;
    for (let y = 0; y < rows; y++) {
      ctx.beginPath();
      for (let x = 0; x < cols; x++) {
        const p = points[y][x];
        x === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y);
      }
      ctx.strokeStyle = `rgba(11,108,255,${0.035 + y/rows*.055})`;
      ctx.stroke();
    }

    for (let x = 0; x < cols; x += 2) {
      ctx.beginPath();
      for (let y = 0; y < rows; y++) {
        const p = points[y][x];
        y === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y);
      }
      ctx.strokeStyle = 'rgba(72,170,255,.045)';
      ctx.stroke();
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const p = points[y][x];
        const alpha = .13 + p.focus * .58;
        const size = .7 + p.focus * 1.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11,108,255,${alpha})`;
        ctx.fill();
      }
    }

    if (!reduced) raf = requestAnimationFrame(draw);
  };

  resize();
  addEventListener('resize', resize, { passive:true });
  draw();
})();
