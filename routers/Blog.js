// routers/Blog.js
const express = require("express");
const router = express.Router();
const { uploadBlogImage } = require("../middleware/multer");

const {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getBlogsByCategory
} = require("../controllers/Blog");

// Create blog with image upload
router.post("/", uploadBlogImage, createBlog);

// Get all blogs with filtering and pagination
router.get("/", getBlogs);

// Get blogs by category
router.get("/category/:categoryId", getBlogsByCategory);

// Get blog by ID
router.get("/:id", getBlogById);

// Update blog with image upload
router.put("/:id", uploadBlogImage, updateBlog);

// Delete blog
router.delete("/:id", deleteBlog);

module.exports = router;
