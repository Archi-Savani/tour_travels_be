const TaxiTour = require("../models/TaxiTour");

// ================= Create Taxi Tour =================
const createTaxiTour = async (req, res) => {
    try {
        const {
            serviceType,
            routeType,
            time,
            title,
            km,
            taxiType,
            price,
            discount,
        } = req.body;

        if (!req.imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Image is required",
            });
        }

        const taxiTour = await TaxiTour.create({
            serviceType,
            routeType,
            time,
            title,
            km,
            taxiType,
            price,
            discount,
            image: req.imageUrl,
        });

        res.status(201).json({
            success: true,
            message: "Taxi tour created successfully",
            data: taxiTour,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create taxi tour",
            error: error.message,
        });
    }
};

// ================= Get All Taxi Tours =================
const getTaxiTours = async (req, res) => {
    try {
        const taxiTours = await TaxiTour.find();
        res.status(200).json({
            success: true,
            count: taxiTours.length,
            data: taxiTours,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch taxi tours",
            error: error.message,
        });
    }
};

// ================= Get Taxi Tour By ID =================
const getTaxiTourById = async (req, res) => {
    try {
        const taxiTour = await TaxiTour.findById(req.params.id);
        if (!taxiTour) {
            return res.status(404).json({
                success: false,
                message: "Taxi tour not found",
            });
        }

        res.status(200).json({
            success: true,
            data: taxiTour,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid request",
            error: error.message,
        });
    }
};

// ================= Update Taxi Tour =================
const updateTaxiTour = async (req, res) => {
    try {
        const taxiTour = await TaxiTour.findById(req.params.id);
        if (!taxiTour) {
            return res.status(404).json({
                success: false,
                message: "Taxi tour not found",
            });
        }

        const updates = { ...req.body };

        if (req.imageUrl) {
            updates.image = req.imageUrl; // replace image if new one uploaded
        }

        Object.assign(taxiTour, updates);
        await taxiTour.save();

        res.status(200).json({
            success: true,
            message: "Taxi tour updated successfully",
            data: taxiTour,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update taxi tour",
            error: error.message,
        });
    }
};

// ================= Delete Taxi Tour =================
const deleteTaxiTour = async (req, res) => {
    try {
        const taxiTour = await TaxiTour.findByIdAndDelete(req.params.id);
        if (!taxiTour) {
            return res.status(404).json({
                success: false,
                message: "Taxi tour not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Taxi tour deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to delete taxi tour",
            error: error.message,
        });
    }
};

module.exports = {
    createTaxiTour,
    getTaxiTours,
    getTaxiTourById,
    updateTaxiTour,
    deleteTaxiTour,
};
