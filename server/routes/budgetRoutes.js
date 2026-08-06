const express = require("express");

const router = express.Router();

const budgetController = require("../controllers/budgetController");

// ======================================
// Budget Routes
// ======================================

// Get Budget
router.get(
    "/",
    budgetController.getBudget
);

// Save / Update Budget
router.post(
    "/",
    budgetController.saveBudget
);

module.exports = router;