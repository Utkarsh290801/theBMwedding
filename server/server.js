require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

connectDB();

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from GitHub Pages and any other browser origin.
        callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
const noteRoutes = require("./routes/noteRoutes");
app.use(["/api/notes", "/notes"], noteRoutes);
app.get("/", (req, res) => {
    res.send("BM Wedding API Running");
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;