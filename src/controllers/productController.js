import Product from "../models/product.js";

const getAllProducts = async (req, res, next) => {
  try {
    const query = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    if (req.query.isActive) query.isActive = req.query.isActive;
    if (req.query.minPrice) query.price = { $gte: req.query.minPrice };
    if (req.query.maxPrice)
      query.price = { ...query.price, $lte: req.query.maxPrice };
    if (req.query.search) query.name = new RegExp(req.query.search, "i");
    const totalCount = await Product.countDocuments(query);
    if (req.query.sortName) {
      const products = await Product.find(query)
        .sort({ name: req.query.sortName })
        .skip(startIndex)
        .limit(limit)
        .exec();

      if (!products)
        return res.status(404).json({ error: "Sản phẩm không tồn tại." });

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
        .skip(startIndex)
        .limit(limit)
        .exec();

      if (!products)
        return res.status(404).json({ error: "Sản phẩm không tồn tại." });

      return res.status(200).json({
        meta: {
          totalCount: totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
        },
        data: products,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, categoryId, price } = req.body;

    if (!name || !categoryId || !price) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
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
      .json({ message: "Thêm sản phẩm thành công!", data: newProduct });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ error: "Sản phẩm không tồn tại." });

    res.status(200).json({ data: product });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const updateProductById = async (req, res, next) => {
  try {
    const updateProduct = await Product.findById(req.params.id);

    if (!updateProduct)
      return res.status(404).json({ error: "Sản phẩm không tồn tại." });

    const { name, description, categoryId, price } = req.body;

    updateProduct.name = name || updateProduct.name;
    updateProduct.description = description || updateProduct.description;
    updateProduct.categoryId = categoryId || updateProduct.categoryId;
    updateProduct.price = price || updateProduct.price;

    await updateProduct.save();
    res
      .status(200)
      .json({ message: "Chỉnh sửa sản phẩm thành công!", data: updateProduct });
  } catch {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const updateStatusProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ error: "Sản phẩm không tồn tại." });

    product.isActive = !product.isActive;

    await product.save();
    if (product.isActive)
      res.status(200).json({ message: "Khôi phục sản phẩm thành công!" });
    else res.status(200).json({ message: "Lưu trữ sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const getBestSellerProduct = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isActive) query.isActive = req.query.isActive;
    const products = await Product.find({ soldQuantity: { $gt: 0 } }, query)
      .sort({
        soldQuantity: -1,
      })
      .limit(10);
    res.status(200).json({ data: products });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
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
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
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
