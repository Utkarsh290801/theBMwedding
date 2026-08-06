const Expense = require("../models/Expense");

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBufferToCloudinary(buffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "bm_wedding/expenses",
        resource_type: "auto",
        public_id: `${Date.now()}-${fileName.replace(/\.[^.]+$/, "")}`,
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
// Get Expenses
// ======================================

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()

      .sort({
        date: -1,
      });

    res.json({
      success: true,

      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================
// Add Expense
// ======================================

exports.addExpense = async (req, res) => {
  try {
    const expenseData = {
      category: req.body.category,

      vendor: req.body.vendor,

      description: req.body.description || "",

      amount: Number(req.body.amount),

      paymentMethod: req.body.paymentMethod || "Cash",

      status: req.body.status || "Paid",

      date: req.body.date || new Date().toISOString(),

      notes: req.body.notes || "",
    };

    if (req.file && req.file.buffer) {
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.originalname,
      );
      expenseData.receiptUrl = uploadResult.secure_url;
      expenseData.receiptPublicId = uploadResult.public_id;
    }

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,

      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
// ======================================
// Update Expense
// ======================================

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,

        message: "Expense not found",
      });
    }

    expense.category = req.body.category;
    expense.vendor = req.body.vendor;
    expense.description = req.body.description || "";
    expense.amount = Number(req.body.amount);
    expense.paymentMethod = req.body.paymentMethod || "Cash";
    expense.status = req.body.status || "Paid";
    expense.date = req.body.date || expense.date;
    expense.notes = req.body.notes || "";

    // Replace Receipt

    if (req.file && req.file.buffer) {
      if (expense.receiptPublicId) {
        await cloudinary.uploader.destroy(expense.receiptPublicId, {
          resource_type: "auto",
        });
      }

      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.originalname,
      );
      expense.receiptUrl = uploadResult.secure_url;
      expense.receiptPublicId = uploadResult.public_id;
    }

    await expense.save();

    res.json({
      success: true,

      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
// ======================================
// Delete Expense
// ======================================

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,

        message: "Expense not found",
      });
    }

    // Delete receipt from Cloudinary

    if (expense.receiptPublicId) {
      await cloudinary.uploader.destroy(
        expense.receiptPublicId,

        {
          resource_type: "auto",
        },
      );
    }

    await expense.deleteOne();

    res.json({
      success: true,

      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
