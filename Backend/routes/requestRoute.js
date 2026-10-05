const express = require("express");
const { verifyToken } = require("../middlewares/jwt");
const {
  sendJoinRequest,
  getVibeRequests,
  acceptJoinRequest,
  rejectJoinRequest,
} = require("../controllers/requestController");

const router = express.Router({ mergeParams: true });

router.post("/", verifyToken, sendJoinRequest);
router.get("/", verifyToken, getVibeRequests);
router.patch("/:requestId/accept", verifyToken, acceptJoinRequest);
router.patch("/:requestId/reject", verifyToken, rejectJoinRequest);

module.exports = router;
