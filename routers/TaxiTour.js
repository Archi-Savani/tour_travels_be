// routes/taxiRoutes.js
const express = require("express");
const router = express.Router();

const { createTaxi, getTaxis, getTaxiById, updateTaxi, deleteTaxi } = require("../controllers/TaxiTour");
const { uploadTaxiImage } = require("../middleware/multer");

// Create taxi service
router.post("/", uploadTaxiImage, createTaxi);

// List all taxi services
router.get("/", getTaxis);

// Get taxi service by id
router.get("/:id", getTaxiById);

// Update taxi service
router.put("/:id", uploadTaxiImage, updateTaxi);

// Delete taxi service
router.delete("/:id", deleteTaxi);

module.exports = router;


