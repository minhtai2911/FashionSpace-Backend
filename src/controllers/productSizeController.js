import asyncHandler from "../middleware/asyncHandler.js";
import ProductSize from "../models/productSize.js";

const getAllProductSizes = asyncHandler(async (req, res, next) => {
  try {
    const productSize = await ProductSize.find({});

    if (!productSize)
      return res.status(404).json({ message: "Product sizes not found" });

    res.status(200).json(productSize);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getProductSizeById = asyncHandler(async (req, res, next) => {
  try {
    const productSize = await ProductSize.findById(req.params.id);

    if (!productSize)
      return res.status(404).json({ message: "Product size not found" });

    res.status(200).json(productSize);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getProductSizesByCategoryId = asyncHandler(async (req, res, next) => {
  try {
    const productSizes = await ProductSize.find({ categoryId: req.params.id });
    if (!productSizes)
      res.status(404).json({ message: "Product size not found" });
    res.status(200).json(productSizes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createProductSize = asyncHandler(async (req, res, next) => {
  try {
    const { categoryId, size } = req.body;

    if (!size || !categoryId)
      throw new Error("Please fill all required fields");

    const productSize = new ProductSize({ categoryId: categoryId, size: size });

    await productSize.save();
    res.status(201).json(productSize);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const updateProductSizeById = asyncHandler(async (req, res, next) => {
  try {
    const productSize = await ProductSize.findById(req.params.id);

    if (!productSize)
      return res.status(404).json({ message: "Product size not found" });

    const { categoryId, size } = req.body;

    productSize.categoryId = categoryId || productSize.categoryId;
    productSize.size = size || productSize.size;

    await productSize.save();
    res.status(200).json(productSize);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteProductSizeById = asyncHandler(async (req, res, next) => {
  try {
    const productSize = await ProductSize.findByIdAndDelete(req.params.id);

    if (!productSize)
      return res.status(404).json({ message: "Product size not found" });

    res.status(200).json({ message: "Product size deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllProductSizes: getAllProductSizes,
  getProductSizeById: getProductSizeById,
  createProductSize: createProductSize,
  updateProductSizeById: updateProductSizeById,
  deleteProductSizeById: deleteProductSizeById,
  getProductSizesByCategoryId: getProductSizesByCategoryId,
};
