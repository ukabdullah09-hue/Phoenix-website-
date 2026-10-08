/* All motion for the store. Falls back to instant changes when GSAP is missing or reduced motion is on. */
window.Motion = (() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const g = window.gsap;
  const ST = window.ScrollTrigger;
  const FL = window.Flip;
  const on = !!(g && ST) && !reduce;
  if (on) { g.registerPlugin(ST); if (FL) g.registerPlugin(FL); }

  const fmtMoney = (n) => '£' + Math.round(n).toLocaleString('en-GB');
  const escText = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let heroDelay = 0;

  function splitWords(el) {
    if (el.dataset.split === 'done') return el.querySelectorAll('.w');
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${escText(w)}</span>`).join(' ');
    el.dataset.split = 'done';
    return el.querySelectorAll('.w');
  }

  /* ── First-load intro: the wordmark rises, a line fills, the curtain lifts ── */
  function loader() {
    const el = document.getElementById('loader');
    if (!el) return 0;
    if (!on) return 0;
    el.style.animation = 'none';
    const word = el.querySelector('.loader__word');
    const text = word.textContent;
    word.setAttribute('aria-label', text);
    word.innerHTML = [...text].map((ch) => `<span aria-hidden="true">${ch === ' ' ? ' ' : escText(ch)}</span>`).join('');
    g.timeline()
      .from(word.children, { yPercent: 110, duration: 0.5, ease: 'power4.out', stagger: 0.025 })
      .to(el, { yPercent: -100, duration: 0.7, ease: 'power4.inOut', delay: 0.2, onComplete: () => el.remove() });
    heroDelay = 0.95;
    return heroDelay;
  }

  function intro() {
    if (!on) return;
    // fromTo with explicit end values: the nav's CSS transform transition would otherwise be read back as the end state
    g.fromTo('#gnav', { y: -40, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: heroDelay * 0.85, clearProps: 'transform,opacity,transition' });
    g.from('.announce', { opacity: 0, duration: 0.6, delay: heroDelay * 0.85 });
  }

  function progress() {
    const bar = document.getElementById('progress-top');
    if (!bar) return () => {};
    let ticking = false;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
    return update;
  }

  function nav() {
    const bar = document.getElementById('gnav');
    let last = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      let hidden = bar.classList.contains('gnav--hidden');
      if (y > last + 6 && y > 160) hidden = true;
      else if (y < last - 6 || y < 160) hidden = false;
      bar.classList.toggle('gnav--hidden', hidden);
      document.body.classList.toggle('nav-hidden', hidden);
      last = y;
    }, { passive: true });
  }

  /* ── Every press: a ring where you touch, a spring on the thing you pressed ── */
  const PRESSABLE = 'a, button, label.opt, label.sw, summary, .fabric-tabs label, .units label';
  const DARK = '.btn--fill, .wa, .story, .card--more, .chips a[aria-current="page"], .finder-opt.picked, .strip__all, .units input:checked + span, .zoom__cap';

  function pressTarget(el) {
    if (el.matches('label.opt')) return el.querySelector(':scope > span');
    if (el.matches('label.sw')) return el.querySelector('i');
    if (el.matches('.fabric-tabs label, .units label')) return el.querySelector('span');
    if (el.matches('.card__name')) return el.closest('.card');
    if (el.matches('.strip__item')) return el.querySelector('.strip__thumb');
    return el;
  }

  function tapRing(x, y, el) {
    if (reduce) return;
    const r = document.createElement('span');
    r.className = 'tapfx';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    if (el.closest(DARK) || el.matches(DARK)) r.style.borderColor = 'rgba(255,255,255,.85)';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }

  function burst(x, y, opts) {
    if (reduce) return;
    const o = Object.assign({ n: 10, dist: 42, colors: ['#1d1d1f', '#6e6e73', '#c7c7cc'] }, opts);
    for (let i = 0; i < o.n; i++) {
      const a = (i / o.n) * Math.PI * 2 + Math.random() * 0.5;
      const d = o.dist * (0.55 + Math.random() * 0.7);
      const s = document.createElement('span');
      s.className = 'burst' + (i % 3 === 0 ? ' burst--sq' : '');
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.background = o.colors[i % o.colors.length];
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      s.style.setProperty('--rot', Math.round(Math.random() * 360) + 'deg');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }

  function burstAt(el, opts) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  }

  function pressFx() {
    document.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      const el = e.target.closest(PRESSABLE);
      if (!el || el.closest('[disabled]')) return;
      tapRing(e.clientX, e.clientY, el);
      if (el.matches('.btn--fill') && !el.closest('.buybar')) burst(e.clientX, e.clientY, { n: 8, dist: 30 });
      if (!on) return;
      const t = pressTarget(el);
      if (!t || getComputedStyle(t).display === 'inline') return;
      const w = t.offsetWidth;
      const amt = w > 400 ? 0.985 : w > 160 ? 0.96 : 0.9;
      g.to(t, { scale: amt, duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
      const release = () => {
        g.to(t, { scale: 1, duration: 0.75, ease: 'elastic.out(1, 0.38)', overwrite: 'auto' });
        window.removeEventListener('pointerup', release);
        window.removeEventListener('pointercancel', release);
      };
      window.addEventListener('pointerup', release);
      window.addEventListener('pointercancel', release);
      const tab = el.closest('.tabbar a');
      if (tab) g.fromTo(tab.querySelector('svg'), { y: 0 }, { y: -7, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' });
    }, { passive: true });
  }

  /* Ripple inside buttons and magnetic pull on desktop */
  function buttons(root) {
    root.querySelectorAll('.btn, .chips a, .seg button').forEach((b) => {
      if (b.dataset.fx) return;
      b.dataset.fx = '1';
      b.addEventListener('pointerdown', (e) => {
        if (reduce) return;
        const r = b.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 2.2;
        const s = document.createElement('span');
        s.className = 'ripple';
        s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
        b.appendChild(s);
        setTimeout(() => s.remove(), 700);
      });
      if (on && fine && b.classList.contains('btn')) {
        const mx = g.quickTo(b, 'x', { duration: 0.35, ease: 'power3' });
        const my = g.quickTo(b, 'y', { duration: 0.35, ease: 'power3' });
        b.addEventListener('pointermove', (e) => {
          const r = b.getBoundingClientRect();
          mx((e.clientX - r.left - r.width / 2) * 0.28);
          my((e.clientY - r.top - r.height / 2) * 0.4);
        });
        b.addEventListener('pointerleave', () => g.to(b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' }));
      }
    });
  }

  /* ── Page-level scroll animation ── */
  function reset() {
    if (!on) return;
    ST.getAll().forEach((t) => t.kill(true));
  }

  function page(root, first) {
    buttons(document);
    faq(root);
    if (!on) { morphCancel(); return; }
    const d0 = first ? heroDelay : 0;

    const heroTitle = root.querySelector('[data-hero-title]');
    if (heroTitle) {
      const words = splitWords(heroTitle);
      const tl = g.timeline({ delay: d0 });
      tl.from(words, { yPercent: 70, opacity: 0, rotateX: -50, transformOrigin: '50% 100%', duration: 0.95, ease: 'power4.out', stagger: 0.06 })
        .from(root.querySelectorAll('[data-hero-after]'), { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.09, clearProps: 'transform,opacity' }, '-=0.55');
      const strip = root.querySelector('[data-strip]');
      if (strip) tl.from(strip.children, { y: 34, opacity: 0, scale: 0.9, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.035, clearProps: 'transform,opacity' }, '-=0.45');
    }

    const zoom = root.querySelector('.zoom');
    if (zoom) {
      const frame = zoom.querySelector('.zoom__frame');
      const img = frame.querySelector('img');
      const cap = zoom.querySelector('.zoom__cap');
      const inset = window.innerWidth < 700 ? '6% 5% 6% 5%' : '10% 16% 10% 16%';
      g.fromTo(img, { filter: 'blur(14px)' }, { filter: 'blur(0px)', duration: 1.4, ease: 'power2.out', delay: d0 });
      g.set(cap, { opacity: 0, y: 30 });
      const tl = g.timeline({ scrollTrigger: { trigger: zoom, start: 'top top', end: '+=80%', scrub: 0.6, pin: true, anticipatePin: 1 } });
      tl.fromTo(frame, { clipPath: `inset(${inset} round 28px)` }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 })
        .fromTo(img, { scale: 1.22 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .to(cap, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.65);
      const introEl = root.querySelector('.hero-intro');
      if (introEl) g.to(introEl, { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: zoom, start: 'top 55%', end: 'top top', scrub: true } });
    }

    const story = root.querySelector('.story');
    if (story && window.innerWidth >= 900) {
      story.classList.add('story--animated');
      const steps = story.querySelectorAll('.story__step');
      const imgs = story.querySelectorAll('.story__media img');
      g.set([...steps].slice(1), { opacity: 0, y: 40 });
      const tl = g.timeline({ scrollTrigger: { trigger: story, start: 'top top', end: `+=${steps.length * 65}%`, scrub: 0.6, pin: true, anticipatePin: 1 } });
      for (let i = 1; i < steps.length; i++) {
        tl.to(steps[i - 1], { opacity: 0, y: -40, duration: 0.5 })
          .to(imgs[i - 1], { opacity: 0, scale: 1.08, duration: 0.6 }, '<')
          .fromTo(imgs[i], { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.6 }, '<')
          .to(steps[i], { opacity: 1, y: 0, duration: 0.5 }, '<0.2')
          .to({}, { duration: 0.35 });
      }
    }

    root.querySelectorAll('[data-brighten]').forEach((el) => {
      const words = splitWords(el);
      g.fromTo(words, { color: '#c7c7cc' }, { color: '#1d1d1f', stagger: 0.12, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 50%', scrub: true } });
    });

    root.querySelectorAll('[data-parallax]').forEach((box) => {
      const img = box.querySelector('img');
      g.fromTo(box, { clipPath: 'inset(22% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: box, start: 'top 95%', end: 'top 55%', scrub: true } });
      g.fromTo(img, { yPercent: -7, scale: 1.14 }, { yPercent: 7, scale: 1.04, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    root.querySelectorAll('[data-stagger]').forEach((box) => {
      // Long lists keep the whole cascade under ~0.6s
      g.from(box.children, { y: 50, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: Math.min(0.08, 0.6 / box.children.length), clearProps: 'transform,opacity', scrollTrigger: { trigger: box, start: 'top 90%', once: true } });
    });

    // Grids: what's on screen rises in at once, the rest rises in batches as you scroll to it
    root.querySelectorAll('[data-stagger-now]').forEach((box) => {
      const shown = [...box.children].filter((c) => !c.classList.contains('is-hidden'));
      const fold = window.innerHeight;
      const now = shown.filter((c) => c.getBoundingClientRect().top < fold);
      const later = shown.filter((c) => c.getBoundingClientRect().top >= fold);
      g.from(now, { y: 30, opacity: 0, scale: 0.96, duration: 0.6, ease: 'power3.out', stagger: 0.03, delay: d0 + 0.15, clearProps: 'transform,opacity' });
      if (later.length) {
        g.set(later, { y: 46, opacity: 0, scale: 0.94 });
        box._batch = ST.batch(later, { start: 'top 96%', once: true, onEnter: (els) => g.to(els, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity' }) });
      }
    });

    root.querySelectorAll('.rail').forEach((rail) => {
      g.from(rail.children, { x: 80, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity', scrollTrigger: { trigger: rail, start: 'top 88%', once: true } });
      drag(rail);
    });

    root.querySelectorAll('.steps-wrap').forEach((wrap) => {
      const line = wrap.querySelector('.steps-line');
      if (line) g.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top 75%', end: 'top 35%', scrub: true } });
      g.from(wrap.querySelectorAll('.step__n'), { scale: 0, rotate: -90, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.25, scrollTrigger: { trigger: wrap, start: 'top 75%', once: true } });
    });

    root.querySelectorAll('[data-count-to]').forEach((el) => {
      const to = parseFloat(el.dataset.countTo);
      const obj = { v: 0 };
      el.textContent = '0.0';
      g.to(obj, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = obj.v.toFixed(1); }, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    root.querySelectorAll('[data-stars]').forEach((el) => {
      g.from(el.querySelectorAll('.star'), { opacity: 0, scale: 0.2, rotate: -40, duration: 0.5, ease: 'back.out(3)', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
    });

    if (fine) root.querySelectorAll('.card').forEach(tilt);

    morphEnd(root.querySelector('#hero-figure'));

    root.querySelectorAll('img').forEach((img) => { if (!img.complete) img.addEventListener('load', () => ST.refresh(), { once: true }); });
    requestAnimationFrame(() => ST.refresh());
  }

  function tilt(card) {
    if (card.dataset.tilt) return;
    card.dataset.tilt = '1';
    const rx = g.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = g.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
    card.addEventListener('pointerenter', () => g.set(card, { transformPerspective: 900 }));
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 9);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  function drag(rail) {
    if (!fine || rail.dataset.drag) return;
    rail.dataset.drag = '1';
    let down = false, startX = 0, startScroll = 0, lastX = 0, lastT = 0, v = 0, moved = false;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.target.closest('button')) return;
      down = true; moved = false; startX = lastX = e.clientX; startScroll = rail.scrollLeft; lastT = performance.now(); v = 0;
      g.killTweensOf(rail);
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4 && !moved) { moved = true; rail.classList.add('dragging'); }
      if (!moved) return;
      rail.scrollLeft = startScroll - dx;
      const t = performance.now();
      v = (e.clientX - lastX) / Math.max(1, t - lastT);
      lastX = e.clientX; lastT = t;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      g.to(rail, { scrollLeft: rail.scrollLeft - v * 380, duration: 0.9, ease: 'power3.out', onComplete: () => rail.classList.remove('dragging') });
    });
  }

  /* FAQ answers glide open and closed */
  function faq(root) {
    root.querySelectorAll('.faq details').forEach((d) => {
      if (d.dataset.faq) return;
      d.dataset.faq = '1';
      const s = d.querySelector('summary');
      const body = d.querySelector('p');
      s.addEventListener('click', (e) => {
        if (!on || !body) return;
        e.preventDefault();
        if (d.open) {
          g.to(body, { height: 0, opacity: 0, paddingBottom: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => { d.open = false; g.set(body, { clearProps: 'height,opacity,paddingBottom' }); } });
        } else {
          d.open = true;
          g.fromTo(body, { height: 0, opacity: 0, paddingBottom: 0 }, { height: 'auto', opacity: 1, paddingBottom: '1.2rem', duration: 0.5, ease: 'power3.out', clearProps: 'height,paddingBottom' });
        }
      });
    });
  }

  /* Glide ring between options, measured from layout so presses never skew it */
  function ring(opts) {
    let r = opts.querySelector('.sel-ring');
    if (!r) { r = document.createElement('div'); r.className = 'sel-ring'; opts.appendChild(r); opts.classList.add('ringed'); }
    const place = (instant) => {
      const input = opts.querySelector('input:checked');
      if (!input) { r.style.opacity = 0; return; }
      const label = input.closest('label');
      if (instant || reduce) r.style.transition = 'none';
      r.style.opacity = 1;
      r.style.width = label.offsetWidth + 'px';
      r.style.height = label.offsetHeight + 'px';
      r.style.transform = `translate(${label.offsetLeft}px, ${label.offsetTop}px)`;
      if (instant || reduce) { r.offsetWidth; r.style.transition = ''; }
    };
    place(true);
    opts.addEventListener('change', () => place(false));
    return place;
  }

  function seg(el) {
    let pill = el.querySelector('.seg__pill');
    if (!pill) { pill = document.createElement('span'); pill.className = 'seg__pill'; el.prepend(pill); }
    const place = () => {
      const b = el.querySelector('[aria-selected="true"], [aria-pressed="true"]');
      if (!b) return;
      pill.style.width = b.offsetWidth + 'px';
      pill.style.transform = `translateX(${b.offsetLeft}px)`;
    };
    place();
    return place;
  }

  /* Ink pill that slides between category chips */
  function chips(el) {
    let pill = el.querySelector('.chips__pill');
    if (!pill) { pill = document.createElement('span'); pill.className = 'chips__pill'; pill.setAttribute('aria-hidden', 'true'); el.prepend(pill); el.classList.add('chips--pill'); }
    const place = (instant) => {
      const a = el.querySelector('a[aria-current="page"]');
      if (!a) { pill.style.opacity = 0; return; }
      if (instant || reduce) pill.style.transition = 'none';
      pill.style.opacity = 1;
      pill.style.width = a.offsetWidth + 'px';
      pill.style.height = a.offsetHeight + 'px';
      pill.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop}px)`;
      if (instant || reduce) { pill.offsetWidth; pill.style.transition = ''; }
      const target = a.offsetLeft - (el.clientWidth - a.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: instant || reduce ? 'auto' : 'smooth' });
    };
    place(true);
    return place;
  }

  /* Filtering and sorting: cards glide to their new places */
  let flipTl = null;
  function flip(targets, mutate) {
    if (!on || !FL) { mutate(); return; }
    // Finish a flip that is still running so rapid taps never stack states or leave a card faded out
    if (flipTl) { const t = flipTl; flipTl = null; t.progress(1); t.kill(); }
    const box = targets[0] && targets[0].parentElement;
    if (box && box._batch) { box._batch.forEach((t) => t.kill()); box._batch = null; }
    g.killTweensOf(targets);
    g.set(targets, { clearProps: 'opacity,transform' });
    const state = FL.getState(targets);
    mutate();
    flipTl = FL.from(state, {
      duration: 0.65, ease: 'power3.inOut', absolute: true, stagger: 0.012, scale: true,
      onComplete() { if (flipTl === this) flipTl = null; },
      onEnter: (els) => g.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.12, ease: 'power3.out', stagger: 0.02 }),
      onLeave: (els) => g.to(els, { opacity: 0, scale: 0.85, duration: 0.3, ease: 'power2.in' })
    });
  }

  function heart(btn) {
    btn.classList.remove('pop'); btn.offsetWidth; btn.classList.add('pop');
    if (reduce || btn.getAttribute('aria-pressed') !== 'true') return;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const s = document.createElement('span');
      s.className = 'spark';
      s.style.setProperty('--dx', Math.cos(a) * 22 + 'px');
      s.style.setProperty('--dy', Math.sin(a) * 22 + 'px');
      btn.appendChild(s);
      setTimeout(() => s.remove(), 650);
    }
  }

  function basketIcon() {
    return [...document.querySelectorAll('[data-basket-icon]')].find((el) => el.getBoundingClientRect().width > 0 && getComputedStyle(el.closest('.tabbar') || el).display !== 'none');
  }

  /* Add to basket: spinner, tick, confetti, photo flies into the basket */
  function addToBag(btn, fromImg, done) {
    if (!btn || btn.classList.contains('is-loading') || btn.classList.contains('is-done')) return;
    btn.classList.add('is-loading');
    setTimeout(() => {
      btn.classList.remove('is-loading');
      btn.classList.add('is-done');
      burstAt(btn, { n: 14, dist: 60 });
      const target = basketIcon();
      if (on && fromImg && target) {
        const a = fromImg.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const fly = document.createElement('img');
        fly.src = fromImg.currentSrc || fromImg.src;
        fly.alt = '';
        fly.className = 'fly';
        document.body.appendChild(fly);
        const sx = a.left + a.width / 2 - 42, sy = a.top + a.height / 2 - 42;
        const ex = b.left + b.width / 2 - 42, ey = b.top + b.height / 2 - 42;
        g.set(fly, { x: sx, y: sy, scale: 1 });
        g.timeline({ onComplete: () => { fly.remove(); if (done) done(); bump(target); } })
          .to(fly, { x: ex, duration: 0.85, ease: 'power1.inOut' })
          .to(fly, { y: ey, duration: 0.85, ease: 'back.in(1.4)' }, 0)
          .to(fly, { scale: 0.18, rotate: 12, duration: 0.85, ease: 'power2.in' }, 0)
          .to(fly, { opacity: 0, duration: 0.15 }, 0.72);
      } else {
        if (done) done();
        if (target) bump(target);
      }
      setTimeout(() => btn.classList.remove('is-done'), 1600);
    }, reduce ? 0 : 650);
  }

  function bump(el) {
    if (reduce || !el) return;
    el.classList.remove('bump'); el.offsetWidth; el.classList.add('bump');
    const c = el.querySelector('.count');
    if (c && on) g.fromTo(c, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(3)' });
  }

  function money(el, value) {
    const from = parseFloat(el.dataset.v || value);
    el.dataset.v = value;
    if (!on || from === value) { el.textContent = fmtMoney(value); return; }
    const o = { v: from };
    g.to(o, { v: value, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => { el.textContent = fmtMoney(o.v); } });
    g.fromTo(el, { scale: 1.08 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
  }

  /* Numbers flip up or down like a counter */
  function flipNum(el, value, dir) {
    if (!on) { el.textContent = value; return; }
    g.to(el, { yPercent: -60 * dir, opacity: 0, duration: 0.12, ease: 'power2.in', onComplete: () => {
      el.textContent = value;
      g.fromTo(el, { yPercent: 60 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)' });
    } });
  }

  function pop(el) {
    if (on && el) g.fromTo(el, { scale: 0.7 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  }

  function fadeSwap(el, html) {
    if (!on) { el.innerHTML = html; return; }
    g.to(el, { opacity: 0, y: -4, duration: 0.15, overwrite: true, onComplete: () => { el.innerHTML = html; g.to(el, { opacity: 1, y: 0, duration: 0.3 }); } });
  }

  function textSwap(el, text) {
    if (!el || el.textContent === text) return;
    if (!on) { el.textContent = text; return; }
    g.to(el, { opacity: 0, y: -8, duration: 0.15, overwrite: true, onComplete: () => { el.textContent = text; g.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }); } });
  }

  function flash(rows) {
    rows.forEach((r) => { r.classList.remove('flash'); r.offsetWidth; r.classList.add('flash'); });
  }

  function shake(el) {
    if (reduce || !el) return;
    el.classList.remove('shake'); el.offsetWidth; el.classList.add('shake');
  }

  function collapse(el, done) {
    if (!on) { done(); return; }
    g.timeline({ onComplete: done })
      .to(el, { x: 80, opacity: 0, duration: 0.3, ease: 'power2.in' })
      .to(el, { height: 0, paddingTop: 0, paddingBottom: 0, borderBottomWidth: 0, duration: 0.35, ease: 'power2.inOut' });
  }

  function slideIn(el, dir) {
    if (!on || !el) return;
    g.from(el.children, { x: 50 * (dir || 1), opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05, clearProps: 'transform,opacity' });
  }

  function slideOut(el, dir, done) {
    if (!on || !el) { done(); return; }
    g.to(el.children, { x: -40 * (dir || 1), opacity: 0, duration: 0.25, ease: 'power2.in', stagger: 0.02, onComplete: done });
  }

  /* Shared photo: the picture you tap grows into the product page */
  let morph = null;
  function morphStart(img) {
    if (!on || !img) return;
    morphCancel();
    const r = img.getBoundingClientRect();
    if (r.width < 10 || r.bottom < 0 || r.top > window.innerHeight) return;
    const c = document.createElement('img');
    c.src = img.currentSrc || img.src;
    c.alt = '';
    c.className = 'morph';
    Object.assign(c.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    document.body.appendChild(c);
    g.fromTo(c, { scale: 1 }, { scale: 1.04, duration: 0.25, ease: 'power2.out' });
    morph = { c, t: setTimeout(morphCancel, 2500) };
  }
  function morphCancel() {
    if (!morph) return;
    clearTimeout(morph.t);
    const c = morph.c;
    morph = null;
    if (on) g.to(c, { opacity: 0, duration: 0.25, onComplete: () => c.remove() });
    else c.remove();
  }
  function morphEnd(target) {
    if (!morph) return;
    if (!target) { morphCancel(); return; }
    const { c, t } = morph;
    clearTimeout(t);
    morph = null;
    const r = target.getBoundingClientRect();
    g.set(target, { opacity: 0 });
    g.to(c, { left: r.left, top: r.top, width: r.width, height: r.height, scale: 1, borderRadius: 18, duration: 0.75, ease: 'power3.inOut', onComplete: () => {
      g.set(target, { opacity: 1 });
      g.to(c, { opacity: 0, duration: 0.2, onComplete: () => c.remove() });
    } });
  }

  function transition(view, swap, first) {
    if (!on || first) { swap(); return; }
    g.to(view, { opacity: 0, y: 10, duration: 0.18, ease: 'power2.in', onComplete: () => {
      swap();
      g.fromTo(view, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all', onComplete: () => ST.refresh() });
    } });
  }

  function sheet(el, open) {
    if (!on) { el.hidden = !open; return; }
    if (open) { el.hidden = false; g.fromTo(el, { scale: 0.85, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)' }); }
    else g.to(el, { scale: 0.9, opacity: 0, duration: 0.18, onComplete: () => { el.hidden = true; g.set(el, { clearProps: 'all' }); } });
  }

  function spin(el) {
    if (on && el) g.fromTo(el, { rotate: 0 }, { rotate: 360, duration: 0.7, ease: 'back.out(1.6)' });
  }

  return { on, reduce, loader, intro, progress, nav, pressFx, buttons, reset, page, ring, seg, chips, flip, heart, addToBag, bump, money, flipNum, pop, fadeSwap, textSwap, flash, shake, collapse, slideIn, slideOut, morphStart, morphCancel, transition, sheet, spin, burst, burstAt, splitWords };
})();
