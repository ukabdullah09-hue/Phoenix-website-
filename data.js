/* Product data read from the Mattresses & Beds UK and Cool & Comfy site videos.
   Values marked placeholder are stand-ins until confirmed. */
window.STORE = (() => {
  const SOURCES = {
    mb: { name: 'Mattresses & Beds UK', rating: 4.8 },
    cc: { name: 'Cool & Comfy', rating: 4.9 }
  };

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
    { id: 'matching', name: 'Matching mattress', note: 'Handmade in the UK, same size as your bed', price: 150, placeholder: true }
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
    P({ id: 'ember', name: 'Ember', cat: 'luxury', src: 'mb', rating: 4.8, count: 2341, prices: [450, 470, 500, 550, 600], style: 'panel', colour: 'grey',
        about: 'One of our most loved designs: a grand, tall headboard with deep vertical panels that frame the whole bed.',
        bullets: ['Tall panelled headboard, our signature design', 'Solid timber frame, no creaks or squeaks', 'Plush velvet in the colour of your choice', 'Built to order in our Dewsbury workshop', '24-month warranty on frame and stitching'] }),
    P({ id: 'emerald', name: 'Emerald', cat: 'luxury', src: 'mb', rating: 4.7, count: 2156, range: [465, 575], style: 'wing', colour: 'silver',
        about: 'Panelled headboard with sculpted wings that wrap around the pillows.' }),
    P({ id: 'mirage', name: 'Mirage', cat: 'luxury', src: 'mb', rating: 4.7, count: 2314, range: [440, 550], style: 'chesterfield', colour: 'cream', stock: false,
        about: 'Deep-buttoned headboard in a soft, bright finish.' }),
    P({ id: 'bubble', name: 'Bubble', cat: 'premium', src: 'mb', rating: 4.8, count: 2780, range: [630, 720], style: 'bubble', colour: 'cream',
        about: 'Rounded, cushioned panels for a soft, sculptural look.' }),
    P({ id: 'elite', name: 'Elite', cat: 'premium', src: 'mb', rating: 4.6, count: 2402, range: [350, 500], style: 'channel', colour: 'cream', stock: false,
        about: 'Slim channel tufting from top to bottom, with a matching base.' }),
    P({ id: 'skye', name: 'Skye', cat: 'premium', src: 'mb', rating: 4.8, count: 2296, range: [360, 470], style: 'panel', colour: 'silver',
        about: 'Clean panelled headboard that suits any room.' }),
    P({ id: 'crystal', name: 'Crystal', cat: 'gaslift', src: 'mb', rating: 4.8, count: 1156, range: [450, 600], pricePlaceholder: true, style: 'chesterfield', colour: 'charcoal',
        about: 'Buttoned headboard over a lift-up storage base.' }),
    P({ id: 'ambassador', name: 'Ambassador', cat: 'gaslift', src: 'mb', rating: 4.7, count: 1073, range: [450, 600], pricePlaceholder: true, style: 'wing', colour: 'grey',
        about: 'Winged headboard with plenty of storage below.' }),
    P({ id: 'pearl', name: 'Pearl', cat: 'luxury', src: 'cc', rating: 4.9, count: 1439, from: 240, style: 'chesterfield', colour: 'silver',
        about: 'Buttoned wingback headboard with a hotel-style finish.' }),
    P({ id: 'isla', name: 'Isla', cat: 'luxury', src: 'cc', rating: 5.0, count: 1123, from: 425, style: 'panel', colour: 'cream',
        about: 'Tall vertical panels in a soft, light velvet.' }),
    P({ id: 'royal-nova', name: 'Royal Nova', cat: 'storage', src: 'cc', rating: 5.0, count: 1189, from: 390, style: 'chesterfield', colour: 'charcoal',
        about: 'Deep-buttoned headboard over a full storage base.' }),
    P({ id: 'akira', name: 'Akira', cat: 'storage', src: 'cc', rating: 4.7, count: 847, from: 260, style: 'pinch', colour: 'grey',
        about: 'Pinch-pleated headboard and base with room underneath.' }),
    P({ id: 'herman', name: 'Herman', cat: 'storage', src: 'cc', rating: 5.0, count: 291, from: 240, style: 'chesterfield', colour: 'black',
        about: 'A darker, deep-buttoned bed with storage below.' }),
    P({ id: 'crown', name: 'Crown', cat: 'storage', src: 'cc', rating: 5.0, count: 1056, prices: [270, 300, 300, 325, 375], pricePlaceholderSizes: ['super-king'], style: 'pinch', colour: 'cream',
        about: 'Pinch-pleated velvet across the headboard and base.' }),
    P({ id: 'horizon', name: 'Horizon', cat: 'premium', src: 'cc', rating: 4.8, count: 667, range: [275, 360], style: 'panel', colour: 'grey',
        about: 'Low, wide panels for a calm, modern room.' }),
    P({ id: 'hazel', name: 'Hazel', cat: 'premium', src: 'cc', rating: 4.8, count: 478, range: [590, 780], style: 'wing', colour: 'cream',
        about: 'A tall winged headboard that makes the bed the centrepiece.' }),
    P({ id: 'quention', name: 'Quention', cat: 'luxury', src: 'cc', rating: 4.8, count: 342, range: [610, 750], style: 'chesterfield', colour: 'charcoal',
        about: 'Grand buttoned headboard with a deep, padded frame.' })
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

  const REVIEWS = [
    { src: 'cc', name: 'Jade Marie Laithwaite', product: 'isla', date: 'January 2025', stars: 5,
      text: 'I have had this bed now for three months and it has by far exceeded my expectations in every single way! It\'s comfortable, sturdy and looks fantastic. The ordering process and delivery was really easy and straightforward.' },
    { src: 'cc', name: 'Adam B.', date: 'October 2026', stars: 5,
      text: 'So happy with it. The storage underneath is a life saver, was packed well. Ordering was simple enough and I was informed.' },
    { src: 'mb', name: 'Verified buyer', date: '', stars: 5,
      text: 'A really great quality bed and mattress, very well packed and delivered. Easy to assemble. Would highly recommend.' }
  ];

  const money = (n) => '£' + n.toLocaleString('en-GB');
  const product = (id) => PRODUCTS.find((p) => p.id === id);
  const colourOf = (fabricId, colourId) => {
    const f = FABRICS.find((x) => x.id === fabricId) || FABRICS[0];
    return f.colours.find((c) => c[0] === colourId) || f.colours[0];
  };

  return { SOURCES, SIZES, CATEGORIES, FABRICS, HEADBOARDS, STORAGE, OTTOMAN_BOX, MATTRESS, DELIVERY, ASSEMBLY, PRODUCTS, REVIEWS, money, product, colourOf };
})();
