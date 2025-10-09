const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
    {
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: String, // e.g. "5 Days / 4 Nights"
            required: true,
        },
        pickupPoints: {
            type: String,
        },
        minimumAge: {
            type: Number,
        },
        bestTimeToVisit: {
            type: String,
        },

        // ✅ packages now include sharingTypes
        packages: [
            {
                from: { type: String }, // e.g. "Delhi"
                price: { type: Number },
                sharingTypes: [
                    {
                        type: { type: String }, // e.g. "room" / "tent"
                        twoSharing: { type: Number },
                        threeSharing: { type: Number },
                        fourSharing: { type: Number },
                    },
                ],
            },
        ],
        date: {
            type: Date,
        },

        images: [
            {
                type: String, // image URLs
            },
        ],

        price: {
            type: Number, // Default shown price
            required: true,
        },

        schedule: [
            {
                day: { type: Number },
                title: { type: String },
                desc: { type: String },
            },
        ],

        summary: {
            type: String,
        },

        placesToBeVisited: [
            {
                type: String,
            },
        ],

        recommended: [
            {
                title: { type: String },
                points: [{ type: String }],
            },
        ],

        gallery: [
            {
                image: { type: String },
                title: { type: String },
            },
        ],

        discount: {
            type: Number, // percentage or flat discount
            default: 0,
        },

        discountedPrice: {
            type: Number,
        },

        // ✅ NEW FIELDS
        rating: {
            type: Number,
            default: 0, // e.g. 4.5
            min: 0,
            max: 5,
        },
        tourType: {
            type: String,
            enum: ["upcoming", "popular"],
        },
        famousCity: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
