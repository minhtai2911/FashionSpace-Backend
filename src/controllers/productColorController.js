import asyncHandler from "../middleware/asyncHandler.js";
import ProductColor from "../models/productColor.js";
import ProductVariant from "../models/productVariant.js";

const getAllProductColors = asyncHandler(async (req, res, next) => {
  try {
    const productColor = await ProductColor.find({});

    if (!productColor)
      return res.status(404).json({ message: "Product colors not found" });

    res.status(200).json(productColor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getProductColorById = asyncHandler(async (req, res, next) => {
  try {
    const productColor = await ProductColor.findById(req.params.id);

    if (!productColor)
      return res.status(404).json({ message: "Product color not found" });

    res.status(200).json(productColor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createProductColor = asyncHandler(async (req, res, next) => {
  try {
    const { color } = req.body;

    if (!color) throw new Error("Please fill all required fields");

    const newProductColor = new ProductColor({ color: color });

    await newProductColor.save();
    res.status(201).json(newProductColor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const updateProductColorById = asyncHandler(async (req, res, next) => {
  try {
    const productColor = await ProductColor.findById(req.params.id);

    if (!productColor)
      return res.status(404).json({ message: "Product color not found" });

    productColor.color = req.body.color || productColor.color;

    await productColor.save();
    res.status(200).json(productColor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteProductColorById = asyncHandler(async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.findOne({
      colorId: req.params.id,
    });

    if (!productVariant)
      return res
        .status(400)
        .json({
          message:
            "Cannot delete product color while it is associated with product variants",
        });

    const productColor = await ProductColor.findByIdAndDelete(req.params.id);

    if (!productColor)
      return res.status(404).json({ message: "Product color not found" });

    res.status(200).json({ message: "Product color deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllProductColors: getAllProductColors,
  getProductColorById: getProductColorById,
  createProductColor: createProductColor,
  updateProductColorById: updateProductColorById,
  deleteProductColorById: deleteProductColorById,
};
