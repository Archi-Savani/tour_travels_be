// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
    },
    { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Category", categorySchema);
