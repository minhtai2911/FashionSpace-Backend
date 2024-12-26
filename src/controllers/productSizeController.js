import ProductSize from "../models/productSize.js";
import ProductVariant from "../models/productVariant.js";
import { messages } from "../config/messageHelper.js";

const getAllProductSizes = async (req, res, next) => {
  try {
    const productSize = await ProductSize.find({});

    res.status(200).json({ data: productSize });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getProductSizeById = async (req, res, next) => {
  try {
    const productSize = await ProductSize.findById(req.params.id);

    if (!productSize)
      return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: productSize });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getProductSizesByCategoryId = async (req, res, next) => {
  try {
    const productSizes = await ProductSize.find({ categoryId: req.params.id });

    res.status(200).json({ data: productSizes });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createProductSize = async (req, res, next) => {
  try {
    const { categoryId, size } = req.body;

    if (!size || !categoryId)
      throw new Error(messages.MSG1);

    const existingProductSize = await ProductSize.findOne({
      categoryId: categoryId,
      size: size,
    });

    if (existingProductSize.length !== 0) {
      return res.status(409).json({ message: messages.MSG54 });
    }

    const productSize = new ProductSize({ categoryId: categoryId, size: size });

    await productSize.save();
    res.status(201).json({
      message: messages.MSG36,
      data: productSize,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateProductSizeById = async (req, res, next) => {
  try {
    const productSize = await ProductSize.findById(req.params.id);

    if (!productSize)
      return res.status(404).json({ error: "Not found" });

    const { categoryId, size } = req.body;

    const existingProductSize = await ProductSize.findOne({
      categoryId: categoryId,
      size: size,
    });

    if (existingProductSize.length !== 0) {
      return res.status(409).json({ message: messages.MSG54 });
    }

    productSize.categoryId = categoryId || productSize.categoryId;
    productSize.size = size || productSize.size;

    await productSize.save();
    res
      .status(200)
      .json({
        message: messages.MSG39,
        data: productSize,
      });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const deleteProductSizeById = async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.findOne({
      sizeId: req.params.id,
    });

    if (productVariant)
      return res.status(400).json({
        message:
          messages.MSG37,
      });

    const productSize = await ProductSize.findByIdAndDelete(req.params.id);

    if (!productSize)
      return res.status(404).json({ error: "Not found" });

    res.status(200).json({ message: messages.MSG38 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  getAllProductSizes: getAllProductSizes,
  getProductSizeById: getProductSizeById,
  createProductSize: createProductSize,
  updateProductSizeById: updateProductSizeById,
  deleteProductSizeById: deleteProductSizeById,
  getProductSizesByCategoryId: getProductSizesByCategoryId,
};
