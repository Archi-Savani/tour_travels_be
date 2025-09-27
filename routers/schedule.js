const express = require("express");
const {
    createSchedule,
    getSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
} = require("../controllers/schedule");

const auth  = require("../middleware/auth");
// 👆 assumes you have middleware/authMiddleware.js exporting `protect`

const router = express.Router();

// ✅ All routes protected
router.post("/", auth, createSchedule);      // Create
router.get("/", auth, getSchedules);         // Get all
router.get("/:id", auth, getScheduleById);   // Get one
router.put("/:id", auth, updateSchedule);    // Update
router.delete("/:id", auth, deleteSchedule); // Delete

module.exports = router;
