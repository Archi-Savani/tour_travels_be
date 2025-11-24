const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
    {
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true,
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
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
        difficulty: {
            type: String,
        },
        duration: {
            type: String, // e.g. "5 Days / 4 Nights"
            required: true,
        },
        altitude: {
            type: String, // e.g. "12,500 ft"
        },
        pickupPoints: {
            type: String,
        },
        baseCamp: {
            type: String,
        },
        minimumAge: {
            type: Number,
        },
        bestTimeToVisit: {
            type: String,
        },
        tourType: {
            type: String,
            required: true,
            enum : ["Domestic" , "International"],
        },

        // ⭐ NEW FIELD ADDED HERE
        tourStar: {
            type: Number, // like rating or star level
            default: 0,   // default 0 stars if not set
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
                dayImage: { type: String },
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

        location: {
            type: String,
        },

        trackActivity: [
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

        discountedPrice: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
