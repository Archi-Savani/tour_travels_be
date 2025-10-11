const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema(
    {
        routeType: {
            type: String,
            enum: ["oneway", "roundtrip"],
            required: true,
        },

        // 🟢 Common fields
        seater: {
            type: String,
            enum: ["4", "7", "tempo_traveller"],
            required: true,
        },

        carName: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String, // Cloudinary URL
            required: true,
        },
        features: {
            type: [String], // ✅ Now common for both routess
            required: true
        },

        // 🟢 Fields for "oneway"
        pickup: {
            type: String,
        },
        drop: {
            type: String,
        },
        date: {
            type: Date,
        },
        time: {
            type: String,
        },

        // 🟢 Fields for "roundtrip"
        pricePerKm: {
            type: Number,
        },
    },
    { timestamps: true }
);

// ✅ Conditional validation middleware
cabSchema.pre("validate", function (next) {
    if (this.routeType === "oneway") {
        if (!this.pickup || !this.drop || !this.date || !this.time) {
            return next(
                new Error("Pickup, drop, date, and time are required for One Way routes.")
            );
        }
    }

    if (this.routeType === "roundtrip") {
        if (this.pricePerKm == null) {
            return next(new Error("Price per Km is required for Round Trip routes."));
        }
    }

    next();
});

const Cab = mongoose.model("Cab", cabSchema);
module.exports = Cab;
