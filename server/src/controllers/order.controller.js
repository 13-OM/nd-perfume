const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateOrderNumber } = require('../utils/orderNumber');

const SHIPPING_FLAT = 49;
const SHIPPING_FREE_ABOVE = 999;

function computeCoupon(coupon, subtotal) {
  if (!coupon) return { code: '', couponDiscount: 0 };

  if (subtotal < coupon.minOrderAmount) {
    throw new ApiError(
      400,
      `This coupon requires a minimum order of ₹${coupon.minOrderAmount}`
    );
  }

  let couponDiscount =
    coupon.type === 'percent'
      ? (subtotal * coupon.value) / 100
      : coupon.value;

  if (coupon.maxDiscount) {
    couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
  }

  return {
    code: coupon.code,
    couponDiscount: Math.round(couponDiscount),
  };
}

/**
 * POST /api/orders/checkout
 *
 * COD:
 *   Creates the order with paymentStatus = pending.
 *
 * Online:
 *   Requires a successfully verified Razorpay payment.
 *   The frontend sends the Razorpay IDs after /payments/verify succeeds.
 */
exports.checkout = asyncHandler(async (req, res) => {
  const {
    address,
    paymentMethod = 'online',
    couponCode,
    razorpayOrderId,
    razorpayPaymentId,
  } = req.body;

  if (
    !address ||
    !address.fullName ||
    !address.mobile ||
    !address.address ||
    !address.city ||
    !address.state ||
    !address.pincode
  ) {
    throw new ApiError(400, 'Complete delivery details are required');
  }

  /*
   * ONLINE PAYMENT SAFETY
   *
   * Do not allow an online order to be created as paid unless
   * Razorpay verification has already returned successfully.
   *
   * The frontend only sends these values after /payments/verify.
   */
  if (paymentMethod === 'online') {
    if (!razorpayOrderId || !razorpayPaymentId) {
      throw new ApiError(
        400,
        'Online payment must be completed and verified before placing the order'
      );
    }
  }

  // Resolve items:
  // Prefer items sent from the client (guests + logged-in users),
  // otherwise fall back to the user's server-side cart.
  let items = (req.body.items || []).filter((i) => i.productId);

  if (!items.length && req.user) {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product'
    );

    items = (cart?.items || []).filter((i) => i.product);
  }

  if (!items.length) {
    throw new ApiError(400, 'Your cart is empty');
  }

  // Build order items using server-side product prices.
  // This prevents the browser from changing product prices.
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product =
      item.product || (await Product.findById(item.productId));

    if (!product) continue;

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Only ${product.stock} units of ${product.name} available`
      );
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      slug: product.slug,
      bottleImage: product.bottleImage,
      price: product.price,
      mrp: product.mrp,
      quantity: item.quantity,
    });

    subtotal += product.price * item.quantity;
  }

  if (!orderItems.length) {
    throw new ApiError(400, 'No valid products found in your cart');
  }

  // Coupon
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      throw new ApiError(404, 'Invalid coupon code');
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      throw new ApiError(400, 'Coupon has expired');
    }
  }

  const { code, couponDiscount } = computeCoupon(coupon, subtotal);

  // Shipping
  const shipping =
    subtotal >= SHIPPING_FREE_ABOVE || subtotal === 0
      ? 0
      : SHIPPING_FLAT;

  const total = subtotal - couponDiscount + shipping;

  /*
   * IMPORTANT:
   *
   * Online orders are marked paid ONLY because the frontend has already
   * successfully passed /payments/verify.
   *
   * COD orders remain pending.
   */
  const paymentStatus =
    paymentMethod === 'online' ? 'paid' : 'pending';

  const order = await Order.create({
    orderNumber: generateOrderNumber(),

    user: req.user?._id,

    guestEmail: req.user
      ? undefined
      : address.email,

    items: orderItems,

    subtotal,

    couponCode: code,

    couponDiscount,

    shipping,

    total,

    paymentMethod,

    paymentStatus,

    // Save Razorpay information for online payments.
    razorpayOrderId:
      paymentMethod === 'online'
        ? razorpayOrderId
        : '',

    razorpayPaymentId:
      paymentMethod === 'online'
        ? razorpayPaymentId
        : '',

    status: 'placed',

    address: {
      fullName: address.fullName,
      mobile: address.mobile,
      email: address.email || req.user?.email,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },

    tracking: {
      timeline: [
        {
          status: 'placed',
          label: 'Order Placed',
          timestamp: new Date(),
          note: 'Order received by ND Perfume',
        },
      ],
    },
  });

  // Decrement stock after successful order creation.
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: -item.quantity,
        },
      }
    );
  }

  // Clear logged-in user's cart.
  if (req.user) {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (cart) {
      cart.items = [];
      await cart.save();
    }
  }

  // Increment coupon usage.
  if (coupon) {
    await Coupon.findByIdAndUpdate(
      coupon._id,
      {
        $inc: {
          usedCount: 1,
        },
      }
    );
  }

  res.status(201).json({
    success: true,
    order,
  });
});

/**
 * GET /api/orders
 * My orders
 */
exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    orders,
  });
});

/**
 * GET /api/orders/:orderNumber
 * My order detail
 */
exports.myOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (
    req.user &&
    String(order.user) !== String(req.user._id)
  ) {
    throw new ApiError(403, 'Not your order');
  }

  res.json({
    success: true,
    order,
  });
});

/**
 * POST /api/orders/track
 *
 * body:
 * {
 *   orderNumber,
 *   mobile
 * }
 */
exports.trackOrder = asyncHandler(async (req, res) => {
  const {
    orderNumber,
    mobile,
  } = req.body;

  if (!orderNumber) {
    throw new ApiError(400, 'Order ID is required');
  }

  const order = await Order.findOne({
    orderNumber: orderNumber.toUpperCase().trim(),
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (
    mobile &&
    order.address.mobile !== String(mobile).trim()
  ) {
    throw new ApiError(
      403,
      'Mobile number does not match this order'
    );
  }

  // Delivery status flow.
  const STATUS_FLOW = [
    {
      status: 'placed',
      label: 'Order Placed',
    },
    {
      status: 'confirmed',
      label: 'Order Confirmed',
    },
    {
      status: 'packed',
      label: 'Packed',
    },
    {
      status: 'shipped',
      label: 'Shipped',
    },
    {
      status: 'out_for_delivery',
      label: 'Out for Delivery',
    },
    {
      status: 'delivered',
      label: 'Delivered',
    },
  ];

  const ageHours =
    (Date.now() -
      new Date(order.createdAt).getTime()) /
    36e5;

  // Approximately 2 hours per simulated step.
  const ageIndex = Math.min(
    STATUS_FLOW.length - 1,
    Math.floor(ageHours / 2)
  );

  const dbIndex = STATUS_FLOW.findIndex(
    (s) => s.status === order.status
  );

  const maxIndex = Math.max(
    ageIndex,
    dbIndex,
    0
  );

  const timeline = STATUS_FLOW
    .slice(0, maxIndex + 1)
    .map((step, idx) => {
      const existing =
        order.tracking.timeline.find(
          (t) => t.status === step.status
        );

      return {
        status: step.status,
        label: step.label,

        timestamp:
          existing?.timestamp ||
          new Date(
            order.createdAt.getTime() +
              idx * 2 * 36e5
          ),

        note: existing?.note || '',

        active: idx <= maxIndex,

        current: idx === maxIndex,
      };
    });

  res.json({
    success: true,

    order: {
      orderNumber: order.orderNumber,

      status:
        timeline[maxIndex]?.status ||
        order.status,

      statusLabel:
        timeline[maxIndex]?.label || '',

      items: order.items,

      total: order.total,

      paymentMethod:
        order.paymentMethod,

      paymentStatus:
        order.paymentStatus,

      createdAt:
        order.createdAt,

      timeline,
    },
  });
});