import ProductColor from "../models/productColor.js";
import ProductVariant from "../models/productVariant.js";
import { messages } from "../config/messageHelper.js";

const getAllProductColors = async (req, res, next) => {
  try {
    const productColor = await ProductColor.find({});

    if (!productColor) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: productColor });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getProductColorById = async (req, res, next) => {
  try {
    const productColor = await ProductColor.findById(req.params.id);

    if (!productColor) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: productColor });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createProductColor = async (req, res, next) => {
  try {
    const { color } = req.body;

    if (!color) throw new Error(messages.MSG1);

    const existingProductColor = await ProductColor.findOne({ color: color });
    if (existingProductColor.length !== 0) {
      return res.status(409).json({ message: messages.MSG55 });
    }

    const newProductColor = new ProductColor({ color: color });

    await newProductColor.save();
    res.status(201).json({
      message: messages.MSG40,
      data: newProductColor,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateProductColorById = async (req, res, next) => {
  try {
    const productColor = await ProductColor.findById(req.params.id);

    if (!productColor) return res.status(404).json({ error: "Not found" });

    productColor.color = req.body.color || productColor.color;

    const existingProductColor = await ProductColor.findOne({ color: req.body.color });
    if (existingProductColor.length !== 0) {
      return res.status(409).json({ message: messages.MSG55 });
    }

    await productColor.save();
    res.status(200).json({
      message: messages.MSG43,
      data: productColor,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const deleteProductColorById = async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.findOne({
      colorId: req.params.id,
    });

    if (productVariant)
      return res.status(400).json({
        message: messages.MSG41,
      });

    const productColor = await ProductColor.findByIdAndDelete(req.params.id);

    if (!productColor) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ message: messages.MSG42 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  getAllProductColors: getAllProductColors,
  getProductColorById: getProductColorById,
  createProductColor: createProductColor,
  updateProductColorById: updateProductColorById,
  deleteProductColorById: deleteProductColorById,
};
