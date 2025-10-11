const express = require("express");
const auth = require("../middleware/auth");
const { uploadSingleImage } = require("../middleware/multer");
const { uploadSingleImage: uploadToCloudinary } = require("../utils/upload");
const {
    createState,
    getStates,
    getStateById,
    updateState,
    deleteState,
} = require("../controllers/State");

const router = express.Router();

// Single image upload
router.post("/", uploadSingleImage, uploadToCloudinary, createState);
router.get("/", getStates);
router.get("/:id", getStateById);
router.put("/:id", uploadSingleImage, uploadToCloudinary, updateState);
router.delete("/:id", auth, deleteState);

module.exports = router;
