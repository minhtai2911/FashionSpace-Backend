import ShoppingCart from "../models/shoppingCart.js";

const getAllShoppingCarts = async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.find({});

    if (!shoppingCart) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getShoppingCartById = async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.findById(req.params.id);
    if (!shoppingCart) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getShoppingCartByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const shoppingCart = await ShoppingCart.find({ userId: userId });
    if (!shoppingCart) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
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

    if (!shoppingCart) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};
const createShoppingCart = async (req, res, next) => {
  try {
    const { productVariantId, quantity } = req.body;
    const userId = req.user.id;

    if (!userId || !productVariantId || !quantity) {
      throw new Error(messages.MSG1);
    }

    const existingShoppingCart = await ShoppingCart.findOne({
      userId,
      productVariantId,
    });

    if (existingShoppingCart) {
      existingShoppingCart.quantity += quantity;
      await existingShoppingCart.save();
      return res.status(200).json({
        message: messages.MSG47,
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
      message: messages.MSG47,
      data: newShoppingCart,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateShoppingCartQuantityById = async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.findById(req.params.id);

    if (!shoppingCart) return res.status(404).json({ error: "Not found" });

    shoppingCart.quantity = req.body.quantity || shoppingCart.quantity;
    await shoppingCart.save();
    res.status(200).json({ data: shoppingCart });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const deleteShoppingCartById = async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.findByIdAndDelete(req.params.id);

    if (!shoppingCart) res.status(404).json({ error: "Not found" });

    res.status(200).json({ message: messages.MSG18 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
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
