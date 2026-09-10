const express = require("express");
const verifyToken = require("../middlewares/jwt.js");
const multer = require("multer");
const uploadNone = multer().none();
const { handleOptionalAvatar } = require("../middlewares/uploads.js");

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
router.post("/login", uploadNone, loginUser);
router.post("/register", handleOptionalAvatar, registerUser);
router.post("/logout", logoutUser);
router.put("/update-profile", verifyToken, handleOptionalAvatar, updateProfile);
router.put("/change-password", verifyToken, uploadNone, changePassword);

module.exports = router;
