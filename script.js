/* ─────────────────────────────────────────
   PHOENIX BEDS — Premium Animations
   ───────────────────────────────────────── */

/* ── PAGE LOADER ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden');
  }, 1500);
});

/* ── HERO PARTICLE CANVAS ── */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = [
    'rgba(212,160,23,',   // gold
    'rgba(232,188,60,',   // gold-lt
    'rgba(139,53,214,',   // purple
    'rgba(176,176,176,',  // silver
    'rgba(255,255,255,',  // white
  ];

  class Particle {
    constructor() { this.reset(true); }
    reset(randomY = false) {
      this.x    = Math.random() * canvas.width;
      this.y    = randomY ? Math.random() * canvas.height : canvas.height + 10;
      this.r    = Math.random() * 2.2 + .5;
      this.vy   = -(Math.random() * .6 + .2);
      this.vx   = (Math.random() - .5) * .4;
      this.life = 0;
      this.maxLife = Math.random() * 200 + 120;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * .04 + .01;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      this.twinkle += this.twinkleSpeed;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const opacity  = progress < .2 ? progress / .2 : progress > .8 ? (1 - progress) / .2 : 1;
      const twinkleOpacity = opacity * (.5 + .5 * Math.sin(this.twinkle));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + twinkleOpacity + ')';
      ctx.fill();
    }
  }

  const particles = Array.from({ length: 90 }, () => new Particle());

  // Occasional large sparkle
  class Sparkle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * canvas.width;
      this.y    = Math.random() * canvas.height;
      this.life = 0;
      this.maxLife = Math.random() * 60 + 30;
      this.size = Math.random() * 6 + 2;
    }
    update() {
      this.life++;
      if (this.life > this.maxLife) this.reset();
    }
    draw() {
      const t = this.life / this.maxLife;
      const op = t < .3 ? t / .3 : t > .7 ? (1 - t) / .3 : 1;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.life * .05);
      const g = ctx.createLinearGradient(-this.size, 0, this.size, 0);
      g.addColorStop(0, `rgba(212,160,23,0)`);
      g.addColorStop(.5, `rgba(232,188,60,${op})`);
      g.addColorStop(1, `rgba(212,160,23,0)`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      // 4-pointed star
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(i * Math.PI / 2) * this.size, Math.sin(i * Math.PI / 2) * this.size);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  const sparkles = Array.from({ length: 12 }, () => new Sparkle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    sparkles.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ── MOBILE MENU ── */
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = burger.querySelectorAll('span');
    const open  = mobileMenu.classList.contains('open');
    if (open) {
      spans[0].style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
      spans[1].style.cssText = 'opacity:0;transform:translateX(-10px)';
      spans[2].style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => s.removeAttribute('style'));
    }
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => s.removeAttribute('style'));
    });
  });
}

/* ── STICKY CTA ── */
const stickyCta = document.getElementById('stickyCta');
if (stickyCta) {
  window.addEventListener('scroll', () => {
    stickyCta.classList.toggle('visible', window.scrollY > 700);
  }, { passive: true });
}

/* ── NAV ACTIVE LINK ── */
const navLinks = document.querySelectorAll('.nav__links a');
const sections = document.querySelectorAll('section[id]');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => navObserver.observe(s));

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
  revealObserver.observe(el);
});

/* ── BUTTON RIPPLE ── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect   = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top  = (e.clientY - rect.top) + 'px';
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

/* ── BUTTON MAGNETIC EFFECT ── */
document.querySelectorAll('.btn--gold, .btn--silver').forEach(btn => {
  btn.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) * .12;
    const dy   = (e.clientY - cy) * .12;
    this.style.transform = `translateY(-3px) translate(${dx}px, ${dy}px) scale(1.02)`;
  });
  btn.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
});

/* ── 3D CARD TILT ── */
document.querySelectorAll('.product-card, .review-card, .contact-card').forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect  = this.getBoundingClientRect();
    const x     = e.clientX - rect.left;
    const y     = e.clientY - rect.top;
    const cx    = rect.width  / 2;
    const cy    = rect.height / 2;
    const rotX  = ((y - cy) / cy) * -6;
    const rotY  = ((x - cx) / cx) *  6;
    this.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    this.style.boxShadow = `${-rotY * 2}px ${rotX * 2 + 20}px 40px rgba(0,0,0,.2)`;
    // Shine highlight following cursor
    const shine = this.querySelector('.card-shine');
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,.12) 0%, transparent 60%)`;
    }
  });
  card.addEventListener('mouseleave', function() {
    this.style.transform = '';
    this.style.boxShadow = '';
  });
  // Inject shine div
  const shine = document.createElement('div');
  shine.className = 'card-shine';
  shine.style.cssText = 'position:absolute;inset:0;pointer-events:none;border-radius:inherit;z-index:1;transition:background .1s ease;';
  card.style.position = 'relative';
  card.appendChild(shine);
});

/* ── COUNTER ANIMATION (proof bar) ── */
function animateCounter(el, target, suffix, duration = 1600) {
  const start = performance.now();
  const isDecimal = String(target).includes('.');
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val  = isDecimal ? (ease * target).toFixed(1) : Math.round(ease * target);
    el.textContent = val + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const proofBar   = document.querySelector('.proof-bar__inner');
let proofCounted = false;
const counterObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !proofCounted) {
    proofCounted = true;
    const items = proofBar.querySelectorAll('.proof-item strong');
    // 50,000+  →  50 + "K+"
    // 4.9 ★    →  4.9 + " ★"
    const targets = [
      { val: 50, suffix: ',000+' },
      { val: 4.9, suffix: ' ★' },
      { val: null, text: 'UK Wide' },
      { val: null, text: 'Next-Day' },
    ];
    items.forEach((el, i) => {
      if (targets[i].val !== null) {
        animateCounter(el, targets[i].val, targets[i].suffix);
      }
    });
  }
}, { threshold: .5 });
if (proofBar) counterObserver.observe(proofBar);

/* ── STEP NUMBER COUNT-IN ── */
document.querySelectorAll('.step__number').forEach((el, i) => {
  const stepObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      el.style.animation = `fadeInScale .5s ease ${i * .15}s both`;
      stepObserver.unobserve(el);
    }
  }, { threshold: .8 });
  stepObserver.observe(el);
});

/* ── PARALLAX ON HERO ── */
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero__content');
  if (hero && window.scrollY < window.innerHeight) {
    hero.style.transform = `translateY(${window.scrollY * .28}px)`;
    hero.style.opacity   = 1 - window.scrollY / (window.innerHeight * .85);
  }
}, { passive: true });

/* ── ORDER FORM SUBMISSION ── */
const form = document.getElementById('orderForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled    = true;
    btn.style.opacity = '.7';
    setTimeout(() => {
      form.innerHTML = `
        <div style="text-align:center;padding:24px 0;animation:fadeInScale .6s ease both;">
          <div style="font-size:3rem;margin-bottom:16px;animation:floatY 2s ease infinite;">✅</div>
          <h3 style="font-family:'Cinzel',serif;color:#E8BC3C;margin-bottom:12px;letter-spacing:.06em;">Thank You!</h3>
          <p style="color:#B0B0B0;font-size:.95rem;line-height:1.7;">We've received your enquiry and will call you back within 2 hours.<br>
          In the meantime, WhatsApp us on <strong style="color:#E8BC3C">0123 456 7890</strong>.</p>
          <a href="https://wa.me/441234567890" class="btn btn--whatsapp" style="margin-top:20px;display:inline-flex;" target="_blank">💬 WhatsApp Us Now</a>
        </div>`;
    }, 1200);
  });
}

/* ── ANNOUNCEMENT BAR TYPING ── */
(function typeAnnouncement() {
  const bar = document.querySelector('.announcement-bar');
  if (!bar) return;
  const text = bar.textContent.trim();
  bar.textContent = '';
  bar.style.opacity = '1';
  let i = 0;
  function type() {
    if (i <= text.length) {
      bar.textContent = text.slice(0, i);
      i++;
      setTimeout(type, i === 0 ? 800 : 22);
    }
  }
  setTimeout(type, 1800);
})();

/* ── SECTION HEADER WORD-BY-WORD REVEAL ── */
document.querySelectorAll('.section-title').forEach(title => {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      const words = title.innerHTML.split(' ');
      title.innerHTML = words.map((w, i) =>
        `<span style="display:inline-block;opacity:0;transform:translateY(20px);transition:opacity .5s ease ${i * .07}s,transform .5s cubic-bezier(.22,1,.36,1) ${i * .07}s;">${w}</span>`
      ).join(' ');
      requestAnimationFrame(() => {
        title.querySelectorAll('span').forEach(s => {
          s.style.opacity   = '1';
          s.style.transform = 'translateY(0)';
        });
      });
      observer.unobserve(title);
    }
  }, { threshold: .5 });
  observer.observe(title);
});

/* ── NAV SHADOW ON SCROLL ── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (nav) {
    nav.style.boxShadow = window.scrollY > 40
      ? '0 4px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(212,160,23,.08)'
      : '0 2px 24px rgba(0,0,0,.5)';
  }
}, { passive: true });
