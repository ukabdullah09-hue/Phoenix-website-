/* Phoenix Beds UK — script.js */

/* ── Nav scroll behaviour ── */
(function () {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile nav burger ── */
(function () {
  const burger = document.querySelector('.nav__burger');
  const mobile = document.querySelector('.nav__mobile');
  if (!burger || !mobile) return;
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mobile.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobile.querySelectorAll('.nav__link').forEach(l => {
    l.addEventListener('click', () => {
      burger.classList.remove('open');
      mobile.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ── Page loader ── */
(function () {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('done'), 400);
  });
  setTimeout(() => loader.classList.add('done'), 2000);
})();

/* ── Scroll reveal ── */
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add('revealed'), +delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ── Hero canvas — drifting embers ── */
class PhoenixCanvas {
  constructor(id) {
    this.canvas = document.getElementById(id);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.W = 0; this.H = 0;
    this._resize();
    window.addEventListener('resize', () => this._resize(), { passive: true });
    this._prime();
    this._loop();
  }
  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.scale(dpr, dpr);
  }
  _newEmber(startPrimed) {
    const x = Math.random() * this.W;
    const yBase = startPrimed ? Math.random() * this.H : this.H + 10;
    return {
      x, y: yBase,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(Math.random() * 0.8 + 0.3),
      life: 0,
      maxLife: Math.random() * 220 + 120,
      size: Math.random() * 2.5 + 0.5,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: (Math.random() * 0.025 + 0.008) * (Math.random() < 0.5 ? 1 : -1),
      bright: Math.random() > 0.7,
    };
  }
  _prime() {
    for (let i = 0; i < 80; i++) this.particles.push(this._newEmber(true));
  }
  _step() {
    while (this.particles.length < 100) this.particles.push(this._newEmber(false));
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.swing += p.swingSpeed;
      p.x += p.vx + Math.sin(p.swing) * 0.5;
      p.y += p.vy;
      if (p.life >= p.maxLife || p.y < -10) this.particles.splice(i, 1);
    }
  }
  _draw() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      const alpha = t < 0.1 ? t / 0.1 : t > 0.8 ? (1 - t) / 0.2 : 1;
      let r, g, b;
      if (p.bright) {
        r = 255; g = Math.round(186 * (1 - t * 0.6)); b = Math.round(8 * (1 - t));
      } else {
        r = Math.round(232 - t * 60); g = Math.round(93 * (1 - t * 0.8)); b = 4;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.85})`;
      ctx.fill();
    }
    /* subtle bottom glow */
    const grad = ctx.createLinearGradient(0, H * 0.75, 0, H);
    grad.addColorStop(0, 'rgba(220,47,2,0)');
    grad.addColorStop(1, 'rgba(220,47,2,0.06)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.75, W, H * 0.25);
  }
  _loop() { this._step(); this._draw(); requestAnimationFrame(() => this._loop()); }
}

/* ── Fire button canvas particles ── */
class FireButton {
  constructor(btn) {
    this.btn = btn;
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;border-radius:inherit;';
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.insertBefore(this.canvas, btn.firstChild);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.burst = 0;
    this.hover = false;
    this.W = 0; this.H = 0;
    this._resize();
    this._bind();
    this._prime();
    this._loop();
  }
  _resize() {
    const r = this.btn.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = r.width * dpr;
    this.canvas.height = r.height * dpr;
    this.canvas.style.width = r.width + 'px';
    this.canvas.style.height = r.height + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.W = r.width; this.H = r.height;
  }
  _bind() {
    this.btn.addEventListener('mouseenter', () => { this.hover = true; });
    this.btn.addEventListener('mouseleave', () => { this.hover = false; });
    this.btn.addEventListener('click', () => { this._burst(); });
    this.btn.addEventListener('touchend', () => { this._burst(); });
    window.addEventListener('resize', () => this._resize(), { passive: true });
  }
  _burst() {
    this.burst = 50;
    for (let i = 0; i < 25; i++) this.particles.push(this._newParticle(true));
  }
  _newParticle(b) {
    const big = b || this.burst > 0;
    return {
      x: Math.random() * this.W,
      y: this.H + Math.random() * 5,
      vx: (Math.random() - 0.5) * (big ? 3 : 1.5),
      vy: -(Math.random() * (big ? 5 : 2.5) + (this.hover ? 2 : 1)),
      life: 0,
      maxLife: Math.random() * 35 + (big ? 25 : 15),
      size: Math.random() * 10 + (big ? 6 : 3),
      swing: Math.random() * Math.PI * 2,
      swingSpeed: (Math.random() * 0.08 + 0.04) * (Math.random() < 0.5 ? 1 : -1),
    };
  }
  _prime() {
    for (let i = 0; i < 40; i++) {
      const p = this._newParticle(false);
      const age = Math.random();
      p.life = age * p.maxLife;
      p.y = this.H - age * this.H * 1.3;
      this.particles.push(p);
    }
  }
  _step() {
    if (this.burst > 0) this.burst--;
    const rate = this.burst > 0 ? 4 : (this.hover ? 2 : 1);
    for (let i = 0; i < rate; i++) {
      if (this.particles.length < 100) this.particles.push(this._newParticle(false));
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++; p.swing += p.swingSpeed;
      p.x += p.vx + Math.sin(p.swing) * 1.2;
      p.y += p.vy;
      if (this.burst > 0) p.vy -= 0.08;
      if (p.life >= p.maxLife || p.y < -p.size) this.particles.splice(i, 1);
    }
  }
  _draw() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    /* base glow at button bottom */
    const baseH = Math.min(H * 0.35, 24);
    const bg = ctx.createLinearGradient(0, H - baseH, 0, H);
    bg.addColorStop(0, 'rgba(220,47,2,0)');
    bg.addColorStop(0.5, `rgba(220,47,2,${this.burst > 0 ? 0.6 : 0.35})`);
    bg.addColorStop(1, `rgba(180,30,0,${this.burst > 0 ? 0.9 : 0.6})`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, H - baseH, W, baseH);
    /* particles */
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      const alpha = t < 0.15 ? t / 0.15 : 1 - t;
      const r = p.size * (1 - t * 0.6);
      let cr, cg, cb;
      if (t < 0.25) { cr = 255; cg = 255; cb = Math.round(220 * (1 - t / 0.25)); }
      else if (t < 0.5) { const tt = (t - 0.25) / 0.25; cr = 255; cg = Math.round(255 - tt * 90); cb = 0; }
      else if (t < 0.75) { const tt = (t - 0.5) / 0.25; cr = 255; cg = Math.round(165 - tt * 130); cb = 0; }
      else { const tt = (t - 0.75) / 0.25; cr = Math.round(255 - tt * 100); cg = 0; cb = 0; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 1.5);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${Math.min(alpha * 1.2, 1)})`);
      g.addColorStop(0.5, `rgba(${cr},${Math.round(cg * 0.7)},0,${alpha * 0.7})`);
      g.addColorStop(1, `rgba(${Math.round(cr * 0.5)},0,0,0)`);
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }
  }
  _loop() { this._step(); this._draw(); requestAnimationFrame(() => this._loop()); }
}

/* ── Collection filter buttons ── */
(function () {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.product-card[data-category]');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
})();

/* ── Contact form — basic client feedback ── */
(function () {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>Enquiry Sent — We\'ll Be In Touch</span>';
    btn.disabled = true;
    btn.style.background = 'var(--dark-5)';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
    }, 4000);
  });
})();

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  /* Hero canvas */
  new PhoenixCanvas('hero-canvas');
  /* Fire buttons */
  document.querySelectorAll('.btn--fire').forEach(btn => new FireButton(btn));
  /* Active nav link */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page || (page === 'index.html' && href === '#') || (page === '' && href === '#')) {
      link.classList.add('active');
    }
  });
});
