const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function identify(req) {
  return { user: req.user?._id, guestId: req.headers['x-guest-id'] || null };
}

async function getCart(req) {
  const { user, guestId } = identify(req);
  let cart = null;
  if (user) cart = await Cart.findOne({ user });
  if (!cart && guestId) cart = await Cart.findOne({ guestId });
  if (!cart) {
    cart = await Cart.create({ user: user || undefined, guestId: user ? undefined : guestId || 'guest-' + Date.now() });
  }
  return cart;
}

/** GET /api/cart */
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req).then((c) =>
    Cart.findById(c._id).populate('items.product')
  );
  const items = cart.items
    .filter((i) => i.product)
    .map((i) => ({
      productId: i.product._id,
      name: i.product.name,
      slug: i.product.slug,
      bottleImage: i.product.bottleImage,
      price: i.product.price,
      mrp: i.product.mrp,
      stock: i.product.stock,
      quantity: i.quantity,
    }));
  res.json({ success: true, cartId: cart._id, items });
});

/** POST /api/cart/add  { productId, quantity } */
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) throw new ApiError(400, 'Product is required');
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');
  const qty = Math.max(1, parseInt(quantity) || 1);

  const cart = await getCart(req);
  const existing = cart.items.find((i) => String(i.product) === String(productId));
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, product.stock || 99);
  } else {
    cart.items.push({ product: productId, quantity: Math.min(qty, product.stock || 99) });
  }
  await cart.save();
  const fresh = await Cart.findById(cart._id).populate('items.product');
  res.json({ success: true, message: `${product.name} added to cart`, count: fresh.items.length });
});

/** PATCH /api/cart/update  { productId, quantity } */
exports.updateCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await getCart(req);
  const item = cart.items.find((i) => String(i.product) === String(productId));
  if (!item) throw new ApiError(404, 'Item not in cart');
  item.quantity = Math.max(1, parseInt(quantity) || 1);
  await cart.save();
  const fresh = await Cart.findById(cart._id).populate('items.product');
  res.json({
    success: true,
    items: fresh.items.map((i) => ({
      productId: i.product._id,
      name: i.product.name,
      slug: i.product.slug,
      bottleImage: i.product.bottleImage,
      price: i.product.price,
      mrp: i.product.mrp,
      stock: i.product.stock,
      quantity: i.quantity,
    })),
  });
});

/** DELETE /api/cart/:productId */
exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req);
  cart.items = cart.items.filter((i) => String(i.product) !== String(req.params.productId));
  await cart.save();
  res.json({ success: true, message: 'Item removed from cart' });
});

/** DELETE /api/cart */
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req);
  cart.items = [];
  await cart.save();
  res.json({ success: true, message: 'Cart cleared' });
});
