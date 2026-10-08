/* Line illustrations for the bed configurator: bed sizes (top view), storage and mattress and ottoman box (side view). */
window.Art = (() => {
  const INK = '#1d1d1f', PAPER = '#ffffff', MIST = '#e8e8ed';
  const svg = (w, h, body) => `<svg class="art" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${body}</svg>`;
  const line = (d, extra) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" ${extra || ''}/>`;

  // a = adult, c = child, laid head-first in each column
  const PEOPLE = {
    single: ['a'],
    'small-double': ['a', 'a'],
    double: ['a', 'a'],
    king: ['a', 'c', 'a'],
    'super-king': ['a', 'c', 'c', 'a']
  };

  function size(id) {
    const people = PEOPLE[id];
    if (!people) return '';
    const x0 = 16, span = 88, colW = span / people.length;
    let b = `<rect x="8" y="8" width="104" height="134" rx="10" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`;
    b += `<rect x="8" y="8" width="104" height="12" rx="6" fill="${INK}"/>`;
    people.forEach((k, i) => {
      const cx = x0 + colW * (i + 0.5);
      const adult = k === 'a';
      const pw = Math.min(colW - 6, adult ? 32 : 20);
      const bw = adult ? Math.min(colW * 0.6, 24) : Math.min(colW * 0.5, 14);
      const hr = adult ? 7 : 5;
      b += `<rect x="${cx - pw / 2}" y="26" width="${pw}" height="14" rx="7" fill="${MIST}" stroke="${INK}" stroke-width="1.6"/>`;
      b += `<rect x="${cx - bw / 2}" y="40" width="${bw}" height="${adult ? 92 : 70}" rx="${bw / 2}" fill="${INK}"/>`;
      b += `<circle cx="${cx}" cy="33" r="${hr}" fill="${INK}"/>`;
    });
    return svg(120, 150, b);
  }

  const STORAGE_BASE = {
    standard: () => {
      let s = `<rect x="10" y="34" width="100" height="34" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`;
      for (let x = 22; x <= 98; x += 12) s += line(`M${x} 39V63`);
      return s;
    },
    underbed: () => `<rect x="10" y="34" width="100" height="34" rx="4" fill="${MIST}" stroke="${INK}" stroke-width="2.4"/>`
      + line('M18 44H102', 'stroke-dasharray="2 4"'),
    drawers: () => {
      let s = `<rect x="10" y="34" width="100" height="34" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`;
      s += `<rect x="16" y="39" width="42" height="24" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>`;
      s += `<rect x="62" y="39" width="42" height="24" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>`;
      s += line('M45 51H53') + line('M91 51H99');
      return s;
    },
    gaslift: () => {
      let s = `<rect x="10" y="34" width="100" height="34" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`;
      s += line('M10 44H110', 'stroke-dasharray="3 3"');
      s += line('M60 64V52') + line('M54 58L60 52L66 58');
      return s;
    }
  };

  function storage(id) {
    const base = STORAGE_BASE[id];
    if (!base) return '';
    return svg(120, 80, `<rect x="10" y="14" width="100" height="20" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`
      + line('M18 24H102', 'stroke-dasharray="1 4"') + base());
  }

  const MATTRESS = {
    none: () => `<rect x="8" y="16" width="8" height="46" rx="3" fill="${INK}"/>`
      + `<rect x="8" y="44" width="104" height="18" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`,
    matching: () => {
      let s = `<rect x="8" y="16" width="8" height="46" rx="3" fill="${INK}"/>`;
      s += `<rect x="16" y="26" width="96" height="22" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`;
      for (let x = 30; x <= 100; x += 14) for (let y = 32; y <= 42; y += 10) s += `<circle cx="${x}" cy="${y}" r="1.6" fill="${INK}"/>`;
      s += `<rect x="8" y="48" width="104" height="14" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`;
      return s;
    }
  };

  function mattress(id) {
    const f = MATTRESS[id];
    return f ? svg(120, 70, f()) : '';
  }

  const BOX = {
    none: () => `<rect x="8" y="14" width="6" height="48" rx="2" fill="${INK}"/>`
      + `<rect x="8" y="22" width="82" height="16" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`
      + `<rect x="8" y="38" width="82" height="20" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`
      + line('M96 58H114', 'stroke-dasharray="2 3"'),
    matching: () => `<rect x="8" y="14" width="6" height="48" rx="2" fill="${INK}"/>`
      + `<rect x="8" y="22" width="82" height="16" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`
      + `<rect x="8" y="38" width="82" height="20" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`
      + `<rect x="94" y="44" width="22" height="26" rx="3" fill="${MIST}" stroke="${INK}" stroke-width="2.4"/>`
      + line('M94 50H116') + line('M103 56H107')
  };

  function box(id) {
    const f = BOX[id];
    return f ? svg(120, 80, f()) : '';
  }

  return { size, storage, mattress, box };
})();
