const { Router } = require("express");
const { getMaterials } = require("../controllers/materialController");

const router = Router();

router.get("/", getMaterials);
module.exports = router;
