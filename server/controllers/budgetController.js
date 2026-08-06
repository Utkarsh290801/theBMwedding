const Budget = require("../models/Budget");

// ======================================
// Get Budget
// ======================================

exports.getBudget = async (req, res) => {

    try {

        let budget = await Budget.findOne();

        if (!budget) {

            budget = await Budget.create({

                totalBudget: 0

            });

        }

        res.json({

            success: true,

            totalBudget: budget.totalBudget

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
// Save / Update Budget
// ======================================

exports.saveBudget = async (req, res) => {

    try {

        let budget = await Budget.findOne();

        if (!budget) {

            budget = new Budget();

        }

        budget.totalBudget = req.body.totalBudget;

        await budget.save();

        res.json({

            success: true,

            data: budget

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};