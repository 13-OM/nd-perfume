const path = require('path');
const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/** POST /api/upload — single image (multer middleware applied in route) */
exports.uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

/** DELETE /api/upload/:filename — remove an uploaded file */
exports.deleteFile = asyncHandler(async (req, res) => {
  const safe = path.basename(req.params.filename);
  const full = path.join(__dirname, '..', '..', 'uploads', safe);
  if (fs.existsSync(full)) fs.unlinkSync(full);
  res.json({ success: true, message: 'File removed' });
});
