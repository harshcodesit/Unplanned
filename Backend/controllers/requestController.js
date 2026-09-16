const Vibe = require("../models/vibe.js");
const Request = require("../models/request.js");
const User = require("../models/user.js");

const sendJoinRequest = async (req, res) => {
  try {
    const { vibeId } = req.params;
    const requesterId = req.user?.userId || req.user?._id;

    const vibe = await Vibe.findById(vibeId);
    if (!vibe) {
      return res.status(404).json({ errors: [{ msg: "Vibe not found." }] });
    }

    if (vibe.endDate && new Date(vibe.endDate) < new Date()) {
      if (vibe.status === "Open") {
        vibe.status = "Closed";
        await vibe.save();
      }
      return res.status(400).json({
        errors: [{ msg: "This microadventure has concluded and is closed to new join requests." }],
      });
    }

    if (vibe.status !== "Open") {
      return res.status(400).json({
        errors: [{ msg: `Cannot join a vibe that is ${vibe.status.toLowerCase()}.` }],
      });
    }

    if (vibe.creator.equals(requesterId)) {
      return res.status(400).json({
        errors: [{ msg: "You cannot send a join request to your own Vibe." }],
      });
    }

    const existingRequest = await Request.findOne({
      vibe: vibeId,
      requester: requesterId,
    });

    if (existingRequest) {
      return res.status(400).json({
        errors: [
          {
            msg: `You already have a '${existingRequest.status}' request for this Vibe.`,
            status: existingRequest.status,
          },
        ],
      });
    }

    const newRequest = new Request({
      vibe: vibeId,
      requester: requesterId,
      status: "pending",
    });

    await newRequest.save();

    return res.status(201).json({
      success: true,
      message: "Join request sent successfully!",
      request: newRequest,
    });
  } catch (err) {
    console.error("Error sending join request:", err);


    if (err.code === 11000) {
      return res.status(400).json({
        errors: [{ msg: "You have already sent a request to join this Vibe." }],
      });
    }

    return res
      .status(500)
      .json({ errors: [{ msg: "Failed to send join request." }] });
  }
};


const getVibeRequests = async (req, res) => {
  try {
    const { vibeId } = req.params;
    const currentUserId = req.user?.userId || req.user?._id;

    const vibe = await Vibe.findById(vibeId);
    if (!vibe) {
      return res.status(404).json({ errors: [{ msg: "Vibe not found." }] });
    }

   
    if (!vibe.creator.equals(currentUserId)) {
      return res.status(403).json({
        errors: [{ msg: "Not authorized to view requests for this Vibe." }],
      });
    }

    
    const requests = await Request.find({ vibe: vibeId })
      .populate("requester", "username name avatarUrl email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    console.error("Error fetching vibe requests:", err);
    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid Vibe ID format." }] });
    }
    return res
      .status(500)
      .json({ errors: [{ msg: "Could not fetch requests." }] });
  }
};



const acceptJoinRequest = async (req, res) => {
  try {
    const { vibeId, requestId } = req.params;
    const currentUserId = req.user?.userId || req.user?._id;

    const vibe = await Vibe.findById(vibeId);
    const request = await Request.findById(requestId);

    if (!vibe || !request) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Vibe or Request not found." }] });
    }

   
    if (!vibe.creator.equals(currentUserId) || !request.vibe.equals(vibeId)) {
      return res
        .status(403)
        .json({ errors: [{ msg: "Not authorized to accept this request." }] });
    }

    
    if (request.status !== "pending") {
      return res.status(400).json({
        errors: [{ msg: `This request is already '${request.status}'.` }],
      });
    }

    if (vibe.status !== "Open") {
      return res.status(400).json({
        errors: [{ msg: `Cannot accept requests for a vibe that is ${vibe.status.toLowerCase()}.` }],
      });
    }

    
    request.status = "accepted";
    await request.save();

    const updatedVibe = await Vibe.findByIdAndUpdate(
      vibeId,
      {
        $addToSet: { participants: request.requester },
      },
      { new: true }
    )
      .populate("creator", "username name avatarUrl")
      .populate("participants", "username name avatarUrl");

    await User.findByIdAndUpdate(request.requester, {
      $addToSet: { joinedVibes: vibeId },
    });

    const exactCoordinates = {
      latitude: updatedVibe.geometry.coordinates[1],
      longitude: updatedVibe.geometry.coordinates[0],
    };

    return res.status(200).json({
      success: true,
      message: "Request accepted successfully!",
      request,
      vibe: updatedVibe,
      displayLocation: exactCoordinates,
      exactLocation: {
        ...exactCoordinates,
        locationName: updatedVibe.locationName,
      },
      showActualLocation: true,
    });
  } catch (err) {
    console.error("Error accepting join request:", err);
    return res
      .status(500)
      .json({ errors: [{ msg: "Failed to accept request." }] });
  }
};


const rejectJoinRequest = async (req, res) => {
  try {
    const { vibeId, requestId } = req.params;
    const currentUserId = req.user?.userId || req.user?._id;

    const vibe = await Vibe.findById(vibeId);
    const request = await Request.findById(requestId);

    if (!vibe || !request) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Vibe or Request not found." }] });
    }

   
    if (!vibe.creator.equals(currentUserId) || !request.vibe.equals(vibeId)) {
      return res
        .status(403)
        .json({ errors: [{ msg: "Not authorized to reject this request." }] });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        errors: [{ msg: `This request is already '${request.status}'.` }],
      });
    }


    request.status = "rejected";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request rejected successfully.",
      request,
    });
  } catch (err) {
    console.error("Error rejecting join request:", err);
    return res
      .status(500)
      .json({ errors: [{ msg: "Failed to reject request." }] });
  }
};




module.exports = {
  sendJoinRequest,
  getVibeRequests,
  acceptJoinRequest,
  rejectJoinRequest
};