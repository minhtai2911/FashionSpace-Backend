import OrderDetail from "../models/orderDetail.js";
import tf from "@tensorflow/tfjs";

const getUserProductData = async () => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderInfo",
        },
      },
      {
        $lookup: {
          from: "productvariants",
          localField: "productVariantId",
          foreignField: "_id",
          as: "productVariantInfo",
        },
      },
      {
        $project: {
          userId: { $arrayElemAt: ["$orderInfo.userId", 0] },
          productId: { $arrayElemAt: ["$productVariantInfo.productId", 0] },
        },
      },
    ];

    const dataRaw = await OrderDetail.aggregate(pipeline);
    return dataRaw.map((item) => ({
      userId: item.userId.toString(),
      productId: item.productId.toString(),
    }));
  } catch (err) {
    console.log(err.message);
    throw new Error("Failed to fetch data");
  }
};

const trainModel = async () => {
  try {
    const data = await getUserProductData();

    const userEncoder = {};
    const productEncoder = {};

    data.forEach((item) => {
      if (userEncoder[item.userId] == undefined) {
        userEncoder[item.userId] = Object.keys(userEncoder).length;
      }
      if (productEncoder[item.productId] == undefined) {
        productEncoder[item.productId] = Object.keys(productEncoder).length;
      }
    });

    const X = data.map((item) => ({
      user: userEncoder[item.userId],
      product: productEncoder[item.productId],
    }));
    const y = new Array(X.length).fill(1);

    const trainSize = Math.floor(0.8 * X.length);
    const X_train = X.slice(0, trainSize);
    const y_train = y.slice(0, trainSize);
    const X_test = X.slice(trainSize);
    const y_test = y.slice(trainSize);

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

    const userInputData = X_train.map((item) => item.user);
    const productInputData = X_train.map((item) => item.product);

    await model.fit([userInputData, productInputData], y_train, {
      epochs: 5,
      batchSize: 64,
    });

    return { model, userEncoder, productEncoder };
  } catch (err) {
    console.log(err.message);
    throw new Error("Failed to train model");
  }
};

const recommend = async (req, res, next) => {
  try {
    const { model, userEncoder, productEncoder } = await trainModel();

    const userIdx = userEncoder[req.user.id];
    const productIndices = Object.values(productEncoder);

    const userInputArray = new Array(productIndices.length).fill(userIdx);
    const productInputArray = productIndices;

    const predictions = await model.predict([
      userInputArray,
      productInputArray,
    ]);

    const topNIndices = predictions.argMax(-1).dataSync().slice(0, 5);
    const topNProductIds = topNIndices.map(
      (i) =>
        Object.keys(productEncoder)[Object.values(productEncoder).indexOf(i)]
    );

    res.status(200).json(topNProductIds);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

export default { recommend: recommend };
