const Flight = require("../models/Flight");

// ✅ Create Flight Booking
exports.createFlight = async (req, res) => {
    try {
        const data = req.body;

        // Conditional validation for returnDate
        if (data.flightType === "round trip" && !data.returnDate) {
            return res.status(400).json({ success: false, message: "Return date is required for round trip" });
        }

        const newFlight = await Flight.create(data);
        res.status(201).json({ success: true, message: "Flight booked successfully", data: newFlight });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ✅ Get All Flights
exports.getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: flights });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ✅ Get Single Flight by ID
exports.getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ success: false, message: "Flight not found" });
        }
        res.status(200).json({ success: true, data: flight });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ✅ Update Flight Booking
exports.updateFlight = async (req, res) => {
    try {
        const data = req.body;

        // Conditional validation for returnDate
        if (data.flightType === "round trip" && !data.returnDate) {
            return res.status(400).json({ success: false, message: "Return date is required for round trip" });
        }

        const updatedFlight = await Flight.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!updatedFlight) {
            return res.status(404).json({ success: false, message: "Flight not found" });
        }

        res.status(200).json({ success: true, message: "Flight updated successfully", data: updatedFlight });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ✅ Delete Flight Booking
exports.deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        if (!flight) {
            return res.status(404).json({ success: false, message: "Flight not found" });
        }
        res.status(200).json({ success: true, message: "Flight deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ✅ Search Flights by From, To & Date (Optional Feature)
exports.searchFlights = async (req, res) => {
    try {
        const { from, to, departureDate } = req.query;

        const filter = {};
        if (from) filter.from = from;
        if (to) filter.to = to;
        if (departureDate) filter.departureDate = departureDate;

        const flights = await Flight.find(filter);
        res.status(200).json({ success: true, data: flights });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
