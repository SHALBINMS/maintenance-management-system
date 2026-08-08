const { Router } = require("express");
const { getMaterials } = require("../controllers/materialController");
const { createMaterial } = require("../controllers/materialController");

const router = Router();

router.get("/", getMaterials);
router.post("/", createMaterial);
module.exports = router;
