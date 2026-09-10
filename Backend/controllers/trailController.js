const User = require("../models/user.js");
const Vibe = require("../models/vibe.js");


const getHostedVibes = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;

    const currentUser = await User.findById(userId).populate({
      path: "hostedVibes",
      select: "title description locationName geometry startDate endDate image status participants",
      populate: {
        path: "participants",
        select: "name username avatarUrl",
      },
      options: { sort: { startDate: -1 } }, // Sort hosted vibes newest first
    });

    if (!currentUser) {
      return res.status(404).json({ errors: [{ msg: "User not found." }] });
    }

    return res.status(200).json({
      success: true,
      count: currentUser.hostedVibes.length,
      hostedVibes: currentUser.hostedVibes,
    });
  } catch (err) {
    console.error("Error fetching hosted vibes:", err);
    return res
      .status(500)
      .json({ errors: [{ msg: "Could not fetch your hosted vibes." }] });
  }
};


const getJoinedVibes = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;

    const currentUser = await User.findById(userId).populate({
      path: "joinedVibes",
      select: "title description locationName geometry startDate endDate image status creator",
      populate: {
        path: "creator",
        select: "name username avatarUrl",
      },
      options: { sort: { startDate: -1 } }, // Sort joined vibes newest first
    });

    if (!currentUser) {
      return res.status(404).json({ errors: [{ msg: "User not found." }] });
    }

    return res.status(200).json({
      success: true,
      count: currentUser.joinedVibes.length,
      joinedVibes: currentUser.joinedVibes,
    });
  } catch (err) {
    console.error("Error fetching joined vibes:", err);
    return res
      .status(500)
      .json({ errors: [{ msg: "Could not fetch your joined vibes." }] });
  }
};


const getTrailSummary = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;

    const currentUser = await User.findById(userId)
      .populate({
        path: "hostedVibes",
        select: "title locationName startDate image status",
      })
      .populate({
        path: "joinedVibes",
        select: "title locationName startDate image status",
      });

    if (!currentUser) {
      return res.status(404).json({ errors: [{ msg: "User not found." }] });
    }

    return res.status(200).json({
      success: true,
      data: {
        hostedCount: currentUser.hostedVibes.length,
        joinedCount: currentUser.joinedVibes.length,
        hostedVibes: currentUser.hostedVibes,
        joinedVibes: currentUser.joinedVibes,
      },
    });
  } catch (err) {
    console.error("Error fetching trail summary:", err);
    return res
      .status(500)
      .json({ errors: [{ msg: "Could not fetch trail summary." }] });
  }
};


module.exports = {
  getHostedVibes,
  getJoinedVibes,
  getTrailSummary,
};