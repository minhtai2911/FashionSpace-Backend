import Category from "../models/category.js";
import Product from "../models/product.js";
import chatbotController from "./chatbotController.js";
import { messages } from "../config/messageHelper.js";
import category from "../models/category.js";

const getAllCategories = async (req, res, next) => {
  try {
    const query = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (req.query.isActive) query.isActive = req.query.isActive;
    if (req.query.search) query.name = new RegExp(req.query.search, "i");

    const totalCount = await Category.countDocuments(query);
    const category = await Category.find(query).skip(skip).limit(limit).exec();

    res.status(200).json({
      meta: {
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
      data: category,
    });
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

    const existingCategory = await Category.findOne({
      name: name,
      gender: gender,
    });

    if (existingCategory) {
      return res.status(409).json({ message: messages.MSG56 });
    }

    const newCategory = new Category({ name, gender });

    chatbotController.updateEntityCategory(name, [name]);
    await newCategory.save();

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

    const existingCategory = await Category.findOne({
      name: name,
      gender: gender,
    });

    if (
      existingCategory &&
      existingCategory._id.toString() == category._id.toString()
    ) {
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

const updateStatusCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ error: "Not found" });

    category.isActive = !category.isActive;

    await category.save();
    if (category.isActive) res.status(200).json({ message: messages.MSG29 });
    else res.status(200).json({ message: messages.MSG30 });
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
  updateStatusCategoryById: updateStatusCategoryById,
};
