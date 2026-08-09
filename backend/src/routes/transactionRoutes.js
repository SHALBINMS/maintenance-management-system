const { Router } = require("express");
const { createTransaction } = require("../controllers/transactionController");

const router = Router();

router.post("/", createTransaction);

module.exports = router;
