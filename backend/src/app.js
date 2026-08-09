// Express create cheyyunnu
const express = require("express");
const app = express();
const materialRoutes = require("./routes/materialRoutes");
const transactionRoutes = require("./routes/transactionRoutes");



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
app.use("/api/transactions", transactionRoutes);

// Export app
module.exports = app;
