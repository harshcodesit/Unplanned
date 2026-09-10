const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/jwt");
const {
  getHostedVibes,
  getJoinedVibes,
  getTrailSummary,
} = require("../controllers/trailController");


router.get("/hosted", verifyToken, getHostedVibes);
router.get("/joined", verifyToken, getJoinedVibes);
router.get("/summary", verifyToken, getTrailSummary);

module.exports = router;