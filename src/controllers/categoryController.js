import Category from "../models/category.js";
import ProductSize from "../models/productSize.js";
import Product from "../models/product.js";
import chatbotController from "./chatbotController.js";
import { messages } from "../config/messageHelper.js";

const getAllCategories = async (req, res, next) => {
  try {
    const category = await Category.find({});

    if (!category) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: category });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: category });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, gender } = req.body;

    if (!name) throw new Error(messages.MSG1);
    const newCategory = new Category({ name, gender });

    const existingCategory = await Category.find({name: name, gender: gender});
    console.log(existingCategory);
    if (existingCategory.length !== 0) {
      return res.status(409).json({ message: messages.MSG56 });
    }

    await newCategory.save();
    chatbotController.updateEntityCategory(name, [name]);
    res.status(201).json({
      message: messages.MSG31,
      data: newCategory,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ error: "Not found" });

    const { name, gender } = req.body;

    const existingCategory = await Category.find({name: name, gender: gender});
    if (existingCategory.length !== 0) {
      return res.status(409).json({ message: messages.MSG56 });
    }

    chatbotController.deleteEntityCategory(category.name);
    chatbotController.updateEntityCategory(name, [name]);

    category.name = name || category.name;
    category.gender = gender || category.gender;

    await category.save();
    res.status(200).json({
      message: messages.MSG26,
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const deleteCategoryById = async (req, res, next) => {
  try {
    const productSize = await ProductSize.find({ categoryId: req.params.id });

    if (productSize)
      return res.status(400).json({
        message: messages.MSG29,
      });

    const product = await Product.find({ categoryId: req.params.id });

    if (product)
      return res.status(400).json({
        message: messages.MSG28,
      });

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) return res.status(404).json({ error: "Not found" });
    chatbotController.deleteEntityCategory(category.name);
    res.status(200).json({ message: messages.MSG30 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  getAllCategories: getAllCategories,
  getCategoryById: getCategoryById,
  createCategory: createCategory,
  updateCategoryById: updateCategoryById,
  deleteCategoryById: deleteCategoryById,
};
