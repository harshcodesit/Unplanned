const express = require("express");
const verifyToken = require("../middlewares/jwt.js");
const { uploadAvatar } = require("../config/multer.js");

const {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  changePassword,
  getAuraProfile,
} = require("../controllers/userController");

const router = express.Router();
router.get("/profile", verifyToken, getAuraProfile);
router.post("/login", loginUser);
router.post("/register", uploadAvatar, registerUser);
router.post("/logout", logoutUser);
router.put("/update-profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;
