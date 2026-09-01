// Express create cheyyunnu
const express = require("express");
const cors = require("cors");
const app = express();
const materialRoutes = require("./routes/materialRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.options(/.*/, cors());
app.use(express.json());
app.use("/materials", materialRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);

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
