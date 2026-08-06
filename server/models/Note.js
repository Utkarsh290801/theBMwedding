const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Other",
    },
    venueAvailability: {
      type: String,
      enum: ["Available", "Not Available"],
    },
    guestCount: {
      type: Number,
      min: 1,
    },
    eventTypes: {
      type: [String],
      default: [],
    },
    shortlisted: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Note", noteSchema);
