const { Router } = require("express");

const {
  registerUser,
  createAdminUser,
  loginUser,
  changePassword,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const router = Router();

router.post("/register", registerUser);
router.post(
  "/admin/users",
  authenticateToken,
  authorizeRole("admin"),
  createAdminUser,
);
router.post("/login", loginUser);
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});
router.post("/change-password", authenticateToken, changePassword);

module.exports = router;
