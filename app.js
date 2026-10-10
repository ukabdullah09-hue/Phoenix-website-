(() => {
  const S = window.STORE;
  const M = window.Motion;
  const Art = window.Art;
  const { money } = S;
  const view = document.getElementById('view');
  const PHOTO = 'images/bed.jpg';
  const pic = (p, k = 0) => (p && p.photos && (p.photos[k] || p.photos[0])) || PHOTO;
  const ALT = 'Placeholder photo: a light grey bed with a tall panelled headboard';

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const keep = {
    get(k, d) { try { const v = localStorage.getItem('pbf-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('pbf-' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  let basket = keep.get('basket', []);
  let wish = keep.get('wish', []);
  const fmt = (n) => n.toLocaleString('en-GB');
  const cat = (id) => S.CATEGORIES.find((c) => c.id === id) || {};
  const pop = (p) => (p.count || 0) * (p.rating || 0);
  const byPop = (l) => l.slice().sort((a, b) => pop(b) - pop(a));
  const pick = (list, v) => list.find((x) => x.id === v);

  const ICON = {
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    workshop: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/>',
    truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.5"/><circle cx="17" cy="17.5" r="1.5"/>',
    heart: '<path d="M12 20s-7-4.4-9.2-8.8C1.3 8 3.2 4.5 6.6 4.5c2 0 3.3 1.1 5.4 3.3 2.1-2.2 3.4-3.3 5.4-3.3 3.4 0 5.3 3.5 3.8 6.7C19 15.6 12 20 12 20z"/>',
    bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 10"/>',
    tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    grid3: '<rect x="3" y="3" width="5" height="5" rx="1"/><rect x="9.5" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><rect x="16" y="9.5" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><rect x="9.5" y="16" width="5" height="5" rx="1"/><rect x="16" y="16" width="5" height="5" rx="1"/>'
  };
  const icon = (n, sw) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 1.6}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
  const meterRow = '<span class="meter__s">★</span>'.repeat(5);
  const meter = (score, cls) => `<span class="meter${cls || ''}" data-score="${score}" role="img" aria-label="Rated ${score} out of 5"><span class="meter__base" aria-hidden="true">${meterRow}</span><span class="meter__fill" aria-hidden="true">${meterRow}</span></span>`;

  function rating(p) {
    if (!p.rating) return '';
    return `<p class="rating"><span class="sr">Rated ${p.rating} out of 5 from ${fmt(p.count)} reviews.</span>${meter(p.rating)}<span aria-hidden="true">${p.rating.toFixed(1)} (${fmt(p.count)} reviews)</span></p>`;
  }

  function heartBtn(p) {
    return `<button class="heart" type="button" data-wish="${p.id}" aria-pressed="${wish.includes(p.id)}" aria-label="Save the ${esc(p.name)} bed to your wishlist">${icon('heart')}</button>`;
  }

  function card(p) {
    return `<article class="card">
      <div class="card__img"><img src="${pic(p)}" alt="${esc(p.name)} Bed" loading="lazy" decoding="async">${p.stock ? '' : '<span class="tag-oos">Out of stock</span>'}</div>
      ${heartBtn(p)}
      <div class="card__body"><span class="card__cat">${esc(cat(p.cat).name || '')}</span><a class="card__name" href="#bed-${p.id}">${esc(p.name)} Bed</a>${rating(p)}<span class="card__price">From ${money(p.min)}</span></div>
    </article>`;
  }

  function compactCard(p, hidden) {
    return `<article class="card card--compact${hidden ? ' is-hidden' : ''}" data-id="${p.id}" data-cat="${p.cat}" data-min="${p.min}" data-pop="${pop(p)}">
      <div class="card__img"><img src="${pic(p)}" alt="${esc(p.name)} Bed" loading="lazy" decoding="async">${p.stock ? '' : '<span class="tag-oos">Out of stock</span>'}</div>
      ${heartBtn(p)}
      <div class="card__body">
        <a class="card__name" href="#bed-${p.id}">${esc(p.name)} Bed</a>
        ${p.rating ? `<span class="card__meta"><span class="sr">Rated ${p.rating} out of 5 from ${fmt(p.count)} reviews.</span><span class="card__stars" aria-hidden="true">${meter(p.rating, ' meter--sm')} ${p.rating.toFixed(1)} (${fmt(p.count)})</span></span>` : ''}
                <span class="card__price">From ${money(p.min)}</span>
      </div>
    </article>`;
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.hidden = true;
    void t.offsetWidth;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.hidden = true; }, 2300);
  }
  function counts() {
    const n = basket.reduce((a, i) => a + i.qty, 0);
    document.querySelectorAll('[data-count="bag"]').forEach((c) => { c.textContent = n; c.hidden = !n; });
    document.querySelectorAll('[data-count="wish"]').forEach((c) => { c.textContent = wish.length; c.hidden = !wish.length; });
  }
  function toggleWish(btn) {
    const id = btn.dataset.wish;
    wish = wish.includes(id) ? wish.filter((x) => x !== id) : wish.concat(id);
    keep.set('wish', wish);
    counts();
    const onNow = wish.includes(id);
    document.querySelectorAll(`[data-wish="${id}"]`).forEach((b) => {
      b.setAttribute('aria-pressed', onNow);
      const l = b.querySelector('.lbl-text');
      if (l) l.textContent = onNow ? 'Saved to wishlist' : 'Add to wishlist';
    });
    M.heart(btn);
    if (onNow) M.burstAt(btn, { n: 10, dist: 36, colors: ['#e0245e', '#ff7a98', '#1d1d1f'] });
    const wishIcon = document.querySelector('.icons a[href="#wishlist"]');
    M.bump(getComputedStyle(wishIcon).display === 'none' ? document.querySelector('.tabbar a[href="#wishlist"]') : wishIcon);
    toast(onNow ? 'Saved to your wishlist' : 'Removed from your wishlist');
  }

  const faq = (items) => `<div class="faq" data-stagger>${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
  const FAQ = [
    ['How does the deposit work?', 'Pay a £40 deposit to secure your build slot. It comes off your total, you pay the rest on delivery, and it is fully refundable if you cancel. Not sure yet? Pay £10 to hold today\'s price for up to 6 months.'],
    ['Can I change my order after paying?', 'Yes. Tell us before we build and we\'ll change the size, fabric, colour or storage.'],
    ['How long does delivery take?', 'We confirm a delivery date with you once your bed is in the build queue. Typical lead times are to be supplied.'],
    ['Is there a warranty?', 'Every bed comes with a 24-month warranty on the frame and stitching.'],
    ['Can I return a bed?', 'Beds made to custom dimensions can\'t be returned, so please double-check your measurements. Our full returns policy is to be supplied.']
  ];
  function reviewCards(list) {
    if (!list.length) return '<p class="muted" style="text-align:center">Customer reviews to be supplied.</p>';
    return `<div class="reviews" data-stagger>${list.map((r) => `<figure class="review">${meter(r.stars)}<blockquote>“${esc(r.text)}”</blockquote><footer><b>${esc(r.name)}</b>${r.product ? ` · ${esc(S.product(r.product).name)} Bed` : ''}${r.date ? ` · ${r.date}` : ''}</footer></figure>`).join('')}</div>`;
  }
  const scores = () => Object.keys(S.SOURCES).length ? `<div class="scores" data-stagger>${Object.values(S.SOURCES).map((s) => `<div class="score"><b data-count-to="${s.rating}">${s.rating.toFixed(1)}</b>${meter(s.rating)}<span class="muted">Average customer rating</span></div>`).join('')}</div>` : '';

  /* ── Home ── */
  function home() {
    const shown = ['gaslift', 'luxury', 'premium', 'kids', 'mattresses'];
    const SLIDES = [
      { id: 'celine',  h2: 'Celine Bed.',  sub: 'Made to order in Dewsbury.', pos: '50% 40%' },
      { id: 'sparkle', h2: 'Sparkle Bed.', sub: 'Made to order in Dewsbury.', pos: '50% 50%' },
      { id: 'mirage',  h2: 'Mirage Bed.',  sub: 'Made to order in Dewsbury.', pos: '50% 50%' },
      { id: 'apollo',  h2: 'Apollo Bed.',  sub: 'Made to order in Dewsbury.', pos: '50% 50%' }
    ];
    return {
      name: 'home',
      title: 'Phoenix Beds',
      html: `
      <section class="hero-intro" aria-labelledby="hero-t">
        <h1 id="hero-t" data-hero-title>Beds made to order in Dewsbury.</h1>
        <p class="sub" data-hero-after>Your size. Your fabric. Your colour.</p>
        <span class="hero-pill" data-hero-after>From £240 · Handmade in Dewsbury</span>
        <div class="actions" data-hero-after><a class="btn btn--fill btn--glint" href="#shop"><span class="lbl">Shop all beds</span></a><a class="btn btn--line" href="#finder"><span class="lbl">Find my bed</span></a></div>
      </section>

      <section class="zoom" aria-label="Featured beds">
        <div class="zoom-track" id="zoom-track">${SLIDES.map((s, i) => `<div class="zoom-slide"><figure class="zoom__frame"><img src="${pic(S.product(s.id))}" alt="${esc(S.product(s.id).name)} Bed" style="object-position:${s.pos}"${i === 0 ? ' fetchpriority="high"' : ''}></figure><div class="zoom__cap"><h2>${s.h2}</h2><p>${s.sub}</p><div class="zoom__go"><a class="btn btn--fill" href="#bed-${s.id}"><span class="lbl">Shop ${s.h2.replace(' Bed.','')}</span></a></div></div></div>`).join('')}</div>
        <div class="zoom-dots" id="zoom-dots" role="group" aria-label="Featured beds">${SLIDES.map((s,i)=>`<button class="zoom-dot" type="button" aria-label="${s.h2.replace('.','')} — slide ${i+1}" aria-current="${i===0}"><i aria-hidden="true"></i></button>`).join('')}<button class="zoom-pause" type="button" aria-label="Pause slideshow" aria-pressed="false"></button></div>
        <button class="zoom-arrow zoom-arrow--prev" type="button" aria-label="Previous bed" id="zoom-prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button class="zoom-arrow zoom-arrow--next" type="button" aria-label="Next bed" id="zoom-next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></button>
      </section>

      <section class="section"><div class="wrap"><div class="promises" data-stagger>
        <div class="promise">${icon('shield')}<strong>24-month warranty</strong><span>On the frame and stitching of every bed.</span></div>
        <div class="promise">${icon('workshop')}<strong>Built in our workshop</strong><span>Made to order in Dewsbury.</span></div>
        <div class="promise">${icon('card')}<strong>Pay on delivery</strong><span>A small deposit now, the rest when it arrives.</span></div>
        <div class="promise">${icon('truck')}<strong>Free ground-floor delivery</strong><span>Upstairs delivery available.</span></div>
      </div></div></section>

      <section class="section" style="padding-top:0" aria-labelledby="cats-t">
        <div class="wrap">
          <div class="head head--center"><h2 id="cats-t" data-brighten>Find your kind of bed.</h2><p>Every bed is made to order in the fabric and colour you choose.</p></div>
          <div class="cats">${shown.map((id) => { const c = cat(id); return `<a class="cat" href="#shop-${id}"><div class="cat__img"><img src="${c.photo || PHOTO}" alt="" loading="lazy" decoding="async"></div><div class="cat__body"><h3>${c.short || c.name}</h3><p>${c.line}</p><span class="go">Shop</span></div></a>`; }).join('')}</div>
        </div>
      </section>

      <section class="section section--mist" aria-labelledby="loved-t">
        <div class="wrap head head--center"><h2 id="loved-t" data-brighten>Most loved.</h2><p>Our most popular beds.</p>
          <div class="seg" role="tablist" aria-label="Most loved"><button type="button" role="tab" id="tb-beds" aria-selected="true" aria-controls="pn-beds">Beds</button><button type="button" role="tab" id="tb-matt" aria-selected="false" aria-controls="pn-matt">Mattresses</button></div>
        </div>
        <div class="rail" id="pn-beds" role="tabpanel" aria-labelledby="tb-beds">${byPop(S.PRODUCTS).slice(0, 8).map(card).join('')}<a class="card card--more" href="#shop"><div><h3>All ${S.PRODUCTS.length} beds.</h3><p>Gaslift and drawers, luxury, premium, kids and mattresses.</p></div></a></div>
        <div class="wrap" id="pn-matt" role="tabpanel" aria-labelledby="tb-matt" hidden><div class="empty" style="background:#fff"><h3 style="font-size:1.5rem">Mattress range to be supplied.</h3><p class="muted">For now, add a matching handmade mattress to any bed when you order.</p></div></div>
      </section>

      <section class="story" aria-labelledby="story-t">
        <div class="story__inner">
          <div class="story__media"><img src="${PHOTO}" alt="${ALT}" loading="lazy" decoding="async"><img src="${PHOTO}" alt="" style="object-position:30% 30%" loading="lazy" decoding="async"><img src="${PHOTO}" alt="" style="object-position:60% 80%" loading="lazy" decoding="async"></div>
          <div class="story__steps">
            <div class="story__step"><span>01 / 03</span><h2 id="story-t">It starts as timber.</h2><p>Every frame is cut and built on our own workshop floor in Dewsbury.</p></div>
            <div class="story__step"><span>02 / 03</span><h2>Then it's upholstered by hand.</h2><p>Your fabric and colour, stitched and fitted by our team.</p></div>
            <div class="story__step"><span>03 / 03</span><h2>Then it's yours.</h2><p>Delivered to your bedroom. You pay the balance when it arrives.</p></div>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="how-t">
        <div class="wrap">
          <div class="head head--center"><h2 id="how-t" data-brighten>How ordering works.</h2><p>Three steps. No pressure.</p></div>
          <div class="steps-wrap"><div class="steps-line" aria-hidden="true"></div>
            <ol class="steps">
              <li class="step"><span class="step__n">1</span><h3>Choose your bed</h3><p>Pick the size, fabric, colour, headboard and storage, and check it fits your room.</p></li>
              <li class="step"><span class="step__n">2</span><h3>Secure your build slot</h3><p>Pay a £40 deposit, or reserve with £10 to hold today's price for up to 6 months.</p></li>
              <li class="step"><span class="step__n">3</span><h3>Pay on delivery</h3><p>We make your bed in our Dewsbury workshop. Pay the rest when it arrives.</p></li>
            </ol>
          </div>
        </div>
      </section>

      <section class="tile tile--mist" aria-labelledby="finder-t" style="padding-bottom:clamp(3rem,7vw,5rem)">
        <h2 id="finder-t" data-brighten>Your bed in three questions.</h2>
        <p class="sub">Size, storage and style. We'll pick the beds that fit.</p>
        <div class="actions"><a class="btn btn--fill btn--glint" href="#finder"><span class="lbl">Start the bed finder</span></a></div>
      </section>

      <section class="section" aria-labelledby="homes-t">
        <div class="wrap">
          <div class="head head--center"><h2 id="homes-t" data-brighten>What customers say.</h2><p>Reviews labelled by source (UK DMCC Act 2024).</p></div>
          ${reviewCards(S.REVIEWS)}
          ${scores()}
          <p style="text-align:center;margin-top:1.5rem"><a class="link" href="#reviews">Read all reviews</a></p>
        </div>
      </section>

      <section class="section section--mist" aria-labelledby="faq-t"><div class="wrap"><div class="head head--center"><h2 id="faq-t" data-brighten>Questions people ask.</h2></div>${faq(FAQ)}</div></section>`,
      after() {
        const place = M.seg(view.querySelector('.seg'));
        const tabs = [['tb-beds', 'pn-beds'], ['tb-matt', 'pn-matt']];
        tabs.forEach(([t, p]) => document.getElementById(t).addEventListener('click', () => {
          tabs.forEach(([t2, p2]) => { document.getElementById(t2).setAttribute('aria-selected', t2 === t); document.getElementById(p2).hidden = p2 !== p; });
          place();
          M.fadeUp(document.getElementById(p));
        }));
      }
    };
  }

  /* ── Shop: everything at a glance, filtered and sorted in place ── */
  let shopCtl = null;
  const SORTS = [['popular', 'Popular'], ['low', 'Lowest price'], ['high', 'Highest price']];
  const dense = () => (keep.get('grid', 'dense') === 'large' ? 'large' : 'dense');
  function shop(c) {
    const C = S.CATEGORIES.find((x) => x.id === c);
    const n = (id) => S.PRODUCTS.filter((p) => !id || p.cat === id).length;
    const chips = [['', 'All beds']].concat(S.CATEGORIES.map((x) => [x.id, x.short]));
    return {
      name: 'shop',
      title: `${C ? C.name : 'All beds'} | Phoenix Beds`,
      html: `<section class="shop"><div class="wrap wrap--wide">
        <div class="shop-head"><h1 class="shop-title" id="shop-title">${C ? C.name : 'All beds'}</h1><p class="shop-line" id="shop-line" data-hero-after>${C ? C.line : 'Every bed is made to order in our Dewsbury workshop.'}</p></div>
        <div class="filterbar" data-hero-after><nav class="chips" id="chips" aria-label="Bed categories">${chips.map(([id, label]) => `<a href="#shop${id ? '-' + id : ''}" data-cat="${id}" ${(id || '') === (c || '') ? 'aria-current="page"' : ''}>${label}${n(id) ? `<span class="chips__n">${n(id)}</span>` : ''}</a>`).join('')}</nav></div>
        <div class="sortrow"><p class="count-line" id="count-line" aria-live="polite"></p>
          <div class="seg seg--sm seg--icon" id="sizeseg" role="group" aria-label="Grid size">${[['dense', 'grid3', 'More beds per row'], ['large', 'grid', 'Bigger photos']].map(([k, ic, l]) => `<button type="button" data-size="${k}" aria-pressed="${k === dense()}" aria-label="${l}" title="${l}">${icon(ic)}</button>`).join('')}</div>
          <div class="seg seg--sm" id="sortseg" role="group" aria-label="Sort beds">${SORTS.map(([k, l], i) => `<button type="button" data-sort="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div></div>
        <div class="grid-compact${dense() === 'dense' ? ' is-dense' : ''}" id="grid" data-stagger-now>${byPop(S.PRODUCTS).map((p) => compactCard(p, !!c && p.cat !== c)).join('')}</div>
        <div class="empty" id="shop-empty" hidden><h2 style="font-size:1.5rem" id="empty-t"></h2><p class="muted" id="empty-p"></p><a class="btn btn--fill" href="#shop"><span class="lbl">Show all beds</span></a></div>
      </div></section>`,
      after() {
        const grid = document.getElementById('grid');
        const chipsEl = document.getElementById('chips');
        const placePill = M.chips(chipsEl);
        const sortEl = document.getElementById('sortseg');
        const placeSort = M.seg(sortEl);
        const cards = () => [...grid.querySelectorAll('.card')];
        const cmp = {
          popular: (a, b) => b.dataset.pop - a.dataset.pop,
          low: (a, b) => a.dataset.min - b.dataset.min || b.dataset.pop - a.dataset.pop,
          high: (a, b) => b.dataset.min - a.dataset.min || b.dataset.pop - a.dataset.pop
        };
        const ctl = { cat: c || '', sort: 'popular' };
        // After a filter or sort, bring the top of the results back under the sticky bar, so nobody has to scroll up
        let toGridT = 0;
        const toGrid = () => { clearTimeout(toGridT); toGridT = setTimeout(toGridNow, M.on ? 220 : 0); };
        const toGridNow = () => {
          if (shopCtl !== ctl || !grid.isConnected) return;
          const row = grid.previousElementSibling;
          const bar = chipsEl.parentElement;
          const navH = document.getElementById('gnav').offsetHeight;
          const y = row.getBoundingClientRect().top + window.scrollY - navH - bar.offsetHeight - 4;
          if (window.scrollY > y + 2) window.scrollTo({ top: y, behavior: M.reduce ? 'auto' : 'smooth' });
        };
        const sizeEl = document.getElementById('sizeseg');
        const placeSize = M.seg(sizeEl);
        sizeEl.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
          if (b.getAttribute('aria-pressed') === 'true') return;
          sizeEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
          placeSize();
          keep.set('grid', b.dataset.size);
          M.flip(cards(), () => grid.classList.toggle('is-dense', b.dataset.size === 'dense'));
        }));
        const describe = () => {
          const shown = cards().filter((el) => !el.classList.contains('is-hidden')).length;
          const C2 = S.CATEGORIES.find((x) => x.id === ctl.cat);
          document.getElementById('count-line').textContent = C2 ? `${shown} of ${S.PRODUCTS.length} beds` : `${shown} beds, made to order`;
          const empty = document.getElementById('shop-empty');
          empty.hidden = shown > 0;
          if (!shown) {
            document.getElementById('empty-t').textContent = ctl.cat === 'mattresses' ? 'Mattress range to be supplied.' : 'Kids beds to be supplied.';
            document.getElementById('empty-p').textContent = ctl.cat === 'mattresses' ? 'You can add a matching handmade mattress to any bed when you order.' : 'Any of our beds can be made in a single or small double.';
          }
        };
        ctl.apply = (newCat, newSort, animate) => {
          if (newCat !== null) ctl.cat = newCat;
          if (newSort) ctl.sort = newSort;
          const mutate = () => {
            const list = cards();
            list.forEach((el) => el.classList.toggle('is-hidden', !!ctl.cat && el.dataset.cat !== ctl.cat));
            list.sort(cmp[ctl.sort]).forEach((el) => grid.appendChild(el));
            describe();
          };
          if (animate) { M.flip(cards(), mutate); toGrid(); } else mutate();
          chipsEl.querySelectorAll('a').forEach((a) => { if (a.dataset.cat === ctl.cat) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
          placePill(!animate);
          const C3 = S.CATEGORIES.find((x) => x.id === ctl.cat);
          M.textSwap(document.getElementById('shop-title'), C3 ? C3.name : 'All beds');
          M.textSwap(document.getElementById('shop-line'), C3 ? C3.line : 'Every bed is made to order in our Dewsbury workshop.');
          document.title = `${C3 ? C3.name : 'All beds'} | Phoenix Beds`;
        };
        sortEl.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
          sortEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
          placeSort();
          ctl.apply(null, b.dataset.sort, true);
        }));
        const onResize = () => { if (shopCtl === ctl) { placePill(true); placeSort(); placeSize(); } };
        window.addEventListener('resize', onResize);
        M.onReset(() => window.removeEventListener('resize', onResize));
        describe();
        shopCtl = ctl;
      }
    };
  }

  /* ── Product ── */
  function product(id) {
    const p = S.product(id);
    if (!p) return notFound();
    const pre = keep.get('presize', null);
    if (pre) keep.set('presize', null);
    const cfg = { size: S.SIZES.some((s) => s.id === pre) ? pre : 'double', fabric: p.fabric, colour: p.colour, height: '54',
      storage: p.cat === 'gaslift' ? 'gaslift' : p.cat === 'storage' ? 'underbed' : 'standard', box: 'none', mattress: 'none', delivery: 'ground', assembly: 'none', date: '', plan: 'deposit', qty: 1 };
    const si = () => S.SIZES.findIndex((s) => s.id === cfg.size);
    const unit = () => p.prices[si()] + pick(S.HEADBOARDS, cfg.height).price + pick(S.STORAGE, cfg.storage).price + pick(S.OTTOMAN_BOX, cfg.box).price
      + pick(S.MATTRESS, cfg.mattress).price + pick(S.DELIVERY, cfg.delivery).price + pick(S.ASSEMBLY, cfg.assembly).price;
    const ART = { size: Art.size, height: Art.height, storage: Art.storage, mattress: Art.mattress, box: Art.box };
    const opt = (name, o, e) => {
      e = e || {};
      const art = ART[name] ? ART[name](o.id) : '';
      return `<label class="opt"><input type="radio" name="${name}" value="${o.id}" ${cfg[name] === o.id ? 'checked' : ''}><span>${art}<b>${o.name}</b><em>${e.price || (o.price ? '+' + money(o.price) : 'Included')}</em><i>${e.note || o.note || ''}${o.placeholder ? ' · placeholder price' : ''}</i></span></label>`;
    };
    const placeholderSizes = p.sizePricesPlaceholder || (p.pricePlaceholderSizes || []).length;
    const bullets = p.bullets || ['Built to order in our Dewsbury workshop', 'Every UK size, from single to super king', 'Plush velvet or Naples fabric in the colour you choose', '24-month warranty on frame and stitching'];
    const others = byPop(S.PRODUCTS.filter((x) => x.id !== p.id && x.cat === p.cat)).concat(byPop(S.PRODUCTS.filter((x) => x.cat !== p.cat))).slice(0, 6);

    const html = `
      <div class="wrap buy-head">
        <a class="crumb" href="#shop-${p.cat}">‹ ${esc(cat(p.cat).name)}</a>
        <h1 data-hero-title>Buy ${esc(p.name)} Bed</h1>
        <div data-hero-after>${rating(p)}</div>
        <p class="price" data-hero-after>${money(p.min)} – ${money(p.max)}${p.stock ? '' : ' · <b>Out of stock</b>'}</p>
      </div>
      <div class="wrap pdp">
        <section class="gallery" aria-label="${esc(p.name)} Bed photos">
          <div class="gallery__track" id="track" tabindex="0">
            <figure id="hero-figure"><img id="hero-img" src="${pic(p, 0)}" alt="${esc(p.name)} Bed"></figure>
            <figure class="crop-head"><img src="${pic(p, 1)}" alt="${esc(p.name)} Bed close-up"></figure>
            <figure class="crop-foot"><img src="${pic(p, 0)}" alt="${esc(p.name)} Bed close-up"></figure>
          </div>
          <div class="dots" id="dots">${['the full bed', 'the headboard', 'the footboard'].map((n, k) => `<button type="button" aria-label="Show ${n}" aria-current="${k === 0}"></button>`).join('')}</div>
          <p class="ph-note">Placeholder photo. ${esc(p.name)} photos to be supplied.</p>
        </section>

        <form class="configure" id="cfg" novalidate>
          <fieldset class="group"><legend>Size. <span>Which is right for you?</span></legend>
            <div class="opts opts--2">${S.SIZES.map((s, i) => opt('size', { id: s.id, name: s.name }, { price: money(p.prices[i]), note: s.feet })).join('')}</div>
            ${placeholderSizes ? '<p class="note"><b>Placeholder prices.</b> Size-by-size prices for this bed need confirming.</p>' : ''}
          </fieldset>
          <fieldset class="group"><legend>Fabric. <span>Pick your colour.</span></legend>
            <div class="fabric-tabs" role="radiogroup" aria-label="Fabric">${S.FABRICS.map((f) => `<label><input type="radio" name="fabric" value="${f.id}" ${f.id === cfg.fabric ? 'checked' : ''}><span>${f.name}</span></label>`).join('')}</div>
            <div id="swatches"></div>
            <p class="chosen" id="chosen"></p>
          </fieldset>
          <fieldset class="group"><legend>Headboard. <span>How tall?</span></legend><div class="opts opts--2">${S.HEADBOARDS.map((h) => opt('height', h)).join('')}</div></fieldset>
          <fieldset class="group"><legend>Storage. <span>What goes underneath?</span></legend><div class="opts opts--2">${S.STORAGE.map((s) => opt('storage', s)).join('')}</div><p class="note">One storage type per bed.</p></fieldset>
          <fieldset class="group"><legend>Ottoman box. <span>For the foot of the bed.</span></legend><div class="opts">${S.OTTOMAN_BOX.map((o) => opt('box', o)).join('')}</div></fieldset>
          <fieldset class="group"><legend>Mattress. <span>Add one built to fit.</span></legend><div class="opts">${S.MATTRESS.map((o) => opt('mattress', o)).join('')}</div><p class="note">Same flat bundle price whatever size you pick.</p></fieldset>
          <fieldset class="group"><legend>Delivery. <span>Which floor is the bedroom on?</span></legend>
            <div class="opts opts--2">${S.DELIVERY.map((o) => opt('delivery', o)).join('')}</div>
            <div class="opts">${S.ASSEMBLY.map((o) => opt('assembly', o)).join('')}</div>
            <div class="field"><label for="date">Preferred delivery date</label><input class="input" type="date" id="date" name="date"><p class="note">We'll confirm it with you. Nothing is booked until we've checked.</p></div>
          </fieldset>
          <section class="panel" aria-labelledby="fit-t">
            <h2 id="fit-t">Will it fit?</h2>
            <p class="muted" style="font-size:.95rem">Measure your room. We'll try the bed both ways round.</p>
            <div class="units" role="radiogroup" aria-label="Units">${[['ft', 'Feet'], ['m', 'Metres'], ['in', 'Inches'], ['cm', 'cm']].map(([v, n], i) => `<label><input type="radio" name="unit" value="${v}" ${i ? '' : 'checked'}><span>${n}</span></label>`).join('')}</div>
            <div class="row2"><div class="field"><label for="rl">Room length</label><input class="input" id="rl" inputmode="decimal" placeholder="e.g. 12"></div><div class="field"><label for="rw">Room width</label><input class="input" id="rw" inputmode="decimal" placeholder="e.g. 10"></div></div>
            <button class="btn btn--soft" type="button" id="fit-btn"><span class="lbl">Check my room</span></button>
            <p class="fit" id="fit" role="status" hidden></p>
          </section>
          <section class="panel summary" aria-labelledby="sum-t"><h2 id="sum-t">Your ${esc(p.name)} Bed.</h2><dl id="sum"></dl></section>
          <fieldset class="group"><legend>Pay. <span>A small deposit today.</span></legend>
            <div class="opts">
              <label class="opt plan"><input type="radio" name="plan" value="deposit" checked><span><b>Reserve with £40 deposit</b><em class="tag">Most popular</em><i>£40 today, the rest on delivery. Fully refundable if you cancel.</i></span></label>
              <label class="opt plan"><input type="radio" name="plan" value="reserve"><span><b>Reserve with £10</b><em>Hold your price</em><i>Holds today's price for up to 6 months. Change anything later.</i></span></label>
            </div>
          </fieldset>
          <div class="extras">
            <button class="btn btn--soft" type="button" data-wish="${p.id}" aria-pressed="${wish.includes(p.id)}"><span class="lbl">${icon('heart')}<span class="lbl-text">${wish.includes(p.id) ? 'Saved to wishlist' : 'Add to wishlist'}</span></span></button>
            <p class="note">Questions? <button class="linkbtn" type="button" data-wa>WhatsApp us</button>. We usually reply within the hour.</p>
          </div>
          <section class="about" aria-labelledby="ab-t"><h2 id="ab-t" style="font-size:1.3rem;margin-bottom:.4rem">About this bed.</h2><p class="muted">${esc(p.about)}</p><details><summary>Read more</summary><ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul></details></section>
        </form>
      </div>

      <section class="section section--mist" aria-labelledby="pr-t"><div class="wrap">
        <div class="head head--center"><h2 id="pr-t" data-brighten>${esc(p.name)} Bed reviews.</h2>${p.rating ? `<p>Rated ${p.rating.toFixed(1)} from ${fmt(p.count)} reviews.</p>` : ''}</div>
        ${S.REVIEWS.some((r) => r.product === p.id) ? reviewCards(S.REVIEWS.filter((r) => r.product === p.id)) : '<p style="text-align:center" class="muted">Written reviews for this bed are to be supplied. <a class="link" href="#reviews">Read all reviews</a></p>'}
      </div></section>
      <section class="section" aria-labelledby="pf-t"><div class="wrap"><div class="head head--center"><h2 id="pf-t" data-brighten>Before you order.</h2></div>${faq([FAQ[0], FAQ[1], FAQ[3], FAQ[4]])}</div></section>
      <section class="section section--mist" aria-labelledby="ym-t" style="padding-top:clamp(2.5rem,6vw,4rem)">
        <div class="wrap head"><h2 id="ym-t" data-brighten>You may also like.</h2></div>
        <div class="rail">${others.map(card).join('')}</div>
      </section>

      <div class="buybar" id="buybar"><div class="wrap">
        <div class="buybar__total"><b id="bb-t"></b><span id="bb-l"></span></div>
        <div class="buybar__go">
          <div class="qty" role="group" aria-label="Quantity"><button type="button" id="qm" aria-label="One fewer">−</button><output id="qv" aria-live="polite">1</output><button type="button" id="qp" aria-label="One more">+</button></div>
          <button class="btn btn--fill" type="button" id="add" ${p.stock ? '' : 'disabled'}><span class="lbl">${p.stock ? 'Add to basket' : 'Out of stock'}</span><span class="spin" aria-hidden="true"><i></i></span><span class="tick" aria-hidden="true">${icon('tick', 2.4)}</span></button>
        </div>
      </div></div>`;

    function after() {
      const form = document.getElementById('cfg');
      const fab = () => S.FABRICS.find((f) => f.id === cfg.fabric);
      const col = () => S.colourOf(cfg.fabric, cfg.colour);
      let prevRows = null;
      const swatches = (animate) => {
        const f = fab();
        if (!f.colours.some((c) => c[0] === cfg.colour)) cfg.colour = f.colours[0][0];
        const html2 = `<div class="swatches" role="radiogroup" aria-label="Colour">${f.colours.map(([cid, n, hex]) => `<label class="sw"><input type="radio" name="colour" value="${cid}" ${cid === cfg.colour ? 'checked' : ''} aria-label="${n}"><i style="background:${hex}"></i><span>${n}</span></label>`).join('')}</div>${f.placeholder ? '<p class="note" style="margin-top:.6rem"><b>Placeholder colours.</b> Naples colours need confirming.</p>' : ''}`;
        if (animate) M.fadeSwap(document.getElementById('swatches'), html2);
        else document.getElementById('swatches').innerHTML = html2;
      };
      const update = (animate) => {
        const size = S.SIZES[si()];
        const total = unit() * cfg.qty;
        const today = (cfg.plan === 'reserve' ? 10 : 40) * cfg.qty;
        const lines = [['Size', size.name, p.prices[si()], true], ['Fabric', `${fab().name}, ${col()[1]}`, 0],
          ['Headboard', pick(S.HEADBOARDS, cfg.height).name, pick(S.HEADBOARDS, cfg.height).price], ['Storage', pick(S.STORAGE, cfg.storage).name, pick(S.STORAGE, cfg.storage).price],
          ['Ottoman box', pick(S.OTTOMAN_BOX, cfg.box).name, pick(S.OTTOMAN_BOX, cfg.box).price], ['Mattress', pick(S.MATTRESS, cfg.mattress).name, pick(S.MATTRESS, cfg.mattress).price],
          ['Delivery', pick(S.DELIVERY, cfg.delivery).name, pick(S.DELIVERY, cfg.delivery).price], ['Assembly', pick(S.ASSEMBLY, cfg.assembly).name, pick(S.ASSEMBLY, cfg.assembly).price]];
        const rows = lines.map(([k, v, pr, base]) => [k, `${esc(v)}${pr ? ` <span class="muted">${base ? '' : '+'}${money(pr)}</span>` : ''}`]);
        if (cfg.date) rows.push(['Preferred date', new Date(cfg.date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })]);
        rows.push(['Due today', money(today)], ['On delivery', money(total - today)]);
        const sum = document.getElementById('sum');
        sum.innerHTML = rows.map(([k, v]) => `<div class="line" data-k="${k}"><dt>${k}</dt><dd>${v}</dd></div>`).join('') + `<div class="line total"><dt>Total${cfg.qty > 1 ? ` (×${cfg.qty})` : ''}</dt><dd id="sum-total"></dd></div>`;
        if (animate && prevRows) M.flash(rows.filter(([k, v]) => prevRows[k] !== v).map(([k]) => sum.querySelector(`[data-k="${k}"]`)).filter(Boolean));
        prevRows = Object.fromEntries(rows);
        const st = document.getElementById('sum-total');
        st.dataset.v = document.getElementById('bb-t').dataset.v || total;
        M.money(st, total);
        M.money(document.getElementById('bb-t'), total);
        M.textSwap(document.getElementById('bb-l'), `${size.name} · ${fab().name} ${col()[1]}`);
        const chosen = `<b>${fab().name}</b> in ${col()[1]}, included`;
        const ch = document.getElementById('chosen');
        if (animate && ch.innerHTML !== chosen) M.fadeSwap(ch, chosen); else ch.innerHTML = chosen;
      };
      const rings = [...form.querySelectorAll('.opts')].map((o) => M.ring(o));
      const onResize = () => rings.forEach((r) => r(true));
      window.addEventListener('resize', onResize);
      M.onReset(() => window.removeEventListener('resize', onResize));
      form.addEventListener('change', (e) => {
        const t = e.target;
        if (t.name === 'unit' || t.id === 'rl' || t.id === 'rw') return;
        if (t.name in cfg) cfg[t.name] = t.value;
        if (t.name === 'fabric') swatches(true);
        if (t.name === 'colour') M.pop(t.nextElementSibling);
        update(true);
      });
      form.addEventListener('submit', (e) => e.preventDefault());
      const track = document.getElementById('track');
      const dots = [...document.querySelectorAll('#dots button')];
      track.addEventListener('scroll', () => { const i = Math.round(track.scrollLeft / track.clientWidth); dots.forEach((d, k) => d.setAttribute('aria-current', k === i)); }, { passive: true });
      dots.forEach((d, k) => d.addEventListener('click', () => track.scrollTo({ left: k * track.clientWidth, behavior: M.reduce ? 'auto' : 'smooth' })));
      const qv = document.getElementById('qv');
      document.getElementById('qm').addEventListener('click', () => { if (cfg.qty === 1) { M.shake(qv.parentElement); return; } cfg.qty -= 1; M.flipNum(qv, cfg.qty, -1); update(true); });
      document.getElementById('qp').addEventListener('click', () => { if (cfg.qty === 9) { M.shake(qv.parentElement); return; } cfg.qty += 1; M.flipNum(qv, cfg.qty, 1); update(true); });
      document.getElementById('fit-btn').addEventListener('click', () => {
        const out = document.getElementById('fit');
        const k = { ft: 30.48, m: 100, in: 2.54, cm: 1 }[form.querySelector('input[name="unit"]:checked').value];
        const L = parseFloat(document.getElementById('rl').value) * k;
        const W = parseFloat(document.getElementById('rw').value) * k;
        out.hidden = false; out.className = 'fit';
        if (!(L > 0 && W > 0)) { out.textContent = 'Enter your room length and width to check the fit.'; M.shake(form.querySelector('.row2')); return; }
        const spare = (s) => { const bw = s.w + 10, bl = s.l + 15; return Math.max(Math.min(W - bw, L - bl), Math.min(L - bw, W - bl)); };
        const s = S.SIZES[si()];
        const left = Math.round(spare(s));
        if (left >= 60) { out.classList.add('fit--ok'); out.textContent = `A ${s.name.toLowerCase()} fits, with about ${left} cm to walk around it.`; M.burstAt(out, { n: 10, dist: 50, colors: ['#1d7a3a', '#6e6e73', '#c7c7cc'] }); }
        else if (left >= 0) { out.classList.add('fit--tight'); out.textContent = `A ${s.name.toLowerCase()} fits, but leaves under 60 cm to walk around it.`; }
        else { out.classList.add('fit--tight'); const best = S.SIZES.slice().reverse().find((x) => spare(x) >= 60); out.textContent = `A ${s.name.toLowerCase()} is about ${Math.abs(left)} cm too big for this room.${best ? ` A ${best.name.toLowerCase()} would fit comfortably.` : ''}`; M.shake(out); }
        out.textContent += ' Allows about 10 cm for the frame and 15 cm for the headboard.';
        M.pop(out);
      });
      const addBtn = document.getElementById('add');
      addBtn.addEventListener('click', () => {
        if (!p.stock) return;
        M.addToBag(addBtn, document.getElementById('hero-img'), () => {
          basket.push({ id: p.id, cfg: Object.assign({}, cfg), unit: unit(), qty: cfg.qty });
          keep.set('basket', basket);
          counts();
          toast(`${p.name} Bed added to your basket`);
        });
      });
      swatches(false);
      update(false);
    }
    return { name: 'product', title: `Buy ${p.name} Bed | Phoenix Beds`, html, after, buybar: true };
  }

  /* ── Basket ── */
  const describe = (item) => {
    const c = item.cfg;
    const col = S.colourOf(c.fabric, c.colour);
    return [S.SIZES.find((s) => s.id === c.size).name, `${S.FABRICS.find((f) => f.id === c.fabric).name}, ${col[1]}`, `${pick(S.HEADBOARDS, c.height).name} headboard`, pick(S.STORAGE, c.storage).name,
      c.box !== 'none' ? pick(S.OTTOMAN_BOX, c.box).name : '', c.mattress !== 'none' ? pick(S.MATTRESS, c.mattress).name : '', `${pick(S.DELIVERY, c.delivery).name} delivery`,
      c.assembly !== 'none' ? 'Assembly included' : '', c.plan === 'reserve' ? 'Reserve with £10' : '£40 deposit'].filter(Boolean);
  };
  const totals = () => {
    const sub = basket.reduce((a, i) => a + i.unit * i.qty, 0);
    const today = basket.reduce((a, i) => a + (i.cfg.plan === 'reserve' ? 10 : 40) * i.qty, 0);
    return { sub, today, later: sub - today };
  };
  const totalsHTML = () => { const t = totals(); return `<dl><div class="line"><dt>Subtotal</dt><dd>${money(t.sub)}</dd></div><div class="line"><dt>Due today</dt><dd>${money(t.today)}</dd></div><div class="line"><dt>On delivery</dt><dd>${money(t.later)}</dd></div><div class="line total"><dt>Total</dt><dd>${money(t.sub)}</dd></div></dl>`; };

  let calm = false;
  function basketView() {
    if (!basket.length) return { name: 'basket', title: 'Basket | Phoenix Beds', html: `<section class="section"><div class="wrap"><div class="empty">${icon('bag').replace('<svg', '<svg style="width:48px;height:48px"')}<h1 style="font-size:2rem" data-hero-title>Your basket is empty.</h1><p class="muted" data-hero-after>Choose a bed and it'll appear here.</p><a class="btn btn--fill" href="#shop" data-hero-after><span class="lbl">Shop beds</span></a></div></div></section>` };
    return {
      name: 'basket',
      title: 'Basket | Phoenix Beds',
      html: `<section class="section" style="padding-top:clamp(2rem,5vw,3.5rem)"><div class="wrap">
        <div class="head"><h1 class="page-h1" ${calm ? '' : 'data-hero-title'}>Your basket.</h1><p ${calm ? '' : 'data-hero-after'}>Pay a small deposit today and the rest on delivery.</p></div>
        <div class="bag"><div ${calm ? '' : 'data-stagger'}>${basket.map((item, i) => {
          const p = S.product(item.id);
          return `<article class="bag-item" data-i="${i}"><img src="${pic(p)}" alt="${esc(p.name)} Bed" loading="lazy" decoding="async"><div><h3>${esc(p.name)} Bed</h3><ul>${describe(item).map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>
            <div class="bag-item__foot"><div class="qty" role="group" aria-label="Quantity for ${esc(p.name)}"><button type="button" data-q="${i}" data-d="-1" aria-label="One fewer">−</button><output aria-live="polite">${item.qty}</output><button type="button" data-q="${i}" data-d="1" aria-label="One more">+</button></div><b class="line-price">${money(item.unit * item.qty)}</b><button class="linkbtn" type="button" data-rm="${i}">Remove</button></div></article>`;
        }).join('')}</div>
        <aside class="panel summary" aria-labelledby="bs-t"><h2 id="bs-t">Order summary</h2><div id="bag-totals">${totalsHTML()}</div><a class="btn btn--fill btn--wide" href="#checkout"><span class="lbl">Check out</span></a><p class="note">Questions? <button class="linkbtn" type="button" data-wa>WhatsApp us</button>.</p></aside></div>
      </div></section>`,
      after() {
        view.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
          const i = +b.dataset.q;
          const next = Math.max(1, Math.min(9, basket[i].qty + +b.dataset.d));
          const item = b.closest('.bag-item');
          if (next === basket[i].qty) { M.shake(b.parentElement); return; }
          basket[i].qty = next;
          keep.set('basket', basket);
          counts();
          M.flipNum(item.querySelector('output'), next, +b.dataset.d);
          const lp = item.querySelector('.line-price');
          lp.dataset.v = lp.dataset.v || basket[i].unit * (next - +b.dataset.d);
          M.money(lp, basket[i].unit * next);
          M.fadeSwap(document.getElementById('bag-totals'), totalsHTML());
        }));
        view.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => {
          M.collapse(b.closest('.bag-item'), () => {
            basket.splice(+b.dataset.rm, 1);
            keep.set('basket', basket);
            counts();
            calm = true;
            render(true);
            calm = false;
            toast('Removed from your basket');
          });
        }));
      }
    };
  }

  function checkout() {
    if (!basket.length) return basketView();
    const t = totals();
    const fields = [['name', 'Full name', 'text', 'name'], ['email', 'Email address', 'email', 'email'], ['phone', 'Phone number', 'tel', 'tel'], ['address', 'Address', 'text', 'street-address'], ['town', 'Town or city', 'text', 'address-level2'], ['postcode', 'Postcode', 'text', 'postal-code']];
    const items = basket.reduce((a, i) => a + i.qty, 0);
    return {
      name: 'checkout',
      title: 'Checkout | Phoenix Beds',
      html: `<section class="section" style="padding-top:clamp(2rem,5vw,3.5rem)"><div class="wrap">
        <div class="head"><h1 class="page-h1" data-hero-title>Checkout.</h1><p data-hero-after>Where should we deliver your bed?</p></div>
        <div class="bag"><div>
          <form class="form panel" id="co" novalidate>
            ${fields.map(([id, l, ty, ac]) => `<div class="field"><label for="${id}">${l}</label><input class="input" id="${id}" type="${ty}" autocomplete="${ac}" aria-describedby="${id}-e"><p class="error" id="${id}-e" hidden></p></div>`).join('')}
            <div class="field"><label for="notes">Delivery notes (optional)</label><textarea class="input" id="notes" rows="3" placeholder="Parking, stairs, access"></textarea></div>
            <p class="note"><b>Payments aren't connected yet.</b> This preview won't take a payment or place an order.</p>
            <button class="btn btn--fill btn--wide" type="submit"><span class="lbl">Pay ${money(t.today)} deposit</span></button>
          </form>
          <div class="panel done" id="done" tabindex="-1" hidden>${icon('check', 1.8)}<h2 style="font-size:1.8rem">Order not placed yet.</h2><p class="muted">Payments aren't connected in this preview, so nothing was charged and no order was sent. Once payments are set up, this step takes your ${money(t.today)} deposit.</p><a class="btn btn--fill" href="#shop"><span class="lbl">Back to the beds</span></a></div>
        </div>
        <aside class="panel summary"><h2>${items} item${items > 1 ? 's' : ''}</h2>${basket.map((i) => `<p class="muted" style="font-size:.95rem">${esc(S.product(i.id).name)} Bed × ${i.qty}</p>`).join('')}${totalsHTML()}</aside></div>
      </div></section>`,
      after() {
        const form = document.getElementById('co');
        const rules = {
          name: (v) => (v.trim() ? '' : 'Enter your full name.'),
          email: (v) => (!v.trim() ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter an email address like name@example.com.'),
          phone: (v) => (v.replace(/\D/g, '').length >= 10 ? '' : 'Enter a phone number so we can arrange delivery.'),
          address: (v) => (v.trim() ? '' : 'Enter the first line of your address.'),
          town: (v) => (v.trim() ? '' : 'Enter your town or city.'),
          postcode: (v) => (/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(v.trim()) ? '' : 'Enter a UK postcode, like WF13 1AA.')
        };
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          let first = null;
          Object.entries(rules).forEach(([id, fn]) => {
            const el = document.getElementById(id);
            const msg = fn(el.value);
            const err = document.getElementById(id + '-e');
            err.textContent = msg; err.hidden = !msg; el.setAttribute('aria-invalid', msg ? 'true' : 'false');
            if (msg && !first) first = el;
          });
          if (first) { M.shake(form); first.focus(); return; }
          form.hidden = true;
          const d = document.getElementById('done');
          d.hidden = false;
          d.focus();
          M.pop(d.querySelector('svg'));
          M.burstAt(d.querySelector('svg'), { n: 18, dist: 90 });
        });
      }
    };
  }

  function wishlist() {
    const list = byPop(S.PRODUCTS.filter((p) => wish.includes(p.id)));
    return {
      name: 'wishlist',
      title: 'Wishlist | Phoenix Beds',
      html: `<section class="section" style="padding-top:clamp(2rem,5vw,3.5rem)"><div class="wrap wrap--wide">
        <div class="head"><h1 class="page-h1" data-hero-title>Your wishlist.</h1><p data-hero-after>Saved on this device.</p></div>
        ${list.length ? `<div class="grid-compact" data-stagger-now>${list.map((p) => compactCard(p, false)).join('')}</div>` : `<div class="empty">${icon('heart').replace('<svg', '<svg style="width:48px;height:48px"')}<h2 style="font-size:1.6rem">Nothing saved yet.</h2><p class="muted">Tap the heart on any bed to save it here.</p><a class="btn btn--fill" href="#shop"><span class="lbl">Shop beds</span></a></div>`}
      </div></section>`
    };
  }

  function finder() {
    const Q = [
      { key: 'size', q: 'What size do you need?', opts: S.SIZES.map((s) => [s.id, s.name, s.feet]) },
      { key: 'storage', q: 'Do you need storage?', opts: [['none', 'No storage', 'Just the bed'], ['any', 'Yes, any kind', 'Drawers, under-bed or gaslift'], ['gaslift', 'A lift-up ottoman', 'Maximum space underneath']] },
      { key: 'style', q: 'Which look do you like?', opts: [['buttoned', 'Buttoned', 'Classic chesterfield tufting'], ['panelled', 'Panelled', 'Clean vertical lines'], ['statement', 'Statement', 'Wings, curves and height'], ['any', 'Show me everything', 'I\'ll know it when I see it']] }
    ];
    const ans = {};
    let step = 0;
    return {
      name: 'finder',
      title: 'Bed finder | Phoenix Beds',
      html: `<section class="section" style="padding-top:clamp(2rem,5vw,3.5rem)"><div class="wrap finder">
        <div class="head head--center"><h1 class="page-h1" data-hero-title>Find your bed.</h1><p data-hero-after>Three quick questions, then we pick the beds that fit.</p></div>
        <div class="progress" aria-hidden="true"><i id="f-bar" style="width:0%"></i></div>
        <div id="f-body"></div></div></section>`,
      after() {
        const body = document.getElementById('f-body');
        const bar = document.getElementById('f-bar');
        let busy = false;
        const show = (dir) => {
          bar.style.width = `${(Math.min(step, Q.length) / Q.length) * 100}%`;
          if (step < Q.length) {
            const q = Q[step];
            body.innerHTML = `<p class="small">Question ${step + 1} of ${Q.length}</p><h2 style="font-size:1.8rem;margin:.3rem 0 1rem" tabindex="-1" id="f-q">${q.q}</h2>
              <div class="opts">${q.opts.map(([v, n, d]) => `<button class="opt finder-opt" type="button" data-v="${v}"><span><b>${n}</b><i>${d}</i></span></button>`).join('')}</div>
              ${step ? '<p style="margin-top:1rem"><button class="linkbtn" type="button" id="f-back">Back</button></p>' : ''}`;
            M.slideIn(body, dir);
            M.buttons(body);
            body.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
              if (busy) return;
              busy = true;
              ans[q.key] = b.dataset.v;
              b.classList.add('picked');
              b.querySelector('span').insertAdjacentHTML('beforeend', `<svg class="chk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON.tick}</svg>`);
              setTimeout(() => M.slideOut(body, 1, () => { step++; busy = false; show(1); }), M.reduce ? 0 : 320);
            }));
            const back = document.getElementById('f-back');
            if (back) back.addEventListener('click', () => { if (busy) return; busy = true; M.slideOut(body, -1, () => { step--; busy = false; show(-1); }); });
            if (step) document.getElementById('f-q').focus();
            return;
          }
          let list = S.PRODUCTS.filter((p) => p.stock);
          if (ans.storage === 'gaslift') list = list.filter((p) => p.cat === 'gaslift' || p.cat === 'storage');
          if (ans.style === 'buttoned') list = list.filter((p) => p.style === 'chesterfield');
          if (ans.style === 'panelled') list = list.filter((p) => ['panel', 'channel'].includes(p.style));
          if (ans.style === 'statement') list = list.filter((p) => ['wing', 'bubble', 'pinch'].includes(p.style));
          list = byPop(list).slice(0, 8);
          keep.set('presize', ans.size);
          body.innerHTML = `<h2 style="font-size:1.8rem" tabindex="-1" id="f-res">${list.length ? `Your matches, in ${S.SIZES.find((s) => s.id === ans.size).name.toLowerCase()}.` : 'No exact match.'}</h2>
            <p class="muted" style="margin:.3rem 0 1rem">${ans.storage === 'any' ? 'Every bed here can add drawers or under-bed storage. ' : ''}${list.length ? 'Each bed opens with your size already chosen.' : 'Try a different style, or browse every bed.'}</p>
            ${list.length ? `<div class="grid-compact">${list.map((p) => compactCard(p, false)).join('')}</div>` : '<a class="btn btn--fill" href="#shop"><span class="lbl">Browse all beds</span></a>'}
            <p style="margin-top:1rem"><button class="linkbtn" type="button" id="f-again">Start again</button></p>`;
          M.slideIn(body, 1);
          M.buttons(body);
          M.burstAt(document.getElementById('f-res'), { n: 16, dist: 70 });
          document.getElementById('f-res').focus();
          document.getElementById('f-again').addEventListener('click', () => { M.slideOut(body, -1, () => { step = 0; show(-1); }); });
        };
        show(1);
      }
    };
  }

  function reviews() {
    return {
      name: 'reviews',
      title: 'Reviews | Phoenix Beds',
      html: `<section class="section" style="padding-top:clamp(2rem,5vw,3.5rem)"><div class="wrap wrap--wide">
        <div class="head head--center"><h1 class="page-h1" data-hero-title>Customer reviews.</h1><p data-hero-after>Phoenix Beds comes from the team behind Mattresses &amp; Beds UK and Cool &amp; Comfy. These reviews were left on those stores.</p></div>
        ${scores()}<div style="height:12px"></div>${reviewCards(S.REVIEWS)}
        <div class="head head--center" style="margin-top:3rem"><h2 data-brighten>Ratings by bed.</h2></div>
        <div class="grid-compact" data-stagger>${byPop(S.PRODUCTS).map((p) => compactCard(p, false)).join('')}</div>
      </div></section>`
    };
  }

  function story() {
    return {
      name: 'story',
      title: 'Our story | Phoenix Beds',
      html: `<section class="hero-intro"><h1 data-hero-title>Beds that start in our workshop.</h1><p class="sub" data-hero-after>Made to order in Dewsbury, West Yorkshire.</p></section>
      <section class="zoom" aria-label="Our workshop"><figure class="zoom__frame"><img src="${PHOTO}" alt="${ALT}"></figure><div class="zoom__cap"><h2>Built by our own team.</h2><p>Cut, upholstered and finished in Dewsbury.</p></div></section>
      <section class="section"><div class="wrap" style="max-width:760px;display:grid;gap:1.25rem;font-size:1.2rem" data-stagger>
        <p>Phoenix Beds makes beds and mattresses to order in Dewsbury, West Yorkshire. Each frame is built, upholstered and finished by our own team, in the size, fabric and colour you choose.</p>
        <p class="muted">We're the team behind Mattresses &amp; Beds UK and Cool &amp; Comfy. Phoenix brings our full range together in one place.</p>
        <p class="muted">Because we make every bed ourselves, there are no suppliers to pay before we start. That's why we only ask for a small deposit, and you pay the rest when your bed arrives.</p>
        <p><a class="btn btn--fill" href="#shop"><span class="lbl">Shop beds</span></a></p>
      </div></section>`
    };
  }

  function help() {
    return {
      name: 'help',
      title: 'Help | Phoenix Beds',
      html: `<section class="section" style="padding-top:clamp(2rem,5vw,3.5rem)"><div class="wrap">
        <div class="head head--center"><h1 class="page-h1" data-hero-title>Help.</h1><p data-hero-after>Ordering, delivery and returns.</p></div>
        ${faq(FAQ.concat([['How much is delivery?', 'Ground-floor delivery is free. Delivery to the first floor or higher is £100.'], ['Do you assemble the bed?', 'Our beds are easy to assemble yourself, or choose assembly when you order.'], ['Terms and conditions', 'Our full terms and conditions are to be supplied.'], ['How do I contact you?', 'Phone, email, WhatsApp and opening hours are to be supplied.']]))}
      </div></section>`
    };
  }

  function notFound() {
    return { name: 'notfound', title: 'Not found | Phoenix Beds', html: `<section class="section"><div class="wrap"><div class="empty"><h1 style="font-size:2rem">We couldn't find that page.</h1><a class="btn btn--fill" href="#shop"><span class="lbl">Shop beds</span></a></div></div></section>` };
  }

  /* ── Router ── */
  const ROUTES = [
    [/^(home)?$/, () => home(), 'home'],
    [/^shop(?:-([a-z]+))?$/, (m) => shop(m[1]), 'shop'],
    [/^bed-([a-z-]+)$/, (m) => product(m[1]), 'shop'],
    [/^basket$/, () => basketView(), 'basket'],
    [/^checkout$/, () => checkout(), 'basket'],
    [/^wishlist$/, () => wishlist(), 'wishlist'],
    [/^finder$/, () => finder(), null],
    [/^reviews$/, () => reviews(), 'reviews'],
    [/^story$/, () => story(), null],
    [/^help$/, () => help(), null]
  ];
  const markNav = (hash, tab) => {
    document.querySelectorAll('[data-tab]').forEach((a) => { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.querySelectorAll('[data-nav]').forEach((a) => { if (a.dataset.nav === hash) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  };
  let first = true;
  function render(quiet) {
    const hash = location.hash.slice(1);
    const sm = hash.match(/^shop(?:-([a-z]+))?$/);
    if (sm && shopCtl && view.dataset.view === 'shop' && !quiet) {
      shopCtl.apply(sm[1] || '', null, true);
      markNav(hash, 'shop');
      return;
    }
    let out = null, tab = null;
    for (const [re, fn, t] of ROUTES) { const m = hash.match(re); if (m) { out = fn(m); tab = t; break; } }
    if (!out) out = notFound();
    const swap = () => {
      M.reset();
      shopCtl = null;
      view.innerHTML = out.html;
      view.dataset.view = out.name;
      document.title = out.title;
      document.body.classList.toggle('has-buybar', !!out.buybar);
      markNav(hash, tab);
      if (!quiet) { window.scrollTo(0, 0); if (window.ScrollTrigger) window.ScrollTrigger.getScrollFunc(window)(0); }
      if (out.after) out.after();
      const bar = document.getElementById('buybar');
      if (bar) document.body.style.setProperty('--buybar-h', bar.offsetHeight + 'px');
      M.page(view, first);
      first = false;
    };
    if (quiet) swap(); else M.transition(view, swap, first);
  }

  document.addEventListener('click', (e) => {
    const w = e.target.closest('[data-wish]');
    if (w) { e.preventDefault(); toggleWish(w); return; }
    if (e.target.closest('[data-wa]')) { openWa(); return; }
    const link = e.target.closest('a[href^="#bed-"]');
    if (link && location.hash !== link.getAttribute('href')) {
      const holder = link.closest('.card') || link;
      M.morphStart(holder.querySelector('img'));
    }
  });
  const waBtn = document.getElementById('wa-btn');
  const sheetEl = document.getElementById('wa-sheet');
  function openWa() { M.sheet(sheetEl, true); M.spin(waBtn.querySelector('svg')); waBtn.setAttribute('aria-expanded', 'true'); document.getElementById('wa-close').focus(); }
  function closeWa() { M.sheet(sheetEl, false); waBtn.setAttribute('aria-expanded', 'false'); }
  waBtn.addEventListener('click', () => (sheetEl.hidden ? openWa() : closeWa()));
  document.getElementById('wa-close').addEventListener('click', () => { closeWa(); waBtn.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheetEl.hidden) { closeWa(); waBtn.focus(); } });
  window.addEventListener('resize', () => { const bar = document.getElementById('buybar'); if (bar) document.body.style.setProperty('--buybar-h', bar.offsetHeight + 'px'); });
  window.addEventListener('hashchange', () => render());

  counts();
  M.loader();
  M.intro();
  M.nav();
  M.progress();
  M.pressFx();
  render();
})();
