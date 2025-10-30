const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
    {
        flightType: {
            type: String,
            enum: ["oneway", "roundtrip"],
            required: true,
        },
        from: {
            type: String,
            required: true,
            trim: true,
        },
        to: {
            type: String,
            required: true,
            trim: true,
        },
        departureDate: {
            type: Date,
            required: true,
        },
        returnDate: {
            type: Date,
            // required only if round trippp
        },
        adults: {
            type: Number,
            default: 0,
            min: 1,
        },
        children: {
            type: Number,
            default: 0,
            min: 0,
        },
        infants: {
            type: Number,
            default: 0,
            min: 0,
        },
        mobileNo: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Flight", flightSchema);
