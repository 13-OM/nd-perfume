const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function identify(req) {
  return { user: req.user?._id, guestId: req.headers['x-guest-id'] || null };
}

async function getWishlist(req) {
  const { user, guestId } = identify(req);
  let wl = null;
  if (user) wl = await Wishlist.findOne({ user });
  if (!wl && guestId) wl = await Wishlist.findOne({ guestId });
  if (!wl) {
    wl = await Wishlist.create({ user: user || undefined, guestId: user ? undefined : guestId || 'guest-' + Date.now() });
  }
  return wl;
}

/** GET /api/wishlist */
exports.getWishlist = asyncHandler(async (req, res) => {
  const wl = await getWishlist(req).then((w) => Wishlist.findById(w._id).populate('products'));
  res.json({
    success: true,
    products: wl.products.map((p) => p.toJSON()),
  });
});

/** POST /api/wishlist/:productId  (toggle) */
exports.toggle = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, 'Product not found');
  const wl = await getWishlist(req);
  const exists = wl.products.some((p) => String(p) === String(product._id));
  if (exists) {
    wl.products = wl.products.filter((p) => String(p) !== String(product._id));
    await wl.save();
    res.json({ success: true, added: false, message: 'Removed from wishlist' });
  } else {
    wl.products.push(product._id);
    await wl.save();
    res.json({ success: true, added: true, message: 'Added to wishlist' });
  }
});

/** DELETE /api/wishlist/:productId */
exports.remove = asyncHandler(async (req, res) => {
  const wl = await getWishlist(req);
  wl.products = wl.products.filter((p) => String(p) !== String(req.params.productId));
  await wl.save();
  res.json({ success: true, message: 'Removed from wishlist' });
});
