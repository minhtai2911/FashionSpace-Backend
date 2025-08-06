import * as tf from "@tensorflow/tfjs-node";
import Product from "../models/product.js";
import ProductView from "../models/productView.js";
import Order from "../models/order.js";
import { messages } from "../config/messageHelper.js";
import natural from "natural";
import asyncHandler from "../middlewares/asyncHandler.js";
import logger from "../utils/logger.js";

const TfIdf = natural.TfIdf;

const getUserProductData = async () => {
  try {
    const orders = await Order.find({}).populate("orderItems.productId");
    const dataRaw = orders.reduce((acc, order) => {
      const orderItems = order.orderItems.map((item) => ({
        userId: order.userId,
        productId: item.productId._id,
      }));
      return [...acc, ...orderItems];
    }, []);

    const productView = await ProductView.find();
    dataRaw.push(
      ...productView.map((item) => ({
        userId: item.userId,
        productId: item.productId,
      }))
    );

    if (!dataRaw || dataRaw.length === 0) {
      logger.error("No data found from database.");
      throw new Error("No data found from database.");
    }

    logger.info("Data fetched successfully from database.");
    return dataRaw
      .filter((item) => item.userId && item.productId)
      .map((item) => ({
        userId: item.userId.toString(),
        productId: item.productId.toString(),
      }));
  } catch (err) {
    logger.error("No data found from database.");
    throw new Error(err.message);
  }
};

const trainModel = async () => {
  try {
    const data = await getUserProductData();

    const userEncoder = {};
    const productEncoder = {};
    const productDecoder = {};

    data.forEach((item) => {
      if (item.userId && userEncoder[item.userId] == undefined) {
        userEncoder[item.userId] = Object.keys(userEncoder).length;
      }
      if (item.productId && productEncoder[item.productId] == undefined) {
        const index = Object.keys(productEncoder).length;
        productEncoder[item.productId] = index;
        productDecoder[index] = item.productId;
      }
    });

    if (
      Object.keys(userEncoder).length === 0 ||
      Object.keys(productEncoder).length === 0
    ) {
      logger.error("Not enough data for training.");
      throw new Error("Not enough data for training");
    }

    const X = data.map((item) => ({
      user: userEncoder[item.userId],
      product: productEncoder[item.productId],
    }));

    const y = new Array(X.length).fill(1);

    const embeddingSize = 50;

    const userInput = tf.input({ shape: [1], name: "user" });
    const productInput = tf.input({ shape: [1], name: "product" });

    const userEmbedding = tf.layers
      .embedding({
        inputDim: Object.keys(userEncoder).length,
        outputDim: embeddingSize,
      })
      .apply(userInput);

    const productEmbedding = tf.layers
      .embedding({
        inputDim: Object.keys(productEncoder).length,
        outputDim: embeddingSize,
      })
      .apply(productInput);

    const dotProduct = tf.layers
      .dot({ axes: 2 })
      .apply([userEmbedding, productEmbedding]);

    const output = tf.layers.flatten().apply(dotProduct);

    const model = tf.model({
      inputs: [userInput, productInput],
      outputs: output,
    });

    model.compile({
      optimizer: "adam",
      loss: "binaryCrossentropy",
    });

    const userInputData = X.map((item) => item.user);
    const productInputData = X.map((item) => item.product);

    const userInputTensor = tf.tensor2d(userInputData, [
      userInputData.length,
      1,
    ]);
    const productInputTensor = tf.tensor2d(productInputData, [
      productInputData.length,
      1,
    ]);
    const yTensor = tf.tensor2d(y, [y.length, 1]);

    await model.fit([userInputTensor, productInputTensor], yTensor, {
      epochs: 5,
      batchSize: 64,
    });

    logger.info("Model trained successfully.");
    return { model, userEncoder, productEncoder, productDecoder };
  } catch (err) {
    logger.error("Error training model: ", err.message);
    throw new Error(err.message);
  }
};

const recommendProductsForYou = async (req, res, next) => {
  try {
    const { model, userEncoder, productEncoder, productDecoder } =
      await trainModel();

    const userIdx = userEncoder[req.user.id];
    if (userIdx == undefined) {
      const bestSeller = await Product.find({
        soldQuantity: { $gt: 0 },
        isActive: true,
      })
        .sort({
          soldQuantity: -1,
        })
        .limit(6);

      const newArrival = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(4);

      const products = [...bestSeller, ...newArrival];

      const result = Array.from(
        new Map(products.map((item) => [item._id.toString(), item])).values()
      );

      logger.info("No user found, returning best sellers and new arrivals.");
      return res.status(200).json({ data: result });
    }

    const productIndices = Object.values(productEncoder);
    const userInputArray = new Array(productIndices.length).fill(userIdx);
    const productInputArray = productIndices;

    const userInputTensor = tf.tensor2d(userInputArray, [
      userInputArray.length,
      1,
    ]);
    const productInputTensor = tf.tensor2d(productInputArray, [
      productInputArray.length,
      1,
    ]);

    const predictions = await model.predict([
      userInputTensor,
      productInputTensor,
    ]);

    const predictionsArray = Array.from(predictions.dataSync());

    const sortedIndices = predictionsArray
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((item) => item.index);

    const topNProductIds = sortedIndices.map((i) => productDecoder[i]);

    let result = [];
    for (let productId of topNProductIds) {
      const product = await Product.findById(productId);
      result.push(product);
    }

    logger.info("Recommendations generated successfully.");
    res.status(200).json({ data: result });
  } catch (err) {
    if (err.message === "No data found from database.")
      return res.status(200).json({ data: [] });
    logger.error("Error generating recommendations: ", err.message);
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

// TF-IDF xử lý description
const buildTfIdfVectors = (products) => {
  const tfidf = new TfIdf();
  products.forEach((p) => {
    const document = `${p.name} ${p.description}`.toLowerCase().trim();
    tfidf.addDocument(document);
  });
  return products.map((_, i) => {
    const vector = [];
    const terms = tfidf.listTerms(i);
    for (let j = 0; j < 20; j++) vector.push(terms[j]?.tfidf || 0);
    return vector;
  });
};

// Vector hóa sản phẩm
function buildProductVectors(products) {
  const categories = [
    ...new Set(products.map((p) => p.categoryId?.name)),
  ];
  const genders = [...new Set(products.map((p) => p.categoryId?.gender))];

  const encodeCategory = (categoryName) =>
    categories.map((c) => (c === categoryName ? 1 : 0));
  const encodeGender = (gender) =>
  genders.map((g) => (g === gender ? 1 : 0));

  const tfidfVectors = buildTfIdfVectors(products);

  const maxValues = {
    price: Math.max(...products.map((p) => p.price)),
    discountPrice: Math.max(...products.map((p) => p.discountPrice)),
    soldQuantity: Math.max(...products.map((p) => p.soldQuantity)),
    totalReview: Math.max(...products.map((p) => p.totalReview)),
  };

  return products.map((p, i) => {
    const categoryVec = encodeCategory(p.categoryId?.name);
    const genderVec = encodeGender(p.categoryId?.gender);
    const numericVec = [
      p.price / (maxValues.price || 1),
      p.discountPrice / (maxValues.discountPrice || 1),
      p.rating / 5,
      p.soldQuantity / (maxValues.soldQuantity || 1),
      p.totalReview / (maxValues.totalReview || 1),
    ];
    return {
      _id: p._id,
      name: p.name,
      vector: [...categoryVec, ...genderVec, ...numericVec, ...tfidfVectors[i]],
      raw: p,
    };
  });
}

// Áp dụng trọng số cho vector
function applyWeights(
  vector,
  categorySize,
  numNumericFields,
  tfidfWeight = 1.0,
  numericWeight = 3.0,
  categoryWeight = 5.0
) {
  const categoryPart = vector
    .slice(0, categorySize)
    .map((v) => v * categoryWeight);
  const numericPart = vector
    .slice(categorySize, categorySize + numNumericFields)
    .map((v) => v * numericWeight);
  const tfidfPart = vector
    .slice(categorySize + numNumericFields)
    .map((v) => v * tfidfWeight);
  return [...categoryPart, ...numericPart, ...tfidfPart];
}

// Tính độ tương đồng cosine
function cosineSimilarity(vecA, vecB, categorySize, numNumericFields) {
  const weightedA = applyWeights(vecA, categorySize, numNumericFields);
  const weightedB = applyWeights(vecB, categorySize, numNumericFields);
  const a = tf.tensor1d(weightedA);
  const b = tf.tensor1d(weightedB);
  const dot = tf.dot(a, b).dataSync()[0];
  const normA = tf.norm(a).dataSync()[0];
  const normB = tf.norm(b).dataSync()[0];
  return dot / (normA * normB);
}

const recommendSimilarProducts = asyncHandler(async (req, res) => {
  const targetId = req.params.productId;
  const allProducts = await Product.find({ isActive: true })
    .populate("categoryId", "name")
    .lean();
  const productVectors = buildProductVectors(allProducts);
  const categorySize = [
    ...new Set(allProducts.map((p) => p.categoryId?.toString())),
  ].length;
  const numNumericFields = 5;

  const target = productVectors.find((p) => p._id.toString() === targetId);
  if (!target) return res.status(404).json({ error: "Not found" });

  const related = productVectors
    .filter((p) => p._id.toString() !== targetId)
    .map((p) => ({
      product: p.raw,
      score: cosineSimilarity(
        target.vector,
        p.vector,
        categorySize,
        numNumericFields
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.product);

  return res.status(200).json({ data: related });
});

export default {
  recommendProductsForYou: recommendProductsForYou,
  recommendSimilarProducts: recommendSimilarProducts,
};
