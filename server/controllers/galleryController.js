const fs = require("fs");
const path = require("path");
const GalleryFolder = require("../models/GalleryFolder");
const GalleryImage = require("../models/GalleryImage");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configure Cloudinary using environment variables.
// Make sure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getFullUrl(req, urlPath) {
  if (!urlPath) return urlPath;
  if (/^https?:\/\//i.test(urlPath)) return urlPath;
  const host = req.protocol + "://" + req.get("host");
  return host + urlPath;
}

function isCloudinaryUrl(urlPath) {
  return typeof urlPath === "string" && /cloudinary\.com/i.test(urlPath);
}

function isLocalUploadUrl(urlPath) {
  return typeof urlPath === "string" && /^\/?uploads\//i.test(urlPath);
}

function deleteLocalFileIfExists(urlPath) {
  if (!urlPath || isCloudinaryUrl(urlPath) || !isLocalUploadUrl(urlPath))
    return;

  const normalizedPath = urlPath.replace(/^\/+/, "");
  const filePath = path.resolve(__dirname, "..", normalizedPath);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function resolveMediaUrl(req, urlPath, folderId, documentRef) {
  if (!urlPath) return "";

  if (isCloudinaryUrl(urlPath)) {
    return urlPath;
  }

  if (isLocalUploadUrl(urlPath)) {
    const normalizedPath = urlPath.replace(/^\/+/, "");
    const filePath = path.resolve(__dirname, "..", normalizedPath);

    if (fs.existsSync(filePath)) {
      try {
        const buffer = fs.readFileSync(filePath);
        const uploadResult = await uploadBufferToCloudinary(
          buffer,
          String(folderId || ""),
        );

        if (documentRef && typeof documentRef.save === "function") {
          documentRef.imageUrl = uploadResult.secure_url;
          await documentRef.save();
        }

        return uploadResult.secure_url;
      } catch (error) {
        console.error(
          "Failed to migrate local gallery image to Cloudinary:",
          error.message,
        );
      }
    }

    return "";
  }

  return getFullUrl(req, urlPath);
}

function uploadBufferToCloudinary(buffer, folderId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `bm_wedding/gallery/${folderId}`,
        resource_type: "image",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
// ======================================
// Create Folder
// ======================================

exports.createFolder = async (req, res) => {
  try {
    const folder = await GalleryFolder.create({
      name: req.body.name,
    });

    res.status(201).json({
      success: true,

      data: folder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================
// Get All Folders
// ======================================

exports.getFolders = async (req, res) => {
  try {
    const folders = await GalleryFolder.find()

      .sort({
        createdAt: -1,
      });

    const responseFolders = [];

    for (const folder of folders) {
      const coverImage = await resolveMediaUrl(
        req,
        folder.coverImage,
        folder._id,
        folder,
      );

      responseFolders.push({
        ...folder.toObject(),
        coverImage,
      });
    }

    res.json({
      success: true,

      data: responseFolders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================
// Upload Images
// ======================================

exports.uploadImages = async (req, res) => {
  try {
    const folderId = req.body.folderId;

    if (!folderId) {
      return res.status(400).json({
        success: false,
        message: "Folder ID is required",
      });
    }

    const files = req.files || [];

    const savedImages = [];

    for (const file of files) {
      const uploadResult = await uploadBufferToCloudinary(
        file.buffer,
        folderId,
      );

      const image = await GalleryImage.create({
        folderId,
        fileName: file.originalname,
        imageUrl: uploadResult.secure_url,
        size: file.size,
      });

      savedImages.push(image);
    }

    // First uploaded image becomes folder cover
    const folder = await GalleryFolder.findById(folderId);

    if (folder && !folder.coverImage && savedImages.length > 0) {
      folder.coverImage = savedImages[0].imageUrl;
      await folder.save();
    }

    // Return images with absolute URLs so remote frontends can load them
    const responseImages = [];

    for (const img of savedImages) {
      const resolvedUrl = await resolveMediaUrl(
        req,
        img.imageUrl,
        img.folderId,
        img,
      );

      if (resolvedUrl) {
        responseImages.push({
          ...img.toObject(),
          imageUrl: resolvedUrl,
        });
      }
    }

    res.json({
      success: true,
      data: responseImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Images
// ======================================

exports.getImages = async (req, res) => {
  try {
    const filter = {};

    if (req.query.folder) {
      filter.folderId = req.query.folder;
    }

    const images = await GalleryImage.find(filter)

      .sort({
        createdAt: -1,
      });

    const responseImages = [];

    for (const img of images) {
      const resolvedUrl = await resolveMediaUrl(
        req,
        img.imageUrl,
        img.folderId,
        img,
      );

      if (resolvedUrl) {
        responseImages.push({
          ...img.toObject(),
          imageUrl: resolvedUrl,
        });
      }
    }

    res.json({
      success: true,

      data: responseImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
// ======================================
// Toggle Shortlist
// ======================================

exports.toggleShortlist = async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,

        message: "Image not found",
      });
    }

    image.shortlisted = !image.shortlisted;

    await image.save();

    res.json({
      success: true,

      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================
// Delete Image
// ======================================

exports.deleteImage = async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,

        message: "Image not found",
      });
    }

    // Delete physical file when the image still points to a local upload path
    deleteLocalFileIfExists(image.imageUrl);

    const folderId = image.folderId;

    await image.deleteOne();

    // Update folder cover

    const folder = await GalleryFolder.findById(folderId);

    if (folder) {
      const firstImage = await GalleryImage.findOne({
        folderId,
      }).sort({
        createdAt: 1,
      });

      folder.coverImage = firstImage ? firstImage.imageUrl : "";

      await folder.save();
    }

    res.json({
      success: true,

      message: "Image deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
// ======================================
// Delete Folder
// ======================================

exports.deleteFolder = async (req, res) => {
  try {
    const folder = await GalleryFolder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,

        message: "Folder not found",
      });
    }

    const images = await GalleryImage.find({
      folderId: folder._id,
    });

    // Delete all local image files that still exist on disk
    for (const image of images) {
      deleteLocalFileIfExists(image.imageUrl);
    }

    // Delete DB records

    await GalleryImage.deleteMany({
      folderId: folder._id,
    });

    await folder.deleteOne();

    res.json({
      success: true,

      message: "Folder deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
