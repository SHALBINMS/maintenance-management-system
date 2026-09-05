const { Router } = require("express");
const { getMaterials } = require("../controllers/materialController");
const { createMaterial } = require("../controllers/materialController");
const { updateMaterial } = require("../controllers/materialController");
const { deleteMaterial } = require("../controllers/materialController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const router = Router();

router.get("/", authenticateToken, getMaterials);
router.post("/", authenticateToken, authorizeRole("admin"), createMaterial);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateMaterial);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteMaterial,
);

module.exports = router;
