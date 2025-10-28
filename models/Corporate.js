const mongoose = require("mongoose");

const corporateSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true,
        },
        contactPersonName: {
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
        destination: {
            type: String,
            required: true,
            trim: true,
        },
        travelStartDate: {
            type: Date,
            required: true,
        },
        travelEndDate: {
            type: Date,
            required: true,
        },
        numberOfTravelers: {
            type: Number,
            required: true,
            min: 1,
        },
        budgetPerPerson: {
            type: Number,
            required: true,
        },
        tripType: {
            type: String,
            enum: ["oneway", "roundtrip"],
            required: true,
        },
        accommodationType: {
            type: String,
            enum: ["hotel", "resort", "hostel", "guesthouse", "other"],
            default: "hotel",
        },
        mealPreference: {
            type: String,
            enum: ["vegetarian", "non-vegetarian", "vegan", "no preference"],
            default: "no preference",
        },
        transportRequirement: {
            type: String,
            enum: ["car", "bus", "train", "flight", "none"],
            default: "none",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Corporate", corporateSchema);
