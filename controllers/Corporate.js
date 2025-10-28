const Corporate = require("../models/Corporate");

// ✅ Create a new Corporate record
exports.createCorporate = async (req, res) => {
    try {
        const data = req.body;

        // Validation for date range
        if (new Date(data.travelStartDate) > new Date(data.travelEndDate)) {
            return res.status(400).json({
                success: false,
                message: "Travel start date cannot be after travel end date.",
            });
        }

        const corporate = await Corporate.create(data);

        res.status(201).json({
            success: true,
            message: "Corporate record created successfully.",
            data: corporate,
        });
    } catch (error) {
        console.error("Error creating corporate:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create corporate record.",
            error: error.message,
        });
    }
};

// ✅ Get all Corporate records
exports.getAllCorporates = async (req, res) => {
    try {
        const corporates = await Corporate.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: corporates.length,
            data: corporates,
        });
    } catch (error) {
        console.error("Error fetching corporates:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch corporate records.",
            error: error.message,
        });
    }
};

// ✅ Get a single Corporate record by ID
exports.getCorporateById = async (req, res) => {
    try {
        const corporate = await Corporate.findById(req.params.id);
        if (!corporate) {
            return res.status(404).json({
                success: false,
                message: "Corporate record not found.",
            });
        }
        res.status(200).json({
            success: true,
            data: corporate,
        });
    } catch (error) {
        console.error("Error fetching corporate by ID:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch corporate record.",
            error: error.message,
        });
    }
};

// ✅ Update Corporate record by ID
exports.updateCorporate = async (req, res) => {
    try {
        const updated = await Corporate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Corporate record not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Corporate record updated successfully.",
            data: updated,
        });
    } catch (error) {
        console.error("Error updating corporate:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update corporate record.",
            error: error.message,
        });
    }
};

// ✅ Delete Corporate record by ID
exports.deleteCorporate = async (req, res) => {
    try {
        const deleted = await Corporate.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Corporate record not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Corporate record deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting corporate:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete corporate record.",
            error: error.message,
        });
    }
};
