import ProductView from "../models/productView.js";

const createProductView = async (req, res, next) => {
  try {
    if (!req.body.productId) {
      return res.status(400).json({ message: "productId is required!" });
    }

    const productView = new ProductView({
      productId: req.body.productId,
      userId: req.user.id,
    });
    
    await productView.save();
    res.status(201).json({
      data: productView,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

export default {
  createProductView: createProductView,
};
