const FAQ = require('../models/FAQ');
const Banner = require('../models/Banner');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/faqs — public, active only */
exports.publicFaqs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
  res.json({ success: true, faqs });
});

/** GET /api/categories — public, active only */
exports.publicCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
  res.json({ success: true, categories });
});

/** GET /api/banners — public, active only */
exports.publicBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ position: 1, createdAt: 1 });
  res.json({ success: true, banners });
});
