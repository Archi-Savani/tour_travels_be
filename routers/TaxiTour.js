const express = require("express");
const router = express.Router();

const { uploadTaxiImage } = require("../middleware/multer");
const {
    createTaxiTour,
    getTaxiTours,
    getTaxiTourById,
    updateTaxiTour,
    deleteTaxiTour,
} = require("../controllers/TaxiTour");

const auth  = require("../middleware/auth"); // 🔒 Auth middleware

// ================= Routes =================

// Create Taxi Tour (Protected, with image upload)
router.post("/", auth, uploadTaxiImage, createTaxiTour);

// Get all Taxi Tours (Public)
router.get("/", getTaxiTours);

// Get Taxi Tour by ID (Public)
router.get("/:id", getTaxiTourById);

// Update Taxi Tour (Protected, with optional image update)
router.put("/:id", auth, uploadTaxiImage, updateTaxiTour);

// Delete Taxi Tour (Protected)
router.delete("/:id", auth, deleteTaxiTour);

module.exports = router;
