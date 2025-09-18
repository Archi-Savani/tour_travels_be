const express = require("express");
const multer = require("multer");
const { uploadSingleImage } = require("../utils/upload");
const {
    createHotelRoom,
    getHotelRooms,
    getHotelRoomById,
    updateHotelRoom,
    deleteHotelRoom,
} = require("../controllers/HotelRoom");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), uploadSingleImage, createHotelRoom);
router.get("/", getHotelRooms);
router.get("/:id", getHotelRoomById);
router.put("/:id", upload.single("image"), uploadSingleImage, updateHotelRoom);
router.delete("/:id", deleteHotelRoom);

module.exports = router;
