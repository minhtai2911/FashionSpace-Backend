import Product from "../models/product.js";
import { messages } from "../config/messageHelper.js";

const getAllProducts = async (req, res, next) => {
  try {
    const query = {};
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const startIndex = (page - 1) * limit;

    if (req.query.isActive) query.isActive = req.query.isActive;
    if (req.query.minPrice) query.price = { $gte: req.query.minPrice };
    if (req.query.maxPrice)
      query.price = { ...query.price, $lte: req.query.maxPrice };
    if (req.query.search) query.name = new RegExp(req.query.search, "i");
    const totalCount = await Product.countDocuments(query);
    if (req.query.sortName) {
      const products = await Product.find(query)
        .sort({ name: req.query.sortName })
        // .skip(startIndex)
        // .limit(limit)
        // .exec();

      if (!products)
        return res.status(404).json({ error: "Not found" });

      return res.status(200).json({
        meta: {
          totalCount: totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
        },
        data: products,
      });
    } else {
      const products = await Product.find(query)
        // .skip(startIndex)
        // .limit(limit)
        // .exec();

      if (!products)
        return res.status(404).json({ error: "Not found" });

      return res.status(200).json({
        // meta: {
        //   totalCount: totalCount,
        //   currentPage: page,
        //   totalPages: Math.ceil(totalCount / limit),
        // },
        data: products,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, categoryId, price } = req.body;

    if (!name || !categoryId || !price) {
      throw new Error(messages.MSG1);
    }

    const newProduct = new Product({
      name,
      description,
      categoryId,
      price,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: messages.MSG32, data: newProduct });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: product });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateProductById = async (req, res, next) => {
  try {
    const updateProduct = await Product.findById(req.params.id);

    if (!updateProduct)
      return res.status(404).json({ error: "Not found" });

    const { name, description, categoryId, price } = req.body;

    updateProduct.name = name || updateProduct.name;
    updateProduct.description = description || updateProduct.description;
    updateProduct.categoryId = categoryId || updateProduct.categoryId;
    updateProduct.price = price || updateProduct.price;

    await updateProduct.save();
    res
      .status(200)
      .json({ message: messages.MSG33, data: updateProduct });
  } catch {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateStatusProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ error: "Not found" });

    product.isActive = !product.isActive;

    await product.save();
    if (product.isActive)
      res.status(200);
    else res.status(200).json({ message: messages.MSG35 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getBestSellerProduct = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isActive) query.isActive = req.query.isActive;
    const products = await Product.find({ soldQuantity: { $gt: 0 }, ...query })
      .sort({
        soldQuantity: -1,
      })
      .limit(10);
    res.status(200).json({ data: products });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getNewArrivalProduct = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isActive) query.isActive = req.query.isActive;
    const products = await Product.find(query).sort({ createdAt: -1 }).limit(10);
    res.status(200).json({ data: products });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  getAllProducts: getAllProducts,
  createProduct: createProduct,
  getProductById: getProductById,
  updateProductById: updateProductById,
  updateStatusProductById: updateStatusProductById,
  getBestSellerProduct: getBestSellerProduct,
  getNewArrivalProduct: getNewArrivalProduct,
};
