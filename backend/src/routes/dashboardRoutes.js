const { Router } = require("express");

const {
  getDashboardStats,
  getLowStockMaterials,
} = require("../controllers/dashboardController");

const router = Router();
const authenticateToken = require("../middleware/authMiddleware");

router.get("/stats", authenticateToken, getDashboardStats);

router.get("/low-stock", authenticateToken, getLowStockMaterials);

module.exports = router;
