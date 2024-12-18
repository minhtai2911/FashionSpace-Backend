import ProductSize from "../models/productSize.js";
import ProductVariant from "../models/productVariant.js";

const getAllProductSizes = async (req, res, next) => {
  try {
    const productSize = await ProductSize.find({});

    res.status(200).json({ data: productSize });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const getProductSizeById = async (req, res, next) => {
  try {
    const productSize = await ProductSize.findById(req.params.id);

    if (!productSize)
      return res.status(404).json({ error: "Kích cỡ sản phẩm không tồn tại." });

    res.status(200).json({ data: productSize });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const getProductSizesByCategoryId = async (req, res, next) => {
  try {
    const productSizes = await ProductSize.find({ categoryId: req.params.id });

    res.status(200).json({ data: productSizes });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const createProductSize = async (req, res, next) => {
  try {
    const { categoryId, size } = req.body;

    if (!size || !categoryId)
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");

    const productSize = new ProductSize({ categoryId: categoryId, size: size });

    await productSize.save();
    res.status(201).json({
      message: "Thêm kích cỡ sản phẩm thành công!",
      data: productSize,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const updateProductSizeById = async (req, res, next) => {
  try {
    const productSize = await ProductSize.findById(req.params.id);

    if (!productSize)
      return res.status(404).json({ error: "Kích cỡ sản phẩm không tồn tại." });

    const { categoryId, size } = req.body;

    productSize.categoryId = categoryId || productSize.categoryId;
    productSize.size = size || productSize.size;

    await productSize.save();
    res
      .status(200)
      .json({
        message: "Chỉnh sửa kích cỡ sản phẩm thành công!",
        data: productSize,
      });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const deleteProductSizeById = async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.findOne({
      sizeId: req.params.id,
    });

    if (!productVariant)
      return res.status(400).json({
        message:
          "Không thể xóa kích cỡ sản phẩm khi nó đang được liên kết với các sản phẩm.",
      });

    const productSize = await ProductSize.findByIdAndDelete(req.params.id);

    if (!productSize)
      return res.status(404).json({ error: "Kích cỡ sản phẩm không tồn tại." });

    res.status(200).json({ message: "Xóa kích cỡ sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

export default {
  getAllProductSizes: getAllProductSizes,
  getProductSizeById: getProductSizeById,
  createProductSize: createProductSize,
  updateProductSizeById: updateProductSizeById,
  deleteProductSizeById: deleteProductSizeById,
  getProductSizesByCategoryId: getProductSizesByCategoryId,
};
