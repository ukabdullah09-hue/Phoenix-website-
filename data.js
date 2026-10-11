/* Product data: bed names and photos from the supplied catalogue. Prices are placeholders until confirmed. */
window.STORE = (() => {
  // ── Reviews ──────────────────────────────────────────────────────────────────────────────────
  // Every review on file recommends us, so the score is 5. The count is the number of reviews we
  // actually hold.
  //
  // A bed only shows stars when a real review names it. To give a bed its own score, put the real
  // number of reviews for that bed in COUNTS below and the stars appear on it straight away. These
  // have to be counted from the reviews themselves. Numbers that were not counted from real reviews
  // are illegal to publish in the UK (Digital Markets, Competition and Consumers Act 2024, banned
  // practice 13: fake or misleading consumer reviews), so leave a bed out rather than guess at it.
  const COUNTS = {
    diva: 3,
    'axel-sleigh': 1
  };
  const SOURCES = { phoenix: { rating: 5, count: 46 } };

  const SIZES = [
    { id: 'single', name: 'Single', feet: "3'0\" × 6'3\"", cm: '90 × 190 cm', w: 90, l: 190 },
    { id: 'small-double', name: 'Small double', feet: "4'0\" × 6'3\"", cm: '120 × 190 cm', w: 120, l: 190 },
    { id: 'double', name: 'Double', feet: "4'6\" × 6'3\"", cm: '135 × 190 cm', w: 135, l: 190 },
    { id: 'king', name: 'King', feet: "5'0\" × 6'6\"", cm: '150 × 200 cm', w: 150, l: 200 },
    { id: 'super-king', name: 'Super king', feet: "6'0\" × 6'6\"", cm: '180 × 200 cm', w: 180, l: 200 }
  ];

  const CATEGORIES = [
    { id: 'gaslift', name: 'Gaslift and drawers', short: 'Gaslift & drawers', line: 'Storage that lifts or slides out.', photo: 'images/storage-gaslift.png' },
    { id: 'luxury', name: 'Luxury beds', short: 'Luxury', line: 'Tall headboards, deep tufting.', photo: 'images/beds/grandeur-1.jpg' },
    { id: 'premium', name: 'Premium beds', short: 'Premium', line: 'Statement shapes, every size.', photo: 'images/beds/celine-1.jpg' },
    { id: 'mattresses', name: 'Mattresses', short: 'Mattresses', line: 'Handmade to fit your frame.', photo: 'images/mattress-matching.png' }
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
    P({ id: 'celine', name: 'Celine', cat: 'luxury', photos: ["images/beds/celine-1.jpg", "images/beds/celine-2.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'sparkle', name: 'Sparkle', cat: 'luxury', photos: ["images/beds/sparkle-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'mirage', name: 'Mirage', cat: 'luxury', photos: ["images/beds/mirage-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'apollo', name: 'Apollo', cat: 'luxury', photos: ["images/beds/apollo-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'sapphire', name: 'Sapphire', cat: 'luxury', photos: ["images/beds/sapphire-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'neo', name: 'Neo', cat: 'luxury', photos: ["images/beds/neo-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'sunshine', name: 'Sunshine', cat: 'luxury', photos: ["images/beds/sunshine-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'pandora', name: 'Pandora', cat: 'luxury', photos: ["images/beds/pandora-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'diva', name: 'Diva', cat: 'luxury', photos: ["images/beds/diva-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'butterfly', name: 'Butterfly', cat: 'luxury', photos: ["images/beds/butterfly-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'eve', name: 'Eve', cat: 'luxury', photos: ["images/beds/eve-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'axel-sleigh', name: 'Axel Sleigh', cat: 'luxury', photos: ["images/beds/axel-sleigh-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'avalon', name: 'Avalon', cat: 'luxury', photos: ["images/beds/avalon-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
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
    P({ id: 'ciri', name: 'Ciri', cat: 'gaslift', photos: ["images/beds/ciri-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'grandeur', name: 'Grandeur', cat: 'gaslift', photos: ["images/beds/grandeur-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'grace', name: 'Grace', cat: 'gaslift', photos: ["images/beds/grace-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'golden', name: 'Golden', cat: 'gaslift', photos: ["images/beds/golden-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'mega-bubble', name: 'Mega Bubble', cat: 'gaslift', photos: ["images/beds/mega-bubble-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'remy', name: 'Remy', cat: 'gaslift', photos: ["images/beds/remy-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'rogue', name: 'Rogue', cat: 'gaslift', photos: ["images/beds/rogue-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'alexa', name: 'Alexa', cat: 'gaslift', photos: ["images/beds/alexa-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'ada', name: 'Ada', cat: 'gaslift', photos: ["images/beds/ada-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'june', name: 'June', cat: 'gaslift', photos: ["images/beds/june-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'daisy', name: 'Daisy', cat: 'gaslift', photos: ["images/beds/daisy-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' }),
    P({ id: 'nova', name: 'Nova', cat: 'gaslift', photos: ["images/beds/nova-1.jpg"], prices: [450, 470, 500, 550, 600], about: 'Made to order in our Dewsbury workshop. Available in every size and add-on.' })
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
    { name: 'Emma Harrison', stars: 5, via: 'Messenger', text: 'Yes we put it together yesterday & my son is very pleased with it.' },
    { name: 'Natalia Veber', stars: 5, via: 'Facebook', text: 'Ordered a lovely bed for myself. The bed looks beautiful, very happy. The mattress is very comfortable. Malik, the person who helped me with my order, was very professional and answered my questions straightaway.' },
    { name: 'Kimberley Gould', stars: 5, via: 'Facebook', text: 'Ordered a lovely double ottoman bed for my daughter from this company! They were so helpful and answered any questions straight away! Her bed is beautiful and she loves it!' },
    { name: 'Jo Shakespeare', stars: 5, via: 'Facebook', text: 'Very happy with our new bed from Phoenix Beds, quality is very good and it\'s extremely comfortable. The whole process from ordering to delivery is seamless and I wouldn\'t hesitate to highly recommend this fantastic company, thanks guys.. very happy.' },
    { name: 'Luxury Hair by K', stars: 5, via: 'Instagram', text: 'I love my new bed it\'s soo comfortable. Thank you soo much for the fast delivery. I will definitely recommend to family and friends.' },
    { name: 'Carla Silva Gomes', stars: 5, via: 'Facebook', text: 'If someone is looking for a good quality bed, believe me it is there. I was in doubt because pictures don\'t show the material, but it is heavy stuff, amazing gas lift. Honestly you can trust because it is absolutely a luxury bed. 5 stars.' },
    { name: 'Sarah Ebsworth', stars: 5, via: 'Facebook', text: 'Highly recommended Phoenix Beds UK, top quality service. The bed is so comfortable and was very easy to assemble.' },
    { name: 'Caz Naden', stars: 5, via: 'Messenger', text: 'Bedroom is finally finished, thank you so much. The bed is beautiful, very well built, really pleased.' },
    { name: 'Dace Krasnoselska', stars: 5, via: 'Facebook', text: 'Thank you for the best bed. I\'m so happy with this luxury bed.' },
    { name: 'Beth Drury', stars: 5, via: 'Messenger', text: 'We received our bed this morning and all I can say is wow! They are so well made, it\'s beautiful, and the mattress, which I was scared was going to be uncomfortable and cheap, is the thickest, most comfy mattress I\'ve ever owned. I was concerned at first ordering a bed from Facebook but I\'m glad I chose your company over the rest, you\'ve been amazing from start to finish. The delivery driver was so lovely too, and very polite and helpful. I\'m so pleased, thank you so much again!' },
    { name: 'Leigh Gagen', stars: 5, via: 'Facebook', text: 'Absolutely amazing! The quality of the bed is unreal: colour, material and everything. Impeccable service too! From start to finish the process was really easy and everyone is very friendly and approachable! 5 stars. I can\'t recommend Phoenix Beds enough!' },
    { name: 'Aimee Harris', stars: 5, via: 'Messenger', text: 'Bed looks lovely, really happy thank you.' },
    { name: 'Kelly Louise', stars: 5, via: 'Messenger', text: 'Thank you so much, it\'s perfect.' },
    { name: 'Nakita Grant', stars: 5, via: 'Messenger', text: 'Very happy thank you.' },
    { name: 'Ivan Valentinov Ivanov', stars: 5, via: 'Facebook', product: 'diva', text: 'Great customer service and excellent products. They answered all my questions and explained everything in detail so I had no doubt in purchasing from them. I have purchased the Diva Bed which is amazing quality, very strong bed. Thank you again for everything and keep up the amazing customer service and the quality!' },
    { name: 'Rebecca Jane Morris', stars: 5, via: 'Facebook', text: 'Thank you so much for my new superking bed, great material and structure. A solid bed frame. Good value for money and the mattress is so comfy. Delivery was great and on time, the delivery driver was so helpful and polite. The bed and mattress came packaged really well so no damage could occur. Fantastic company and service, greatly appreciated. Would highly recommend this company!' },
    { name: 'Nichola Ludbrook', stars: 5, via: 'Messenger', text: 'Thank you so much for my bed, I absolutely love it.' },
    { name: 'Neguinha Guigui', stars: 5, via: 'Messenger', text: 'At first I was scared, but to be honest this is the best bed I\'ve ever bought here on Facebook, simply magnificent. I hope to buy more things from you.' },
    { name: 'Fay', stars: 5, via: 'Messenger', text: 'I\'m delighted with my mattress, it\'s lovely thanks very much. The quality is fantastic, thanks again.' },
    { name: 'Jenny Abrahams', stars: 5, via: 'Facebook', text: 'Really pleasantly surprised by the quality of the bed received! Here\'s to many more relaxing evenings. Thank you Phoenix Beds.' },
    { name: 'Sam Philpot', stars: 5, via: 'Facebook', text: 'High recommendations to Phoenix Beds UK. Super easy to deal with, friendly with their advice, couldn\'t fault their service online. Delivery was a quick simple turnaround, the guys were here between the time frame and gave me a phone call to let me know they were on the way. The bed itself is built to such a high spec I don\'t feel worried about it breaking any time soon. If you\'re going to make a purchase from these guys get a mattress as well, they are so soft and comfortable, it\'s the best night\'s sleep I\'ve had in years.' },
    { name: 'Tanya Purkiss', stars: 5, via: 'Facebook', product: 'axel-sleigh', text: 'A huge thank you to Phoenix Beds UK for their fabulous Double Sleigh Bed in Silver Grey. My order from start to finish was amazing. This family run business was very informative, going through designs, styles and fabrics with me, showing me photos and fabric colour swatches so I could choose from the comfort of my own home. The cost of the bed was great value and looks fabulous, the fabric feels soft to touch and I love the button scroll detail. We were kept informed of time scale and delivery times throughout. I would happily recommend this bed company to everyone.' },
    { name: 'Dan JJ', stars: 5, via: 'Facebook', text: 'Great service, quick delivery, outstanding bed, strong and amazing quality. Mattress is 10/10, best night\'s sleep ever. Highly recommended and will definitely purchase again.' },
    { name: 'Aaron Jenkins', stars: 5, via: 'Facebook', text: 'Thanks to Phoenix Beds, my wife and I are having the best night\'s sleep we ever had. Naturally we were apprehensive about ordering from Facebook but they made me feel at ease and confident through the whole process. The bed and mattress arrived as described and advertised. I would recommend them to anyone searching for the best night\'s sleep.' },
    { name: 'Justyna Sikor', stars: 5, via: 'Facebook', text: 'Thank you so much for the lovely bed and so comfortable mattress. Highly recommended. Great value for money and lovely service, will order again.' },
    { name: 'Rose Wilcox', stars: 5, via: 'Messenger', text: 'Yes, it is really lovely!' },
    { name: 'Donna Daniels', stars: 5, via: 'Facebook', text: 'Helpful friendly staff. Mattress was as described in the picture, would definitely purchase again from this company. Speedy delivery. Overall excellent customer service.' },
    { name: 'Clarice Hayward', stars: 5, via: 'Facebook', text: 'Very good service, easy to place an order and delivered very quick. Very happy with my bed for the price I paid! Thank you Phoenix Beds UK.' },
    { name: 'Dawid Szczuka', stars: 5, via: 'Facebook', text: 'Great bed with fast delivery and easy communication with the seller. Would highly recommend to anyone!' },
    { name: 'Ayesha Musahid', stars: 5, via: 'Facebook', text: 'Lovely bed I\'ve purchased, looks elegant and great quality for a good price. Fast delivery. I would highly recommend this company!' },
    { name: 'Claire Melville-Wake', stars: 5, via: 'Facebook', text: 'I bought a mattress at the beginning of December and wanted to try it out for a bit of time before doing a review. The mattress is exactly as described and super comfy, the staff were really polite and helpful answering all my questions promptly and the delivery was super fast. All in all a great service, and the best bit: a great night\'s sleep for me.' },
    { name: 'Ellie Polley', stars: 5, via: 'Facebook', product: 'diva', text: 'I ordered the king size luxury Diva bed frame with the 13-14 inch pillow top mattress and it is amazing!! Such good value for money and looks. Mattress is so comfortable, I don\'t want to get out of bed!! Recommend this company. 10/10 customer service!' },
    { name: 'Ashley Harper', stars: 5, via: 'Facebook', text: 'Just wow, got my master bedroom bed. Wanted something a bit extra and different, so many designs and colours to choose from and the team helped me pick my dream bed. They were so helpful and knew exactly what was going to look best, couldn\'t recommend enough. From start of ordering to delivery, so helpful. Thanks again Phoenix Beds UK.' },
    { name: 'Anelisha Hanson', stars: 5, via: 'Messenger', text: 'Love our new bed.' },
    { name: 'Tori Beau', stars: 5, via: 'Messenger', text: 'Thank you for all your assistance.' },
    { name: 'Sara Soares', stars: 5, via: 'WhatsApp', text: 'Oh my god, it\'s amazing quality.' },
    { name: 'Taylor', stars: 5, via: 'WhatsApp', text: 'It is amazing, thank you.' },
    { name: 'Ella Carter', stars: 5, via: 'Facebook', text: 'Just had my new bed delivered this morning, it\'s amazing. I love it and fantastic quality. Absolutely solid frame and luxurious quality fabric. Sales people and delivery guys all very professional. Can definitely recommend.' },
    { name: 'Deb Menear', stars: 5, via: 'Facebook', text: 'After being slightly worried about purchasing a bed online, I am delighted with it. I was worried about the colour match, so I went with the staff member\'s recommendation after sending through a picture of my current wallpaper. I must have asked about 20 questions, but well worth it! I couldn\'t recommend these guys enough and intend to purchase another soon for my daughter.' },
    { name: 'Jessica Ford', stars: 5, via: 'Facebook', text: 'Called here for a new bed which I got sorted with straight away. No hassle, it came when they said. So easy to put up and absolutely love it. A wonderful family run business. I can highly recommend.' },
    { name: 'Mandy Harrison', stars: 5, via: 'Messenger', text: 'Absolutely in love with my bed, so comfy thank you.' },
    { name: 'Jhonson Mayo', stars: 5, via: 'Facebook', product: 'diva', text: '5 star experience from this company. We ordered a bed back in May to secure the price but we couldn\'t take delivery until our renovation was finished. They held it for us until September and delivered it some days ago. I received a call the night before advising of the delivery time. It is a beautiful bed, we went for the Diva Bed, and such a comfy mattress. My daughter is very happy. We will be ordering our master bed from this company soon also! Thanks so much.' },
    { name: 'Gemma Sherwood', stars: 5, via: 'Facebook', text: 'I ordered a bed from here and they were very professional and answered any enquiries I had straight away! I\'ve always been sceptical ordering online but I received my bed and it\'s the most beautiful bed I\'ve ever seen! Thank you.' },
    { name: 'Kate Aspinall', stars: 5, via: 'Facebook', text: 'Super fast delivery, excellent quality and very competitive prices! Would recommend!' },
    { name: 'Sara Alexandra Soares', stars: 5, via: 'Facebook', text: 'Got this bed for my son, he absolutely loves it and says it\'s super comfortable. Arrived quickly, would definitely recommend these guys.' },
    { name: 'Louise Lea Scott', stars: 5, via: 'WhatsApp', text: 'Amazing, I\'m in love with my bed. Thank you so much.' }
  ];

  const money = (n) => '£' + n.toLocaleString('en-GB');
  const product = (id) => PRODUCTS.find((p) => p.id === id);
  const colourOf = (fabricId, colourId) => {
    const f = FABRICS.find((x) => x.id === fabricId) || FABRICS[0];
    return f.colours.find((c) => c[0] === colourId) || f.colours[0];
  };

  // A bed carries stars only where COUNTS gives it a real, counted number
  PRODUCTS.forEach((p) => { const n = COUNTS[p.id]; if (n > 0) { p.rating = 5; p.count = n; } });

  return { SOURCES, SIZES, CATEGORIES, FABRICS, HEADBOARDS, STORAGE, OTTOMAN_BOX, MATTRESS, DELIVERY, ASSEMBLY, PRODUCTS, REVIEWS, money, product, colourOf };
})();
