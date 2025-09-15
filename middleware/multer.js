const multer = require("multer");

// store files in memory as Buffer (not saved locally)
const storage = multer.memoryStorage();

// file filter (accept only images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

// 10MB max size (same as Cloudinary limit you set)
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
