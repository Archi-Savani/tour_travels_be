const mongoose = require("mongoose");

const taxiTourSchema = new mongoose.Schema(
    {
        serviceType: { type: String, required: true },
        routeType: { type: String, required: true },
        time: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        km: { type: Number, required: true },
        taxiType: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        taxiImage: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("TaxiTour", taxiTourSchema);
