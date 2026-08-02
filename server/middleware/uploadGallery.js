const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================
// Create uploads/gallery if not exists
// =====================================

const uploadPath = path.join(
    __dirname,
    "../uploads/gallery"
);

if (!fs.existsSync(uploadPath)) {

    fs.mkdirSync(uploadPath, {
        recursive: true
    });

}

// =====================================
// Storage
// =====================================

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