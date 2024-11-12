import asyncHandler from "../middleware/asyncHandler.js";
import ShoppingCart from "../models/shoppingCart.js";

const getAllShoppingCarts = asyncHandler(async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.find({});
    if (!shoppingCart)
      return res.status(404).json({ message: "No shopping cart found" });
    res.status(200).json(shoppingCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getShoppingCartById = asyncHandler(async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.findById(req.params.id);
    if (!shoppingCart)
      return res.status(404).json({ message: "Shopping cart not found" });
    res.status(200).json(shoppingCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getShoppingCartByUserId = asyncHandler(async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.find({ userId: req.params.id });
    if (!shoppingCart)
      return res.status(404).json({ message: "Shopping cart not found" });
    res.status(200).json(shoppingCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createShoppingCart = asyncHandler(async (req, res, next) => {
  try {
    const { userId, productVariantId, quantity } = req.body;

    // if (!userId ||!productVariantId ||!quantity) {
    //   throw new Error("Please fill in all required fields");
    // }

    // const existingShoppingCart = await ShoppingCart.findOne({
    //   userId,
    //   productVariantId,
    // });

    // if (existingShoppingCart) {
    //   existingShoppingCart.quantity += quantity;
    //   await existingShoppingCart.save();
    //   return res.status(200).json(existingShoppingCart);
    // }

    const newShoppingCart = new ShoppingCart({
      userId,
      productVariantId,
      quantity,
    });

    await newShoppingCart.save();
    res.status(201).json(newShoppingCart);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

const updateShoppingCartQuantityById = asyncHandler(async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.findById(req.params.id);

    if (!shoppingCart)
      return res.status(404).json({ message: "Shopping cart not found" });

    shoppingCart.quantity = req.body.quantity || shoppingCart.quantity;
    await shoppingCart.save();
    res.status(200).json(shoppingCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteShoppingCartById = asyncHandler(async (req, res, next) => {
  try {
    const shoppingCart = await ShoppingCart.findByIdAndDelete(req.params.id);

    if (!shoppingCart)
      res.status(404).json({ message: "Couldn't find shopping cart" });

    res.status(200).json({ message: "Shopping cart deleted successfully" });
  } catch {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllShoppingCarts: getAllShoppingCarts,
  getShoppingCartById: getShoppingCartById,
  getShoppingCartByUserId: getShoppingCartByUserId,
  createShoppingCart: createShoppingCart,
  updateShoppingCartQuantityById: updateShoppingCartQuantityById,
  deleteShoppingCartById: deleteShoppingCartById,
};
