const express = require("express");
const router = express.Router();

const {
    createCity,
    getAllCities,
    getCitiesByState,
    updateCity,
    deleteCity
} = require("../controllers/City");

// ✅ Create City
router.post("/", createCity);

// ✅ Get All Cities with State Info
router.get("/", getAllCities);

// ✅ Get Cities by State ID (Dropdown API)
router.get("/state/:stateId", getCitiesByState);

// ✅ Update City
router.put("/:cityId", updateCity);

// ✅ Delete City
router.delete("/:cityId", deleteCity);

module.exports = router;
