const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/** Extract Bearer token from request */
function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** Protect routes: any logged-in user */
const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new ApiError(401, 'Please login to continue');
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (e) {
    throw new ApiError(401, 'Session expired. Please login again.');
  }
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'Account not found or disabled');
  req.user = user;
  next();
});

/** Protect admin routes (separate AdminUser collection) */
const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new ApiError(401, 'Please login to continue');
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (e) {
    throw new ApiError(401, 'Session expired. Please login again.');
  }
  if (decoded.aud !== 'admin') throw new ApiError(403, 'Admin access required');
  const admin = await AdminUser.findById(decoded.id);
  if (!admin || !admin.isActive) throw new ApiError(401, 'Admin account not found');
  req.admin = admin;
  next();
});

module.exports = { signToken, verifyToken, protect, protectAdmin };
