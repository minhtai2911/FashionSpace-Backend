import asyncHandler from "../middleware/asyncHandler.js";
import ProductImage from "../models/productImage.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const getAllProductImagesByProductId = asyncHandler(async (req, res, next) => {
  try {
    const productId = req.params.id;
    const productImages = await ProductImage.find({ productId });
    res.status(200).json(productImages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getProductImageById = asyncHandler(async (req, res, next) => {
  try {
    const productImageId = req.params.id;
    const productImage = await ProductImage.findById(productImageId);

    if (!productImage)
      return res.status(404).json({ message: "Product image not found" });

    res.status(200).json(productImage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createProductImage = asyncHandler(async (req, res, next) => {
  try {
    const productId = req.body.productId;
    let newProductImages = [];
    for (let i = 0; i < req.files.length; i++) {
      let imagePath = req.files[i].path;
      const start = imagePath.indexOf("\\products\\");
      imagePath = imagePath.slice(start);
      imagePath = path.join(process.env.URL_SERVER, imagePath);
      if (!productId || !imagePath)
        throw new Error("Please fill all required fields");
      const newProductImage = new ProductImage({ productId, imagePath });
      newProductImages.push(newProductImage);
      await newProductImage.save();
    }
    res.status(201).json(newProductImages);
  } catch (err) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    for (let i = 0; i < req.files.length; i++) {
      fs.unlinkSync(path.join(__dirname, "../..", req.files[i].path));
    }
    res.status(500).json({ message: err.message });
  }
});

const updateProductImageById = asyncHandler(async (req, res, next) => {
  try {
    const updateProductImage = await ProductImage.findById(req.params.id);

    if (!updateProductImage)
      return res.status(404).json({ message: "Product image not found" });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const deleteStart = updateProductImage.imagePath.indexOf("\\products\\");
    const deleteFile =
      "\\public" + updateProductImage.imagePath.slice(deleteStart);
    fs.unlinkSync(path.join(__dirname, "..", deleteFile));

    const productId = req.body.productId;
    let imagePath = req.file.path;

    const start = imagePath.indexOf("\\products\\");
    imagePath = imagePath.slice(start);
    imagePath = path.join(process.env.URL_SERVER, imagePath);
    updateProductImage.productId = productId || updateProductImage.productId;
    updateProductImage.imagePath = imagePath;

    await updateProductImage.save();
    res.status(200).json(updateProductImage);
  } catch (err) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    fs.unlinkSync(path.join(__dirname, "../..", req.file.path));
    res.status(500).json({ message: err.message });
  }
});

const deleteProductImageByProductId = asyncHandler(async (req, res, next) => {
  try {
    const deleteProductImage = await ProductImage.find({
      productId: req.params.productId,
    });

    if (!deleteProductImage)
      return res.status(404).json({ message: "Product image not found" });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    for (let i = 0; i < deleteProductImage.length; i++) {
      const deleteStart =
        deleteProductImage[i].imagePath.indexOf("\\products\\");
      const deleteFile =
        "\\public" + deleteProductImage[i].imagePath.slice(deleteStart);
      fs.unlinkSync(path.join(__dirname, "..", deleteFile));
    }
    await ProductImage.deleteMany({ productId: req.body.productId });
    res.status(200).json({ message: "Product image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteProductImageById = asyncHandler(async (req, res, next) => {
  try {
    const deleteProductImage = await ProductImage.findByIdAndDelete(
      req.params.id
    );
    
    if (!deleteProductImage)
      return res.status(404).json({ message: "Product image not found" });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const deleteStart = deleteProductImage.imagePath.indexOf("\\products\\");
    const deleteFile =
      "\\public" + deleteProductImage.imagePath.slice(deleteStart);
    fs.unlinkSync(path.join(__dirname, "..", deleteFile));
    res.status(200).json({ message: "Product image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllProductImagesByProductId: getAllProductImagesByProductId,
  getProductImageById: getProductImageById,
  createProductImage: createProductImage,
  updateProductImageById: updateProductImageById,
  deleteProductImageByProductId: deleteProductImageByProductId,
  deleteProductImageById: deleteProductImageById,
};
