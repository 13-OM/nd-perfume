const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const FAQ = require('../models/FAQ');
const Banner = require('../models/Banner');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');

/* ------------------------------------------------------------------ */
/* Dashboard stats                                                     */
/* ------------------------------------------------------------------ */
exports.stats = asyncHandler(async (req, res) => {
  const [totalProducts, totalOrders, totalCustomers, revenueAgg, pendingOrders, lowStockCount] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'failed' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'packed'] } }),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
    ]);
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'fullName email');

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingOrders,
      lowStock: lowStockCount,
    },
    recentOrders,
  });
});

/* ------------------------------------------------------------------ */
/* Products CRUD                                                       */
/* ------------------------------------------------------------------ */
exports.listAllProducts = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.query;
  const filter = search
    ? { $or: [{ name: { $regex: search, $options: 'i' } }, { slug: { $regex: search, $options: 'i' } }] }
    : {};
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, products, total, page: +page, pages: Math.ceil(total / limit) });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const data = req.body;
  const name = (data.name || '').trim();
  if (!name || !data.price) throw new ApiError(400, 'Name and price are required');
  let slug = data.slug || slugify(name);
  if (await Product.findOne({ slug })) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const mrp = Number(data.mrp) || Number(data.price);
  const price = Number(data.price);
  const discount = Math.round(((mrp - price) / mrp) * 100);

  const product = await Product.create({
    ...data,
    name,
    slug,
    mrp,
    price,
    discount: data.discount !== undefined && data.discount !== '' ? Number(data.discount) : discount,
    bottleImage: data.bottleImage || '',
    descriptionImage: data.descriptionImage || '',
    galleryImages: data.galleryImages || [],
    topNotes: data.topNotes || [],
    heartNotes: data.heartNotes || [],
    baseNotes: data.baseNotes || [],
    perfectFor: data.perfectFor || [],
  });
  res.status(201).json({ success: true, product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  const data = req.body;
  const mrp = Number(data.mrp) || Number(data.price) || product.mrp;
  const price = Number(data.price) || product.price;
  const discount = Math.round(((mrp - price) / mrp) * 100);
  Object.assign(product, {
    ...data,
    mrp,
    price,
    discount: data.discount !== undefined && data.discount !== '' ? Number(data.discount) : discount,
  });
  await product.save();
  res.json({ success: true, product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, message: 'Product deleted' });
});

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */
exports.listOrders = asyncHandler(async (req, res) => {
  const { status = '', search = '', page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'address.mobile': { $regex: search, $options: 'i' } },
      { guestEmail: { $regex: search, $options: 'i' } },
    ];
  }
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'fullName email mobile'),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, orders, total, page: +page, pages: Math.ceil(total / limit) });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'fullName email mobile');
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  const { status, note } = req.body;
  const valid = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!valid.includes(status)) throw new ApiError(400, 'Invalid status');
  order.status = status;
  if (status === 'delivered') order.paymentStatus = 'paid';
  order.tracking.timeline.push({
    status,
    label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    timestamp: new Date(),
    note: note || '',
  });
  await order.save();
  res.json({ success: true, order });
});

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */
exports.listCustomers = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.query;
  const filter = search
    ? {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  const [users, total] = await Promise.all([
    User.find({ role: 'user', ...filter })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments({ role: 'user', ...filter }),
  ]);
  // attach order counts
  const enriched = await Promise.all(
    users.map(async (u) => ({
      ...u,
      orderCount: await Order.countDocuments({ user: u._id }),
      orderValue: (
        await Order.aggregate([
          { $match: { user: u._id } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ])
      )[0]?.total || 0,
    }))
  );
  res.json({ success: true, customers: enriched, total, page: +page, pages: Math.ceil(total / limit) });
});

exports.getCustomer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) throw new ApiError(404, 'Customer not found');
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
  res.json({ success: true, customer: user, orders });
});

/* ------------------------------------------------------------------ */
/* Coupons                                                             */
/* ------------------------------------------------------------------ */
exports.listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const { code, type, value, minOrderAmount, maxDiscount, expiryDate, isActive, usageLimit } = req.body;
  if (!code || !value) throw new ApiError(400, 'Code and value are required');
  const coupon = await Coupon.create({
    code: String(code).toUpperCase(),
    type: type || 'percent',
    value,
    minOrderAmount: minOrderAmount || 0,
    maxDiscount: maxDiscount || 0,
    expiryDate: expiryDate || null,
    isActive: isActive !== false,
    usageLimit: usageLimit || 0,
  });
  res.status(201).json({ success: true, coupon });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json({ success: true, coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */
exports.listFaqs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find().sort({ sortOrder: 1, createdAt: 1 });
  res.json({ success: true, faqs });
});

exports.upsertFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id && id !== 'new') {
    const faq = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
    if (!faq) throw new ApiError(404, 'FAQ not found');
    return res.json({ success: true, faq });
  }
  const faq = await FAQ.create(req.body);
  res.status(201).json({ success: true, faq });
});

exports.deleteFaq = asyncHandler(async (req, res) => {
  await FAQ.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'FAQ deleted' });
});

/* ------------------------------------------------------------------ */
/* Banners                                                             */
/* ------------------------------------------------------------------ */
exports.listBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ position: 1, createdAt: 1 });
  res.json({ success: true, banners });
});

exports.upsertBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id && id !== 'new') {
    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    if (!banner) throw new ApiError(404, 'Banner not found');
    return res.json({ success: true, banner });
  }
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, banner });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Banner deleted' });
});

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */
exports.listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1 });
  res.json({ success: true, categories });
});

exports.upsertCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body, slug: req.body.slug || slugify(req.body.name) };
  if (id && id !== 'new') {
    const cat = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!cat) throw new ApiError(404, 'Category not found');
    return res.json({ success: true, category: cat });
  }
  const cat = await Category.create(data);
  res.status(201).json({ success: true, category: cat });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});
