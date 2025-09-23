const mongoose = require("mongoose");

const taxiTourSchema = new mongoose.Schema(
    {
        serviceType: {
            type: String,
            enum: ["city_tour", "airport_transfer", "inter_city"],
            required: true,
        },
        routeType: {
            type: String,
            enum: ["fix route", "per km"],
            required: true,
        },
        time: {
            type: String, // Example: "2 hours", "1 day", "10:00 AM - 6:00 PM"
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        km: {
            type: Number, // Only required if routeType is "per km"
            min: 0,
        },
        taxiType: {
            type: String, // Example: Sedan, SUV, Mini
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0, // percentage (0-100)
            min: 0,
            max: 100,
        },
        discountPrice: {
            type: Number,
            min: 0,
        },
        image: {
            type: String, // Cloudinary URL or file path
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

// Auto calculate discountPrice before saving
taxiTourSchema.pre("save", function (next) {
    if (this.discount && this.price) {
        this.discountPrice = Math.round(
            this.price - (this.price * this.discount) / 100
        );
    } else {
        this.discountPrice = this.price;
    }
    next();
});

const TaxiTour = mongoose.model("TaxiTour", taxiTourSchema);

module.exports = TaxiTour;
