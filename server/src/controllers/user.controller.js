const User = require('../models/User');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/users/me */
exports.profile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

/** PUT /api/users/me — update profile */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullName, mobile, email } = req.body;
  if (fullName) req.user.fullName = fullName;
  if (mobile !== undefined) req.user.mobile = mobile;
  if (email && email !== req.user.email) {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw new ApiError(409, 'Email already in use');
    req.user.email = email;
  }
  await req.user.save();
  res.json({ success: true, user: req.user.toSafeJSON() });
});

/** PUT /api/users/password */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, 'Both passwords are required');
  if (newPassword.length < 6) throw new ApiError(400, 'New password must be at least 6 characters');
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) throw new ApiError(401, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

/** GET /api/users/addresses */
exports.getAddresses = asyncHandler(async (req, res) => {
  res.json({ success: true, addresses: req.user.addresses || [] });
});

/** POST /api/users/addresses */
exports.addAddress = asyncHandler(async (req, res) => {
  const { fullName, mobile, address, city, state, pincode, isDefault } = req.body;
  if (!fullName || !mobile || !address || !city || !state || !pincode) {
    throw new ApiError(400, 'All address fields are required');
  }
  if (isDefault) req.user.addresses.forEach((a) => (a.isDefault = false));
  req.user.addresses.push({ fullName, mobile, address, city, state, pincode, isDefault: !!isDefault });
  await req.user.save();
  res.status(201).json({ success: true, addresses: req.user.addresses });
});

/** PUT /api/users/addresses/:id */
exports.updateAddress = asyncHandler(async (req, res) => {
  const addr = req.user.addresses.id(req.params.id);
  if (!addr) throw new ApiError(404, 'Address not found');
  Object.assign(addr, req.body);
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});

/** DELETE /api/users/addresses/:id */
exports.deleteAddress = asyncHandler(async (req, res) => {
  req.user.addresses = req.user.addresses.filter((a) => String(a._id) !== String(req.params.id));
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});

/** GET /api/users/orders */
exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});
