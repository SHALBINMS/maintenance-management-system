const { Router } = require("express");

const {
  createTransaction,
  getTransactions,
} = require("../controllers/transactionController");

const router = Router();
const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, createTransaction);
router.get("/", authenticateToken, getTransactions);

module.exports = router;
