const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;

  const extensionOk = allowed.test(
    file.originalname.toLowerCase()
  );

  const mimeOk = allowed.test(file.mimetype);

  if (extensionOk && mimeOk) {
    cb(null, true);
  } else {
    cb(
      new Error('Only images are allowed (jpg, png, webp, gif)'),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

module.exports = upload;
