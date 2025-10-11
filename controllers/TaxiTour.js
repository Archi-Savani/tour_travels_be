const Cab = require("../models/TaxiTour");
const multer = require("multer");
const { uploadFile, deleteImageFromCloudinary } = require("../utils/upload");

// ------------------------------------
// 🧠 MULTER MEMORY STORAGE (for buffer)
// ------------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ------------------------------------
// 🟢 CREATE CAB
// ------------------------------------
const createCab = async (req, res) => {
    try {
        const {
            routeType,
            pickup,
            drop,
            date,
            time,
            seater,
            carName,
            features,
            pricePerKm,
        } = req.body;

        if (!routeType) {
            return res.status(400).json({
                ok: false,
                error: "routeType is required (oneway or roundtrip).",
            });
        }

        // 🧠 Upload image to Cloudinary
        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadFile(req.file.buffer, "cabs");
        } else {
            return res.status(400).json({
                ok: false,
                error: "Cab image is required.",
            });
        }

        // 🧠 Build cab data
        const cabData = {
            routeType,
            seater,
            carName,
            image: imageUrl,
            features // ✅ Common now for all routes
        };

        if (routeType === "oneway") {
            cabData.pickup = pickup;
            cabData.drop = drop;
            cabData.date = date;
            cabData.time = time;
        }

        if (routeType === "roundtrip") {
            cabData.pricePerKm = pricePerKm;
        }

        const cab = new Cab(cabData);
        await cab.save();

        res.status(201).json({
            ok: true,
            message: "Cab created successfully",
            data: cab,
        });
    } catch (error) {
        console.error("❌ Error creating cab:", error);
        res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
};

// ------------------------------------
// 🟢 GET ALL CABS
// ------------------------------------
const getAllCabs = async (req, res) => {
    try {
        const cabs = await Cab.find().sort({ createdAt: -1 });
        res.status(200).json({
            ok: true,
            count: cabs.length,
            data: cabs,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
};

// ------------------------------------
// 🟢 GET CAB BY ID
// ------------------------------------
const getCabById = async (req, res) => {
    try {
        const cab = await Cab.findById(req.params.id);
        if (!cab) {
            return res.status(404).json({
                ok: false,
                error: "Cab not found",
            });
        }
        res.status(200).json({
            ok: true,
            data: cab,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
};

// ------------------------------------
// 🟢 UPDATE CAB
// ------------------------------------
const updateCab = async (req, res) => {
    try {
        const cab = await Cab.findById(req.params.id);
        if (!cab) {
            return res.status(404).json({
                ok: false,
                error: "Cab not found",
            });
        }

        const {
            routeType,
            pickup,
            drop,
            date,
            time,
            seater,
            carName,
            features,
            pricePerKm,
        } = req.body;

        if (routeType) cab.routeType = routeType;
        if (seater) cab.seater = seater;
        if (carName) cab.carName = carName;

        // ✅ Always update features now (common field)
        if (features) {
            cab.features = features;
        }

        // 🧠 Image update
        if (req.file) {
            if (cab.image) {
                await deleteImageFromCloudinary(cab.image);
            }
            const newImageUrl = await uploadFile(req.file.buffer, "cabs");
            cab.image = newImageUrl;
        }

        // 🧠 Handle conditional fields but DO NOT remove features for oneway
        if (cab.routeType === "oneway") {
            cab.pickup = pickup || cab.pickup;
            cab.drop = drop || cab.drop;
            cab.date = date || cab.date;
            cab.time = time || cab.time;
        }

        if (cab.routeType === "roundtrip") {
            cab.pricePerKm = pricePerKm ?? cab.pricePerKm;
        }

        await cab.save();

        res.status(200).json({
            ok: true,
            message: "Cab updated successfully",
            data: cab,
        });
    } catch (error) {
        console.error("❌ Error updating cab:", error);
        res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
};

// ------------------------------------
// 🟢 DELETE CAB
// ------------------------------------
const deleteCab = async (req, res) => {
    try {
        const cab = await Cab.findById(req.params.id);
        if (!cab) {
            return res.status(404).json({
                ok: false,
                error: "Cab not found",
            });
        }

        if (cab.image) {
            await deleteImageFromCloudinary(cab.image);
        }

        await Cab.findByIdAndDelete(req.params.id);

        res.status(200).json({
            ok: true,
            message: "Cab deleted successfully",
        });
    } catch (error) {
        console.error("❌ Error deleting cab:", error);
        res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
};

module.exports = {
    upload,
    createCab,
    getAllCabs,
    getCabById,
    updateCab,
    deleteCab,
};
