const Review = require('../models/Review');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/reviews/product/:productId */
exports.listByProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'fullName')
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, reviews });
});

/** POST /api/reviews — { productId, rating, title, comment } (auth) */
exports.create = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  if (!productId || !rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Valid product and rating (1-5) are required');
  }
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) throw new ApiError(409, 'You already reviewed this product');

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    title: title || '',
    comment: comment || '',
  });

  // Recompute product rating
  const agg = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const stat = agg[0] || { avg: rating, count: 1 };
  product.rating = Math.round(stat.avg * 10) / 10;
  product.reviewCount = stat.count;
  await product.save();

  res.status(201).json({ success: true, review });
});
