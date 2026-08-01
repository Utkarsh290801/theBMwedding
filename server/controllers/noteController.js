const Note = require("../models/Note");

// ==============================
// GET ALL NOTES
// ==============================

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });

        res.json({
    success: true,
    data: notes
});

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// ==============================
// CREATE NOTE
// ==============================

exports.createNote = async (req, res) => {

    try {

        const note = await Note.create(req.body);

        res.status(201).json({
            success: true,
            data: note
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ==============================
// UPDATE NOTE
// ==============================

exports.updateNote = async (req, res) => {

    try {

        const note = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!note) {

            return res.status(404).json({
                success: false,
                message: "Note not found"
            });

        }

        res.json({
            success: true,
            data: note
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ==============================
// DELETE NOTE
// ==============================

exports.deleteNote = async (req, res) => {

    try {

        const note = await Note.findByIdAndDelete(req.params.id);

        if (!note) {

            return res.status(404).json({
                success: false,
                message: "Note not found"
            });

        }

        res.json({
            success: true,
            message: "Note deleted successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};