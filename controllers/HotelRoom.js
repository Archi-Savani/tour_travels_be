const HotelRoom = require("../models/HotelRoom");

// ✅ Create Hotel Room
const createHotelRoom = async (req, res) => {
    try {
        const {
            title,
            location,
            price,
            discount,
            overview,
            amenities,
            policies,
            rating, // 🟢 Added rating field
        } = req.body;

        // Cloudinary image URL from middleware
        const image = req.imageUrl;

        if (!image) {
            return res.status(400).json({ message: "Image is required" });
        }

        let parsedAmenities = [];
        if (amenities) {
            try {
                // If amenities is a JSON string like '["wifi","pool"]'
                parsedAmenities = JSON.parse(amenities);
                if (!Array.isArray(parsedAmenities)) {
                    parsedAmenities = [parsedAmenities];
                }
            } catch {
                // If amenities is a comma-separated string like "wifi,pool"
                parsedAmenities = amenities.split(",").map(a => a.trim());
            }
        }

        const newHotelRoom = new HotelRoom({
            title,
            location,
            price,
            discount,
            overview,
            amenities: parsedAmenities,
            policies,
            image,
            rating: rating ? Number(rating) : 0, // 🟢 Safely assign rating
        });

        await newHotelRoom.save();

        res.status(201).json({
            message: "Hotel Room created successfully",
            data: newHotelRoom,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating hotel room",
            error: error.message,
        });
    }
};

// ✅ Get all Hotel Rooms
const getHotelRooms = async (req, res) => {
    try {
        const rooms = await HotelRoom.find().sort({ createdAt: -1 });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching hotel rooms",
            error: error.message,
        });
    }
};

// ✅ Get single Hotel Room by ID
const getHotelRoomById = async (req, res) => {
    try {
        const room = await HotelRoom.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Hotel Room not found" });
        }
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching hotel room",
            error: error.message,
        });
    }
};

// ✅ Update Hotel Room
const updateHotelRoom = async (req, res) => {
    try {
        const {
            title,
            location,
            price,
            discount,
            overview,
            amenities,
            policies,
            rating, // 🟢 Added rating field
        } = req.body;

        const updateData = {
            title,
            location,
            price,
            discount,
            overview,
            amenities: amenities
                ? amenities.split(",").map(a => a.trim())
                : [],
            policies,
        };

        // 🟢 Include rating if provided
        if (rating !== undefined) {
            updateData.rating = Number(rating);
        }

        if (req.imageUrl) {
            updateData.image = req.imageUrl;
        }

        const updatedRoom = await HotelRoom.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedRoom) {
            return res.status(404).json({ message: "Hotel Room not found" });
        }

        res.status(200).json({
            message: "Hotel Room updated successfully",
            data: updatedRoom,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating hotel room",
            error: error.message,
        });
    }
};

// ✅ Delete Hotel Room
const deleteHotelRoom = async (req, res) => {
    try {
        const deletedRoom = await HotelRoom.findByIdAndDelete(req.params.id);
        if (!deletedRoom) {
            return res.status(404).json({ message: "Hotel Room not found" });
        }
        res.status(200).json({ message: "Hotel Room deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting hotel room",
            error: error.message,
        });
    }
};

module.exports = {
    createHotelRoom,
    getHotelRooms,
    getHotelRoomById,
    updateHotelRoom,
    deleteHotelRoom,
};
