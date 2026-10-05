const express = require("express");
const { verifyToken, optionalVerifyToken } = require("../middlewares/jwt");
const { handleOptionalVibeImages } = require("../middlewares/uploads");
const {
  getAllVibes,
  createVibe,
  getVibeById,
  updateVibe,
  deleteVibe,
} = require("../controllers/vibeContoller");

const router = express.Router();

router.get("/", optionalVerifyToken, getAllVibes);
router.get("/:id", optionalVerifyToken, getVibeById);
router.post("/", verifyToken, handleOptionalVibeImages, createVibe);
router.put("/:id", verifyToken, handleOptionalVibeImages, updateVibe);
router.delete("/:id", verifyToken, deleteVibe);

module.exports = router;
