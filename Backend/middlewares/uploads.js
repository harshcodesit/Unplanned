
const { uploadAvatar, uploadvibeImages } = require("../config/multer.js");


const handleOptionalAvatar = (req, res, next) => {
  if (req.is("json")) return next();
  uploadAvatar(req, res, next);
};

const handleOptionalVibeImages = (req, res, next) => {
  if (req.is("json")) return next();
  uploadvibeImages(req, res, next);
};

module.exports = {
  handleOptionalAvatar,
  handleOptionalVibeImages,
};