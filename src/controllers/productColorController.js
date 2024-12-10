import asyncHandler from "../middleware/asyncHandler.js";
import ProductColor from "../models/productColor.js";
import ProductVariant from "../models/productVariant.js";

const getAllProductColors = asyncHandler(async (req, res, next) => {
  try {
    const productColor = await ProductColor.find({});

    if (!productColor)
      return res.status(404).json({ error: "Màu sắc sản phẩm không tồn tại." });

    res.status(200).json({ data: productColor });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const getProductColorById = asyncHandler(async (req, res, next) => {
  try {
    const productColor = await ProductColor.findById(req.params.id);

    if (!productColor)
      return res.status(404).json({ error: "Màu sắc sản phẩm không tồn tại." });

    res.status(200).json({ data: productColor });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const createProductColor = asyncHandler(async (req, res, next) => {
  try {
    const { color } = req.body;

    if (!color) throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");

    const newProductColor = new ProductColor({ color: color });

    await newProductColor.save();
    res.status(201).json({
      message: "Tạo màu sắc sản phẩm thành công!",
      data: newProductColor,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const updateProductColorById = asyncHandler(async (req, res, next) => {
  try {
    const productColor = await ProductColor.findById(req.params.id);

    if (!productColor)
      return res.status(404).json({ error: "Màu sắc sản phẩm không tồn tại." });

    productColor.color = req.body.color || productColor.color;

    await productColor.save();
    res.status(200).json({
      message: "Cập nhật màu sắc sản phẩm thành công!",
      data: productColor,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const deleteProductColorById = asyncHandler(async (req, res, next) => {
  try {
    const productVariant = await ProductVariant.findOne({
      colorId: req.params.id,
    });

    if (!productVariant)
      return res.status(400).json({
        message:
          "Không thể xóa màu sản phẩm khi nó đang được liên kết với các sản phẩm.",
      });

    const productColor = await ProductColor.findByIdAndDelete(req.params.id);

    if (!productColor)
      return res.status(404).json({ error: "Màu sắc sản phẩm không tồn tại." });

    res.status(200).json({ message: "Xóa màu sắc sản phẩm thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

export default {
  getAllProductColors: getAllProductColors,
  getProductColorById: getProductColorById,
  createProductColor: createProductColor,
  updateProductColorById: updateProductColorById,
  deleteProductColorById: deleteProductColorById,
};
