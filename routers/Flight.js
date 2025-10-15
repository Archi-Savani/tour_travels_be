const express = require("express");
const router = express.Router();
const {
    createFlight,
    getAllFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    // searchFlights,
} = require("../controllers/Flight");

// ✅ Create Flight Booking
router.post("/", createFlight);

// ✅ Get All Flights
router.get("/", getAllFlights);

// ✅ Get Flight by ID
router.get("/:id", getFlightById);

// ✅ Update Flight
router.put("/:id", updateFlight);

// ✅ Delete Flight
router.delete("/:id", deleteFlight);

// ✅ Search Flights (Query Based)
// router.get("/search", searchFlights);

module.exports = router;
