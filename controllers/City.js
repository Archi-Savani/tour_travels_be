const City = require("../models/City");
const State = require("../models/State");

// ✅ Create City
exports.createCity = async (req, res) => {
    try {
        const { state, cityName } = req.body;

        if (!state || !cityName) {
            return res.status(400).json({ success: false, message: "State ID and City Name are required" });
        }

        // Check if provided state exists
        const isStateExists = await State.findById(state);
        if (!isStateExists) {
            return res.status(404).json({ success: false, message: "State not found" });
        }

        // Check duplicate city under same state
        const isDuplicate = await City.findOne({ state, cityName: { $regex: `^${cityName}$`, $options: "i" } });
        if (isDuplicate) {
            return res.status(400).json({ success: false, message: "City already exists in this state" });
        }

        const newCity = new City({ state, cityName });
        await newCity.save();

        res.status(201).json({ success: true, message: "City created successfully", data: newCity });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ✅ Get All Cities with State Details
exports.getAllCities = async (req, res) => {
    try {
        const cities = await City.find().populate("state", "stateName"); // assumes stateName field exists
        res.status(200).json({ success: true, data: cities });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ✅ Get Cities by State ID
exports.getCitiesByState = async (req, res) => {
    try {
        const { stateId } = req.params;
        const cities = await City.find({ state: stateId });

        if (!cities.length) {
            return res.status(404).json({ success: false, message: "No cities found for this state" });
        }

        res.status(200).json({ success: true, data: cities });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ✅ Update City
exports.updateCity = async (req, res) => {
    try {
        const { cityId } = req.params;
        const { cityName } = req.body;

        const updatedCity = await City.findByIdAndUpdate(
            cityId,
            { cityName },
            { new: true, runValidators: true }
        );

        if (!updatedCity) {
            return res.status(404).json({ success: false, message: "City not found" });
        }

        res.status(200).json({ success: true, message: "City updated successfully", data: updatedCity });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ✅ Delete City
exports.deleteCity = async (req, res) => {
    try {
        const { cityId } = req.params;

        const deletedCity = await City.findByIdAndDelete(cityId);

        if (!deletedCity) {
            return res.status(404).json({ success: false, message: "City not found" });
        }

        res.status(200).json({ success: true, message: "City deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
