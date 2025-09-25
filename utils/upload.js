const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadFile = async (fileBuffer, folder = "State") => {
    try {
        const fileSize = fileBuffer.length;
        const maxFileSize = 10 * 1024 * 1024; // 10MB

        if (fileSize > maxFileSize) {
            throw new Error("File size exceeds the maximum allowed limit.");
        }

        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: folder,
                resource_type: "auto", // Automatically detect image/video
                quality: "auto", // Auto optimize quality
                fetch_format: "auto" // Auto convert to modern formats
            };

            cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    reject(error.message);
                } else {
                    resolve(result.secure_url);
                }
            }).end(fileBuffer);
        });
    } catch (error) {
        console.error(error.message);
        throw new Error("Error uploading file..");
    }
};

// Specific function for blog image uploads
const uploadBlogImage = async (fileBuffer) => {
    return uploadFile(fileBuffer, "blogs");
};

// Function to delete image from Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        // Extract public_id from Cloudinary URL
        const urlParts = imageUrl.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        const fullPublicId = `${folder}/${publicId}`;

        const result = await cloudinary.uploader.destroy(fullPublicId);
        return result;
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw new Error("Error deleting image from Cloudinary");
    }
};

// Middleware function to handle single image upload
const uploadSingleImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const imageUrl = await uploadFile(req.file.buffer);
        req.imageUrl = imageUrl;
        next();
    } catch (error) {
        res.status(500).json({ message: "Error uploading image", error: error.message });
    }
};

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: "tours" }, (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            })
            .end(buffer);
    });
};

const uploadFilesToCloudinary = async (files) => {
    const urls = [];
    for (const file of files) {
        const url = await uploadToCloudinary(file);
        urls.push(url);
    }
    return urls;
};

module.exports = { uploadFile, uploadBlogImage, deleteImageFromCloudinary, uploadSingleImage, uploadToCloudinary, uploadFilesToCloudinary };
