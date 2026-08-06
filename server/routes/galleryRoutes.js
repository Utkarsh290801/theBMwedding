const express = require("express");

const router = express.Router();

const galleryController = require("../controllers/galleryController");

const upload = require("../middleware/uploadGallery");

// ======================================
// Folder Routes
// ======================================

router.get("/folders", galleryController.getFolders);

router.post("/folders", galleryController.createFolder);

router.delete("/folders/:id", galleryController.deleteFolder);

// ======================================
// Image Routes
// ======================================

router.get("/images", galleryController.getImages);

router.post(
  "/upload",
  upload.array("images", 100),
  galleryController.uploadImages,
);

router.put("/image/:id/shortlist", galleryController.toggleShortlist);

router.delete("/image/:id", galleryController.deleteImage);

module.exports = router;
