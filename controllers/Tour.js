const Tour = require("../models/Tour");
const { uploadToCloudinary } = require("../utils/upload");

// helper to safely parse JSON
const safeParse = (val) => {
    try {
        return typeof val === "string" ? JSON.parse(val) : val;
    } catch (err) {
        return val;
    }
};

// Helper to parse JSON fields and gallery
const parseComplexFields = (fields, uploadedGalleryImages) => {
    const parsedFields = {};
    const jsonFields = [
        "packages",
        "schedule",
        "placesToBeVisited",
        "recommended",
        "trackActivity",
        "date"
    ];

    jsonFields.forEach((field) => {
        if (fields[field]) {
            parsedFields[field] = safeParse(fields[field]);
        }
    });

    // ✅ ensure sharingTypes inside packages are parsed
    if (parsedFields.packages && Array.isArray(parsedFields.packages)) {
        parsedFields.packages = parsedFields.packages.map((pkg) => ({
            ...pkg,
            sharingTypes: pkg.sharingTypes ? safeParse(pkg.sharingTypes) : []
        }));
    }

    // Handle gallery parsing
    const gallery = [];
    Object.keys(fields).forEach((key) => {
        const match = key.match(/^gallery\[(\d+)\]\[(?:'|\")?(\w+)(?:'|\")?\]$/);
        if (match) {
            const idx = parseInt(match[1]);
            const subField = match[2];
            if (!gallery[idx]) gallery[idx] = {};

            if (subField === "image") {
                if (typeof fields[key] === "string" && fields[key].startsWith("http")) {
                    gallery[idx][subField] = fields[key];
                } else if (uploadedGalleryImages[key]) {
                    gallery[idx][subField] = uploadedGalleryImages[key];
                }
            } else {
                gallery[idx][subField] = fields[key];
            }
        }
    });

    if (uploadedGalleryImages) {
        Object.keys(uploadedGalleryImages).forEach((key) => {
            const match = key.match(/^gallery\[(\d+)\]\[image\]$/);
            if (match) {
                const idx = parseInt(match[1]);
                if (!gallery[idx]) gallery[idx] = {};
                gallery[idx].image = uploadedGalleryImages[key];
            }
        });
    }

    parsedFields.gallery = gallery.filter(Boolean).map((item) => {
        if (Array.isArray(item.image)) item.image = item.image[0];
        return item;
    });

    return parsedFields;
};

// CREATE TOUR
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
            price,
            summary,
            location,
            discount,
            date,
            rating,
            tourType,
            famousCity
        } = req.body;

        // collect files from multer.any()
        let imageUrls = [];
        const uploadedGalleryImages = {};
        if (Array.isArray(req.files)) {
            const imageFiles = req.files.filter((f) => f.fieldname === "images");
            const galleryFiles = req.files.filter((f) =>
                /^gallery\[\d+\]\[image\]$/.test(f.fieldname)
            );
            if (imageFiles.length) {
                imageUrls = await Promise.all(
                    imageFiles.map((file) => uploadToCloudinary(file.buffer))
                );
            }
            for (const file of galleryFiles) {
                uploadedGalleryImages[file.fieldname] = await uploadToCloudinary(
                    file.buffer
                );
            }
        }

        const parsedFields = parseComplexFields(req.body, uploadedGalleryImages);

        // discount calc
        let discountedPrice = price;
        if (discount && discount > 0)
            discountedPrice = price - (price * discount) / 100;

        // single date parse
        let parsedDate = null;
        if (date) parsedDate = new Date(date);

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
            date: parsedDate,
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
            // ✅ new fields
            rating: rating || 0,
            tourType: tourType || "normal",
            famousCity: famousCity || ""
        });

        const savedTour = await newTour.save();
        res.status(201).json(savedTour);
    } catch (err) {
        res.status(500).json({ message: "Error creating tour", error: err.message });
    }
};

// UPDATE TOUR
const updateTour = async (req, res) => {
    try {
        const { discount, price, date } = req.body;

        let imageUrls = [];
        const uploadedGalleryImages = {};
        if (Array.isArray(req.files)) {
            const imageFiles = req.files.filter((f) => f.fieldname === "images");
            const galleryFiles = req.files.filter((f) =>
                /^gallery\[\d+\]\[image\]$/.test(f.fieldname)
            );
            if (imageFiles.length) {
                imageUrls = await Promise.all(
                    imageFiles.map((file) => uploadToCloudinary(file.buffer))
                );
            }
            for (const file of galleryFiles) {
                uploadedGalleryImages[file.fieldname] = await uploadToCloudinary(
                    file.buffer
                );
            }
        }

        const parsedFields = parseComplexFields(req.body, uploadedGalleryImages);

        let discountedPrice = price;
        if (discount && discount > 0)
            discountedPrice = price - (price * discount) / 100;

        const updateData = {
            ...req.body,
            discountedPrice,
            packages: parsedFields.packages || [],
            date: date ? new Date(date) : undefined,
            schedule: parsedFields.schedule || [],
            recommended: parsedFields.recommended || [],
            trackActivity: parsedFields.trackActivity || [],
            gallery: parsedFields.gallery || []
        };

        // ✅ ensure new fields can be updated too
        if (req.body.rating !== undefined) updateData.rating = req.body.rating;
        if (req.body.tourType) updateData.tourType = req.body.tourType;
        if (req.body.famousCity) updateData.famousCity = req.body.famousCity;

        if (imageUrls.length > 0) updateData.images = imageUrls;

        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!updatedTour)
            return res.status(404).json({ message: "Tour not found" });
        res.status(200).json(updatedTour);
    } catch (err) {
        res.status(500).json({ message: "Error updating tour", error: err.message });
    }
};

// GET TOURS
const getTours = async (req, res) => {
    try {
        const tours = await Tour.find().populate("state");
        res.status(200).json(tours);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tours", error: err.message });
    }
};

// GET TOUR BY ID
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id).populate("state");
        if (!tour) return res.status(404).json({ message: "Tour not found" });
        res.status(200).json(tour);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tour", error: err.message });
    }
};

// DELETE TOUR
const deleteTour = async (req, res) => {
    try {
        const deletedTour = await Tour.findByIdAndDelete(req.params.id);
        if (!deletedTour)
            return res.status(404).json({ message: "Tour not found" });
        res.status(200).json({ message: "Tour deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting tour", error: err.message });
    }
};

module.exports = {
    createTour,
    updateTour,
    getTours,
    getTourById,
    deleteTour,
};
