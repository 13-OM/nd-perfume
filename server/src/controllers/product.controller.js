const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');

const PUBLIC_MATCH = { isActive: true };

/** GET /api/products — list with filters, sort, search, pagination */
exports.listProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search = '',
    category = '',
    gender = '',
    fragranceType = '',
    minPrice = '',
    maxPrice = '',
    rating = '',
    availability = '',
    sort = 'featured',
  } = req.query;

  const filter = { ...PUBLIC_MATCH };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { fragranceType: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) filter.category = { $regex: `^${category}$`, $options: 'i' };
  if (gender) filter.gender = { $regex: `^${gender}$`, $options: 'i' };
  if (fragranceType) filter.fragranceType = { $regex: `^${fragranceType}$`, $options: 'i' };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (rating) filter.rating = { $gte: Number(rating) };
  if (availability === 'in_stock') filter.stock = { $gt: 0 };
  if (availability === 'out_of_stock') filter.stock = 0;

  const sortMap = {
    featured: { featured: -1, rating: -1, createdAt: -1 },
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1, reviewCount: -1 },
    bestseller: { bestseller: -1, rating: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.featured;

  const p = Math.max(1, parseInt(page));
  const l = Math.min(40, Math.max(1, parseInt(limit)));
  const skip = (p - 1) * l;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip(skip).limit(l).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    total,
    page: p,
    pages: Math.ceil(total / l),
    limit: l,
    facets: {
      categories: await Product.distinct('category', PUBLIC_MATCH),
      genders: await Product.distinct('gender', PUBLIC_MATCH),
      fragranceTypes: await Product.distinct('fragranceType', PUBLIC_MATCH),
    },
  });
});

/** GET /api/products/slug/:slug */
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!product) throw new ApiError(404, 'Product not found');

  // Related: same fragrance type OR same gender, excluding self.
  // Fill with other active products if fewer than 4 matches.
  let related = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [
      { fragranceType: product.fragranceType },
      { gender: product.gender },
      { category: product.category },
    ],
  }).lean();
  if (related.length < 4) {
    const ids = related.map((r) => r._id);
    const fillers = await Product.find({
      _id: { $ne: product._id, $nin: ids },
      isActive: true,
    })
      .limit(4 - related.length)
      .lean();
    related = [...related, ...fillers];
  }
  related = related.slice(0, 4);

  res.json({ success: true, product, related });
});

/** GET /api/products/:id */
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

/** GET /api/products/featured?type=featured|bestseller|new */
exports.getCollections = asyncHandler(async (req, res) => {
  const type = req.query.type || 'featured';
  const flagMap = { featured: 'featured', bestseller: 'bestseller', new: 'newArrival' };
  const flag = flagMap[type];
  const products = await Product.find({ isActive: true, [flag]: true }).limit(8).lean();
  res.json({ success: true, products });
});

/** GET /api/products/home — aggregated data for the homepage */
exports.getHome = asyncHandler(async (req, res) => {
  const [featured, bestsellers, newArrivals] = await Promise.all([
    Product.find({ isActive: true, featured: true }).limit(8).lean(),
    Product.find({ isActive: true, bestseller: true }).limit(4).lean(),
    Product.find({ isActive: true, newArrival: true }).limit(4).lean(),
  ]);
  res.json({ success: true, featured, bestsellers, newArrivals });
});

/** POST /api/products/seed-data — helper used by admin "reset demo data" (optional) */
exports.getSuggestSlug = asyncHandler(async (req, res) => {
  const slug = slugify(req.query.name || '');
  res.json({ success: true, slug });
});
