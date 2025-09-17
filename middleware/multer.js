const multer = require("multer");

// Store files in memory
const storage = multer.memoryStorage();

// Only accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
};

// Base multer config
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Export two middlewares
module.exports = {
    uploadSingleImage: upload.single("image"),    // For State
    uploadMultipleImages: upload.array("images", 10), // For Tour
};
