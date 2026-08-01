require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());

app.use(express.json());
const noteRoutes = require("./routes/noteRoutes");
app.use("/api/notes", noteRoutes);
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