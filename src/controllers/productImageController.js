import ProductImage from "../models/productImage.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { messages } from "../config/messageHelper.js";

const getAllProductImagesByProductId = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const productImages = await ProductImage.find({ productId });

    res.status(200).json({ data: productImages });
  } catch (err) {
    res.status(500).json({ error: err.message, message: messages.MSG5 });
  }
};

const getProductImageById = async (req, res, next) => {
  try {
    const productImageId = req.params.id;
    const productImage = await ProductImage.findById(productImageId);

    if (!productImage) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: productImage });
  } catch (err) {
    res.status(500).json({ error: err.message, message: messages.MSG5 });
  }
};

const createProductImage = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    let newProductImages = [];
    for (let i = 0; i < req.files.length; i++) {
      let imagePath = req.files[i].path;
      const start = imagePath.indexOf("\\products\\");
      imagePath = imagePath.slice(start);
      imagePath = path.join(process.env.URL_SERVER, imagePath);
      if (!productId || !imagePath) throw new Error(messages.MSG1);
      const newProductImage = new ProductImage({ productId, imagePath });
      newProductImages.push(newProductImage);
      await newProductImage.save();
    }
    res.status(201).json({ data: newProductImages });
  } catch (err) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    for (let i = 0; i < req.files.length; i++) {
      fs.unlinkSync(path.join(__dirname, "../..", req.files[i].path));
    }
    res.status(500).json({ error: err.message, message: messages.MSG5 });
  }
};

const updateProductImageById = async (req, res, next) => {
  try {
    const updateProductImage = await ProductImage.findById(req.params.id);

    if (!updateProductImage)
      return res.status(404).json({ error: "Not found" });

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
    res.status(200).json({ data: updateProductImage });
  } catch (err) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    fs.unlinkSync(path.join(__dirname, "../..", req.file.path));
    res.status(500).json({ error: err.message, message: messages.MSG5 });
  }
};

const deleteProductImageByProductId = async (req, res, next) => {
  try {
    const deleteProductImage = await ProductImage.find({
      productId: req.params.productId,
    });

    if (!deleteProductImage)
      return res.status(404).json({ error: "Not found" });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    for (let i = 0; i < deleteProductImage.length; i++) {
      const deleteStart =
        deleteProductImage[i].imagePath.indexOf("\\products\\");
      const deleteFile =
        "\\public" + deleteProductImage[i].imagePath.slice(deleteStart);
      fs.unlinkSync(path.join(__dirname, "..", deleteFile));
    }
    await ProductImage.deleteMany({ productId: req.params.productId });
    res.status(200).json({ message: "Product image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message, message: messages.MSG5 });
  }
};

const deleteProductImageById = async (req, res, next) => {
  try {
    const deleteProductImage = await ProductImage.findByIdAndDelete(
      req.params.id
    );

    if (!deleteProductImage)
      return res.status(404).json({ error: "Not found" });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const deleteStart = deleteProductImage.imagePath.indexOf("\\products\\");
    const deleteFile =
      "\\public" + deleteProductImage.imagePath.slice(deleteStart);
    fs.unlinkSync(path.join(__dirname, "..", deleteFile));
    res.status(200).json();
  } catch (err) {
    res.status(500).json({ error: err.message, message: messages.MSG5 });
  }
};

export default {
  getAllProductImagesByProductId: getAllProductImagesByProductId,
  getProductImageById: getProductImageById,
  createProductImage: createProductImage,
  updateProductImageById: updateProductImageById,
  deleteProductImageByProductId: deleteProductImageByProductId,
  deleteProductImageById: deleteProductImageById,
};
