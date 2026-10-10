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

  /* ── Intro sound: a rising whoosh, then a warm strike as the name lands, then a shimmer that fades.
     Synthesised with the Web Audio API, so there is no sound file to download. Browsers keep sound
     switched off until someone has tapped the page, so on a first visit this stays silent and the mute
     button never appears. ── */
  const MUTE_KEY = 'pbf-introsound';
  function introSound(plan) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    let off = false;
    try { off = localStorage.getItem(MUTE_KEY) === 'off'; } catch (e) { /* storage unavailable */ }
    if (!Ctx || off || reduce) return;
    let ctx;
    try { ctx = new Ctx(); } catch (e) { return; }
    const done = () => { try { ctx.close(); } catch (e) { /* already closed */ } };
    const give = () => { done(); };
    let settled = false;
    const build = () => {
      if (settled || ctx.state !== 'running') { give(); return; }
      settled = true;
      const t0 = ctx.currentTime + 0.02;
      const master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);

      // Rising whoosh: filtered noise climbing while the embers gather
      const len = Math.floor(ctx.sampleRate * 2.2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.6;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.value = 1.1;
      band.frequency.setValueAtTime(160, t0);
      band.frequency.exponentialRampToValueAtTime(2200, t0 + plan.strike);
      band.frequency.exponentialRampToValueAtTime(500, t0 + plan.strike + 0.9);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, t0);
      ng.gain.exponentialRampToValueAtTime(0.085, t0 + plan.strike - 0.05);
      ng.gain.exponentialRampToValueAtTime(0.0001, t0 + plan.strike + 1.1);
      noise.connect(band).connect(ng).connect(master);
      noise.start(t0);
      noise.stop(t0 + 2.2);

      // The strike as the name lands: a soft low boom under a warm chord
      const ts = t0 + plan.strike;
      const boom = ctx.createOscillator();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(120, ts);
      boom.frequency.exponentialRampToValueAtTime(48, ts + 0.7);
      const bg = ctx.createGain();
      bg.gain.setValueAtTime(0.0001, ts);
      bg.gain.exponentialRampToValueAtTime(0.16, ts + 0.04);
      bg.gain.exponentialRampToValueAtTime(0.0001, ts + 1.2);
      boom.connect(bg).connect(master);
      boom.start(ts);
      boom.stop(ts + 1.3);

      [523.25, 784, 1046.5, 1568].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        const gn = ctx.createGain();
        gn.gain.setValueAtTime(0.0001, ts);
        gn.gain.exponentialRampToValueAtTime(0.05 / (i + 1.2), ts + 0.05 + i * 0.02);
        gn.gain.exponentialRampToValueAtTime(0.0001, ts + 1.6 + i * 0.2);
        o.connect(gn).connect(master);
        o.start(ts);
        o.stop(ts + 2);
      });

      // Mute control, shown only while there is something to mute
      const btn = document.getElementById('mutebtn');
      if (btn) {
        btn.hidden = false;
        const set = (quiet) => {
          master.gain.setTargetAtTime(quiet ? 0 : 0.9, ctx.currentTime, 0.05);
          btn.classList.toggle('is-off', quiet);
          btn.setAttribute('aria-label', quiet ? 'Turn intro sound on' : 'Turn intro sound off');
          try { localStorage.setItem(MUTE_KEY, quiet ? 'off' : 'on'); } catch (e) { /* storage unavailable */ }
        };
        btn.onclick = () => set(!btn.classList.contains('is-off'));
        setTimeout(() => { btn.hidden = true; btn.onclick = null; }, (plan.strike + 2.2) * 1000);
      }
      setTimeout(done, (plan.strike + 2.6) * 1000);
    };
    const r = ctx.resume();
    if (r && r.then) r.then(build, give); else build();
    setTimeout(() => { if (!settled) give(); }, 900);
  }

  /* ── First-load intro: embers drift up out of the dark, gather, and the name strikes through them in
     brushed metal before the curtain lifts off the page. Inspired by a logo reveal Usman sent. ── */
  function loader() {
    const el = document.getElementById('loader');
    if (!el) return 0;
    if (!on) return 0;
    el.style.animation = 'none';
    const words = [...el.querySelectorAll('.loader__word')];
    const rule = el.querySelector('.loader__rule');
    const sub = el.querySelector('.loader__sub');
    // Each letter sits in its own window, so it rises into place from behind the line rather than fading in
    words.forEach((w) => {
      const text = w.textContent;
      w.setAttribute('aria-label', text);
      w.innerHTML = [...text].map((ch) => `<span aria-hidden="true"><i>${ch === ' ' ? '&nbsp;' : escText(ch)}</i></span>`).join('');
    });
    const letters = el.querySelectorAll('.loader__word span i');
    const lockup = [...words, rule, sub];
    const STRIKE = 2.2, END = 4.1;
    const stopFx = flames(el.querySelector('.loader__fx'), STRIKE);
    introSound({ strike: STRIKE });

    // The page is held back until the intro hands over to it, so the two cross over instead of cutting
    const page = document.querySelectorAll('#view, .footer');
    const chrome = document.querySelectorAll('.tabbar, .wa');
    g.set(page, { opacity: 0, scale: 1.035, transformOrigin: '50% 40%' });
    g.set(chrome, { opacity: 0 });

    g.timeline({ onComplete: () => { stopFx(); el.remove(); } })
      .fromTo(letters, { yPercent: 118 }, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.045 }, STRIKE - 1.05)
      .fromTo(words[0], { letterSpacing: '0.62em', textIndent: '0.62em' }, { letterSpacing: '0.34em', textIndent: '0.34em', duration: 2.2, ease: 'expo.out' }, STRIKE - 1.05)
      .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'expo.out' }, STRIKE - 0.35)
      // The glint travels across the name: each letter sweeps its own sheen, a beat after the one before
      .fromTo(letters, { backgroundPosition: '110% 0' }, { backgroundPosition: '-70% 0', duration: 1.25, ease: 'power2.inOut', stagger: 0.06 }, STRIKE + 0.15)
      .fromTo(sub, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out' }, STRIKE + 0.35)
      // The name drifts back and softens as the page comes forward through it
      .to(lockup, { opacity: 0, scale: 1.12, filter: 'blur(10px)', duration: 1.15, ease: 'power2.inOut' }, END - 0.35)
      .to(el, { opacity: 0, duration: 1.25, ease: 'power2.inOut' }, END - 0.15)
      .to(page, { opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out', clearProps: 'transform,opacity' }, END - 0.25)
      .to(chrome, { opacity: 1, duration: 1, ease: 'power2.out', clearProps: 'opacity' }, END + 0.05);

    // The page is hidden until the intro hands over, so make sure it can never stay hidden
    setTimeout(() => {
      if (!el.isConnected) return;
      stopFx();
      el.remove();
      g.set([...page, ...chrome], { clearProps: 'transform,opacity' });
    }, (END + 6) * 1000);

    heroDelay = END + 0.35;
    return heroDelay;
  }

  /* Fire: flames climb the screen behind the name, licking and curling as they cool from a white core
     through orange into deep red. Each tongue is one pre-drawn blob, so a phone only pays for the
     drawing, never the shading. The fire swells as the name lands, then burns down as the page opens. */
  function flames(cv, strike) {
    if (!cv) return () => {};
    const c = cv.getContext && cv.getContext('2d', { alpha: true });
    if (!c) return () => {};
    let w = 0, h = 0, raf = 0, last = 0, glow = null;
    // Fire is soft, so it is drawn at well under screen resolution and stretched back up. Nobody can
    // see the difference in flames, and it is a quarter of the pixels to shade on a phone.
    const SCALE = 0.62;
    const size = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.max(1, Math.round(w * SCALE)); cv.height = Math.max(1, Math.round(h * SCALE));
      c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      glow = null;
    };
    size();

    // Red fire: a small white heart at the foot, then orange, then red the whole way up
    const BANDS = [[255, 244, 206], [255, 186, 86], [255, 112, 32], [243, 52, 18], [198, 22, 12], [120, 10, 8], [62, 5, 4]];
    const sprites = BANDS.map(([r, g2, b]) => {
      const sc = document.createElement('canvas');
      const S = 72;
      sc.width = sc.height = S;
      const x = sc.getContext('2d');
      const gr = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      gr.addColorStop(0, `rgba(${r},${g2},${b},0.8)`);
      gr.addColorStop(0.35, `rgba(${r},${g2},${b},0.3)`);
      gr.addColorStop(0.7, `rgba(${r},${g2},${b},0.07)`);
      gr.addColorStop(1, `rgba(${r},${g2},${b},0)`);
      x.fillStyle = gr;
      x.fillRect(0, 0, S, S);
      return sc;
    });

    const rnd = (a2, z) => a2 + Math.random() * (z - a2);
    // Tongues start along the foot of the screen, thickest in the middle so the body of the fire
    // sits right behind the name
    const make = (p) => {
      const mid = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      p.x = w / 2 + mid * w * 0.38;
      p.y = h * rnd(1, 1.05);
      p.vx = rnd(-14, 14);
      p.vy = -h * rnd(0.46, 0.95);
      p.r = h * rnd(0.03, 0.075) * (1 - Math.abs(mid) * 0.28);
      p.ttl = rnd(1.2, 2.2);
      p.life = 1;
      p.sway = rnd(1, 3.2);
      p.ph = rnd(0, 6.283);
      p.spark = Math.random() < 0.1;
      if (p.spark) { p.r *= 0.17; p.ttl *= 1.4; p.vy *= 1.3; }
      return p;
    };
    const N = Math.max(130, Math.min(260, Math.round(w * h / 2400)));
    const ps = Array.from({ length: N }, () => { const p = make({}); p.life = Math.random(); return p; });

    const t0 = performance.now();
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      // The fire catches, swells as the name lands, then burns down as the page opens behind it
      const rise = Math.min(1, t / (strike * 0.72));
      const surge = t > strike - 0.25 && t < strike + 0.7 ? 1 + 0.5 * Math.sin((t - strike + 0.25) / 0.95 * Math.PI) : 1;
      const fade = t > strike + 0.8 ? Math.max(0, 1 - (t - strike - 0.8) / 1.5) : 1;
      const power = rise * surge * fade;

      c.clearRect(0, 0, w, h);
      if (power <= 0.001) { c.globalAlpha = 1; return; }
      c.globalCompositeOperation = 'lighter';

      // The glow the fire throws onto the dark behind it, built once and dimmed with the fire
      if (!glow) {
        glow = c.createRadialGradient(w / 2, h * 1.02, 0, w / 2, h * 1.02, h * 1.1);
        glow.addColorStop(0, 'rgba(196, 34, 14, 1)');
        glow.addColorStop(0.4, 'rgba(130, 16, 8, 0.47)');
        glow.addColorStop(1, 'rgba(50, 5, 4, 0)');
      }
      c.globalAlpha = 0.34 * power;
      c.fillStyle = glow;
      c.fillRect(0, 0, w, h);

      for (const p of ps) {
        p.life -= dt / p.ttl;
        if (p.life <= 0 || p.y < -h * 0.2) { make(p); continue; }
        // Flames curl harder the higher they climb, and cool by height rather than by age, so the
        // fire is white only at its foot and red all the way up
        const climb = 1 - p.life;
        p.x += (p.vx + Math.sin(t * p.sway + p.ph) * 46 * climb) * dt;
        p.y += p.vy * (0.5 + p.life * 0.7) * dt;
        const up = Math.max(0, Math.min(1, (h - p.y) / (h * 0.88)));
        const band = Math.min(6, Math.floor(Math.pow(up, 0.52) * 6.4) + (p.spark ? 1 : 0));
        const rad = p.spark ? p.r * (0.6 + p.life * 0.5) : p.r * (0.45 + p.life * 0.85);
        c.globalAlpha = Math.min(1, p.life * (p.spark ? 1.5 : 0.62) * (1 - up * 0.35)) * power;
        // Tongues are drawn taller than they are wide, so the fire licks instead of bubbling
        const tw = rad * (p.spark ? 2 : 1.3), th = rad * (p.spark ? 2 : 3.7);
        c.drawImage(sprites[Math.min(band, 6)], p.x - tw / 2, p.y - th * 0.62, tw, th);
      }
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    };
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', size);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
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
    meters(root);
    carousel(root.querySelector('.zoom'));
    if (!on) { morphCancel(); return; }
    const d0 = first ? heroDelay : 0;
    springObserve(root);
    shimmer(root);

    const heroTitle = root.querySelector('[data-hero-title]');
    if (heroTitle) {
      const words = splitWords(heroTitle);
      const tl = g.timeline({ delay: d0 });
      tl.from(words, { yPercent: 115, opacity: 0, rotateX: -75, filter: 'blur(14px)', transformOrigin: '50% 100%', duration: 1.25, ease: 'expo.out', stagger: 0.075, clearProps: 'filter' }, 0.1)
        .from(root.querySelectorAll('[data-hero-after]'), { y: 30, opacity: 0, scale: 0.94, duration: 1, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity' }, '-=0.85');
      const strip = root.querySelector('[data-strip]');
      if (strip) tl.from(strip.children, { y: 34, opacity: 0, scale: 0.9, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.035, clearProps: 'transform,opacity' }, '-=0.45');
    }

    // Category pages: the title lifts out of a blur, the chips slide in, the cover photo wipes open
    const shopHead = root.querySelector('.shop-head');
    if (shopHead) {
      g.fromTo(shopHead.querySelector('.shop-title'), { yPercent: 70, opacity: 0, filter: 'blur(12px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', delay: d0, clearProps: 'transform,opacity,filter' });
      g.from(shopHead.querySelector('.shop-line'), { y: 18, opacity: 0, duration: 0.9, ease: 'power3.out', delay: d0 + 0.12, clearProps: 'transform,opacity' });
      g.from(root.querySelectorAll('#chips a'), { x: 36, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: d0 + 0.2, clearProps: 'transform,opacity' });
      const cv = root.querySelector('#shop-cover');
      if (cv && !cv.hidden) coverIn(cv, d0 + 0.1);
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
      // Hold the whole frame back until its photo has decoded, then open it. The frame carries the
      // blurred backing as well as the photo, so revealing it together is what stops the picture
      // snapping onto the screen in one frame.
      const fig0 = zoom.querySelector('.zoom__frame');
      const first0 = imgs[0];
      g.set(fig0, { opacity: 0 });
      let opened = false;
      const openFirst = () => {
        if (opened) return;
        opened = true;
        g.to(fig0, { opacity: 1, duration: 1.1, ease: 'power2.out', clearProps: 'opacity' });
        if (track) g.fromTo(fig0, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' });
        if (fine) g.fromTo(first0, { filter: 'blur(12px)' }, { filter: 'blur(0px)', duration: 1.3, ease: 'power2.out', clearProps: 'filter' });
      };
      const decoded = first0.decode ? first0.decode().catch(() => {}) : Promise.resolve();
      decoded.then(() => g.delayedCall(Math.max(0, d0 - 0.25), openFirst));
      // Never leave the picture hidden if the photo cannot be decoded
      g.delayedCall(d0 + 3, openFirst);
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
    if (story) storyFx(story);

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
      // Each card rises and settles while its photo eases out of a zoom
      const gd = d0 + (first ? 0.3 : 0.06);
      g.from(now, { y: 56, opacity: 0, scale: 0.92, duration: 1, ease: 'expo.out', stagger: 0.05, delay: gd, clearProps: 'transform,opacity' });
      now.forEach((c, i) => {
        const im = c.querySelector('.card__img img');
        if (im) g.fromTo(im, { scale: 1.35, transition: 'none' }, { scale: 1, duration: 1.5, ease: 'expo.out', delay: gd + i * 0.05, clearProps: 'transform,transition' });
      });
      if (later.length) {
        g.set(later, { y: 46, opacity: 0, scale: 0.94 });
        box._batch = ST.batch(later, { start: 'top 96%', once: true, onEnter: (els) => g.to(els, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity' }) });
      }
    });

    root.querySelectorAll('.rail').forEach((rail) => {
      g.from(rail.children, { y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity', scrollTrigger: { trigger: rail, start: 'top 88%', once: true } });
      drag(rail);
      railFx(rail);
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

    if (fine) root.querySelectorAll('.card, .cat').forEach((c) => { if (!c.closest('.rail')) tilt(c); });

    morphEnd(root.querySelector('#hero-figure'));

    root.querySelectorAll('img').forEach((img) => { if (!img.complete) img.addEventListener('load', refreshSoon, { once: true }); });
    requestAnimationFrame(() => ST.refresh());
  }

  let refreshT = 0;
  const refreshSoon = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ST.refresh(), 200); };

  /* Gold stars fill to the real score when they scroll into view */
  function meters(root) {
    root.querySelectorAll('.meter').forEach((m) => {
      const fill = m.querySelector('.meter__fill');
      const to = Math.min(5, parseFloat(m.dataset.score) || 0) / 5 * 100;
      if (!on) { fill.style.width = to + '%'; return; }
      const o = { w: 0 };
      fill.style.width = '0%';
      const glyphs = fill.querySelectorAll('.meter__s');
      ST.create({ trigger: m, start: 'top 92%', once: true, onEnter: () => {
        g.to(o, { w: to, duration: 1.3, ease: 'power2.out', onUpdate: () => { fill.style.width = o.w.toFixed(2) + '%'; }, onComplete: () => m.classList.add('is-in') });
        g.fromTo(glyphs, { scale: 0.2, rotate: -50, y: 6 }, { scale: 1, rotate: 0, y: 0, duration: 0.7, ease: 'back.out(2.6)', stagger: 0.14, clearProps: 'transform' });
        g.fromTo(m, { scale: 0.92 }, { scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)', clearProps: 'transform', delay: 0.1 });
      } });
    });
  }

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

  /* ── Sideways rails: the card nearest the middle of the screen sits forward and bright, the ones either
     side sit back. The photo inside never moves or scales, so every bed stays sharp and whole. Each card
     reads one number (--d, -1 to 1 from the rail's centre); a thumb under the rail tracks where you are. ── */
  function railFx(rail) {
    if (!on || rail.dataset.fx) return;
    rail.dataset.fx = '1';
    const items = [...rail.children];
    const bar = document.createElement('div');
    bar.className = 'rail-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i></i>';
    rail.after(bar);
    const thumb = bar.firstChild;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rc = rail.getBoundingClientRect();
      const mid = rc.left + rc.width / 2, span = rc.width * 0.58;
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.max(-1, Math.min(1, (r.left + r.width / 2 - mid) / span));
        el.style.setProperty('--d', d.toFixed(3));
        el.style.setProperty('--ad', Math.abs(d).toFixed(3));
      });
      const max = rail.scrollWidth - rail.clientWidth;
      const share = rail.clientWidth / Math.max(1, rail.scrollWidth);
      thumb.style.width = (share * 100).toFixed(1) + '%';
      thumb.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * (1 / share - 1) * 100 : 0}%)`;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    rail.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    cleanups.push(() => window.removeEventListener('resize', queue));
    queue();
    setTimeout(queue, 600);
    rail.querySelectorAll('img').forEach((im) => { if (!im.complete) im.addEventListener('load', queue, { once: true }); });
  }

  /* ── Our story: one chapter at a time. The photo opens from a rounded window while its blurred backdrop
     drifts, the chapter number draws a line, and the words rise out of a blur. Same on phones and desktop,
     with no pinning, so nothing fights the address bar while you scroll. ── */
  function storyFx(story) {
    if (!on) return;
    story.querySelectorAll('.story__chapter').forEach((ch) => {
      const pic = ch.querySelector('.story__pic');
      const img = ch.querySelector('.story__pic img');
      const words = splitWords(ch.querySelector('h2'));
      const num = ch.querySelector('.story__n');
      const para = ch.querySelector('p');
      g.set(words, { yPercent: 110, opacity: 0 });
      g.set([num, para], { y: 24, opacity: 0 });
      g.set(pic, { clipPath: 'inset(12% 14% 12% 14% round 26px)' });
      g.set(img, { scale: 1.12, opacity: 0 });
      let shown = false;
      const play = () => {
        if (shown) return;
        shown = true;
        g.timeline()
          .to(pic, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.25, ease: 'expo.out' }, 0)
          .to(img, { scale: 1, opacity: 1, duration: 1.6, ease: 'expo.out' }, 0)
          .to(num, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.25)
          .to(words, { yPercent: 0, opacity: 1, duration: 1.05, ease: 'expo.out', stagger: 0.07 }, 0.3)
          .to(para, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.55);
      };
      ST.create({ trigger: ch, start: 'top 82%', once: true, onEnter: play, onEnterBack: play, onLeave: play });
    });
  }

  /* ── Category cover photo: wipes open on arrival, crossfades when you switch category, folds away for All beds ── */
  function coverIn(el, delay) {
    const img = el.querySelector('img');
    g.killTweensOf([el, img]);
    g.fromTo(el, { clipPath: 'inset(0% 0% 100% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.1, ease: 'expo.out', delay, clearProps: 'clipPath' });
    g.fromTo(img, { scale: 1.4, yPercent: 8 }, { scale: 1.08, yPercent: 0, duration: 1.8, ease: 'expo.out', delay });
  }

  function cover(el, src, set) {
    if (!el) return;
    const img = el.querySelector('img');
    if (!src) return;
    const paint = () => {
      // srcset wins over src, so both have to change together or the old photo stays
      if (set) img.setAttribute('srcset', set); else img.removeAttribute('srcset');
      img.src = src;
      el.style.setProperty('--shot', `url('${src}')`);
    };
    if (!on) { paint(); el.hidden = false; return; }
    g.killTweensOf([el, img]);
    if (el.hidden) { paint(); el.hidden = false; coverIn(el, 0.05); return; }
    if (img.getAttribute('src') === src) return;
    g.timeline()
      .to(img, { opacity: 0, scale: 1.2, duration: 0.25, ease: 'power2.in' })
      .add(paint)
      .fromTo(img, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1.08, duration: 1.1, ease: 'expo.out' });
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
    if (!fine) return;
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
  const SHIM_BOX = '.card__img, .cat__img, .zoom__frame, .story__pic, .shop-cover, .gallery__track figure';
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

  /* Tab switch: the new items fade up together, no sideways travel or overshoot */
  function fadeUp(el) {
    if (!on || !el) return;
    g.from(el.children, { y: 22, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity' });
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
    g.killTweensOf(view);
    // The page being left is lifted out of the view and held on screen while the new one is built and
    // starts arriving underneath, then dissolved off. Without this the new page is caught half-built,
    // which is what reads as a cut.
    const r = view.getBoundingClientRect();
    const top = Math.max(0, r.top);
    const ghost = document.createElement('div');
    ghost.className = 'ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.top = top + 'px';
    const held = document.createElement('div');
    held.className = 'ghost__in';
    held.style.top = (r.top - top) + 'px';
    // Moving the nodes rather than copying them keeps every photo decoded, so the still never flickers
    while (view.firstChild) held.appendChild(view.firstChild);
    ghost.appendChild(held);
    document.body.appendChild(ghost);

    swap();
    g.timeline({ onComplete: () => { ghost.remove(); ST.refresh(); } })
      .to(ghost, { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, 0)
      .to(held, { scale: 1.025, y: -10, duration: 0.55, ease: 'power2.in' }, 0)
      .fromTo(view, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'opacity' }, 0.06);
  }

  function sheet(el, open) {
    if (!on) { el.hidden = !open; return; }
    if (open) { el.hidden = false; g.fromTo(el, { scale: 0.85, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)' }); }
    else g.to(el, { scale: 0.9, opacity: 0, duration: 0.18, onComplete: () => { el.hidden = true; g.set(el, { clearProps: 'all' }); } });
  }

  function spin(el) {
    if (on && el) g.fromTo(el, { rotate: 0 }, { rotate: 360, duration: 0.7, ease: 'back.out(1.6)' });
  }

  return { on, reduce, onReset: (fn) => cleanups.push(fn), fadeUp, cover, loader, intro, progress, nav, pressFx, buttons, reset, page, ring, seg, chips, flip, heart, addToBag, bump, money, flipNum, pop, fadeSwap, textSwap, flash, shake, collapse, slideIn, slideOut, morphStart, morphCancel, transition, sheet, spin, burst, burstAt, splitWords };
})();
