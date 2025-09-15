const express = require("express");
const {
    createState,
    getStates,
    getStateById,
    updateState,
    deleteState
} = require("../controllers/State");
const upload = require("../middleware/multer");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, upload.single("image"), createState);
router.get("/", getStates);
router.get("/:id", getStateById);
router.put("/:id", auth, upload.single("image"), updateState);
router.delete("/:id", auth, deleteState);

module.exports = router;
