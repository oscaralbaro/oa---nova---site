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


// Malha abstrata do Hero — versão otimizada
(() => {
  const canvas = document.getElementById('heroMesh');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 700px)').matches;
  let width = 0, height = 0, dpr = 1, raf = 0;
  let mouseX = .5, mouseY = .5;
  let visible = true;
  let lastFrame = 0;
  const frameInterval = 1000 / 30;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const parent = canvas.closest('.hero-full') || canvas.parentElement;
  if (!mobile && matchMedia('(pointer:fine)').matches) {
    parent?.addEventListener('pointermove', e => {
      const r = parent.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width;
      mouseY = (e.clientY - r.top) / r.height;
    }, { passive:true });
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf && !reduced && !mobile) raf = requestAnimationFrame(draw);
  }, { threshold: 0 });
  observer.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible && !raf && !reduced && !mobile) raf = requestAnimationFrame(draw);
  });

  const render = (time = 0) => {
    ctx.clearRect(0, 0, width, height);

    const cols = mobile ? 24 : 36;
    const rows = mobile ? 14 : 20;
    const stepX = width / (cols - 1);
    const stepY = height / (rows - 1);
    const t = time * 0.00035;
    const points = Array.from({length: rows}, () => Array(cols));

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const nx = x / (cols - 1);
        const ny = y / (rows - 1);
        const wave = Math.sin(nx * 8 + t * 1.8) * 15 + Math.cos(ny * 7 - t * 1.3) * 10;
        const dx = nx - (.55 + (mouseX - .5) * .06);
        const dy = ny - (.55 + (mouseY - .5) * .06);
        const focus = Math.max(0, 1 - (dx * dx + dy * dy) * 4.2);
        points[y][x] = {
          x: x * stepX + Math.sin(ny * 4 + t) * 5,
          y: y * stepY + wave * (.22 + focus * .55),
          focus
        };
      }
    }

    ctx.lineWidth = .7;
    for (let y = 0; y < rows; y += 2) {
      ctx.beginPath();
      for (let x = 0; x < cols; x++) {
        const p = points[y][x];
        x ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y);
      }
      ctx.strokeStyle = 'rgba(11,108,255,.055)';
      ctx.stroke();
    }

    for (let x = 0; x < cols; x += 3) {
      ctx.beginPath();
      for (let y = 0; y < rows; y++) {
        const p = points[y][x];
        y ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y);
      }
      ctx.strokeStyle = 'rgba(72,170,255,.04)';
      ctx.stroke();
    }

    for (let y = 0; y < rows; y += 2) {
      for (let x = 0; x < cols; x += 2) {
        const p = points[y][x];
        ctx.beginPath();
        ctx.arc(p.x, p.y, .7 + p.focus * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11,108,255,${.12 + p.focus * .32})`;
        ctx.fill();
      }
    }
  };

  const draw = (time = 0) => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (time - lastFrame >= frameInterval) {
      lastFrame = time;
      render(time);
    }
    raf = requestAnimationFrame(draw);
  };

  resize();
  addEventListener('resize', resize, { passive:true });
  render(0);
  if (!reduced && !mobile) raf = requestAnimationFrame(draw);
})();

// Contato corporativo expansível
(() => {
  const toggle = document.getElementById('contactToggle');
  const wrap = document.getElementById('contactFormWrap');
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!toggle || !wrap || !form) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? 'Fechar formulário' : 'Iniciar contato';
    if (open) {
      wrap.hidden = false;
      requestAnimationFrame(() => wrap.classList.add('is-open'));
      setTimeout(() => form.querySelector('input')?.focus(), 450);
    } else {
      wrap.classList.remove('is-open');
      setTimeout(() => { wrap.hidden = true; }, 650);
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.className = 'form-status';

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = 'Revise os campos obrigatórios.';
      status.classList.add('error');
      return;
    }

    const data = new FormData(form);
    const subject = encodeURIComponent(`Contato pelo site — ${data.get('nome')}`);
    const body = encodeURIComponent(
      `Nome: ${data.get('nome')}\n` +
      `Empresa: ${data.get('empresa') || 'Não informado'}\n` +
      `E-mail: ${data.get('email')}\n` +
      `WhatsApp: ${data.get('whatsapp')}\n\n` +
      `Mensagem:\n${data.get('mensagem')}`
    );

    status.textContent = 'Abrindo seu aplicativo de e-mail…';
    status.classList.add('success');
    window.location.href = `mailto:contato@oanova.com.br?subject=${subject}&body=${body}`;
  });
})();
