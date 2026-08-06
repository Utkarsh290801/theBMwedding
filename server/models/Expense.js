const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true
        },

        vendor: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        amount: {
            type: Number,
            required: true
        },

        paymentMethod: {
            type: String,
            default: "Cash"
        },

        status: {
            type: String,
            enum: ["Paid", "Pending"],
            default: "Paid"
        },

        date: {
            type: Date,
            default: Date.now
        },

        receiptUrl: {
            type: String,
            default: ""
        },

        receiptPublicId: {
            type: String,
            default: ""
        },

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Expense",
    expenseSchema
);