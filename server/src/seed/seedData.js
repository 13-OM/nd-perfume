/**
 * Seed data for the ND Perfume prototype.
 * Image paths point to static assets bundled with the React client
 * (client/public/images). Admin-uploaded images live under /uploads.
 */

const products = [
  {
    name: 'Aqua Veil',
    slug: 'aqua-veil',
    price: 999,
    mrp: 1499,
    discount: 33,
    category: 'Aquatic',
    gender: 'Unisex',
    fragranceType: 'Aquatic',
    size: '50 ML',
    stock: 120,
    rating: 4.8,
    reviewCount: 214,
    featured: true,
    bestseller: true,
    newArrival: true,
    bottleImage: '/images/bottle-aqua-veil.webp',
    descriptionImage: '/images/desc-aqua-veil.webp',
    shortDescription:
      'A refreshing aquatic fragrance that flows with elegance and freshness — pure, calm and effortlessly sophisticated.',
    description:
      'Aqua Veil wraps you in the cool, crystalline freshness of the sea. A crisp blend of aquatic notes and soft florals creates a scent that feels pure, calm and effortlessly sophisticated — like a gentle wave on a serene shore. Designed for the modern soul that finds clarity in calm.',
    topNotes: ['Marine Accord', 'Bergamot', 'Cucumber'],
    heartNotes: ['Water Lily', 'Jasmine', 'Sea Salt'],
    baseNotes: ['White Musk', 'Driftwood', 'Ambergris'],
    perfectFor: ['Daily wear', 'Summer days', 'Office & work', 'Gifting'],
    fragranceCharacter: 'Crisp · Clean · Serene',
    longevity: '6–8 hours',
    sillage: 'Moderate',
    usage:
      'Spray on pulse points — wrists, neck and behind the ears — from a distance of 15–20 cm. For a longer-lasting veil, apply over unscented moisturised skin.',
    story:
      'Aqua Veil was born from the idea of the perfect morning — a cool breeze, an open sea, and a fresh start. It captures that fleeting moment between dawn and the first wave, bottled as a scent that moves with you all day.',
  },
  {
    name: 'Aqua Desire',
    slug: 'aqua-desire',
    price: 1099,
    mrp: 1599,
    discount: 31,
    category: 'Aquatic',
    gender: 'Unisex',
    fragranceType: 'Aquatic',
    size: '50 ML',
    stock: 95,
    rating: 4.7,
    reviewCount: 178,
    featured: true,
    bestseller: true,
    newArrival: false,
    bottleImage: '/images/bottle-aqua-desire.webp',
    descriptionImage: '/images/desc-aqua-desire.webp',
    shortDescription:
      'A fresh and invigorating fragrance that awakens your senses and captures the essence of the ocean.',
    description:
      'Aqua Desire is an invigorating aquatic composition that awakens the senses with a burst of freshness. Notes of sparkling citrus and ocean breeze rise over a heart of aquatic florals, settling into a warm, clean base. It captures the essence of the ocean — desire, depth and endless possibility.',
    topNotes: ['Lemon Zest', 'Ocean Breeze', 'Mint'],
    heartNotes: ['Lotus', 'Aquatic Florals', 'Green Leaves'],
    baseNotes: ['Amberwood', 'Musk', 'Sandal'],
    perfectFor: ['Vacation', 'Sports & gym', 'Day outings', 'Summer evenings'],
    fragranceCharacter: 'Invigorating · Fresh · Dynamic',
    longevity: '6–8 hours',
    sillage: 'Moderate to strong',
    usage:
      'Spray on pulse points and clothing. Ideal after a shower — the scent adheres better to clean, hydrated skin.',
    story:
      'Aqua Desire was crafted for the ones who chase the horizon. Every spray carries the rush of diving into deep blue water — a scent built to accompany ambition, motion and the thrill of the next adventure.',
  },
  {
    name: 'Amber Woods',
    slug: 'amber-woods',
    price: 1199,
    mrp: 1699,
    discount: 29,
    category: 'Woody',
    gender: 'Men',
    fragranceType: 'Woody',
    size: '50 ML',
    stock: 80,
    rating: 4.9,
    reviewCount: 242,
    featured: true,
    bestseller: true,
    newArrival: false,
    bottleImage: '/images/bottle-amber-woods.webp',
    descriptionImage: '/images/desc-amber-woods.webp',
    shortDescription:
      'A warm and captivating blend of rich amber and deep woods that exudes confidence and sophistication.',
    description:
      'Amber Woods is a warm and captivating blend that exudes quiet confidence. The richness of amber intertwines with deep woods — sandalwood, cedar and vetiver — creating a timeless scent that lingers long after you leave the room. Made for the man who speaks softly and carries presence.',
    topNotes: ['Cardamom', 'Bergamot', 'Cinnamon'],
    heartNotes: ['Amber', 'Cedarwood', 'Sandalwood'],
    baseNotes: ['Vetiver', 'Tonka Bean', 'Musk'],
    perfectFor: ['Evening wear', 'Winter', 'Date nights', 'Formal occasions'],
    fragranceCharacter: 'Warm · Sophisticated · Lasting',
    longevity: '8–10 hours',
    sillage: 'Strong',
    usage:
      'Apply to pulse points — neck, wrists, chest. Great for evenings; a single spray on the collar keeps the trail alive for hours.',
    story:
      'Amber Woods draws from the oldest luxury in perfumery — resin, wood and fire. It is the scent of a mahogany library at dusk, of well-worn leather, of decisions made with certainty. Timeless, like the man it was made for.',
  },
  {
    name: 'Gold Aura',
    slug: 'gold-aura',
    price: 1399,
    mrp: 1899,
    discount: 26,
    category: 'Oriental',
    gender: 'Women',
    fragranceType: 'Amber',
    size: '50 ML',
    stock: 70,
    rating: 4.9,
    reviewCount: 306,
    featured: true,
    bestseller: true,
    newArrival: false,
    bottleImage: '/images/bottle-gold-aura.webp',
    descriptionImage: '/images/desc-gold-aura.webp',
    shortDescription:
      'A luminous and luxurious fragrance that reflects sophistication and success.',
    description:
      'Gold Aura is a radiant blend of rich florals, warm amber and precious woods that leaves an unforgettable impression. It is light, opulent and self-assured — a scent that turns heads and lingers in memory. For the woman whose presence is already golden, this is the finishing touch.',
    topNotes: ['Saffron', 'Mandarin', 'Pink Pepper'],
    heartNotes: ['Jasmine', 'Rose', 'Orchid'],
    baseNotes: ['Amber', 'Oud', 'Vanilla', 'Sandalwood'],
    perfectFor: ['Weddings', 'Celebrations', 'Special evenings', 'Signature scent'],
    fragranceCharacter: 'Opulent · Radiant · Memorable',
    longevity: '8–10 hours',
    sillage: 'Strong',
    usage:
      'Spray on pulse points and hair. A golden scent deserves golden moments — reserve it for occasions that matter.',
    story:
      'Gold Aura celebrates the idea that some people carry their own light. Blended with saffron, rose and warm amber, it was composed to mirror the glow of golden hour — luminous, warm and impossible to ignore.',
  },
  {
    name: 'Next Level N19',
    slug: 'next-level-n19',
    price: 1299,
    mrp: 1799,
    discount: 28,
    category: 'Woody',
    gender: 'Men',
    fragranceType: 'Oriental',
    size: '50 ML',
    stock: 110,
    rating: 4.8,
    reviewCount: 195,
    featured: true,
    bestseller: true,
    newArrival: true,
    bottleImage: '/images/bottle-next-level-n19.webp',
    descriptionImage: '/images/desc-next-level-n19.webp',
    shortDescription:
      'A bold and powerful fragrance crafted for those who strive for greatness and stand out with confidence.',
    description:
      'Next Level N19 is a bold, powerful composition crafted for those who refuse to blend in. A dynamic blend of spicy, woody and amber notes builds an intense, magnetic trail — daring, ambitious and unmistakably confident. Step up. Take the next level.',
    topNotes: ['Black Pepper', 'Nutmeg', 'Bergamot'],
    heartNotes: ['Leather', 'Cedarwood', 'Cinnamon'],
    baseNotes: ['Amber', 'Oud', 'Guaiac Wood'],
    perfectFor: ['Nights out', 'Power meetings', 'Signature statements', 'Gifting'],
    fragranceCharacter: 'Bold · Intense · Magnetic',
    longevity: '9–12 hours',
    sillage: 'Very strong',
    usage:
      'A little goes a long way — two sprays on pulse points are enough to command the room.',
    story:
      'N19 stands for the nineteenth attempt — the one where everything clicked. It is the scent of perseverance, of the breakthrough nobody saw coming. Every note is engineered to announce: you have arrived.',
  },
];

const faqs = [
  {
    question: 'What fragrances do you offer?',
    answer:
      'ND Perfume offers a curated range of premium Eau de Parfum (50 ML) across aquatic, woody, amber and oriental families — including bestsellers like Aqua Veil, Aqua Desire, Amber Woods, Gold Aura and Next Level N19. New fragrances are added regularly.',
    sortOrder: 1,
  },
  {
    question: 'How long does the fragrance last?',
    answer:
      'Our Eau de Parfum concentration typically lasts 6 to 12 hours on skin depending on the fragrance and your skin type. Woody and oriental scents like Amber Woods and Gold Aura tend to last longest; aquatic scents like Aqua Veil are lighter and fresher.',
    sortOrder: 2,
  },
  {
    question: 'How do I choose the right perfume?',
    answer:
      'Think about the occasion, season and your personality. Fresh aquatics suit daytime and summers; warm woody and amber scents suit evenings and winters. You can also use our fragrance filters on the Shop page to explore by gender, fragrance type and price.',
    sortOrder: 3,
  },
  {
    question: 'What payment methods are available?',
    answer:
      'We accept all major payment methods — UPI, credit/debit cards, net banking and popular wallets via secure online payment, as well as Cash on Delivery across India.',
    sortOrder: 4,
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Orders are packed within 24 hours and typically delivered in 3–7 business days across India. Metro cities often receive orders faster. Shipping is free on orders above ₹999.',
    sortOrder: 5,
  },
  {
    question: 'Can I track my order?',
    answer:
      'Yes. Once your order is placed, use the Track Order page with your Order ID (e.g. ND24090123) and the mobile number used at checkout to see live status — from confirmation to delivery.',
    sortOrder: 6,
  },
  {
    question: 'What is your return policy?',
    answer:
      'We offer a 7-day return policy. If your product arrives damaged, defective or different from what you ordered, contact our support team and we will replace or refund it. For hygiene reasons, unsealed products cannot be returned.',
    sortOrder: 7,
  },
];

const categories = [
  { name: 'Men', slug: 'men', type: 'gender', sortOrder: 1 },
  { name: 'Women', slug: 'women', type: 'gender', sortOrder: 2 },
  { name: 'Unisex', slug: 'unisex', type: 'gender', sortOrder: 3 },
  { name: 'Aquatic', slug: 'aquatic', type: 'fragrance', sortOrder: 4 },
  { name: 'Woody', slug: 'woody', type: 'fragrance', sortOrder: 5 },
  { name: 'Amber', slug: 'amber', type: 'fragrance', sortOrder: 6 },
  { name: 'Fresh', slug: 'fresh', type: 'fragrance', sortOrder: 7 },
  { name: 'Oriental', slug: 'oriental', type: 'fragrance', sortOrder: 8 },
];

const banners = [
  {
    title: 'ND PERFUME',
    subtitle: 'Scent Your Signature',
    ctaText: 'Shop Collection',
    link: '/shop',
    position: 1,
  },
  {
    title: 'FIND YOUR SIGNATURE SCENT',
    subtitle: 'Premium fragrances crafted to leave a lasting impression.',
    ctaText: 'Shop Now',
    link: '/shop',
    position: 2,
  },
];

const coupons = [
  { code: 'WELCOME10', type: 'percent', value: 10, minOrderAmount: 499, maxDiscount: 200, expiryDate: null, isActive: true, usageLimit: 0 },
  { code: 'ND500', type: 'fixed', value: 500, minOrderAmount: 2499, maxDiscount: 0, expiryDate: null, isActive: true, usageLimit: 0 },
  { code: 'FIRST15', type: 'percent', value: 15, minOrderAmount: 999, maxDiscount: 300, expiryDate: null, isActive: true, usageLimit: 0 },
];

module.exports = { products, faqs, categories, banners, coupons };
