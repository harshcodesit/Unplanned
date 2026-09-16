
const express = require("express");
const router = express.Router();
const { verifyToken, optionalVerifyToken } = require("../middlewares/jwt.js");
const { handleOptionalVibeImages } = require("../middlewares/uploads.js");
const {
  getAllVibes,
  createVibe,
  getVibeById,
  updateVibe,
  deleteVibe,
} = require("../controllers/vibeContoller.js");

router.get("/", optionalVerifyToken, getAllVibes);
router.get("/:id", optionalVerifyToken, getVibeById);

router.post("/", verifyToken, handleOptionalVibeImages, createVibe);
router.put("/:id", verifyToken, handleOptionalVibeImages, updateVibe);
router.delete("/:id", verifyToken, deleteVibe);

module.exports = router;
