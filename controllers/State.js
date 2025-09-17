const State = require("../models/State");
const { uploadFile } = require("../utils/upload"); // adjust path if needed

// @desc Create a new State
// @route POST /api/states
exports.createState = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!req.imageUrl) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const state = new State({
            name,
            description,
            image: req.imageUrl
        });

        await state.save();

        res.status(201).json({
            message: "State created successfully",
            state
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Get all States
// @route GET /api/states
exports.getStates = async (req, res) => {
    try {
        const states = await State.find().sort({ createdAt: -1 });
        res.status(200).json(states);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Get single State by ID
// @route GET /api/states/:id
exports.getStateById = async (req, res) => {
    try {
        const state = await State.findById(req.params.id);
        if (!state) {
            return res.status(404).json({ message: "State not found" });
        }
        res.status(200).json(state);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Update State
// @route PUT /api/states/:id
exports.updateState = async (req, res) => {
    try {
        const { name, description } = req.body;
        let updateData = { name, description };

        // if a new image is uploaded
        if (req.imageUrl) {
            updateData.image = req.imageUrl;
        }

        const state = await State.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!state) {
            return res.status(404).json({ message: "State not found" });
        }

        res.status(200).json({
            message: "State updated successfully",
            state
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Delete State
// @route DELETE /api/states/:id
exports.deleteState = async (req, res) => {
    try {
        const state = await State.findByIdAndDelete(req.params.id);
        if (!state) {
            return res.status(404).json({ message: "State not found" });
        }

        res.status(200).json({ message: "State deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
