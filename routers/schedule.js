const express = require("express");
const {
    createSchedule,
    getSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
} = require("../controllers/schedule");

// 👆 assumes you have middleware/authMiddleware.js exporting `protect`

const router = express.Router();

// ✅ All routes protected
router.post("/", createSchedule);      // Create
router.get("/", getSchedules);         // Get all
router.get("/:id", getScheduleById);   // Get one
router.put("/:id", updateSchedule);    // Update
router.delete("/:id", deleteSchedule); // Delete

module.exports = router;
