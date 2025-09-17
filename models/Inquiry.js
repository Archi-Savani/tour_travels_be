const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        inquiryType: {
            type: String,
            required: true,
        },
        preferredDestination: {
            type: String,
            trim: true,
        },
        travelDates: {
            from: { type: Date },
            to: { type: Date },
        },
        groupSize: {
            type: Number,
            min: 1,
        },
        budgetRange: {
            min: { type: Number },
            max: { type: Number },
        },
        yourMessage: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);

module.exports = Inquiry;
