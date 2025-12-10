const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
    {
        countryName: {
            type: String,
            required: [true, "Country name is required"],
            unique: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        }
    },
    { timestamps: true }
);

const Country = mongoose.model("Country", countrySchema);
module.exports = Country;

