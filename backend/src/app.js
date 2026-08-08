// Express create cheyyunnu
const express = require("express");
const app = express();
const materialRoutes = require("./routes/materialRoutes");

// Middleware
app.use(express.json());
app.use("/materials", materialRoutes);

// Routes
app.get("/", (req, res) => {
 res.status(200).json({
   success: true,
   message: "Maintenance Management API Running 🚀",
 });
});

app.use("/api/materials", materialRoutes);

// Export app
module.exports = app;
