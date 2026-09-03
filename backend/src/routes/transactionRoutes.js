const { Router } = require("express");

const {
  createTransaction,
  getTransactions,
} = require("../controllers/transactionController");

const router = Router();

router.post("/", createTransaction);
router.get("/", getTransactions);

module.exports = router;
