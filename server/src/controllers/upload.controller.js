const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'nd-perfume/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(req.file.buffer);
  });

  res.json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
  });
});


exports.deleteFile = asyncHandler(async (req, res) => {
  const publicId = req.params.filename;

  if (!publicId) {
    throw new ApiError(400, 'Cloudinary public ID is required');
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });

  res.json({
    success: true,
    message: 'Image removed from Cloudinary',
    result,
  });
});
