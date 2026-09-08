
const { uploadAvatar } = require("../config/multer.js");




const handleOptionalUpload = (req, res, next) => {
  if (req.is("json")) {
    return next(); 
  }
  uploadAvatar(req, res, next); 
};

module.exports = { handleOptionalUpload };