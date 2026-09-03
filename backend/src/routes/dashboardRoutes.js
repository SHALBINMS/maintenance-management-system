const { Router } = require("express");

const {
  getDashboardStats,
  getLowStockMaterials,
} = require("../controllers/dashboardController");

const router = Router();

router.get("/stats", getDashboardStats);

router.get("/low-stock", getLowStockMaterials);

module.exports = router;
