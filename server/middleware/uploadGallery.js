const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

// =====================================
// Upload root path
// =====================================

const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadRoot = isServerless
    ? path.join(os.tmpdir(), "uploads")
    : path.join(__dirname, "../uploads");

const uploadPath = path.join(uploadRoot, "gallery");

try {
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, {
            recursive: true,
        });
    }
} catch (error) {
    console.error("Unable to create upload directory:", uploadPath, error.message);
}

module.exports = {
    uploadPath,
    relativePath: (filename) => `/uploads/gallery/${filename}`,
    isServerless,
};

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadPath);

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

// =====================================
// Allow All Image Types
// =====================================

const fileFilter = (req, file, cb) => {

    if (file.mimetype.startsWith("image/")) {

        cb(null, true);

    } else {

        cb(
            new Error("Only image files are allowed."),
            false
        );

    }

};

// =====================================
// Upload
// =====================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 50 * 1024 * 1024 // 50MB per image

    }

});

module.exports = upload;