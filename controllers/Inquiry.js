// controllers/inquiryController.js
const Inquiry = require("../models/Inquiry");

/**
 * @desc Create a new inquiry
 */
const createInquiry = async (req, res) => {
    try {
        const {
            fullname,
            email,
            phoneNumber,
            inquiryType,
            preferredDestination,
            travelDates,
            groupSize,
            budgetRange,
            yourMessage,
        } = req.body;

        const newInquiry = new Inquiry({
            fullname,
            email,
            phoneNumber,
            inquiryType,
            preferredDestination,
            travelDates,
            groupSize,
            budgetRange,
            yourMessage,
        });

        const savedInquiry = await newInquiry.save();
        res.status(201).json(savedInquiry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating inquiry", error: error.message });
    }
};

/**
 * @desc Get all inquiries
 */
const getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.status(200).json(inquiries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching inquiries", error: error.message });
    }
};

/**
 * @desc Get a single inquiry by ID
 */
const getInquiryById = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.status(200).json(inquiry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching inquiry", error: error.message });
    }
};

/**
 * @desc Update an inquiry
 */
const updateInquiry = async (req, res) => {
    try {
        const updatedInquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedInquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.status(200).json(updatedInquiry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating inquiry", error: error.message });
    }
};

/**
 * @desc Delete an inquiry
 */
const deleteInquiry = async (req, res) => {
    try {
        const deletedInquiry = await Inquiry.findByIdAndDelete(req.params.id);
        if (!deletedInquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.status(200).json({ message: "Inquiry deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting inquiry", error: error.message });
    }
};

module.exports = {
    createInquiry,
    getInquiries,
    getInquiryById,
    updateInquiry,
    deleteInquiry,
};
