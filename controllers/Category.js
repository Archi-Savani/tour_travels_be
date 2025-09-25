// controllers/categoryController.js
const Category = require("../models/Category");

// ------------------------
// Create Category
// ------------------------
const createCategory = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }

        const category = new Category({ title });
        await category.save();

        res.status(201).json({ success: true, message: "Category created", data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating category", error: error.message });
    }
};

// ------------------------
// Get All Categories
// ------------------------
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
    }
};

// ------------------------
// Get Category by ID
// ------------------------
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching category", error: error.message });
    }
};

// ------------------------
// Update Category
// ------------------------
const updateCategory = async (req, res) => {
    try {
        const { title } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { title },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category updated", data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating category", error: error.message });
    }
};

// ------------------------
// Delete Category
// ------------------------
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
    }
};

// Export all controllers
module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
