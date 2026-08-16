const { Router } = require("express");

const { registerUser, loginUser } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

module.exports = router;
