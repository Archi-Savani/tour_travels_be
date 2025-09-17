// controllers/tourController.js
const Tour = require("../models/Tour");
const { uploadMultipleFiles } = require("../utils/uploadMultipleFiles");

// Helper function to parse JSON strings for complex fields
const parseComplexFields = (fields) => {
    const parsedFields = {};
    const fieldNames = ['packages', 'sharingTypes', 'schedule', 'placesToBeVisited', 'recommended', 'trackActivity', 'gallery'];
    
    fieldNames.forEach(fieldName => {
        const fieldValue = fields[fieldName];
        if (fieldValue) {
            if (typeof fieldValue === 'string') {
                try {
                    parsedFields[fieldName] = JSON.parse(fieldValue);
                } catch (error) {
                    throw new Error(`Invalid JSON format for ${fieldName}: ${error.message}`);
                }
            } else if (Array.isArray(fieldValue)) {
                parsedFields[fieldName] = fieldValue;
            }
        }
    });
    
    return parsedFields;
};

/**
 * @desc Create a new tour
 */
    const createTour = async (req, res) => {
        try {
            const {
                state,
                title,
                description,
                difficulty,
                duration,
                altitude,
                pickupPoints,
                baseCamp,
                minimumAge,
                bestTimeToVisit,
                availableDates,
                price,
                summary,
                location,
                discount,
            } = req.body;

            // Parse JSON strings for complex fields
            let parsedFields = {};
            try {
                parsedFields = parseComplexFields(req.body);
            } catch (parseError) {
                return res.status(400).json({
                    message: "Invalid JSON format for complex fields",
                    error: parseError.message
                });
            }

            let imageUrls = [];
            if (req.imageUrls && req.imageUrls.length > 0) {
                imageUrls = req.imageUrls;
            }

            // auto-calculate discountedPrice
            let discountedPrice = price;
            if (discount && discount > 0) {
                discountedPrice = price - (price * discount) / 100;
            }

            const newTour = new Tour({
                state,
                title,
                description,
                difficulty,
                duration,
                altitude,
                pickupPoints,
                baseCamp,
                minimumAge,
                bestTimeToVisit,
                packages: parsedFields.packages || [],
                availableDates,
                sharingTypes: parsedFields.sharingTypes || [],
                images: imageUrls,
                price,
                schedule: parsedFields.schedule || [],
                summary,
                placesToBeVisited: parsedFields.placesToBeVisited || [],
                recommended: parsedFields.recommended || [],
                location,
                trackActivity: parsedFields.trackActivity || [],
                gallery: parsedFields.gallery || [],
                discount,
                discountedPrice,
            });

            const savedTour = await newTour.save();
            res.status(201).json(savedTour);
        } catch (error) {
            res.status(500).json({ message: "Error creating tour", error: error.message });
        }
    };

/**
 * @desc Get all tours
 */
const getTours = async (req, res) => {
    try {
        const tours = await Tour.find().populate("state");
        res.status(200).json(tours);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tours", error: error.message });
    }
};

/**
 * @desc Get a single tour by ID
 */
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id).populate("state");
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }
        res.status(200).json(tour);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tour", error: error.message });
    }
};

/**
 * @desc Update a tour
 */
const updateTour = async (req, res) => {
    try {
        const { discount, price } = req.body;

        let imageUrls = [];
        if (req.imageUrls && req.imageUrls.length > 0) {
            imageUrls = req.imageUrls;
        }

        // Parse JSON strings for complex fields
        let parsedFields = {};
        try {
            parsedFields = parseComplexFields(req.body);
        } catch (parseError) {
            return res.status(400).json({ 
                message: "Invalid JSON format for complex fields", 
                error: parseError.message 
            });
        }

        // calculate discounted price
        let discountedPrice = price;
        if (discount && discount > 0) {
            discountedPrice = price - (price * discount) / 100;
        }

        // Prepare update data
        const updateData = {
            ...req.body,
            discountedPrice,
            ...(imageUrls.length > 0 && { images: imageUrls }), // only update images if new ones provided
        };

        // Replace complex fields with parsed versions if they exist
        Object.keys(parsedFields).forEach(key => {
            if (parsedFields[key] && parsedFields[key].length > 0) {
                updateData[key] = parsedFields[key];
            }
        });

        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedTour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        res.status(200).json(updatedTour);
    } catch (error) {
        res.status(500).json({ message: "Error updating tour", error: error.message });
    }
};

/**
 * @desc Delete a tour
 */
const deleteTour = async (req, res) => {
    try {
        const deletedTour = await Tour.findByIdAndDelete(req.params.id);
        if (!deletedTour) {
            return res.status(404).json({ message: "Tour not found" });
        }
        res.status(200).json({ message: "Tour deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting tour", error: error.message });
    }
};

module.exports = {
    createTour,
    getTours,
    getTourById,
    updateTour,
    deleteTour,
};
