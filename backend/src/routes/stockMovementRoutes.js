const { Router } = require("express");

const {
  stockIn,
  getStockMovements,
} = require("../controllers/stockMovementController");

const router = Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

router.post("/stock-in", authenticateToken, authorizeRole("admin"), stockIn);
router.get("/", authenticateToken, getStockMovements);

module.exports = router;
