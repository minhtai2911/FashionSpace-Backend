import ProductView from "../models/productView.js";
import { messages } from "../config/messageHelper.js";

const createProductView = async (req, res, next) => {
  try {
    if (!req.body.productId) {
      return res.status(400).json({ error: "productId is required!" });
    }

    const existsProductView = await ProductView.findOne({
      productId: req.body.productId,
      userId: req.user.id,
    });

    if (existsProductView) {
      return res.status(400).json({
        error: "ProductView already exists",
      });
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
      message: messages.MSG5,
    });
  }
};

export default {
  createProductView: createProductView,
};
