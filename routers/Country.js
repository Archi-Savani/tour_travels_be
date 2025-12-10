const express = require("express");
const router = express.Router();

const {
    createCountry,
    getAllCountries,
    getCountryById,
    updateCountry,
    deleteCountry
} = require("../controllers/Country");

// ✅ Create Country
router.post("/", createCountry);

// ✅ Get All Countries
router.get("/", getAllCountries);

// ✅ Get Country by ID
router.get("/:id", getCountryById);

// ✅ Update Country
router.put("/:id", updateCountry);

// ✅ Delete Country
router.delete("/:id", deleteCountry);

module.exports = router;

