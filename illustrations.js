/* Warm line-and-tone illustrations for the bed configurator. One tile per option, same size and palette throughout. */
window.Art = (() => {
  const BG = '#f5f5f7', WOOD = '#e8e8ed', WOOD_D = '#c7c7cc', FOAM = '#ffffff', DRAWER = '#f0f0f3', LINE = '#1d1d1f', INK = '#1d1d1f', SHADOW = '#aeaeb2', GOLD = '#c9a227';
  const tile = (body) => `<svg class="art" viewBox="0 0 170 110" aria-hidden="true" focusable="false"><rect width="170" height="110" rx="14" fill="${BG}"/>${body}</svg>`;
  const shape = (tag, attrs) => `<${tag} ${attrs} stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
  const dash = (d, w) => `<path d="${d}" fill="none" stroke="${LINE}" stroke-width="${w || 1.6}" stroke-linecap="round" stroke-dasharray="3 4"/>`;
  const line = (d, w) => `<path d="${d}" fill="none" stroke="${LINE}" stroke-width="${w || 1.6}" stroke-linecap="round"/>`;

  // Bed seen from the side. Base top at y=66; `hb` is the headboard height above the floor line, `mh` the mattress thickness.
  function sideBed(hb, mh, baseBody) {
    let s = shape('rect', `x="26" y="84" width="6" height="7" rx="2" fill="${WOOD_D}"`) + shape('rect', `x="142" y="84" width="6" height="7" rx="2" fill="${WOOD_D}"`);
    s += shape('rect', `x="26" y="66" width="126" height="18" rx="4" fill="${WOOD}"`);
    if (baseBody) s += baseBody();
    s += shape('rect', `x="12" y="${84 - hb}" width="14" height="${hb + 8}" rx="6" fill="${WOOD}"`);
    if (mh) s += mattress(mh);
    return s;
  }

  function mattress(mh) {
    const top = 66 - mh;
    let s = shape('rect', `x="28" y="${top}" width="122" height="${mh}" rx="6" fill="${FOAM}"`);
    if (mh > 18) {
      for (let x = 42; x <= 140; x += 14) for (let y = top + 7; y < 66 - 4; y += 8) s += `<circle cx="${x}" cy="${y}" r="1.4" fill="${LINE}" opacity=".55"/>`;
    }
    return s;
  }

  // Top view, sized from the single bed up to super king. Adults and children lie head-first in rows.
  const PEOPLE = {
    single: ['a'],
    'small-double': ['a', 'a'],
    double: ['a', 'a'],
    king: ['a', 'c', 'a'],
    'super-king': ['a', 'c', 'c', 'a']
  };

  const SIZE_PHOTO = { single: 'images/size-single.png', 'small-double': 'images/size-small-double.png', king: 'images/size-king.png' };
  function size(id) {
    if (SIZE_PHOTO[id]) return `<img class="art art--photo" src="${SIZE_PHOTO[id]}" alt="" loading="lazy" decoding="async">`;
    const people = PEOPLE[id];
    if (!people) return '';
    const top = 12, span = 86, rowH = span / people.length;
    let b = shape('rect', `x="12" y="${top}" width="146" height="${span}" rx="10" fill="${FOAM}"`);
    b += shape('rect', `x="12" y="${top}" width="12" height="${span}" rx="6" fill="${WOOD}"`);
    people.forEach((k, i) => {
      const cy = top + rowH * (i + 0.5);
      const adult = k === 'a';
      const ph = Math.min(rowH * 0.62, 22), pw = 16;
      const bh = adult ? Math.min(rowH * 0.5, 20) : Math.min(rowH * 0.36, 12);
      const len = adult ? 100 : 62;
      b += shape('rect', `x="27" y="${cy - ph / 2}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="#fffdf8"`);
      b += `<rect x="46" y="${cy - bh / 2}" width="${len}" height="${bh}" rx="${bh / 2}" fill="${INK}"/>`;
      b += `<circle cx="35" cy="${cy}" r="${adult ? 6 : 4.5}" fill="${INK}"/>`;
    });
    return tile(b);
  }

  const HEIGHT = { '54': 34, '60': 42, '75': 54, '80': 62 };
  function height(id) {
    const hb = HEIGHT[id];
    return hb ? tile(sideBed(hb, 14, null)) : '';
  }

  const STORAGE = {
    standard: () => {
      let s = '';
      for (let x = 36; x <= 146; x += 12) s += line(`M${x} 69V82`, 2.2);
      return s;
    },
    underbed: () => shape('rect', `x="26" y="66" width="126" height="18" rx="4" fill="${WOOD_D}"`),
    drawers: () => {
      let s = shape('rect', `x="30" y="69" width="54" height="13" rx="3" fill="${DRAWER}"`) + shape('rect', `x="90" y="69" width="54" height="13" rx="3" fill="${DRAWER}"`);
      s += `<path d="M54 75.5H62M114 75.5H122" fill="none" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>`;
      return s;
    },
    gaslift: () => {
      let s = shape('rect', `x="30" y="60" width="118" height="5" rx="2" fill="${SHADOW}"`);
      s += `<path d="M40 84L72 56" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>`;
      s += line('M140 62V44M134 50L140 44L146 50', 2.2);
      return s;
    }
  };
  function storage(id) {
    const base = STORAGE[id];
    if (!base) return '';
    return tile(sideBed(34, 14, base));
  }

  const MATTRESS = { none: 0, matching: 26 };
  function mattressArt(id) {
    if (!(id in MATTRESS)) return '';
    return tile(sideBed(34, MATTRESS[id], null));
  }

  function box(id) {
    if (id === 'none') return tile(sideBed(34, 14, null) + dash('M136 70H164V84H136Z', 1.8));
    if (id !== 'matching') return '';
    let s = sideBed(34, 14, null);
    s += shape('rect', `x="136" y="62" width="30" height="22" rx="4" fill="${DRAWER}"`);
    s += line('M136 69H166', 1.8) + line('M147 76H155', 2.4);
    return tile(s);
  }

  return { size, height, storage, mattress: mattressArt, box };
})();
