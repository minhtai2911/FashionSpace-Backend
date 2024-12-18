import ShoppingCart from "../models/shoppingCart.js";

const getAllShoppingCarts = async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.find({});

    if (!shoppingCart)
      return res.status(404).json({ error: "Giỏ hàng không tồn tại." });

    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const getShoppingCartById = async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.findById(req.params.id);
    if (!shoppingCart)
      return res.status(404).json({ error: "Giỏ hàng không tồn tại." });
    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const getShoppingCartByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const shoppingCart = await ShoppingCart.find({ userId: userId });
    if (!shoppingCart)
      return res.status(404).json({ error: "Giỏ hàng không tồn tại." });
    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const getShoppingCartByUserIdProductVariantId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productVariantId = req.params.productVariantId;
    const shoppingCart = await ShoppingCart.findOne({
      userId,
      productVariantId,
    });

    if (!shoppingCart)
      return res.status(404).json({ error: "Giỏ hàng không tồn tại." });

    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};
const createShoppingCart = async (req, res, next) => {
  try {
    const { productVariantId, quantity } = req.body;
    const userId = req.user.id;

    if (!userId || !productVariantId || !quantity) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }

    const existingShoppingCart = await ShoppingCart.findOne({
      userId,
      productVariantId,
    });

    if (existingShoppingCart) {
      existingShoppingCart.quantity += quantity;
      await existingShoppingCart.save();
      return res.status(200).json({
        message: "Sản phẩm đã được thêm vào giỏ hàng!",
        data: existingShoppingCart,
      });
    }

    const newShoppingCart = new ShoppingCart({
      userId,
      productVariantId,
      quantity,
    });

    await newShoppingCart.save();
    res.status(201).json({
      message: "Sản phẩm đã được thêm vào giỏ hàng!",
      data: newShoppingCart,
    });
  } catch {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const updateShoppingCartQuantityById = async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.findById(req.params.id);

    if (!shoppingCart)
      return res.status(404).json({ error: "Giỏ hàng không tồn tại" });

    shoppingCart.quantity = req.body.quantity || shoppingCart.quantity;
    await shoppingCart.save();
    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const deleteShoppingCartById = async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.findByIdAndDelete(req.params.id);

    if (!shoppingCart)
      res.status(404).json({ error: "Giỏ hàng không tồn tại" });

    res.status(200).json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng!" });
  } catch {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

export default {
  getAllShoppingCarts: getAllShoppingCarts,
  getShoppingCartById: getShoppingCartById,
  getShoppingCartByUserId: getShoppingCartByUserId,
  createShoppingCart: createShoppingCart,
  updateShoppingCartQuantityById: updateShoppingCartQuantityById,
  deleteShoppingCartById: deleteShoppingCartById,
  getShoppingCartByUserIdProductVariantId:
    getShoppingCartByUserIdProductVariantId,
};
