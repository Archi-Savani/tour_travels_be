// routes/inquiryRoutes.js
const express = require("express");
const router = express.Router();
const {
    createInquiry,
    getInquiries,
    getInquiryById,
    updateInquiry,
    deleteInquiry,
} = require("../controllers/Inquiry");

// Import your auth middleware
const auth  = require("../middleware/auth");

// Routes

// Create a new inquiry (protected)
router.post("/", createInquiry);

// Get all inquiries (protected)
router.get("/", getInquiries);

// Get single inquiry by ID (protected)
router.get("/:id", getInquiryById);

// Update an inquiry by ID (protected)
router.put("/:id", updateInquiry);

// Delete an inquiry by ID (protected)
router.delete("/:id", deleteInquiry);

module.exports = router;
