import asyncHandler from "../middleware/asyncHandler.js";
import Category from "../models/category.js";
import ProductSize from "../models/productSize.js";
import Product from "../models/product.js";
import chatbotController from "./chatbotController.js";

const getAllCategories = asyncHandler(async (req, res, next) => {
  try {
    const category = await Category.find({});

    if (!category)
      return res
        .status(404)
        .json({ error: "Danh mục sản phẩm không tồn tại." });

    res.status(200).json({ data: category });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const getCategoryById = asyncHandler(async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res
        .status(404)
        .json({ error: "Danh mục sản phẩm không tồn tại." });

    res.status(200).json({ data: category });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const createCategory = asyncHandler(async (req, res, next) => {
  try {
    const { name, gender } = req.body;

    if (!name) throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    const newCategory = new Category({ name, gender });

    await newCategory.save();
    chatbotController.updateEntityCategory(name, [name]);
    res
      .status(201)
      .json({
        message: "Thêm danh mục sản phẩm thành công!",
        data: newCategory,
      });
  } catch (err) {
    res
      .status(400)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const updateCategoryById = asyncHandler(async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res
        .status(404)
        .json({ error: "Danh mục sản phẩm không tồn tại." });

    const { name, gender } = req.body;

    chatbotController.deleteEntityCategory(category.name);
    chatbotController.updateEntityCategory(name, [name]);

    category.name = name || category.name;
    category.gender = gender || category.gender;

    await category.save();
    res
      .status(200)
      .json({
        message: "Chỉnh sửa danh mục sản phẩm thành công!",
        data: category,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const deleteCategoryById = asyncHandler(async (req, res, next) => {
  try {
    const productSize = await ProductSize.find({ categoryId: req.params.id });

    if (!productSize)
      return res.status(400).json({
        message:
          "Không thể xóa danh mục sản phẩm khi nó đang được liên kết với các kích cỡ sản phẩm.",
      });

    const product = await Product.find({ categoryId: req.params.id });

    if (!product)
      return res.status(400).json({
        message:
          "Không thể xóa danh mục sản phẩm khi nó đang được liên kết với sản phẩm.",
      });

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category)
      return res
        .status(404)
        .json({ error: "Danh mục sản phẩm không tồn tại." });
    chatbotController.deleteEntityCategory(category.name);
    res.status(200).json({ message: "Xóa danh mục sản phẩm thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

export default {
  getAllCategories: getAllCategories,
  getCategoryById: getCategoryById,
  createCategory: createCategory,
  updateCategoryById: updateCategoryById,
  deleteCategoryById: deleteCategoryById,
};
