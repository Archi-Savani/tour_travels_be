// controllers/scheduleController.js
const Schedule = require("../models/Schedule");

/**
 * @desc    Create a new schedule
 * @route   POST /api/schedules
 */
const createSchedule = async (req, res) => {
    console.log("POST /api/schedules hit", req.body);
    try {
        const { name, contact } = req.body;

        // Basic validation
        if (!name || !contact) {
            return res.status(400).json({ success: false, message: "Name and contact are required" });
        }

        const schedule = await Schedule.create({ name, contact });

        res.status(201).json({
            success: true,
            data: schedule,
        });
    } catch (err) {
        console.error("Error creating schedule:", err.message);
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get all schedules
 * @route   GET /api/schedules
 */
const getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules,
        });
    } catch (err) {
        console.error("Error fetching schedules:", err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get a single schedule by ID
 * @route   GET /api/schedules/:id
 */
const getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }

        res.status(200).json({ success: true, data: schedule });
    } catch (err) {
        console.error("Error fetching schedule:", err.message);
        if (err.kind === "ObjectId") {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Update a schedule
 * @route   PUT /api/schedules/:id
 */
const updateSchedule = async (req, res) => {
    console.log("PUT /api/schedules/:id hit", req.body);
    try {
        const { name, contact } = req.body;

        const schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            { name, contact },
            { new: true, runValidators: true }
        );

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }

        res.status(200).json({ success: true, data: schedule });
    } catch (err) {
        console.error("Error updating schedule:", err.message);
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.kind === "ObjectId") {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Delete a schedule
 * @route   DELETE /api/schedules/:id
 */
const deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }

        res.status(200).json({ success: true, message: "Schedule deleted successfully" });
    } catch (err) {
        console.error("Error deleting schedule:", err.message);
        if (err.kind === "ObjectId") {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Export all controllers
module.exports = {
    createSchedule,
    getSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
};
