const express = require("express");

const {
  getMachines,
  createMachine,
  updateMachine,
  deleteMachine,
} = require("../controllers/machinesController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const router = express.Router();

// View machines
router.get("/", authenticateToken, getMachines);

// Admin-only actions
router.post("/", authenticateToken, authorizeRole("admin"), createMachine);

router.put("/:id", authenticateToken, authorizeRole("admin"), updateMachine);

router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteMachine);

module.exports = router;
