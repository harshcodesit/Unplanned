
const multer = require('multer');
const cloudinary = require('cloudinary').v2; 
const { CloudinaryStorage } = require('multer-storage-cloudinary'); 



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'unplanned/avatars',
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
    }
});


const vibeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'unplanned/vibes',
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],  
    }
});


const imageFilter = (req, file, cb) => {

    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        req.fileValidationError = 'Only image files (jpg, jpeg, png, gif, webp) are allowed!';
        return cb(new Error(req.fileValidationError), false);
    }
    cb(null, true);
};


const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('avatar');

const uploadvibeImages = multer({
    storage: vibeStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
}).array('image', 5);

module.exports = { uploadAvatar, uploadvibeImages };