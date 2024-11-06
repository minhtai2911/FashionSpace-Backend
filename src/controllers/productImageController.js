import asyncHandler from "../middleware/asyncHandler.js";
import ProductImage from "../models/productImage.js";

const getAllProductImagesByProductId = asyncHandler(async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const productImages = await ProductImage.find({ productId });
    res.status(200).json(productImages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getProductImageById = asyncHandler(async (req, res, next) => {
  try {
    const productImageId = req.params.id;
    const productImage = await ProductImage.findById(productImageId);

    if (!productImage)
      return res.status(404).json({ message: "Product image not found" });

    res.status(200).json(productImage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createProductImage = asyncHandler(async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const imagePath = req.body.imagePath;

    if (!productId || !imagePath)
      throw new Error("Please fill all required fields");
    const newProductImage = new ProductImage({ productId, imagePath });

    await newProductImage.save();
    res.status(201).json(newProductImage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const updateProductImageById = asyncHandler(async (req, res, next) => {
  try {
    const updateProductImage = await ProductImage.findById(req.params.id);

    if (!updateProductImage)
      return res.status(404).json({ message: "Product image not found" });

    const { productId, imagePath } = req.body;

    updateProductImage.productId = productId || updateProductImage.productId;
    updateProductImage.imagePath = imagePath || updateProductImage.imagePath;

    await updateProductImage.save();
    res.status(200).json(updateProductImage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteProductImageById = asyncHandler(async (req, res, next) => {
  try {
    const deleteProductImage = await ProductImage.findByIdAndDelete(
      req.params.id
    );

    if (!deleteProductImage)
      return res.status(404).json({ message: "Product image not found" });

    res.status(200).json({ message: "Product image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllProductImagesByProductId: getAllProductImagesByProductId,
  getProductImageById: getProductImageById,
  createProductImage: createProductImage,
  updateProductImageById: updateProductImageById,
  deleteProductImageById: deleteProductImageById,
};
