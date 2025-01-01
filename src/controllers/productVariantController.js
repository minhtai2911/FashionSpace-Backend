import ProductVariant from "../models/productVariant.js";
import ProductColor from "../models/productColor.js";
import ProductSize from "../models/productSize.js";
import { messages } from "../config/messageHelper.js";

const getProductVariants = async (req, res, next) => {
  try {
    const productVariants = await ProductVariant.find({});

    if (!productVariants) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: productVariants });
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

const getProductVariantByProductIdColorIdSizeId = async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.findOne({
      productId: req.params.productId,
      colorId: req.params.colorId,
      sizeId: req.params.sizeId,
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
    const { productId, sizeId, colorId, quantity } = req.body;

    if (!productId || !sizeId || !colorId || !quantity)
      throw new Error(messages.MSG1);

    const existingProductVariant = await ProductVariant.findOne({
      productId,
      sizeId,
      colorId,
    });

    if (existingProductVariant) {
      const color = await ProductColor.findById(existingProductVariant.colorId);
      if (!color) return res.status(404).json({ error: "Not found" });
      const size = await ProductSize.findById(existingProductVariant.sizeId);
      if (!size) return res.status(404).json({ error: "Not found" });

      return res.status(409).json({
        message: `Sản phẩm với kích cỡ ${size.size} và màu sắc ${color.color} đã tồn tại. Vui lòng kiểm tra lại!`,
      });
    }

    const newProductVariant = new ProductVariant({
      productId,
      sizeId,
      colorId,
      quantity,
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
      req.body.sizeId == updateProductVariant.sizeId &&
      req.body.colorId == updateProductVariant.colorId
    ) {
      check = false;
    }

    updateProductVariant.productId =
      req.body.productId || updateProductVariant.productId;
    updateProductVariant.sizeId =
      req.body.sizeId || updateProductVariant.sizeId;
    updateProductVariant.colorId =
      req.body.colorId || updateProductVariant.colorId;
    updateProductVariant.quantity =
      req.body.quantity || updateProductVariant.quantity;

    const productId = updateProductVariant.productId;
    const sizeId = updateProductVariant.sizeId;
    const colorId = updateProductVariant.colorId;
    const existingProductVariant = await ProductVariant.findOne({
      productId,
      sizeId,
      colorId,
    });

    if (existingProductVariant && check) {
      const color = await ProductColor.findById(existingProductVariant.colorId);
      if (!color) return res.status(404).json({ error: "Not found" });
      const size = await ProductSize.findById(existingProductVariant.sizeId);
      if (!size) return res.status(404).json({ error: "Not found" });

      return res.status(409).json({
        message: `Sản phẩm với kích cỡ ${size.size} và màu sắc ${color.color} đã tồn tại. Vui lòng kiểm tra lại!`,
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

const deleteProductVariantsByProductId = async (req, res, next) => {
  try {
    const deleteProductVariants = await ProductVariant.deleteMany({
      productId: req.params.id,
    });

    if (!deleteProductVariants)
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
  getProductVariants: getProductVariants,
  getProductVariantById: getProductVariantById,
  getProductVariantsByProductId: getProductVariantsByProductId,
  createProductVariant: createProductVariant,
  updateProductVariantById: updateProductVariantById,
  deleteProductVariantById: deleteProductVariantById,
  deleteProductVariantsByProductId: deleteProductVariantsByProductId,
  getProductVariantByProductIdColorIdSizeId:
    getProductVariantByProductIdColorIdSizeId,
};
