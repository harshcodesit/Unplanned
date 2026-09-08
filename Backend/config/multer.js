
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
        folder: 'unplanned/avatars', // Folder name in Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }] // Auto-crop/resize avatars
    }
});

// Define Cloudinary storage for vibe images
const vibeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'unplanned/vibes', // Folder name in Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],  
    }
});


const imageFilter = (req, file, cb) => {
    // Accept images only (jpg, jpeg, png, gif, webp)
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        req.fileValidationError = 'Only image files (jpg, jpeg, png, gif, webp) are allowed!';
        return cb(new Error(req.fileValidationError), false);
    }
    cb(null, true);
};


const uploadAvatar = multer({
    storage: avatarStorage, // Use Cloudinary storage for avatars
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit for avatars
}).single('avatar'); // Expects a single file input named 'avatar' from the form

const uploadvibeImages = multer({
    storage: vibeStorage, // Use Cloudinary storage for vibes
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit per single vibe image
}).array('image', 5); // Expects an array of files named 'image' (singular field name), allows max 5 files.

module.exports = { uploadAvatar, uploadvibeImages };