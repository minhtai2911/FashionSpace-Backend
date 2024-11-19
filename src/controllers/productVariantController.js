import asyncHandler from "../middleware/asyncHandler.js";
import ProductVariant from "../models/productVariant.js";

const getProductVariants = asyncHandler(async (req, res, next) => {
  try {
    const productVariants = await ProductVariant.find({});

    if (!productVariants)
      return res.status(404).json({ message: "Product variants not found" });

    res.status(200).json(productVariants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getProductVariantById = asyncHandler(async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.findById(req.params.id);

    if (!productVariant)
      return res.status(404).json({ message: "Product variant not found" });

    res.status(200).json(productVariant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getProductVariantByProductIdColorIdSizeId = asyncHandler(
  async (req, res, next) => {
    try {
      const productVariant = await ProductVariant.findOne({
        productId: req.params.productId,
        colorId: req.params.colorId,
        sizeId: req.params.sizeId,
      });
      if (!productVariant)
        return res.status(404).json({ message: "Product variant not found" });

      res.status(200).json(productVariant);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

const getProductVariantsByProductId = asyncHandler(async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.find({
      productId: req.params.id,
    });

    if (!productVariant)
      return res
        .status(404)
        .json({ message: "Product variant not found for the given product" });
    res.status(200).json(productVariant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createProductVariant = asyncHandler(async (req, res, next) => {
  try {
    const { productId, sizeId, colorId, quantity } = req.body;

    if (!productId || !sizeId || !colorId || !quantity)
      throw new Error("Please fill all required fields");

    const existingProductVariant = await ProductVariant.findOne({
      productId,
      sizeId,
      colorId,
    });
    
    if (existingProductVariant) return res.status(409).json({ message: "Product variant already exists" });

    const newProductVariant = new ProductVariant({
      productId,
      sizeId,
      colorId,
      quantity,
    });

    await newProductVariant.save();
    res.status(201).json(newProductVariant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const updateProductVariantById = asyncHandler(async (req, res, next) => {
  try {
    const updateProductVariant = await ProductVariant.findById(req.params.id);

    if (!updateProductVariant)
      return res.status(404).json({ message: "Product variant not found" });

    updateProductVariant.productId =
      req.body.productId || updateProductVariant.productId;
    updateProductVariant.sizeId =
      req.body.sizeId || updateProductVariant.sizeId;
    updateProductVariant.colorId =
      req.body.colorId || updateProductVariant.colorId;
    updateProductVariant.quantity =
      req.body.quantity || updateProductVariant.quantity;

    await updateProductVariant.save();
    res.status(200).json(updateProductVariant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteProductVariantById = asyncHandler(async (req, res, next) => {
  try {
    const deleteProductVariant = await ProductVariant.findByIdAndDelete(
      req.params.id
    );

    if (!deleteProductVariant)
      return res.status(404).json({ message: "ProductVariant not found" });

    res.status(200).json({ message: "Product variant deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteProductVariantsByProductId = asyncHandler(
  async (req, res, next) => {
    try {
      const deleteProductVariants = await ProductVariant.deleteMany({
        productId: req.params.id,
      });

      if (!deleteProductVariants)
        return res.status(404).json({ message: "ProductVariant not found" });

      res
        .status(200)
        .json({ message: "Product variants deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default {
  getProductVariants: getProductVariants,
  getProductVariantById: getProductVariantById,
  getProductVariantsByProductId: getProductVariantsByProductId,
  createProductVariant: createProductVariant,
  updateProductVariantById: updateProductVariantById,
  deleteProductVariantById: deleteProductVariantById,
  deleteProductVariantsByProductId: deleteProductVariantsByProductId,
  getProductVariantByProductIdColorIdSizeId: getProductVariantByProductIdColorIdSizeId,
};
