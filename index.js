const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoutes = require("./routers/User");
const stateRoutes = require("./routers/State");
const tourRoutes = require("./routers/Tour");
const inquiryRoutes = require("./routers/Inquiry");
const hotelRoomRoutes = require("./routers/HotelRoom");
const taxiTourRoutes = require("./routers/TaxiTour");
const categoryRoutes = require("./routers/Category");
const blogRoutes = require("./routers/Blog");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log('Content-Type:', req.headers['content-type']);
    next();
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/state", stateRoutes);
app.use("/api/tour", tourRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/hotel-room", hotelRoomRoutes);
app.use("/api/taxi-tour", taxiTourRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/blog", blogRoutes);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log("MongoDB connected successfully.");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
