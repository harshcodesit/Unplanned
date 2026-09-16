const mongoose = require("mongoose");

const VibeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Vibe title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
    },
    description: {
      type: String,
      required: [true, "Vibe description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    image: [
      {
        url: String,
        filename: String,
      },
    ],
    locationName: {
      type: String,
      trim: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["Open", "Full", "Completed", "Cancelled", "Closed", "closed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  },
);

VibeSchema.index({ geometry: "2dsphere" });

module.exports = mongoose.model("Vibe", VibeSchema);
