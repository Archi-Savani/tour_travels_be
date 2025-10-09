const express = require("express");
const router = express.Router();
const {
    upload,
    createCab,
    getAllCabs,
    getCabById,
    updateCab,
    deleteCab,
} = require("../controllers/TaxiTour");

// Create Cab (multipart/form-data)
router.post("/", upload.single("image"), createCab);

// Get all Cabs
router.get("/", getAllCabs);

// Get single Cab
router.get("/:id", getCabById);

// Update Cab
router.put("/:id", upload.single("image"), updateCab);

// Delete Cab
router.delete("/:id", deleteCab);

module.exports = router;
