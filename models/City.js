const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
    {
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State", // Reference to State model
            required: true,
        },
        cityName: {
            type: String,
            required: true,
            trim: true,
        }
    },
    { timestamps: true }
);

const City = mongoose.model("City", citySchema);
module.exports = City;
