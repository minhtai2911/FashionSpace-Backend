import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/product.js";

const getAllProducts = asyncHandler(async (req, res, next) => {
  try {
    const product = await Product.find({});

    if (!product)
      return res.status(404).json({ message: "Products not found" });

    return res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createProduct = asyncHandler(async (req, res, next) => {
  try {
    const { name, description, categoryId, price, rating } = req.body;

    if (!name || !description || !categoryId || !price || !rating) {
      throw new Error("Please fill all required fields");
    }

    const newProduct = new Product({
      name,
      description,
      categoryId,
      price,
      rating,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getProductById = asyncHandler(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const updateProductById = asyncHandler(async (req, res, next) => {
  try {
    const updateProduct = await Product.findById(req.params.id);

    if (!updateProduct)
      return res.status(404).json({ message: "Product not found" });

    const { name, description, categoryId, price, rating } = req.body;

    updateProduct.name = name || updateProduct.name;
    updateProduct.description = description || updateProduct.description;
    updateProduct.categoryId = categoryId || updateProduct.categoryId;
    updateProduct.price = price || updateProduct.price;
    updateProduct.rating = rating || updateProduct.rating;

    await updateProduct.save();
    res.status(200).json(updateProduct);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

const deleteProductById = asyncHandler(async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllProducts: getAllProducts,
  createProduct: createProduct,
  getProductById: getProductById,
  updateProductById: updateProductById,
  deleteProductById: deleteProductById,
};
