import ProductVariant from "../models/productVariant.js";
import { messages } from "../config/messageHelper.js";

const getAllProductVariants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await ProductVariant.countDocuments();
    const productVariants = await ProductVariant.find({})
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      meta: {
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
      data: productVariants,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getProductVariantById = async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.findById(req.params.id);

    if (!productVariant) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: productVariant });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getProductVariantByProductInfo = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.productId) query.productId = req.query.productId;
    else throw new Error(messages.MSG1);
    if (req.query.color) query.color = req.query.color;
    else throw new Error(messages.MSG1);
    if (req.query.size) query.size = req.query.size;
    else throw new Error(messages.MSG1);

    const productVariant = await ProductVariant.findOne(query);

    if (!productVariant) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: productVariant });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getProductVariantsByProductId = async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.find({
      productId: req.params.id,
    });

    if (!productVariant) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ data: productVariant });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createProductVariant = async (req, res, next) => {
  try {
    const { productId, size, color, stock } = req.body;

    if (!productId || !size || !color || !stock) throw new Error(messages.MSG1);

    const existingProductVariant = await ProductVariant.findOne({
      productId,
      size,
      color,
    });

    if (existingProductVariant) {
      return res.status(409).json({
        message: messages.MSG57,
      });
    }

    const newProductVariant = new ProductVariant({
      productId,
      size,
      color,
      stock,
    });

    await newProductVariant.save();
    res.status(201).json({ data: newProductVariant });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateProductVariantById = async (req, res, next) => {
  try {
    const updateProductVariant = await ProductVariant.findById(req.params.id);

    if (!updateProductVariant)
      return res.status(404).json({ error: "Not found" });

    let check = true;

    if (
      req.body.productId == updateProductVariant.productId &&
      req.body.size == updateProductVariant.size &&
      req.body.color == updateProductVariant.color
    ) {
      check = false;
    }

    updateProductVariant.productId =
      req.body.productId || updateProductVariant.productId;
    updateProductVariant.size = req.body.size || updateProductVariant.size;
    updateProductVariant.color = req.body.color || updateProductVariant.color;
    updateProductVariant.stock =
      req.body.stock || updateProductVariant.stock;

    const productId = updateProductVariant.productId;
    const size = updateProductVariant.size;
    const color = updateProductVariant.color;
    const existingProductVariant = await ProductVariant.findOne({
      productId,
      size,
      color,
    });

    if (existingProductVariant && check) {
      return res.status(409).json({
        message: messages.MSG57,
      });
    }

    await updateProductVariant.save();
    res.status(200).json({ data: updateProductVariant });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const deleteProductVariantById = async (req, res, next) => {
  try {
    const deleteProductVariant = await ProductVariant.findByIdAndDelete(
      req.params.id
    );

    if (!deleteProductVariant)
      return res.status(404).json({ error: "Not found" });

    res.status(200).json();
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  getAllProductVariants: getAllProductVariants,
  getProductVariantById: getProductVariantById,
  getProductVariantsByProductId: getProductVariantsByProductId,
  createProductVariant: createProductVariant,
  updateProductVariantById: updateProductVariantById,
  deleteProductVariantById: deleteProductVariantById,
  getProductVariantByProductInfo: getProductVariantByProductInfo,
};
