// Express create cheyyunnu
const express = require("express");
const app = express();
const materialRoutes = require("./routes/materialRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");


// Middleware
app.use(express.json());
app.use("/materials", materialRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
