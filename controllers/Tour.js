// controllers/tourController.js
const Tour = require("../models/Tour");
const State = require("../models/State");
const City = require("../models/City");
const { uploadToCloudinary } = require("../utils/upload");

// helper to safely parse JSON
const safeParse = (val) => {
    try {
        return typeof val === "string" ? JSON.parse(val) : val;
    } catch (err) {
        return val; // fallback if invalid JSON
    }
};

// Helper to parse JSON fields, gallery, and schedule with dayImage
const parseComplexFields = (fields, uploadedGalleryImages, uploadedScheduleImages) => {
    const parsedFields = {};
    const jsonFields = [
        "packages",
        "schedule",
        "placesToBeVisited",
        "recommended",
        "trackActivity",
        "availableDates"
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

    // Handle schedule parsing with possible dayImage uploads
    const scheduleFromFields = [];
    Object.keys(fields).forEach((key) => {
        const match = key.match(/^schedule\[(\d+)\]\[(?:'|\")?(\w+)(?:'|\")?\]$/);
        if (match) {
            const idx = parseInt(match[1]);
            const subField = match[2];
            if (!scheduleFromFields[idx]) scheduleFromFields[idx] = {};

            if (subField === "dayImage") {
                if (typeof fields[key] === "string" && fields[key].startsWith("http")) {
                    scheduleFromFields[idx][subField] = fields[key];
                } else if (uploadedScheduleImages && uploadedScheduleImages[key]) {
                    scheduleFromFields[idx][subField] = uploadedScheduleImages[key];
                }
            } else {
                scheduleFromFields[idx][subField] = fields[key];
            }
        }
    });

    if (uploadedScheduleImages) {
        Object.keys(uploadedScheduleImages).forEach((key) => {
            const match = key.match(/^schedule\[(\d+)\]\[dayImage\]$/);
            if (match) {
                const idx = parseInt(match[1]);
                if (!scheduleFromFields[idx]) scheduleFromFields[idx] = {};
                scheduleFromFields[idx].dayImage = uploadedScheduleImages[key];
            }
        });
    }

    const normalizedSchedule = scheduleFromFields.filter(Boolean).map((item) => {
        if (Array.isArray(item.dayImage)) item.dayImage = item.dayImage[0];
        if (typeof item.day === "string") {
            const n = Number(item.day);
            if (!Number.isNaN(n)) item.day = n;
        }
        return item;
    });

    if (normalizedSchedule.length > 0) {
        parsedFields.schedule = normalizedSchedule;
    }

    return parsedFields;
};

// CREATE TOUR
const createTour = async (req, res) => {
    try {
        const {
            state,
            city,
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
            tourStar,
            tourType
        } = req.body;

        if (!state || !city) {
            return res.status(400).json({ message: "State and City are required" });
        }

        // Validate state
        const isStateExist = await State.findById(state);
        if (!isStateExist) return res.status(404).json({ message: "State not found" });

        // Validate city
        const isCityExist = await City.findById(city);
        if (!isCityExist) return res.status(404).json({ message: "City not found" });

        // collect files from multer.any()
        let imageUrls = [];
        const uploadedGalleryImages = {};
        const uploadedScheduleImages = {};
        if (Array.isArray(req.files)) {
            const imageFiles = req.files.filter(f => f.fieldname === "images");
            const galleryFiles = req.files.filter(f => /^gallery\[\d+\]\[image\]$/.test(f.fieldname));
            const scheduleImageFiles = req.files.filter(f => /^schedule\[\d+\]\[dayImage\]$/.test(f.fieldname));
            if (imageFiles.length) {
                imageUrls = await Promise.all(
                    imageFiles.map(file => uploadToCloudinary(file.buffer))
                );
            }
            for (const file of galleryFiles) {
                uploadedGalleryImages[file.fieldname] = await uploadToCloudinary(file.buffer);
            }
            for (const file of scheduleImageFiles) {
                uploadedScheduleImages[file.fieldname] = await uploadToCloudinary(file.buffer);
            }
        }

        const parsedFields = parseComplexFields(req.body, uploadedGalleryImages, uploadedScheduleImages);

        // discount calculation
        let discountedPrice = price;
        if (discount && discount > 0)
            discountedPrice = price - (price * discount) / 100;

        // parse availableDates
        let parsedDates = [];
        if (parsedFields.availableDates) {
            parsedDates = parsedFields.availableDates.map(d => new Date(d));
        }

        const newTour = new Tour({
            state,
            city,
            title,
            description,
            difficulty,
            duration,
            tourType,
            altitude,
            pickupPoints,
            baseCamp,
            minimumAge,
            bestTimeToVisit,
            packages: parsedFields.packages || [],
            availableDates: parsedDates,
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
            tourStar
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
        const { discount, price, tourStar, state, city } = req.body;

        // Validate state & city if provided
        if (state) {
            const isStateExist = await State.findById(state);
            if (!isStateExist) return res.status(404).json({ message: "State not found" });
        }
        if (city) {
            const isCityExist = await City.findById(city);
            if (!isCityExist) return res.status(404).json({ message: "City not found" });
        }

        let imageUrls = [];
        const uploadedGalleryImages = {};
        const uploadedScheduleImages = {};
        if (Array.isArray(req.files)) {
            const imageFiles = req.files.filter(f => f.fieldname === "images");
            const galleryFiles = req.files.filter(f => /^gallery\[\d+\]\[image\]$/.test(f.fieldname));
            const scheduleImageFiles = req.files.filter(f => /^schedule\[\d+\]\[dayImage\]$/.test(f.fieldname));
            if (imageFiles.length) {
                imageUrls = await Promise.all(
                    imageFiles.map(file => uploadToCloudinary(file.buffer))
                );
            }
            for (const file of galleryFiles) {
                uploadedGalleryImages[file.fieldname] = await uploadToCloudinary(file.buffer);
            }
            for (const file of scheduleImageFiles) {
                uploadedScheduleImages[file.fieldname] = await uploadToCloudinary(file.buffer);
            }
        }

        const parsedFields = parseComplexFields(req.body, uploadedGalleryImages, uploadedScheduleImages);

        let discountedPrice = price;
        if (discount && discount > 0)
            discountedPrice = price - (price * discount) / 100;

        const updateData = {
            ...req.body,
            discountedPrice,
            packages: parsedFields.packages || [],
            availableDates: (parsedFields.availableDates || []).map(d => new Date(d)),
            schedule: parsedFields.schedule || [],
            recommended: parsedFields.recommended || [],
            trackActivity: parsedFields.trackActivity || [],
            gallery: parsedFields.gallery || [],
            tourStar
        };

        if (imageUrls.length > 0) updateData.images = imageUrls;

        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedTour) return res.status(404).json({ message: "Tour not found" });

        res.status(200).json(updatedTour);
    } catch (err) {
        res.status(500).json({ message: "Error updating tour", error: err.message });
    }
};

// GET TOURS
const getTours = async (req, res) => {
    try {
        const tours = await Tour.find().populate("state").populate("city");
        res.status(200).json(tours);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tours", error: err.message });
    }
};

// GET TOUR BY ID
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id).populate("state").populate("city");
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
        if (!deletedTour) return res.status(404).json({ message: "Tour not found" });
        res.status(200).json({ message: "Tour deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting tour", error: err.message });
    }
};

// GET TOUR HIGHLIGHTS
const getTourHighlights = async (req, res) => {
    try {
        const now = new Date();
        const upcoming = await Tour.find({ availableDates: { $gte: now } })
            .populate("state")
            .populate("city")
            .sort({ availableDates: 1, createdAt: -1 })
            .limit(10);

        const popular = await Tour.find({
            discount: { $gt: 0 },
            availableDates: { $lt: now },
        })
            .populate("state")
            .populate("city")
            .sort({ discount: -1, createdAt: -1 })
            .limit(10);

        res.status(200).json({ upcoming, popular });
    } catch (err) {
        res.status(500).json({ message: "Error fetching tour highlights", error: err.message });
    }
};

module.exports = {
    createTour,
    updateTour,
    getTours,
    getTourById,
    deleteTour,
    getTourHighlights
};
