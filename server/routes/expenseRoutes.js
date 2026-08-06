const express = require("express");

const router = express.Router();

const expenseController = require("../controllers/expenseController");

const upload = require("../middleware/uploadExpense");

// ======================================
// Expense Routes
// ======================================

// Get All Expenses
router.get("/", expenseController.getExpenses);

// Add Expense
router.post("/", upload.single("receipt"), expenseController.addExpense);

// Update Expense
router.put("/:id", upload.single("receipt"), expenseController.updateExpense);

// Delete Expense
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
