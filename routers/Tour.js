const express = require("express");
const auth = require("../middleware/auth");
const { uploadMultipleImages } = require("../middleware/multer");
const { uploadMultipleImages: uploadToCloudinary } = require("../utils/uploadMultipleFiles");
const {
    createTour,
    getTours,
    getTourById,
    updateTour,
    deleteTour,
} = require("../controllers/Tour");

const router = express.Router();

// Multiple image upload
router.post("/", auth, uploadMultipleImages, uploadToCloudinary, createTour);
router.get("/", getTours);
router.get("/:id", getTourById);
router.put("/:id", auth, uploadMultipleImages, uploadToCloudinary, updateTour);
router.delete("/:id", auth, deleteTour);

module.exports = router;
