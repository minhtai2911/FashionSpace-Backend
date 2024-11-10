import asyncHandler from "../middleware/asyncHandler.js";
import Category from "../models/category.js";

const getAllCategories = asyncHandler(async (req, res, next) => {
  try {
    const category = await Category.find({});

    if (!category)
      return res.status(404).json({ message: "Categories not found" });

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getCategoryById = asyncHandler(async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createCategory = asyncHandler(async (req, res, next) => {
  try {
    const { name, gender } = req.body;

    if (!name) throw new Error("Please fill all required fields");
    const newCategory = new Category({ name, gender });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const updateCategoryById = asyncHandler(async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const { name, gender } = req.body;

    category.name = name || category.name;
    category.gender = gender || category.gender;

    await category.save();
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteCategoryById = asyncHandler(async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllCategories: getAllCategories,
  getCategoryById: getCategoryById,
  createCategory: createCategory,
  updateCategoryById: updateCategoryById,
  deleteCategoryById: deleteCategoryById,
};
