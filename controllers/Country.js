const Country = require("../models/Country");

// ✅ Create Country
exports.createCountry = async (req, res) => {
    try {
        const { countryName } = req.body;

        if (!countryName) {
            return res.status(400).json({ success: false, message: "Country name is required" });
        }

        // Check if country already exists
        const isDuplicate = await Country.findOne({ countryName: { $regex: `^${countryName}$`, $options: "i" } });
        if (isDuplicate) {
            return res.status(400).json({ success: false, message: "Country already exists" });
        }

        const newCountry = new Country({ countryName });
        await newCountry.save();

        res.status(201).json({ success: true, message: "Country created successfully", data: newCountry });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Country name already exists" });
        }
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ✅ Get All Countries
exports.getAllCountries = async (req, res) => {
    try {
        const countries = await Country.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: countries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ✅ Get Country by ID
exports.getCountryById = async (req, res) => {
    try {
        const { id } = req.params;
        const country = await Country.findById(id);

        if (!country) {
            return res.status(404).json({ success: false, message: "Country not found" });
        }

        res.status(200).json({ success: true, data: country });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ✅ Update Country
exports.updateCountry = async (req, res) => {
    try {
        const { id } = req.params;
        const { countryName } = req.body;

        if (!countryName) {
            return res.status(400).json({ success: false, message: "Country name is required" });
        }

        // Check if country name already exists (excluding current country)
        const isDuplicate = await Country.findOne({ 
            countryName: { $regex: `^${countryName}$`, $options: "i" },
            _id: { $ne: id }
        });
        if (isDuplicate) {
            return res.status(400).json({ success: false, message: "Country name already exists" });
        }

        const updatedCountry = await Country.findByIdAndUpdate(
            id,
            { countryName },
            { new: true, runValidators: true }
        );

        if (!updatedCountry) {
            return res.status(404).json({ success: false, message: "Country not found" });
        }

        res.status(200).json({ success: true, message: "Country updated successfully", data: updatedCountry });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Country name already exists" });
        }
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ✅ Delete Country
exports.deleteCountry = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCountry = await Country.findByIdAndDelete(id);

        if (!deletedCountry) {
            return res.status(404).json({ success: false, message: "Country not found" });
        }

        res.status(200).json({ success: true, message: "Country deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

