/* All motion for the store. Falls back to instant changes when GSAP is missing or reduced motion is on. */
window.Motion = (() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const g = window.gsap;
  const ST = window.ScrollTrigger;
  const FL = window.Flip;
  const on = !!(g && ST) && !reduce;
  if (on) {
    g.registerPlugin(ST); if (FL) g.registerPlugin(FL);
    // Phone address bars grow and shrink while scrolling; recalculating every trigger on that resize causes jumps
    ST.config({ ignoreMobileResize: true });
  }

  const fmtMoney = (n) => '£' + Math.round(n).toLocaleString('en-GB');
  const escText = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let heroDelay = 0;
  const cleanups = [];
  const buzz = (ms) => { if (!fine && navigator.vibrate) navigator.vibrate(ms); };

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
    heroDelay = 1.35;
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

  /* Buttons squash like jelly; cards pressed by a finger tip toward it, then spring back */
  const SQUISH = '.btn, .zoom-arrow, .zoom-dot, .wa, .heart, .qty button, .seg button, .chips a, .bag-link, .finder-opt';
  const TIP = '.cat, .card, .strip__thumb';

  function pressFx() {
    const start = (e, el, released) => {
      tapRing(e.clientX, e.clientY, el);
      if (el.matches('.btn--fill') && !el.closest('.buybar')) burst(e.clientX, e.clientY, { n: 8, dist: 30 });
      if (!on) return;
      const t = pressTarget(el);
      if (!t || getComputedStyle(t).display === 'inline') return;
      const r = t.getBoundingClientRect();
      const amt = r.width > 400 ? 0.985 : r.width > 160 ? 0.96 : 0.9;
      springRelease(t);
      // Most loved cards press with a plain, quick ease: no tilt, no elastic bounce
      const railCard = !!t.closest('.rail');
      const tipped = e.pointerType !== 'mouse' && t.matches(TIP) && !railCard;
      let press = { scale: amt };
      if (t.matches(SQUISH)) {
        press = { scaleX: 1 + (1 - amt) * 0.35, scaleY: 1 - (1 - amt) * 1.1 };
      } else if (tipped) {
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        t.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        t.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        press = { scale: amt, rotationY: (px - 0.5) * 13, rotationX: (0.5 - py) * 10, transformPerspective: 700 };
      }
      t.classList.add('is-pressed');
      g.to(t, Object.assign(press, { duration: 0.14, ease: 'power2.out', overwrite: 'auto' }));
      const release = (cancelled) => {
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cancel);
        t.classList.remove('is-pressed');
        const back = { scaleX: 1, scaleY: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1.1, 0.32)', overwrite: 'auto' };
        if (tipped) Object.assign(back, { rotationX: 0, rotationY: 0, ease: 'elastic.out(1, 0.42)' });
        if (cancelled || railCard) Object.assign(back, { duration: 0.35, ease: 'power3.out' });
        g.to(t, back);
      };
      const up = () => release(false);
      const cancel = () => release(true);
      if (released) setTimeout(up, 120);
      else { window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cancel); }
      const tab = el.closest('.tabbar a');
      // Web Animations, not GSAP: GSAP measures a bare <svg> by moving it in the DOM and puts it back after the label
      if (tab) tab.querySelector('svg').animate([{ transform: 'none' }, { transform: 'translateY(-7px)' }, { transform: 'none' }], { duration: 320, easing: 'ease-out' });
    };
    document.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      const el = e.target.closest(PRESSABLE);
      if (!el || el.closest('[disabled]')) return;
      if (e.pointerType !== 'touch') return start(e, el, false);
      let done = false;
      const wait = setTimeout(() => { done = true; start(e, el, false); }, 90);
      const cleanup = () => { window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onCancel); };
      const onUp = () => { cleanup(); if (!done) { done = true; clearTimeout(wait); start(e, el, true); } };
      const onCancel = () => { cleanup(); clearTimeout(wait); };
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
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
    while (cleanups.length) cleanups.pop()();
    springReset();
    if (!on) return;
    ST.getAll().forEach((t) => t.kill(true));
  }

  function page(root, first) {
    buttons(document);
    faq(root);
    carousel(root.querySelector('.zoom'));
    if (!on) { morphCancel(); return; }
    const d0 = first ? heroDelay : 0;
    springObserve(root);
    shimmer(root);

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
      // The carousel clips its whole track so every slide shares the reveal; the story page has a single frame
      const track = zoom.querySelector('.zoom-track');
      const frame = track || zoom.querySelector('.zoom__frame');
      const imgs = zoom.querySelectorAll('.zoom__frame img');
      const cap = zoom.querySelector('.zoom__cap');
      const inset = window.innerWidth < 700 ? '6% 5% 6% 5%' : '10% 16% 10% 16%';
      // A full-screen blur costs phones a lot of frames; they get a plain fade instead
      if (fine) g.fromTo(imgs[0], { filter: 'blur(14px)' }, { filter: 'blur(0px)', duration: 1.4, ease: 'power2.out', delay: d0, clearProps: 'filter' });
      else if (imgs[0].complete) g.from(imgs[0], { opacity: 0, duration: 1, ease: 'power2.out', delay: d0, clearProps: 'opacity' });
      // Caption, dots and arrows stay untappable until they have faded in
      if (track) { g.set(zoom, { '--cap': 0 }); zoom.classList.add('cap-off'); } else g.set(cap, { opacity: 0, y: 30 });
      const tl = g.timeline({ scrollTrigger: { trigger: zoom, start: 'top top', end: '+=80%', scrub: 0.6, pin: true, anticipatePin: 1,
        onUpdate: track ? (self) => zoom.classList.toggle('cap-off', self.progress < 0.65) : undefined } });
      tl.fromTo(frame, { clipPath: `inset(${inset} round 28px)` }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 })
        .fromTo(imgs, { scale: 1.22 }, { scale: 1, ease: 'none', duration: 1 }, 0);
      if (track) tl.to(zoom, { '--cap': 1, duration: 0.35, ease: 'power2.out' }, 0.65);
      else tl.to(cap, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.65);
      const introEl = root.querySelector('.hero-intro');
      if (introEl) g.to(introEl, { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: zoom, start: 0, end: 'top top', scrub: true } });
    }

    // Category tiles: each rises, then its photo wipes up from the bottom while the picture settles inside
    const cats = [...root.querySelectorAll('.cats > .cat')];
    if (cats.length) {
      const parts = (t) => [t.querySelector('.cat__img'), t.querySelector('.cat__img img'), t.querySelectorAll('.cat__body > *')];
      cats.forEach((t) => {
        const [box, pic, words] = parts(t);
        g.set(t, { y: 46, opacity: 0 });
        g.set(box, { yPercent: 101, transition: 'none' }); // its CSS hover transition would smear the reveal
        g.set(pic, { yPercent: -55, scale: 1.3 });
        g.set(words, { y: 14, opacity: 0 });
      });
      const reveal = (els) => els.forEach((t, i) => {
        if (t.dataset.shown) return;
        t.dataset.shown = '1';
        const [box, pic, words] = parts(t);
        const at = i * 0.1;
        g.timeline({ delay: at })
          .to(t, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity' })
          .to(box, { yPercent: 0, duration: 1.05, ease: 'expo.out', clearProps: 'transform,transition' }, 0.05)
          .to(pic, { yPercent: 0, scale: 1.12, duration: 1.35, ease: 'expo.out' }, 0.05)
          .to(words, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' }, 0.4);
      });
      ST.batch(cats, { start: 'top 94%', once: true, onEnter: reveal, onEnterBack: reveal, onLeave: reveal });
    }

    // Promise icons draw themselves stroke by stroke, then pop into place
    root.querySelectorAll('.promises').forEach((box) => {
      const icons = box.querySelectorAll('svg');
      const lines = [...box.querySelectorAll('svg path, svg rect, svg circle')];
      lines.forEach((s) => { const len = s.getTotalLength() + 1; s.style.strokeDasharray = len; s.style.strokeDashoffset = len; });
      g.set(icons, { scale: 0.4, rotate: -25, opacity: 0 });
      let drawn = false;
      const draw = () => {
        if (drawn) return;
        drawn = true;
        g.to(icons, { scale: 1, rotate: 0, opacity: 1, duration: 0.85, ease: 'back.out(2.4)', stagger: 0.1, clearProps: 'transform,opacity' });
        g.to(lines, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.06, delay: 0.15, clearProps: 'strokeDasharray,strokeDashoffset' });
      };
      ST.create({ trigger: box, start: 'top 90%', once: true, onEnter: draw, onEnterBack: draw, onLeave: draw });
    });

    root.querySelectorAll('.gallery__track').forEach((t) => depth(t, 'img', 0.3, 0));

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
      g.from(rail.children, { y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity', scrollTrigger: { trigger: rail, start: 'top 88%', once: true } });
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

    if (fine) root.querySelectorAll('.card, .cat').forEach(tilt);

    morphEnd(root.querySelector('#hero-figure'));

    root.querySelectorAll('img').forEach((img) => { if (!img.complete) img.addEventListener('load', refreshSoon, { once: true }); });
    requestAnimationFrame(() => ST.refresh());
  }

  let refreshT = 0;
  const refreshSoon = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ST.refresh(), 200); };

  function tilt(card) {
    if (card.dataset.tilt) return;
    card.dataset.tilt = '1';
    const rx = g.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = g.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
    card.addEventListener('pointerenter', () => { springRelease(card); g.set(card, { transformPerspective: 900 }); });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 9);
      rx(-(py - 0.5) * 7);
      card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
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

  /* ── Soft springs: cards hang on the page like iMessage bubbles. A flick leaves the ones far from
     your finger trailing a little, then they settle back. Written to the CSS `translate` property so it
     composes with the GSAP transforms used for reveals, presses and tilt. GSAP folds `translate` into its
     own transform the first time it touches an element, so a press zeroes the spring first (springRelease).
     Runs only while something moves. ── */
  const SPRING = '.cat, .card, .promise, .review, .score, .step, .strip__item';
  const K = 170, DAMP = 17, LAG = 0.2;
  const springs = new Map();
  const railPos = new Map();
  const finger = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let springIO = null, frame = 0, lastY = 0, lastT = 0;

  function unspring(el) {
    const s = springs.get(el);
    if (!s) return;
    el.style.translate = ''; el.style.willChange = '';
    springs.delete(el);
  }

  function springRelease(el) {
    const s = springs.get(el);
    if (!s || !s.moved) return;
    s.x = s.vx = s.y = s.vy = 0;
    s.moved = false;
    el.style.translate = ''; el.style.willChange = '';
  }

  function kick() {
    if (frame || !springs.size) return;
    lastT = performance.now();
    frame = requestAnimationFrame(springStep);
  }

  function springObserve(root) {
    if (!springIO) {
      springIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) { unspring(e.target); return; }
          if (springs.has(e.target)) return;
          const pic = e.target.querySelector('.cat__img img');
          springs.set(e.target, { x: 0, vx: 0, y: 0, vy: 0, moved: false, rail: e.target.parentElement.closest('.rail, .strip'), pic: pic && g.quickSetter(pic, 'y', 'px') });
        });
        kick();
      }, { rootMargin: '12% 0px' });
      const aim = (p) => { if (p) { finger.x = p.clientX; finger.y = p.clientY; } };
      document.addEventListener('touchstart', (e) => aim(e.touches[0]), { passive: true });
      document.addEventListener('touchmove', (e) => aim(e.touches[0]), { passive: true });
      document.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') aim(e); }, { passive: true });
      // Capture catches rails scrolling sideways as well as the page
      document.addEventListener('scroll', kick, { passive: true, capture: true });
    }
    lastY = window.scrollY;
    railPos.clear();
    root.querySelectorAll(SPRING).forEach((el) => { if (!el.closest('.rail')) springIO.observe(el); });
  }

  function springReset() {
    if (springIO) springIO.disconnect();
    [...springs.keys()].forEach(unspring);
    cancelAnimationFrame(frame);
    frame = 0;
  }

  // Before a FLIP layout change: measure without any spring offset
  function springSettle() {
    springs.forEach((s, el) => { s.x = s.vx = s.y = s.vy = 0; s.moved = false; el.style.translate = ''; el.style.willChange = ''; });
  }

  function springStep(now) {
    frame = 0;
    const dt = Math.min(1 / 30, Math.max(1 / 240, (now - lastT) / 1000));
    lastT = now;
    const y = window.scrollY;
    let dy = y - lastY;
    lastY = y;
    if (Math.abs(dy) > 300) dy = 0; // a jump (route change, anchor) is not a flick
    const vh = window.innerHeight, vw = window.innerWidth;
    // Read everything first, then write, so the loop never forces extra layouts
    const railD = new Map();
    const reads = [];
    springs.forEach((s, el) => {
      let dx = 0;
      if (s.rail) {
        if (!railD.has(s.rail)) {
          const left = s.rail.scrollLeft;
          const d = railPos.has(s.rail) ? left - railPos.get(s.rail) : 0;
          railPos.set(s.rail, left);
          railD.set(s.rail, Math.abs(d) > 400 ? 0 : d);
        }
        dx = railD.get(s.rail);
      }
      if (g.isTweening(el)) {
        // A reveal ending with clearProps folds any live `translate` into GSAP's transform for good
        if (s.moved) { s.x = s.vx = s.y = s.vy = 0; s.moved = false; el.style.translate = ''; el.style.willChange = ''; }
        return;
      }
      reads.push([el, s, el.getBoundingClientRect(), dx]);
    });
    let live = false;
    reads.forEach(([el, s, r, dx]) => {
      const cy = r.top + r.height / 2 - s.y, cx = r.left + r.width / 2 - s.x;
      const fy = Math.min(1, Math.abs(cy - finger.y) / (vh * 0.6)), fx = Math.min(1, Math.abs(cx - finger.x) / (vw * 0.6));
      if (dy) s.y += dy * LAG * fy;
      if (dx) s.x += dx * LAG * fx;
      s.vy += (-K * s.y - DAMP * s.vy) * dt; s.y += s.vy * dt;
      s.vx += (-K * s.x - DAMP * s.vx) * dt; s.x += s.vx * dt;
      const my = Math.min(10, r.height * 0.05) * fy + 0.5, mx = Math.min(12, r.width * 0.05) * fx + 0.5;
      if (Math.abs(s.y) > my) { s.y = Math.sign(s.y) * my; s.vy = 0; }
      if (Math.abs(s.x) > mx) { s.x = Math.sign(s.x) * mx; s.vx = 0; }
      if (Math.abs(s.y) < 0.1 && Math.abs(s.vy) < 3 && Math.abs(s.x) < 0.1 && Math.abs(s.vx) < 3) {
        s.x = s.vx = s.y = s.vy = 0;
        if (s.moved) { el.style.translate = ''; el.style.willChange = ''; s.moved = false; }
      } else {
        if (!s.moved) el.style.willChange = 'translate';
        el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
        s.moved = true;
        live = true;
      }
      // Depth inside category tiles: the photo drifts against the scroll (it is overscanned in CSS)
      if (s.pic) s.pic(-((cy - vh / 2) / vh) * r.height * 0.09);
    });
    if (live || dy || [...railD.values()].some(Boolean)) frame = requestAnimationFrame(springStep);
  }

  /* Swipe depth: inside a full-width slider the photo moves slower than its slide, the caption a touch faster than the photo.
     `layer` must be something GSAP never animates, because GSAP would fold this translate into its own transform. */
  function depth(track, layer, pic, cap) {
    if (!on || !track) return;
    const slides = [...track.children];
    const pics = slides.map((s) => s.querySelector(layer));
    const caps = slides.map((s) => s.querySelector('.zoom__cap'));
    let tick = false;
    const run = () => {
      tick = false;
      const w = track.clientWidth || 1, left = track.scrollLeft;
      slides.forEach((s, j) => {
        const o = j * w - left;
        if (Math.abs(o) > w * 1.2) return;
        if (pics[j]) pics[j].style.translate = `${(-o * pic).toFixed(1)}px 0`;
        if (caps[j] && cap) caps[j].style.translate = `${(-o * cap).toFixed(1)}px 0`;
      });
    };
    track.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ── Hero carousel: swipe between beds, the caption rises in for each, and the active dot fills
     as a six-second timer (Web Animations, so it pauses and resumes exactly). The carousel moves on
     when the fill finishes; it holds while a finger is down, the pointer hovers, a control has keyboard
     focus, the hero is mostly off screen or the tab is hidden. ── */
  const DWELL = 6000;
  function carousel(zoom) {
    const track = zoom && zoom.querySelector('.zoom-track');
    if (!track) return;
    const slides = [...track.children];
    const dots = [...zoom.querySelectorAll('.zoom-dot')];
    const auto = !reduce && !!Element.prototype.animate;
    const hold = { user: false, touch: false, off: false, hover: false, focus: false };
    let idx = -1, fill = null;
    const width = () => Math.max(1, track.clientWidth);
    const slideTo = (i) => track.scrollTo({ left: i * width(), behavior: reduce ? 'auto' : 'smooth' });
    const sync = () => {
      if (!fill) return;
      const wait = hold.user || hold.touch || hold.off || hold.hover || hold.focus || document.hidden;
      if (wait && fill.playState === 'running') fill.pause();
      else if (!wait && fill.playState === 'paused') fill.play();
    };
    const startFill = () => {
      if (!auto) return;
      if (fill) fill.cancel();
      const bar = dots[idx] && dots[idx].querySelector('i');
      if (!bar) return;
      fill = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: DWELL, easing: 'linear' });
      fill.onfinish = () => slideTo((idx + 1) % slides.length);
      sync();
    };
    const setActive = (i) => {
      if (i === idx || !slides[i]) return;
      idx = i;
      slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
      dots.forEach((d, j) => d.setAttribute('aria-current', j === i ? 'true' : 'false'));
      startFill();
    };
    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; setActive(Math.round(track.scrollLeft / width())); });
    }, { passive: true });
    // After the visitor takes over, the timer starts again from empty
    dots.forEach((d, i) => d.addEventListener('click', () => { slideTo(i); startFill(); }));
    const step = (n) => { slideTo(Math.min(slides.length - 1, Math.max(0, idx + n))); startFill(); };
    const prev = zoom.querySelector('.zoom-arrow--prev'), next = zoom.querySelector('.zoom-arrow--next');
    if (prev) prev.addEventListener('click', () => step(-1));
    if (next) next.addEventListener('click', () => step(1));
    zoom.classList.add('is-ready');
    if (auto) zoom.classList.add('is-auto');
    setActive(Math.round(track.scrollLeft / width()));
    depth(track, '.zoom__frame', 0.35, 0.12);
    if (on) {
      // Every ScrollTrigger refresh (rotation, resize) re-parents the pinned hero, which resets the track to slide 1 without a scroll event
      const keep = () => { if (Math.round(track.scrollLeft / width()) !== idx) track.scrollTo({ left: idx * width(), behavior: 'auto' }); };
      ST.addEventListener('refresh', keep);
      cleanups.push(() => ST.removeEventListener('refresh', keep));
    }
    const pause = zoom.querySelector('.zoom-pause');
    if (pause) pause.hidden = !auto;
    if (!auto) return;
    if (pause) pause.addEventListener('click', () => {
      hold.user = !hold.user;
      pause.setAttribute('aria-pressed', hold.user);
      pause.setAttribute('aria-label', hold.user ? 'Play slideshow' : 'Pause slideshow');
      sync();
    });
    track.addEventListener('touchstart', () => { hold.touch = true; sync(); }, { passive: true });
    const letGo = () => { hold.touch = false; startFill(); };
    track.addEventListener('touchend', letGo, { passive: true });
    track.addEventListener('touchcancel', letGo, { passive: true });
    zoom.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hold.hover = true; sync(); } });
    zoom.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hold.hover = false; sync(); } });
    zoom.addEventListener('focusin', (e) => { hold.focus = e.target.matches(':focus-visible'); sync(); });
    zoom.addEventListener('focusout', (e) => { const t = e.relatedTarget; hold.focus = !!(t && zoom.contains(t) && t.matches(':focus-visible')); sync(); });
    // The pin moves the hero in and out of its spacer, so one batch can hold stale entries: the newest one is the truth
    const io = new IntersectionObserver((es) => { const e = es[es.length - 1]; hold.off = !e.isIntersecting || e.intersectionRatio < 0.5; sync(); }, { threshold: [0, 0.5, 1] });
    io.observe(zoom);
    document.addEventListener('visibilitychange', sync);
    cleanups.push(() => { io.disconnect(); document.removeEventListener('visibilitychange', sync); if (fill) fill.cancel(); });
  }

  /* Photos that are still downloading shimmer, then fade in */
  const SHIM_BOX = '.card__img, .cat__img, .zoom__frame, .story__media';
  function shimmer(root) {
    root.querySelectorAll('img').forEach((img) => {
      if (img.complete) return;
      const box = img.parentElement;
      if (!box.matches(SHIM_BOX)) return;
      box.classList.add('shim');
      img.classList.add('img-wait');
      const done = () => { box.classList.remove('shim'); img.classList.remove('img-wait'); img.classList.add('img-in'); };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
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
    springSettle();
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
    if (btn.getAttribute('aria-pressed') !== 'true') return;
    buzz(12);
    if (reduce) return;
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
      buzz([10, 40, 18]);
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

  return { on, reduce, onReset: (fn) => cleanups.push(fn), loader, intro, progress, nav, pressFx, buttons, reset, page, ring, seg, chips, flip, heart, addToBag, bump, money, flipNum, pop, fadeSwap, textSwap, flash, shake, collapse, slideIn, slideOut, morphStart, morphCancel, transition, sheet, spin, burst, burstAt, splitWords };
})();
