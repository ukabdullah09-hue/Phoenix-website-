/* Product option pictures: the photos supplied for each option. Options without a supplied picture show none. */
window.Art = (() => {
  const PHOTOS = {
    size: { single: 'images/size-single.png', 'small-double': 'images/size-small-double.png', king: 'images/size-king.png' },
    height: { '54': 'images/headboard-54.png', '60': 'images/headboard-60.png', '75': 'images/headboard-75.png', '80': 'images/headboard-80.png' },
    storage: { standard: 'images/storage-standard.png', underbed: 'images/storage-underbed.png', drawers: 'images/storage-drawers.png', gaslift: 'images/storage-gaslift.png' },
    mattress: { matching: 'images/mattress-matching.png' }
  };
  const photo = (group, id) => {
    const src = (PHOTOS[group] || {})[id];
    return src ? `<img class="art art--photo" src="${src}" alt="" loading="lazy" decoding="async">` : '';
  };
  return {
    size: (id) => photo('size', id),
    height: (id) => photo('height', id),
    storage: (id) => photo('storage', id),
    mattress: (id) => photo('mattress', id),
    box: () => ''
  };
})();
