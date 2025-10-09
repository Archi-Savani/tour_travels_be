const mongoose = require("mongoose");

const hotelRoomSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
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
            default: 0, // in percentage
            min: 0,
            max: 100,
        },
        discountPrice: {
            type: Number,
            min: 0,
        },
        overview: {
            type: String,
            trim: true,
        },
        amenities: [
            {
                type: String,
                trim: true,
            },
        ],
        policies: {
            type: String,
            trim: true,
        },
        image: {
            type: String, // Cloudinary URL or local file path
            required: true,
        },

        // ✅ New field added
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0, // optional: default average rating
        },
    },
    { timestamps: true }
);

// Automatically calculate discountPrice before saving
hotelRoomSchema.pre("save", function (next) {
    if (this.discount && this.price) {
        this.discountPrice = Math.round(
            this.price - (this.price * this.discount) / 100
        );
    }
    next();
});

const HotelRoom = mongoose.model("HotelRoom", hotelRoomSchema);

module.exports = HotelRoom;
