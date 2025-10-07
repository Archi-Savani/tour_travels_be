// routes/tourRoutes.js
const express = require("express");
const router = express.Router();
const {
    createTour,
    getTours,
    getTourById,
    updateTour,
    deleteTour,
    getTourHighlights,
} = require("../controllers/Tour");

const { uploadTourFiles } = require("../middleware/multer");

// -------------------- TOUR ROUTES --------------------

// Create a new tour
router.post("/", uploadTourFiles, createTour);

// Get all tours
router.get("/", getTours);

// Get upcoming and popular tours
router.get("/highlights", getTourHighlights);

// Get a single tour by ID
router.get("/:id", getTourById);

// Update a tour
router.put("/:id", uploadTourFiles, updateTour);

// Delete a tour
router.delete("/:id", deleteTour);


module.exports = router;
