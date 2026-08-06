// Express create cheyyunnu
const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
 res.status(200).json({
   success: true,
   message: "Maintenance Management API Running 🚀",
 });
});

// Export app
module.exports = app;
