const { Router } = require("express");

const {
  stockIn,
  getStockMovements,
} = require("../controllers/stockMovementController");

const router = Router();

router.post("/stock-in", stockIn);
router.get("/", getStockMovements);

module.exports = router;
