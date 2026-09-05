const { Router } = require("express");

const {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const router = Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

router.get("/", authenticateToken, getEmployees);

router.post("/", authenticateToken, authorizeRole("admin"), createEmployee);

router.put("/:id", authenticateToken, authorizeRole("admin"), updateEmployee);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteEmployee,
);

module.exports = router;
