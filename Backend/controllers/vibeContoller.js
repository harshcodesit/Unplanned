const Vibe = require("../models/vibe.js");
const User = require("../models/user.js");
const Request = require("../models/request.js");

function getBlurredCoordinates(longitude, latitude, radiusKm = 1) {
  const R = 6371;
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;

  const randomAngle = Math.random() * 2 * Math.PI;
  const randomDistance = Math.random() * radiusKm;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(randomDistance / R) +
      Math.cos(latRad) * Math.sin(randomDistance / R) * Math.cos(randomAngle),
  );

  const newLonRad =
    lonRad +
    Math.atan2(
      Math.sin(randomAngle) * Math.sin(randomDistance / R) * Math.cos(latRad),
      Math.cos(randomDistance / R) - Math.sin(latRad) * Math.sin(newLatRad),
    );

  return {
    latitude: (newLatRad * 180) / Math.PI,
    longitude: (newLonRad * 180) / Math.PI,
  };
}

const getAllVibes = async (req, res) => {
  try {
    const { lng, lat, dist } = req.query;
    let query = {};

    if (lng && lat) {
      const radiusInMeters = dist ? parseFloat(dist) * 1000 : 10000;
      query.geometry = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

    const vibes = await Vibe.find(query)
      .populate("creator", "username name avatarUrl")
      .populate("participants", "username name avatarUrl")
      .sort({ createdAt: -1 });

    const now = new Date();
    const vibesForDisplay = vibes.map((vibe) => {

      if (vibe.endDate && new Date(vibe.endDate) < now && vibe.status === "Open") {
        vibe.status = "Closed";
        vibe.save().catch((e) => console.error("Auto-close error in getAllVibes:", e));
      }

      const currentUserId = req.user?.userId || req.user?._id;
      let displayLocation = {
        latitude: vibe.geometry.coordinates[1],
        longitude: vibe.geometry.coordinates[0],
      };

      if (
        !currentUserId ||
        (vibe.creator && !vibe.creator._id.equals(currentUserId))
      ) {
        displayLocation = getBlurredCoordinates(
          vibe.geometry.coordinates[0],
          vibe.geometry.coordinates[1],
        );
      }

      return {
        ...vibe.toObject(),
        displayLatitude: displayLocation.latitude,
        displayLongitude: displayLocation.longitude,
      };
    });

    return res
      .status(200)
      .json({
        success: true,
        count: vibesForDisplay.length,
        vibes: vibesForDisplay,
      });
  } catch (err) {
    console.error("Error fetching vibes:", err);
    return res
      .status(500)
      .json({ errors: [{ msg: "Could not fetch vibes." }] });
  }
};

const createVibe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const {
      title,
      description,
      locationName,
      latitude,
      longitude,
      startDate,
      endDate,
    } = req.body;


    let errors = [];
    if (!title || !description || !latitude || !longitude || !startDate) {
      errors.push({ msg: "Please fill in all required fields." });
    }
    if (title && title.length < 3) {
      errors.push({ msg: "Title must be at least 3 characters long." });
    }
    if (description && description.length < 10) {
      errors.push({ msg: "Description must be at least 10 characters long." });
    }

    const start = new Date(startDate);
    if (start.getTime() < Date.now() - 10 * 60 * 1000) {
      errors.push({ msg: "Start date cannot be in the past." });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    let imageArray = [];
    if (req.files && req.files.length > 0) {
      imageArray = req.files.slice(0, 5).map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
    }

    const newVibe = new Vibe({
      title,
      description,
      locationName,
      geometry: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      startDate: start,
      endDate: endDate ? new Date(endDate) : undefined,
      creator: userId,
      image: imageArray,
      status: "Open",
    });

    await newVibe.save();

    await User.findByIdAndUpdate(userId, {
      $push: { hostedVibes: newVibe._id },
    });

    return res.status(201).json({
      success: true,
      message: "Vibe created successfully!",
      vibe: newVibe,
    });
  } catch (err) {
    console.error("Error creating vibe:", err);
    return res
      .status(500)
      .json({ errors: [{ msg: "Failed to create vibe." }] });
  }
};



const getVibeById = async (req, res) => {
  try {
    const currentUserId = req.user?.userId || req.user?._id;

    const vibe = await Vibe.findById(req.params.id)
      .populate("creator", "username name avatarUrl")
      .populate("participants", "username name avatarUrl");

    if (!vibe) {
      return res.status(404).json({ errors: [{ msg: "Vibe not found." }] });
    }


    if (vibe.endDate && new Date(vibe.endDate) < new Date() && vibe.status === "Open") {
      vibe.status = "Closed";
      await vibe.save();
    }

    let showActualLocation = false;
    let userRequest = null;

    if (currentUserId) {

      const isCreator = Boolean(
        vibe.creator &&
          (vibe.creator._id.equals(currentUserId) ||
            vibe.creator._id.toString() === currentUserId.toString())
      );


      const isParticipant = Boolean(
        vibe.participants &&
          vibe.participants.some((p) => {
            const pId = p._id ? p._id.toString() : p.toString();
            return pId === currentUserId.toString();
          })
      );


      userRequest = await Request.findOne({
        vibe: vibe._id,
        requester: currentUserId,
      }).select("status requestedAt");

      const hasAcceptedRequest = Boolean(userRequest && userRequest.status === "accepted");

      if (isCreator || isParticipant || hasAcceptedRequest) {
        showActualLocation = true;
      }
    }

    let displayLocation = {
      latitude: vibe.geometry.coordinates[1],
      longitude: vibe.geometry.coordinates[0],
    };

    if (!showActualLocation) {
      displayLocation = getBlurredCoordinates(
        vibe.geometry.coordinates[0],
        vibe.geometry.coordinates[1],
      );
    }

    return res.status(200).json({
      success: true,
      vibe,
      displayLocation,
      showActualLocation,
      exactLocation: showActualLocation
        ? {
            latitude: vibe.geometry.coordinates[1],
            longitude: vibe.geometry.coordinates[0],
            locationName: vibe.locationName,
          }
        : null,
      userRequest: userRequest
        ? {
            status: userRequest.status,
            requestedAt: userRequest.requestedAt,
          }
        : null,
    });
  } catch (err) {
    console.error("Error fetching single vibe:", err);
    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid Vibe ID format." }] });
    }
    return res
      .status(500)
      .json({ errors: [{ msg: "Could not fetch vibe details." }] });
  }
};


const updateVibe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const { id } = req.params;
    const { title, description, locationName, latitude, longitude, startDate, status } = req.body;

    let vibe = await Vibe.findById(id);

    if (!vibe) {
      return res.status(404).json({ errors: [{ msg: "Vibe not found." }] });
    }


    if (!vibe.creator.equals(userId)) {
      return res.status(403).json({ errors: [{ msg: "Not authorized to update this vibe." }] });
    }

    if (title) vibe.title = title;
    if (description) vibe.description = description;
    if (locationName) vibe.locationName = locationName;
    if (status) {
      vibe.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
    if (startDate) vibe.startDate = new Date(startDate);

    if (latitude && longitude) {
      vibe.geometry = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => ({ url: f.path, filename: f.filename }));
      vibe.image = [...vibe.image, ...newImages].slice(0, 5);
    }

    await vibe.save();

    return res.status(200).json({
      success: true,
      message: "Vibe updated successfully!",
      vibe,
    });
  } catch (err) {
    console.error("Error updating vibe:", err);
    return res.status(500).json({ errors: [{ msg: "Failed to update vibe." }] });
  }
};


const deleteVibe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const { id } = req.params;

    const vibe = await Vibe.findById(id);

    if (!vibe) {
      return res.status(404).json({ errors: [{ msg: "Vibe not found." }] });
    }

    if (!vibe.creator.equals(userId)) {
      return res.status(403).json({ errors: [{ msg: "Not authorized to delete this vibe." }] });
    }

    
    await User.findByIdAndUpdate(userId, { $pull: { hostedVibes: id } });
    await User.updateMany({ joinedVibes: id }, { $pull: { joinedVibes: id } });
    await Request.deleteMany({ vibe: id });

    await Vibe.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Vibe and related references deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting vibe:", err);
    return res.status(500).json({ errors: [{ msg: "Could not delete vibe." }] });
  }
};


module.exports = {
  getAllVibes,
  createVibe,
  getVibeById,
  updateVibe,
  deleteVibe
};