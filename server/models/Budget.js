const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    totalBudget: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Budget", budgetSchema);
