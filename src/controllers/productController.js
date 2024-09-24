import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/product.js";

const getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({});

  if (!products) return res.status(404).json({ message: "Products not found" });

  return res.status(200).json(products);
});

const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, category_id, price, rating } = req.body;

  if (!name || !description || !category_id || !price || !rating) {
    throw new Error("Please fill all required fields");
  }

  const newProduct = new Product({
    name,
    description,
    category_id,
    price,
    rating,
  });

  try {
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    throw new Error("Invalid new product");
  }
});

const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  res.status(200).json(product);
});

const updateProductById = asyncHandler(async (req, res, next) => {
  const updateProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updateProduct) return res.status(404).json({ message: "Product not found" });

  res.status(200).json(updateProduct);
});

const deleteProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  res.status(200).json({ message: "Product deleted successfully" });
});

export default {
  getAllProducts: getAllProducts,
  createProduct: createProduct,
  getProductById: getProductById,
  updateProductById: updateProductById,
  deleteProductById: deleteProductById,
};
