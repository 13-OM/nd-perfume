const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/coupons/validate — body: { code, subtotal } */
exports.validate = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) throw new ApiError(400, 'Coupon code is required');
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');
  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    throw new ApiError(400, 'This coupon has expired');
  }
  if (subtotal < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`);
  }
  let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount),
    },
  });
});
