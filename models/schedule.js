// models/Schedule.js
const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [200, "Name cannot exceed 200 characters"],
        },
        contact: {
            type: String,
            required: [true, "Contact is required"],
            trim: true,
            validate: {
                validator: function (v) {
                    // Allow phone numbers with digits, +, -, spaces, or parentheses
                    const phoneRegex = /^[+\d]?(?:[\d-.\s()]*)$/;
                    return phoneRegex.test(v);
                },
                message: (props) => `${props.value} is not a valid contact number`,
            },
        },
    },
    { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("Schedule", scheduleSchema);
