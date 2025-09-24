const TaxiTour = require("../models/TaxiTour");
const { uploadToCloudinary } = require("../utils/upload");

// Normalize different forms of incoming 'feactures' into a clean string array
const normalizeFeactures = (body) => {
    // 1) Direct array already parsed by express
    if (Array.isArray(body.feactures)) {
        return body.feactures;
    }
    // 2) JSON string
    if (typeof body.feactures === "string") {
        const val = body.feactures.trim();
        if (val.startsWith("[") && val.endsWith("]")) {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [];
            } catch (_) {
                // fallthrough to comma-separated
            }
        }
        // 3) Comma separated string
        if (val.length > 0) {
            return val.split(",").map(s => s.trim()).filter(Boolean);
        }
        return [];
    }
    // 4) Bracketed keys: feactures[0], feactures[1], ...
    const indexedKeys = Object.keys(body).filter(k => /^feactures\[(\d+)\]$/.test(k));
    if (indexedKeys.length > 0) {
        return indexedKeys
            .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]))
            .map(k => body[k])
            .filter(v => typeof v === "string" ? v.trim().length > 0 : Boolean(v));
    }
    // 5) Repeated field name feactures without [] can be given by some clients
    if (body["feactures[]"]) {
        const v = body["feactures[]"]; // can be string or array
        return Array.isArray(v) ? v : [v];
    }
    return [];
};

// CREATE TAXI SERVICE
const createTaxi = async (req, res) => {
    try {
        const { serviceType, name, from, to, price, wayType, perKmPrice } = req.body;

        let imageUrl = null;
        if (req.files && req.files.image && req.files.image[0]) {
            imageUrl = await uploadToCloudinary(req.files.image[0].buffer);
        } else if (req.files && req.files.taxiImage && req.files.taxiImage[0]) {
            imageUrl = await uploadToCloudinary(req.files.taxiImage[0].buffer);
        }

        const payload = {
            serviceType,
            name,
            image: imageUrl || req.body.image, // allow passing an existing URL
        };

        if (serviceType === "fix_route") {
            payload.from = from;
            payload.to = to;
            payload.price = price;
            payload.wayType = wayType; // oneway | twoway
        } else if (serviceType === "per_km") {
            payload.perKmPrice = perKmPrice;
            payload.feactures = normalizeFeactures(req.body);
        }

        // Always persist feactures if provided, for both service types
        const normalizedFeactures = normalizeFeactures(req.body);
        if (normalizedFeactures && Array.isArray(normalizedFeactures)) {
            payload.feactures = normalizedFeactures;
        }

        const doc = new TaxiTour(payload);
        const saved = await doc.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: "Error creating taxi service", error: err.message });
    }
};

// UPDATE TAXI SERVICE
const updateTaxi = async (req, res) => {
    try {
        const { id } = req.params;
        const update = { ...req.body };

        // Normalize feactures if sent as JSON string
        // Normalize and persist feactures on update for both service types
        const normalized = normalizeFeactures(req.body);
        if (normalized) update.feactures = normalized;

        // Handle image replacement
        if (req.files && req.files.image && req.files.image[0]) {
            update.image = await uploadToCloudinary(req.files.image[0].buffer);
        } else if (req.files && req.files.taxiImage && req.files.taxiImage[0]) {
            update.image = await uploadToCloudinary(req.files.taxiImage[0].buffer);
        }

        const updated = await TaxiTour.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: "Taxi service not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: "Error updating taxi service", error: err.message });
    }
};

// LIST ALL
const getTaxis = async (_req, res) => {
    try {
        const list = await TaxiTour.find().sort({ createdAt: -1 });
        res.status(200).json(list);
    } catch (err) {
        res.status(500).json({ message: "Error fetching taxi services", error: err.message });
    }
};

// GET BY ID
const getTaxiById = async (req, res) => {
    try {
        const doc = await TaxiTour.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: "Taxi service not found" });
        res.status(200).json(doc);
    } catch (err) {
        res.status(500).json({ message: "Error fetching taxi service", error: err.message });
    }
};

// DELETE
const deleteTaxi = async (req, res) => {
    try {
        const deleted = await TaxiTour.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Taxi service not found" });
        res.status(200).json({ message: "Taxi service deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting taxi service", error: err.message });
    }
};

module.exports = { createTaxi, updateTaxi, getTaxis, getTaxiById, deleteTaxi };


