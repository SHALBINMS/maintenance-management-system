const { Router } = require("express");
const { getMaterials } = require("../controllers/materialController");
const { createMaterial } = require("../controllers/materialController");
const { updateMaterial } = require("../controllers/materialController");
const { deleteMaterial } = require("../controllers/materialController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const router = Router();

router.get("/", getMaterials);
router.post("/", createMaterial);
router.put("/:id", updateMaterial);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteMaterial,
);

module.exports = router;
