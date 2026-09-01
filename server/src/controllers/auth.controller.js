const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../middleware/auth');

/** POST /api/auth/register */
exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, mobile, password } = req.body;
  if (!fullName || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ fullName, email, mobile: mobile || '', password });
  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json({ success: true, token, user: user.toSafeJSON() });
});

/** POST /api/auth/login */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Account is disabled. Contact support.');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken({ id: user._id, role: user.role });
  res.json({ success: true, token, user: user.toSafeJSON() });
});

/** GET /api/auth/me */
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

/** POST /api/auth/forgot-password — prototype: returns a reset token in the response */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, 'No account found with this email');

  const resetToken = signToken({ id: user._id, purpose: 'reset' });
  // Prototype note: in production send this via email (Nodemailer / SendGrid).
  res.json({
    success: true,
    message: 'Password reset token generated (prototype — in production this is emailed).',
    resetToken,
  });
});

/** POST /api/auth/reset-password */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) throw new ApiError(400, 'Token and new password are required');
  if (newPassword.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
  const { verifyToken } = require('../middleware/auth');
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (e) {
    throw new ApiError(401, 'Invalid or expired reset token');
  }
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated. Please login.' });
});

/** POST /api/auth/admin-login */
exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');
  const admin = await AdminUser.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin || !(await admin.matchPassword(password))) {
    throw new ApiError(401, 'Invalid admin credentials');
  }
  if (!admin.isActive) throw new ApiError(403, 'Admin account disabled');
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });
  const token = signToken({ id: admin._id, role: 'admin', aud: 'admin' });
  res.json({
    success: true,
    token,
    admin: { id: admin._id, fullName: admin.fullName, email: admin.email, role: admin.role },
  });
});
