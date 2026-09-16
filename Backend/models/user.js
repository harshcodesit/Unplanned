const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {

      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9_]{3,20}$/,
        "Username can only contain letters, numbers, and underscores, and be 3-20 characters long.",
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: "https://res.cloudinary.com/dzz15h9wq/image/upload/v1789508270/avatar-3814049_1280.webp",
    },
    hostedVibes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vibe",
      },
    ],
    joinedVibes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vibe",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

UserSchema.virtual("avatar").get(function () {
  return this.avatarUrl;
});

module.exports = mongoose.model("User", UserSchema);
