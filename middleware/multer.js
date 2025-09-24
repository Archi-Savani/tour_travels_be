const multer = require("multer");

// Store files in memory
const storage = multer.memoryStorage();

// Only accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ✅ Middlewares
module.exports = {
    uploadSingleImage: upload.single("image"), // For State model
    uploadMultipleImages: upload.array("images", 10), // For Tour model
    uploadTourFiles: upload.any(), // Accept any fields including gallery[0][image], gallery[1][image]...
    // Accept both 'image' and 'taxiImage' field names for TaxiTour
    uploadTaxiImage: upload.fields([
        { name: "image", maxCount: 1 },
        { name: "taxiImage", maxCount: 1 },
    ]),
};
