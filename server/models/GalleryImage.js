const mongoose = require("mongoose");

const galleryImageSchema = new mongoose.Schema(
  {
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GalleryFolder",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      default: 0,
    },

    shortlisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("GalleryImage", galleryImageSchema);
