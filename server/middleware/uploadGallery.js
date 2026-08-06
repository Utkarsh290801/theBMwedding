const multer = require("multer");

// =====================================
// Cloudinary upload storage
// =====================================
// Use memory storage so file buffers are uploaded directly to Cloudinary.
// This avoids local disk persistence issues on Vercel and works with the free tier.

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per image
  },
});

module.exports = upload;
