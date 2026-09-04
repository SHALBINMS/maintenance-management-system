// Express create cheyyunnu
const express = require("express");
const cors = require("cors");

const app = express();

// Routes
const materialRoutes = require("./routes/materialRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const machinesRoutes = require("./routes/machinesRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");

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

// API Routes
app.use("/api/materials", materialRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/machines", machinesRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/stock-movements", stockMovementRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Maintenance Management API Running 🚀",
  });
});

// Export app
module.exports = app;
