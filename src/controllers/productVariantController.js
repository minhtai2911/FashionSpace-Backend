import ProductVariant from "../models/productVariant.js";
import { messages } from "../config/messageHelper.js";
import invalidateCache from "../utils/changeCache.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const getProductVariantById = asyncHandler(async (req, res, next) => {
  const cacheKey = `productVariant:${req.params.id}`;
  const cachedProductVariant = await req.redisClient.get(cacheKey);

  if (cachedProductVariant) {
    return res.status(200).json(JSON.parse(cachedProductVariant));
  }

  const productVariant = await ProductVariant.findById(req.params.id);

  if (!productVariant) return res.status(404).json({ error: "Not found" });

  await req.redisClient.setex(cacheKey, 3600, JSON.stringify(productVariant));
  res.status(200).json({ data: productVariant });
});

const getProductVariantByProductInfo = asyncHandler(async (req, res, next) => {
  const query = {};

  if (req.query.productId) query.productId = req.query.productId;
  else throw new Error(messages.MSG1);
  if (req.query.color) query.color = req.query.color;
  else throw new Error(messages.MSG1);
  if (req.query.size) query.size = req.query.size;
  else throw new Error(messages.MSG1);

  const cacheKey = `productVariant:${query.productId}:${query.color}:${query.size}`;
  const cachedProductVariant = await req.redisClient.get(cacheKey);

  if (cachedProductVariant) {
    return res.status(200).json(JSON.parse(cachedProductVariant));
  }
  const productVariant = await ProductVariant.findOne(query);

  if (!productVariant) return res.status(404).json({ error: "Not found" });

  await req.redisClient.setex(cacheKey, 3600, JSON.stringify(productVariant));
  res.status(200).json({ data: productVariant });
});

const getProductVariantsByProductId = asyncHandler(async (req, res, next) => {
  const cacheKey = `productVariants:${req.params.id}`;
  const cachedProductVariants = await req.redisClient.get(cacheKey);

  if (cachedProductVariants) {
    return res.status(200).json(JSON.parse(cachedProductVariants));
  }

  const productVariants = await ProductVariant.find({
    productId: req.params.id,
  });

  await req.redisClient.setex(cacheKey, 3600, JSON.stringify(productVariants));
  res.status(200).json({ data: productVariants });
});

const createProductVariant = asyncHandler(async (req, res, next) => {
  const { productId, size, color, stock } = req.body;

  if (!productId || !size || !color || !stock) throw new Error(messages.MSG1);

  const existingProductVariant = await ProductVariant.findOne({
    productId,
    size,
    color,
  });

  if (existingProductVariant) {
    return res.status(409).json({
      message: messages.MSG57,
    });
  }

  const newProductVariant = new ProductVariant({
    productId,
    size,
    color,
    stock,
  });

  await newProductVariant.save();
  invalidateCache(
    req,
    "productVariant",
    "productVariants",
    newProductVariant._id.toString()
  );
  res.status(201).json({ data: newProductVariant });
});

const updateProductVariantById = asyncHandler(async (req, res, next) => {
  const updateProductVariant = await ProductVariant.findById(req.params.id);

  if (!updateProductVariant)
    return res.status(404).json({ error: "Not found" });

  let check = true;

  if (
    req.body.productId == updateProductVariant.productId &&
    req.body.size == updateProductVariant.size &&
    req.body.color == updateProductVariant.color
  ) {
    check = false;
  }

  updateProductVariant.productId =
    req.body.productId || updateProductVariant.productId;
  updateProductVariant.size = req.body.size || updateProductVariant.size;
  updateProductVariant.color = req.body.color || updateProductVariant.color;
  updateProductVariant.stock = req.body.stock || updateProductVariant.stock;

  const productId = updateProductVariant.productId;
  const size = updateProductVariant.size;
  const color = updateProductVariant.color;
  const existingProductVariant = await ProductVariant.findOne({
    productId,
    size,
    color,
  });

  if (existingProductVariant && check) {
    return res.status(409).json({
      message: messages.MSG57,
    });
  }

  await updateProductVariant.save();
  invalidateCache(
    req,
    "productVariant",
    "productVariants",
    updateProductVariant._id.toString()
  );
  res.status(200).json({ data: updateProductVariant });
});

const deleteProductVariantById = asyncHandler(async (req, res, next) => {
  const deleteProductVariant = await ProductVariant.findByIdAndDelete(
    req.params.id
  );

  if (!deleteProductVariant)
    return res.status(404).json({ error: "Not found" });
  invalidateCache(req, "productVariant", "productVariants", req.params.id);
  res.status(200).json();
});

export default {
  getProductVariantById: getProductVariantById,
  getProductVariantsByProductId: getProductVariantsByProductId,
  createProductVariant: createProductVariant,
  updateProductVariantById: updateProductVariantById,
  deleteProductVariantById: deleteProductVariantById,
  getProductVariantByProductInfo: getProductVariantByProductInfo,
};
