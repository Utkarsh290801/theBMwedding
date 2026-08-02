const GalleryFolder = require("../models/GalleryFolder");
const GalleryImage = require("../models/GalleryImage");

const fs = require("fs");
const path = require("path");

function getFullUrl(req, urlPath) {
    if (!urlPath) return urlPath;
    if (/^https?:\/\//i.test(urlPath)) return urlPath;
    const host = req.protocol + "://" + req.get("host");
    return host + urlPath;
}
// ======================================
// Create Folder
// ======================================

exports.createFolder = async (req, res) => {

    try {

        const folder = await GalleryFolder.create({

            name: req.body.name

        });

        res.status(201).json({

            success: true,

            data: folder

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

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

                createdAt: -1

            });

        const responseFolders = folders.map(f => ({
            ...f.toObject(),
            coverImage: getFullUrl(req, f.coverImage)
        }));

        res.json({

            success: true,

            data: responseFolders

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================
// Upload Images
// ======================================

exports.uploadImages = async (req, res) => {

    try {

        const folderId = req.body.folderId;

        const files = req.files;

        const savedImages = [];

        for (const file of files) {

            const image = await GalleryImage.create({

                folderId,

                fileName: file.originalname,

                imageUrl: `/uploads/gallery/${file.filename}`,

                size: file.size

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
        const responseImages = savedImages.map(img => ({
            ...img.toObject(),
            imageUrl: getFullUrl(req, img.imageUrl)
        }));

        res.json({

            success: true,

            data: responseImages

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

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

                createdAt: -1

            });

        const responseImages = images.map(img => ({
            ...img.toObject(),
            imageUrl: getFullUrl(req, img.imageUrl)
        }));

        res.json({

            success: true,

            data: responseImages

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

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

                message: "Image not found"

            });

        }

        image.shortlisted = !image.shortlisted;

        await image.save();

        res.json({

            success: true,

            data: image

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

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

                message: "Image not found"

            });

        }

        // Delete physical file

        const filePath = path.join(

            __dirname,

            "..",

            image.imageUrl

        );

        if (fs.existsSync(filePath)) {

            fs.unlinkSync(filePath);

        }

        const folderId = image.folderId;

        await image.deleteOne();

        // Update folder cover

        const folder = await GalleryFolder.findById(folderId);

        if (folder) {

            const firstImage = await GalleryImage.findOne({

                folderId

            }).sort({

                createdAt: 1

            });

            folder.coverImage = firstImage

                ? firstImage.imageUrl

                : "";

            await folder.save();

        }

        res.json({

            success: true,

            message: "Image deleted"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

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

                message: "Folder not found"

            });

        }

        const images = await GalleryImage.find({

            folderId: folder._id

        });

        // Delete all image files

        for (const image of images) {

            const filePath = path.join(

                __dirname,

                "..",

                image.imageUrl

            );

            if (fs.existsSync(filePath)) {

                fs.unlinkSync(filePath);

            }

        }

        // Delete DB records

        await GalleryImage.deleteMany({

            folderId: folder._id

        });

        await folder.deleteOne();

        res.json({

            success: true,

            message: "Folder deleted"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
