// controllers/tourController.js
const Tour = require("../models/Tour");
const Country = require("../models/Country");
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

// Normalize placesToBeVisited to an array of strings
const normalizePlaces = (input) => {
    if (input === undefined || input === null) return [];
    let value = input;
    if (typeof value === "string") {
        // Try parse JSON string; fallback to single-item array
        try {
            const parsed = JSON.parse(value);
            value = parsed;
        } catch (_) {
            return value.trim() ? [value] : [];
        }
    }
    if (Array.isArray(value)) {
        // Handle array where first item is a JSON array string
        if (value.length === 1 && typeof value[0] === "string") {
            const first = value[0];
            if (first.trim().startsWith("[")) {
                try {
                    const parsed = JSON.parse(first);
                    if (Array.isArray(parsed)) return parsed.map(String);
                } catch (_) {
                    // ignore
                }
            }
        }
        return value.map((v) => (v == null ? "" : String(v))).filter((s) => s !== "");
    }
    // Any other object type -> try to extract values
    try {
        return Object.values(value).map((v) => String(v)).filter((s) => s !== "");
    } catch (_) {
        return [];
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
        "availableDates",
        "gallery"
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

    // Handle gallery parsing (field-based)
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

    const galleryFromFields = gallery.filter(Boolean).map((item) => {
        if (Array.isArray(item.image)) item.image = item.image[0];
        return item;
    });

    // If gallery was provided as JSON, merge with field-based and uploaded images
    if (parsedFields.gallery && Array.isArray(parsedFields.gallery)) {
        const merged = [];
        const jsonGallery = parsedFields.gallery;
        const maxLen = Math.max(jsonGallery.length, galleryFromFields.length);
        for (let i = 0; i < maxLen; i++) {
            merged[i] = {
                ...(jsonGallery[i] || {}),
                ...(galleryFromFields[i] || {}),
            };
        }
        // Overlay uploaded images onto merged
        if (uploadedGalleryImages) {
            Object.keys(uploadedGalleryImages).forEach((key) => {
                const match = key.match(/^gallery\[(\d+)\]\[image\]$/);
                if (match) {
                    const idx = parseInt(match[1]);
                    if (!merged[idx]) merged[idx] = {};
                    merged[idx].image = uploadedGalleryImages[key];
                }
            });
        }
        parsedFields.gallery = merged.filter(Boolean).map((item) => {
            if (Array.isArray(item.image)) item.image = item.image[0];
            return item;
        });
    } else {
        // No JSON gallery provided; use field-based result
        parsedFields.gallery = galleryFromFields;
    }

    // Handle schedule parsing with day, title, desc, and dayImage
    const scheduleFromFields = [];
    
    // First, check if schedule is sent as JSON string
    if (parsedFields.schedule && Array.isArray(parsedFields.schedule)) {
        parsedFields.schedule.forEach((item, idx) => {
            if (!scheduleFromFields[idx]) scheduleFromFields[idx] = {};
            // Copy all fields from JSON schedule (day, title, desc, dayImage)
            if (item.day !== undefined) scheduleFromFields[idx].day = item.day;
            if (item.title !== undefined) scheduleFromFields[idx].title = item.title;
            if (item.desc !== undefined) scheduleFromFields[idx].desc = item.desc;
            if (item.dayImage !== undefined) scheduleFromFields[idx].dayImage = item.dayImage;
        });
    }
    
    // Then parse individual field-based inputs (like schedule[0][day], schedule[0][title], etc.)
    Object.keys(fields).forEach((key) => {
        const match = key.match(/^schedule\[(\d+)\]\[(?:'|\")?(\w+)(?:'|\")?\]$/);
        if (match) {
            const idx = parseInt(match[1]);
            const subField = match[2];
            if (!scheduleFromFields[idx]) scheduleFromFields[idx] = {};

            // Handle dayImage separately (can be uploaded file or URL)
            if (subField === "dayImage") {
                if (typeof fields[key] === "string" && fields[key].startsWith("http")) {
                    scheduleFromFields[idx][subField] = fields[key];
                } else if (uploadedScheduleImages && uploadedScheduleImages[key]) {
                    scheduleFromFields[idx][subField] = uploadedScheduleImages[key];
                } else if (fields[key]) {
                    scheduleFromFields[idx][subField] = fields[key];
                }
            } 
            // Handle day, title, desc fields - capture all of them
            else if (subField === "day" || subField === "title" || subField === "desc") {
                scheduleFromFields[idx][subField] = fields[key];
            }
        }
    });

    // Handle uploaded schedule images (overrides any existing dayImage)
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

    // Normalize schedule: ensure day is number, dayImage is single value, and preserve title, desc
    const normalizedSchedule = scheduleFromFields.filter(Boolean).map((item) => {
        const normalized = {};
        
        // Normalize day to number
        if (item.day !== undefined && item.day !== null && item.day !== "") {
            if (typeof item.day === "string") {
                const n = Number(item.day);
                normalized.day = !Number.isNaN(n) ? n : item.day;
            } else {
                normalized.day = item.day;
            }
        }
        
        // Preserve title and desc (only if they have values)
        if (item.title !== undefined && item.title !== null && item.title !== "") {
            normalized.title = item.title;
        }
        if (item.desc !== undefined && item.desc !== null && item.desc !== "") {
            normalized.desc = item.desc;
        }
        
        // Normalize dayImage (ensure it's a single string, not array)
        if (item.dayImage !== undefined && item.dayImage !== null && item.dayImage !== "") {
            normalized.dayImage = Array.isArray(item.dayImage) ? item.dayImage[0] : item.dayImage;
        }
        
        return normalized;
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
            country,
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
            discountedPrice,
            summary,
            location,
            tourStar,
            tourType
        } = req.body;

        if (!country || !state || !city) {
            return res.status(400).json({ message: "Country, State and City are required" });
        }

        // Validate country
        const isCountryExist = await Country.findById(country);
        if (!isCountryExist) return res.status(404).json({ message: "Country not found" });

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

        // parse availableDates
        let parsedDates = [];
        if (parsedFields.availableDates) {
            parsedDates = parsedFields.availableDates.map(d => new Date(d));
        }

        const finalDiscountedPrice = discountedPrice !== undefined && discountedPrice !== null
            ? discountedPrice
            : price;

        const newTour = new Tour({
            country,
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
            placesToBeVisited: normalizePlaces(parsedFields.placesToBeVisited ?? req.body.placesToBeVisited),
            recommended: parsedFields.recommended || [],
            location,
            trackActivity: parsedFields.trackActivity || [],
            gallery: parsedFields.gallery || [],
            discountedPrice: finalDiscountedPrice,
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
        const { price, discountedPrice, tourStar, country, state, city } = req.body;

        // Validate country, state & city if provided
        if (country) {
            const isCountryExist = await Country.findById(country);
            if (!isCountryExist) return res.status(404).json({ message: "Country not found" });
        }
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

        const updateData = {
            ...req.body,
            packages: parsedFields.packages || [],
            availableDates: (parsedFields.availableDates || []).map(d => new Date(d)),
            schedule: parsedFields.schedule || [],
            recommended: parsedFields.recommended || [],
            trackActivity: parsedFields.trackActivity || [],
            gallery: parsedFields.gallery || [],
            tourStar
        };

        const resolvedDiscountedPrice = Object.prototype.hasOwnProperty.call(req.body, "discountedPrice")
            ? discountedPrice
            : (Object.prototype.hasOwnProperty.call(req.body, "price") ? price : undefined);

        if (resolvedDiscountedPrice !== undefined) {
            updateData.discountedPrice = resolvedDiscountedPrice;
        } else {
            delete updateData.discountedPrice;
        }

        if (imageUrls.length > 0) updateData.images = imageUrls;

        // normalize placesToBeVisited: always save as array of strings if provided
        if (Object.prototype.hasOwnProperty.call(parsedFields, "placesToBeVisited") ||
            Object.prototype.hasOwnProperty.call(req.body, "placesToBeVisited")) {
            updateData.placesToBeVisited = normalizePlaces(parsedFields.placesToBeVisited ?? req.body.placesToBeVisited);
        }

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
        const tours = await Tour.find().populate("country").populate("state").populate("city");
        const normalized = tours.map((t) => {
            const obj = t.toObject({ virtuals: true });
            const v = t.placesToBeVisited;
            if (Array.isArray(v)) {
                obj.placesToBeVisited = v;
            } else if (typeof v === "string") {
                try { obj.placesToBeVisited = JSON.parse(v); } catch (_) { obj.placesToBeVisited = v ? [v] : []; }
            } else {
                obj.placesToBeVisited = [];
            }
            return obj;
        });
        res.status(200).json(normalized);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tours", error: err.message });
    }
};

// GET TOUR BY ID
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id).populate("country").populate("state").populate("city");
        if (!tour) return res.status(404).json({ message: "Tour not found" });
        const obj = tour.toObject({ virtuals: true });
        const v = tour.placesToBeVisited;
        if (Array.isArray(v)) {
            obj.placesToBeVisited = v;
        } else if (typeof v === "string") {
            try { obj.placesToBeVisited = JSON.parse(v); } catch (_) { obj.placesToBeVisited = v ? [v] : []; }
        } else {
            obj.placesToBeVisited = [];
        }
        res.status(200).json(obj);
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
            .populate("country")
            .populate("state")
            .populate("city")
            .sort({ availableDates: 1, createdAt: -1 })
            .limit(10);

        const popular = await Tour.find({
            availableDates: { $lt: now },
            $expr: { $lt: ["$discountedPrice", "$price"] }
        })
            .populate("country")
            .populate("state")
            .populate("city")
            .sort({ discountedPrice: 1, createdAt: -1 })
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
