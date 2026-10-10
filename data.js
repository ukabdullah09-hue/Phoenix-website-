/* Product data: bed names and photos from the supplied catalogue. Prices are placeholders until confirmed. */
window.STORE = (() => {
  const SOURCES = {};

  const SIZES = [
    { id: 'single', name: 'Single', feet: "3'0\" × 6'3\"", cm: '90 × 190 cm', w: 90, l: 190 },
    { id: 'small-double', name: 'Small double', feet: "4'0\" × 6'3\"", cm: '120 × 190 cm', w: 120, l: 190 },
    { id: 'double', name: 'Double', feet: "4'6\" × 6'3\"", cm: '135 × 190 cm', w: 135, l: 190 },
    { id: 'king', name: 'King', feet: "5'0\" × 6'6\"", cm: '150 × 200 cm', w: 150, l: 200 },
    { id: 'super-king', name: 'Super king', feet: "6'0\" × 6'6\"", cm: '180 × 200 cm', w: 180, l: 200 }
  ];

  const CATEGORIES = [
    { id: 'gaslift', name: 'Gaslift and drawers', short: 'Gaslift & drawers', line: 'Storage that lifts or slides out.' },
    { id: 'luxury', name: 'Luxury beds', short: 'Luxury', line: 'Tall headboards, deep tufting.' },
    { id: 'premium', name: 'Premium beds', short: 'Premium', line: 'Statement shapes, every size.' },
    { id: 'storage', name: 'Storage beds', short: 'Storage', line: 'Room for everything underneath.' },
    { id: 'kids', name: 'Kids beds', short: 'Kids', line: 'Made for growing up in.' },
    { id: 'mattresses', name: 'Mattresses', short: 'Mattresses', line: 'Handmade to fit your frame.' }
  ];

  const FABRICS = [
    { id: 'plush', name: 'Plush Velvet', colours: [
      ['cream', 'Cream', '#e6dccb'], ['white', 'White', '#efede8'], ['silver', 'Silver', '#c4c4c8'],
      ['grey', 'Grey', '#8c8c91'], ['charcoal', 'Charcoal', '#3b3b3e'], ['black', 'Black', '#1c1c1e'],
      ['mink', 'Mink', '#9a8878'], ['coffee', 'Coffee', '#5a4232'], ['maroon', 'Maroon', '#6b1f2b'],
      ['pink', 'Pink', '#e2adb6'], ['blue', 'Blue', '#2f4c78'], ['sky', 'Sky blue', '#a8c5e2'],
      ['teal', 'Teal', '#2e6b67'], ['mustard', 'Mustard', '#c4922e']
    ] },
    { id: 'naples', name: 'Naples', placeholder: true, colours: [
      ['stone', 'Stone', '#b6ae9f'], ['oatmeal', 'Oatmeal', '#d4c9b4'], ['ash', 'Ash', '#98989a'], ['slate', 'Slate', '#5b626b']
    ] }
  ];

  const HEADBOARDS = [
    { id: '54', name: '54 inch', note: 'Standard height', price: 0 },
    { id: '60', name: '60 inch', note: 'A little taller', price: 20, placeholder: true },
    { id: '75', name: '75 inch', note: 'Tall statement', price: 40 },
    { id: '80', name: '80 inch', note: 'Towering height', price: 60 }
  ];

  const STORAGE = [
    { id: 'standard', name: 'Standard base', note: 'Slatted base, no storage', price: 0 },
    { id: 'underbed', name: 'Solid under-bed', note: 'Sturdy base, no lift mechanism', price: 30, placeholder: true },
    { id: 'drawers', name: 'Drawers', note: 'Two or four deep drawers', price: 60 },
    { id: 'gaslift', name: 'Gas lift storage', note: 'The whole base lifts up for access', price: 45, placeholder: true }
  ];

  const OTTOMAN_BOX = [
    { id: 'none', name: 'No ottoman box', note: 'Just the bed frame', price: 0 },
    { id: 'matching', name: 'Matching ottoman box', note: 'Same fabric, sits at the foot of the bed', price: 90, placeholder: true }
  ];

  const MATTRESS = [
    { id: 'none', name: 'No mattress', note: 'Bed frame only', price: 0 },
    { id: 'matching', name: 'Matching mattress', note: 'Handmade in the UK, same size as your bed', price: 150, placeholder: true },
    { id: 'pillow-top', name: 'Pillow-top mattress', note: 'Deep quilted top, same size as your bed', price: 180, placeholder: true },
    { id: 'slim', name: 'Slim mattress', note: 'Low-profile, same size as your bed', price: 120, placeholder: true }
  ];

  const DELIVERY = [
    { id: 'ground', name: 'Ground floor', note: 'Free', price: 0 },
    { id: 'upstairs', name: 'First floor or higher', note: 'Carried up and placed', price: 100 }
  ];

  const ASSEMBLY = [
    { id: 'none', name: 'No thanks', note: 'Easy to assemble yourself', price: 0 },
    { id: 'assemble', name: 'Assemble it for me', note: 'Built in your bedroom', price: 40, placeholder: true }
  ];

  const P = (o) => Object.assign({ stock: true, fabric: 'plush' }, o);
  const PRODUCTS = [
    P({ id: 'celine', name: 'Celine', cat: 'premium', photos: ["images/beds/celine-1.jpg", "images/beds/celine-2.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'sparkle', name: 'Sparkle', cat: 'premium', photos: ["images/beds/sparkle-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'mirage', name: 'Mirage', cat: 'premium', photos: ["images/beds/mirage-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'apollo', name: 'Apollo', cat: 'premium', photos: ["images/beds/apollo-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'sapphire', name: 'Sapphire', cat: 'premium', photos: ["images/beds/sapphire-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'neo', name: 'Neo', cat: 'premium', photos: ["images/beds/neo-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'sunshine', name: 'Sunshine', cat: 'premium', photos: ["images/beds/sunshine-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'pandora', name: 'Pandora', cat: 'premium', photos: ["images/beds/pandora-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'diva', name: 'Diva', cat: 'premium', photos: ["images/beds/diva-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'butterfly', name: 'Butterfly', cat: 'premium', photos: ["images/beds/butterfly-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'eve', name: 'Eve', cat: 'premium', photos: ["images/beds/eve-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'axel-sleigh', name: 'Axel Sleigh', cat: 'premium', photos: ["images/beds/axel-sleigh-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'avalon', name: 'Avalon', cat: 'premium', photos: ["images/beds/avalon-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'lilly', name: 'Lilly', cat: 'premium', photos: ["images/beds/lilly-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'aurora', name: 'Aurora', cat: 'premium', photos: ["images/beds/aurora-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'magnus', name: 'Magnus', cat: 'premium', photos: ["images/beds/magnus-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'horizon', name: 'Horizon', cat: 'premium', photos: ["images/beds/horizon-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'aura', name: 'Aura', cat: 'premium', photos: ["images/beds/aura-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'brooklyn', name: 'Brooklyn', cat: 'premium', photos: ["images/beds/brooklyn-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'luna', name: 'Luna', cat: 'premium', photos: ["images/beds/luna-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'omega', name: 'Omega', cat: 'premium', photos: ["images/beds/omega-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'crown', name: 'Crown', cat: 'premium', photos: ["images/beds/crown-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'princess', name: 'Princess', cat: 'premium', photos: ["images/beds/princess-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'ray', name: 'Ray', cat: 'premium', photos: ["images/beds/ray-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'hex', name: 'Hex', cat: 'premium', photos: ["images/beds/hex-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'ciri', name: 'Ciri', cat: 'premium', photos: ["images/beds/ciri-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'grandeur', name: 'Grandeur', cat: 'premium', photos: ["images/beds/grandeur-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'grace', name: 'Grace', cat: 'premium', photos: ["images/beds/grace-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'golden', name: 'Golden', cat: 'premium', photos: ["images/beds/golden-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'mega-bubble', name: 'Mega Bubble', cat: 'premium', photos: ["images/beds/mega-bubble-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'remy', name: 'Remy', cat: 'premium', photos: ["images/beds/remy-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'rogue', name: 'Rogue', cat: 'premium', photos: ["images/beds/rogue-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'alexa', name: 'Alexa', cat: 'premium', photos: ["images/beds/alexa-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'ada', name: 'Ada', cat: 'premium', photos: ["images/beds/ada-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'june', name: 'June', cat: 'premium', photos: ["images/beds/june-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'daisy', name: 'Daisy', cat: 'premium', photos: ["images/beds/daisy-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'nova', name: 'Nova', cat: 'premium', photos: ["images/beds/nova-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' })
  ];

  const round5 = (n) => Math.round(n / 5) * 5;
  PRODUCTS.forEach((p) => {
    if (!p.prices) {
      if (p.range) {
        const [a, b] = p.range;
        p.prices = [0, 1, 2, 3, 4].map((i) => round5(a + ((b - a) * i) / 4));
      } else {
        p.prices = [0, 30, 60, 100, 150].map((d) => p.from + d);
      }
      p.sizePricesPlaceholder = true;
    }
    p.min = Math.min(...p.prices);
    p.max = Math.max(...p.prices);
  });

  const REVIEWS = [];

  const money = (n) => '£' + n.toLocaleString('en-GB');
  const product = (id) => PRODUCTS.find((p) => p.id === id);
  const colourOf = (fabricId, colourId) => {
    const f = FABRICS.find((x) => x.id === fabricId) || FABRICS[0];
    return f.colours.find((c) => c[0] === colourId) || f.colours[0];
  };

  return { SOURCES, SIZES, CATEGORIES, FABRICS, HEADBOARDS, STORAGE, OTTOMAN_BOX, MATTRESS, DELIVERY, ASSEMBLY, PRODUCTS, REVIEWS, money, product, colourOf };
})();
