const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/jwt");
const { handleOptionalAvatar } = require("../middlewares/uploads");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  changePassword,
  deleteUserAccount,
  getAuraProfile,
} = require("../controllers/userController");

const router = express.Router();
const uploadNone = multer().none();

router.get("/profile", verifyToken, getAuraProfile);
router.post("/login", uploadNone, loginUser);
router.post("/register", handleOptionalAvatar, registerUser);
router.post("/logout", logoutUser);
router.put("/update-profile", verifyToken, handleOptionalAvatar, updateProfile);
router.put("/change-password", verifyToken, uploadNone, changePassword);
router.delete("/delete-account", verifyToken, deleteUserAccount);

module.exports = router;
