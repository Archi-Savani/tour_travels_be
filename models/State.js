const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "State name is required"],
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    image: {
        type: String,
        required: [true, "State image URL is required"], // store URL or file path
        trim: true
    },
    description: {
        type: String,
        required: [true, "State description is required"],
        minlength: 10,
        maxlength: 2000
    }
}, { timestamps: true });

module.exports = mongoose.model("State", stateSchema);
