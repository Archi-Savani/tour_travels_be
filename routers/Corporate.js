const express = require("express");
const router = express.Router();
const {
    createCorporate,
    getAllCorporates,
    getCorporateById,
    updateCorporate,
    deleteCorporate,
} = require("../controllers/Corporate");

// Routes
router.post("/", createCorporate);
router.get("/", getAllCorporates);
router.get("/:id", getCorporateById);
router.put("/:id", updateCorporate);
router.delete("/:id", deleteCorporate);

module.exports = router;
