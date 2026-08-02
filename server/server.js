require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());

app.use(express.json());
const uploadStaticPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadStaticPath));
const noteRoutes = require("./routes/noteRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
app.use(["/api/notes", "/notes"], noteRoutes);
app.use(["/api/gallery", "/gallery"], galleryRoutes);
app.get("/", (req, res) => {
    res.send("MB Wedding API Running");
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;