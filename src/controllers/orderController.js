import Order from "../models/order.js";
import chatbotController from "./chatbotController.js";
import { messages } from "../config/messageHelper.js";
import mongoose from "mongoose";
import { paymentStatus } from "../config/paymentStatus.js";
import { orderStatus } from "../config/orderStatus.js";
import { addOrderToReport } from "../controllers/statisticController.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import sendDeliveryInfo from "../utils/sendDeliveryInfo.js";
import Product from "../models/product.js";
import ProductVariant from "../models/productVariant.js";
import logger from "../utils/logger.js";
import axios from "axios";
import crypto from "crypto";
import moment from "moment";

const getAllOrders = asyncHandler(async (req, res, next) => {
  const query = {};

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (req.query.paymentMethod) query.paymentMethod = req.query.paymentMethod;
  if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;

  const basePipeline = [
    { $match: query },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
  ];

  if (req.query.search) {
    basePipeline.push({
      $match: {
        "userInfo.fullName": { $regex: req.query.search, $options: "i" },
      },
    });
  }

  if (req.query.status) {
    basePipeline.push(
      {
        $addFields: {
          lastStatus: {
            $let: {
              vars: {
                lastDelivery: {
                  $arrayElemAt: ["$deliveryInfo", -1],
                },
              },
              in: "$$lastDelivery.status",
            },
          },
        },
      },
      {
        $match: {
          lastStatus: { $regex: `^${req.query.status}$`, $options: "i" },
        },
      }
    );
  }

  const totalCountPipeline = [...basePipeline, { $count: "count" }];

  const pipeline = [
    ...basePipeline,
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        status: 1,
        paymentMethod: 1,
        paymentStatus: 1,
        "userInfo.fullName": 1,
        deliveryInfo: 1,
        finalPrice: 1,
        createdAt: 1,
      },
    },
  ];

  const totalResult = await Order.aggregate(totalCountPipeline);
  const totalCount = totalResult[0]?.count || 0;
  const orders = await Order.aggregate(pipeline);

  logger.info("Lấy danh sách đơn hàng thành công!", { ...query, page, limit });
  res.status(200).json({
    meta: {
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    },
    data: orders,
  });
});

const getAllOrdersByUserId = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const userId = req.user.id;

  const totalCount = await Order.countDocuments({ userId: userId });
  const orders = await Order.find(
    { userId: userId },
    {
      paymentMethod: 1,
      finalPrice: 1,
      expectedDeliveryDate: 1,
      orderItems: 1,
      paymentStatus: 1,
      deliveryInfo: 1,
      userAddressId: 1,
    }
  )
    .skip(skip)
    .limit(limit)
    .exec();

  logger.info("Lấy danh sách đơn hàng thành công!", { userId, page, limit });
  return res.status(200).json({
    meta: {
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    },
    data: orders,
  });
});

const getOrderById = asyncHandler(async (req, res, next) => {
  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
  ];

  pipeline.push({
    $project: {
      orderItems: 1,
      status: 1,
      paymentMethod: 1,
      paymentStatus: 1,
      "userInfo.fullName": 1,
      "userInfo.email": 1,
      deliveryInfo: 1,
      finalPrice: 1,
      createdAt: 1,
      shippingFee: 1,
      expectedDeliveryDate: 1,
      userAddressId: 1,
    },
  });

  const order = await Order.aggregate(pipeline);

  if (!order) {
    logger.warn("Đơn hàng không tồn tại");
    return res.status(404).json({ error: "Not found" });
  }

  logger.info("Lấy đơn hàng thành công");
  res.status(200).json({ data: order });
});

const createOrder = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    discount,
    userAddressId,
    shippingFee,
    paymentMethod,
    deliveryInfo,
    expectedDeliveryDate,
  } = req.body;

  const userId = req.user.id;

  if (
    !orderItems ||
    orderItems.length === 0 ||
    !userAddressId ||
    !paymentMethod
  ) {
    logger.warn(messages.MSG1);
    throw new Error(messages.MSG1);
  }

  const totalPrice = orderItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const finalPrice = totalPrice - (totalPrice * discount) / 100 + shippingFee;

  const newOrder = new Order({
    userId,
    orderItems,
    totalPrice,
    discount,
    finalPrice,
    userAddressId,
    shippingFee,
    paymentMethod,
    deliveryInfo,
    expectedDeliveryDate,
  });

  chatbotController.updateEntityOrderId(newOrder._id);
  logger.info(messages.MSG19);
  await newOrder.save();
  res.status(201).json({ message: messages.MSG19, data: newOrder });
});

const updateDeliveryInfoById = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const { status, deliveryAddress, expectedDeliveryDate } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    logger.warn("Đơn hàng không tồn tại");
    return res.status(404).json({ error: "Not found" });
  }

  order.expectedDeliveryDate =
    expectedDeliveryDate || order.expectedDeliveryDate;

  if (!status || !deliveryAddress) {
    logger.warn(messages.MSG1);
    throw new Error(messages.MSG1);
  }

  order.deliveryInfo.push({
    status,
    deliveryAddress,
  });

  if (status === orderStatus.ACCEPTED) {
    for (let orderItem of order.orderItems) {
      const cacheKey = `productVariant:${orderItem.productVariantId}`;
      const productVariant = await ProductVariant.findById(
        orderItem.productVariantId
      );
      productVariant.stock -= orderItem.quantity;
      await req.redisClient.hincrby(cacheKey, "stock", -orderItem.quantity);
      await productVariant.save();
    }
  }

  if (status === orderStatus.RETURNED) {
    for (let orderItem of order.orderItems) {
      const cacheKey = `productVariant:${orderItem.productVariantId}`;
      const productVariant = await ProductVariant.findById(
        orderItem.productVariantId
      );
      productVariant.stock += orderItem.quantity;
      await req.redisClient.hincrby(cacheKey, "stock", orderItem.quantity);
      await productVariant.save();
    }
  }

  if (status === orderStatus.SHIPPED) {
    for (let orderItem of order.orderItems) {
      const cacheKey = `product:${orderItem.productId}`;
      const product = await Product.findById(orderItem.productId);
      product.soldQuantity += orderItem.quantity;
      await req.redisClient.hincrby(
        cacheKey,
        "soldQuantity",
        orderItem.quantity
      );
      await product.save();
    }
    addOrderToReport(order.finalPrice);
  }

  logger.info(messages.MSG44);
  await order.save();
  res.status(200).json({ message: messages.MSG44, data: order });
});

const updatePaymentStatusById = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const { paymentStatus } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    logger.warn("Đơn hàng không tồn tại");
    return res.status(404).json({ error: "Not found" });
  }

  order.paymentStatus = paymentStatus;
  logger.info(messages.MSG40);
  await order.save();
  res.status(200).json({ message: messages.MSG40, data: order });
});

const checkoutWithMoMo = asyncHandler(async (req, res, next) => {
  const accessKey = "F8BBA842ECF85";
  const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  const orderInfo = "Checkout with MoMo";
  const partnerCode = "MOMO";
  const redirectUrl = `${process.env.URL_CLIENT}/orderCompleted`;
  const ipnUrl = `${process.env.LINK_NGROK}/api/v1/order/callbackMoMo`;
  const requestType = "payWithMethod";
  const amount = req.body.amount;
  const orderId = req.body.orderId;
  const requestId = orderId;
  const extraData = "";
  const orderGroupId = "";
  const autoCapture = true;
  const lang = "vi";

  let rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;

  let signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
  });

  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };

  const response = await axios(options);
  logger.info("Bắt đầu quá trình thanh toán Momo");
  res.status(200).json(response.data);
});

const callbackMoMo = asyncHandler(async (req, res, next) => {
  if (req.body.resultCode === 0) {
    const order = await Order.findById({ _id: req.body.orderId });

    if (!order) {
      logger.warn("Đơn hàng không tồn tại");
      throw new Error("Not found");
    }

    order.paymentStatus = paymentStatus.PAID;
    order.save();
  }
});

const checkStatusTransaction = asyncHandler(async (req, res, next) => {
  const accessKey = "F8BBA842ECF85";
  const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  const orderId = req.body.orderId;
  const partnerCode = "MOMO";

  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${orderId}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: "MOMO",
    requestId: orderId,
    orderId: orderId,
    signature: signature,
    lang: "vi",
  });

  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/query",
    headers: {
      "Content-Type": "application/json",
    },
    data: requestBody,
  };

  const response = await axios(options);

  if (response.data.resultCode === 0) {
    const order = await Order.findById({ _id: req.body.orderId });

    if (!order) {
      logger.warn("Đơn hàng không tồn tại");
      return res.status(404).json();
    }

    order.paymentStatus = paymentStatus.PAID;
    logger.info("Thanh toán đơn hàng thành công!");
    order.save();
    return res.status(200).json();
  } else {
    logger.info("Thanh toán đơn hàng thất bại!");
    return res.status(200).json();
  }
});

const sendMailDeliveryInfo = asyncHandler(async (req, res, next) => {
  const { orderId, email } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    logger.warn("Đơn hàng không tồn tại");
    throw new Error("Not found");
  }

  await sendDeliveryInfo(email, order);
  logger.info("Gửi email thông báo trạng thái đơn hàng thành công!");
  res.status(200).json({ message: messages.MSG66 });
});

const checkoutWithVnPay = asyncHandler(async (req, res, next) => {
  const orderId = req.body.orderId;
  const amount = req.body.amount;
  const orderInfo = "Thanh toán đơn hàng";
  const createDate = moment(new Date()).format("YYYYMMDDHHmmss");
  const bankCode = req.body.bankCode || "NCB";

  const vnpUrl = process.env.VNP_URL;
  const vnpReturnUrl = `${process.env.URL_SERVER}/api/v1/order/callbackVnPay`;
  const vnpTmnCode = process.env.VNP_TMNCODE;
  const vnpHashSecret = process.env.VNP_HASH_SECRET;

  const ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpTmnCode,
    vnp_Amount: amount * 100,
    vnp_CurrCode: "VND",
    vnp_BankCode: bankCode,
    vnp_Locale: "vn",
    vnp_CreateDate: createDate,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_ReturnUrl: vnpReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_TxnRef: orderId,
  };

  vnpParams = Object.keys(vnpParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {});

  let queryString = new URLSearchParams(vnpParams).toString();
  let hmac = crypto.createHmac("sha512", vnpHashSecret);
  let signed = hmac.update(Buffer.from(queryString, "utf-8")).digest("hex");
  vnpParams["vnp_SecureHash"] = signed;
  queryString = new URLSearchParams(vnpParams).toString();

  logger.info("Gửi url thanh toán VnPay thành công!");
  res.status(200).json({ url: `${vnpUrl}?${queryString}` });
});

const callbackVnPay = asyncHandler(async (req, res, next) => {
  let vnpParams = req.query;
  const secureHash = vnpParams["vnp_SecureHash"];

  const orderId = vnpParams["vnp_TxnRef"];
  const responseCode = vnpParams["vnp_ResponseCode"];
  const vnpHashSecret = process.env.VNP_HASH_SECRET;

  delete vnpParams["vnp_SecureHash"];

  vnpParams = Object.keys(vnpParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {});

  const queryString = new URLSearchParams(vnpParams).toString();
  const hmac = crypto.createHmac("sha512", vnpHashSecret);
  const signed = hmac.update(Buffer.from(queryString, "utf-8")).digest("hex");

  if (secureHash === signed) {
    const order = await Order.findById(orderId);

    if (!order) {
      logger.warn("Đơn hàng không tồn tại");
      return res.status(404).json({ error: "Not found" });
    }

    if (order.paymentStatus === paymentStatus.PAID) {
      logger.warn("Đơn hàng đã được thanh toán trước đó");
      return res.status(400).json({ message: "Đơn hàng đã được thanh toán" });
    }

    if (order.finalPrice !== vnpParams["vnp_Amount"] / 100) {
      logger.warn("Số tiền thanh toán không khớp với đơn hàng");
      return res.status(400).json({ message: "Số tiền thanh toán không khớp" });
    }

    if (responseCode === "00") {
      order.paymentStatus = paymentStatus.PAID;
      await order.save();

      logger.info("Thanh toán VnPay thành công!");
      return res.redirect(
        `${process.env.URL_CLIENT}/orderCompleted?orderId=${orderId}`
      );
    }
  }

  logger.warn("Thanh toán VnPay thất bại!");
  return res.status(400).json({ message: "Thanh toán thất bại!" });
});

const checkoutWithZaloPay = asyncHandler(async (req, res, next) => {
  const app_id = "2553";
  const key1 = "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL";
  const endpoint = "https://sb-openapi.zalopay.vn/v2/create";
  const orderId = req.body.orderId;

  const embed_data = {
    redirectUrl: `${process.env.URL_CLIENT}/orderCompleted`,
  };
  const order = await Order.findById(orderId);
  if (!order) {
    logger.warn("Đơn hàng không tồn tại");
    return res.status(404).json({ message: "Đơn hàng không tồn tại" });
  }
  const amount = req.body.amount;

  let zaloPayParams = {
    app_id: app_id,
    app_trans_id: `${new Date()
      .toISOString()
      .slice(2, 10)
      .replace(/-/g, "")}_${orderId}`,
    app_user: "FashionSpace",
    app_time: Date.now(),
    item: JSON.stringify(order.orderItems),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    callback_url: `${process.env.LINK_NGROK}/api/v1/order/callbackZaloPay`,
    description: `Thanh toán đơn hàng ${orderId}`,
    bank_code: "",
  };

  const data =
    zaloPayParams.app_id +
    "|" +
    zaloPayParams.app_trans_id +
    "|" +
    zaloPayParams.app_user +
    "|" +
    zaloPayParams.amount +
    "|" +
    zaloPayParams.app_time +
    "|" +
    zaloPayParams.embed_data +
    "|" +
    zaloPayParams.item;

  zaloPayParams["mac"] = crypto
    .createHmac("sha256", key1)
    .update(data)
    .digest("hex");

  const result = await axios.post(endpoint, null, { params: zaloPayParams });
  return res.status(200).json(result.data);
});

const callbackZaloPay = asyncHandler(async (req, res, next) => {
  const key2 = "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz";
  const { app_trans_id, amount } = JSON.parse(req.body.data);
  const mac = req.body.mac;

  const raw = req.body.data;
  const orderId = app_trans_id.split("_")[1];
  const order = await Order.findById(orderId);
  if (!order) {
    logger.warn("Đơn hàng không tồn tại");
    throw new Error("Not found");
  }

  const expected = crypto.createHmac("sha256", key2).update(raw).digest("hex");

  if (expected !== mac) {
    logger.warn("Mã xác thực không hợp lệ!");
    throw new Error("Mã xác thực không hợp lệ!");
  }

  if (order.paymentStatus === paymentStatus.PAID) {
    logger.warn("Đơn hàng đã được thanh toán trước đó");
    return;
  }

  if (order.finalPrice !== amount) {
    logger.warn("Số tiền thanh toán không khớp với đơn hàng");
    throw new Error("Số tiền thanh toán không khớp");
  }

  order.paymentStatus = paymentStatus.PAID;
  await order.save();
  logger.info("Thanh toán ZaloPay thành công!");
});

const checkStatusTransactionZaloPay = asyncHandler(async (req, res, next) => {
  const app_id = "2553";
  const key1 = "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL";
  const endpoint = "https://sb-openapi.zalopay.vn/v2/query";

  const { app_trans_id } = req.body;

  const data = `${app_id}|${app_trans_id}|${key1}`;
  const mac = crypto.createHmac("sha256", key1).update(data).digest("hex");

  const params = {
    app_id,
    app_trans_id,
    mac,
  };

  const result = await axios.post(endpoint, null, { params });

  if (result.data.return_code !== 1) {
    logger.warn("Truy vấn giao dịch thất bại!");
    return res.status(400).json({ message: "Truy vấn giao dịch thất bại!" });
  }

  if (result.data.data.status === 1) {
    const orderId = app_trans_id.split("_")[1];
    const order = await Order.findById(orderId);

    if (!order) {
      logger.warn("Đơn hàng không tồn tại");
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    if (order.paymentStatus === paymentStatus.PAID) {
      logger.warn("Đơn hàng đã được thanh toán trước đó");
      return res
        .status(400)
        .json({ message: "Đơn hàng đã được thanh toán trước đó" });
    }

    order.paymentStatus = paymentStatus.PAID;
    await order.save();
    logger.info("Thanh toán ZaloPay thành công!");
    return res.status(200).json({ message: "Thanh toán thành công!" });
  }
});

export default {
  getAllOrders: getAllOrders,
  getOrderById: getOrderById,
  createOrder: createOrder,
  getAllOrdersByUserId: getAllOrdersByUserId,
  updateDeliveryInfoById: updateDeliveryInfoById,
  updatePaymentStatusById: updatePaymentStatusById,
  checkoutWithMoMo: checkoutWithMoMo,
  callbackMoMo: callbackMoMo,
  checkStatusTransaction: checkStatusTransaction,
  sendMailDeliveryInfo: sendMailDeliveryInfo,
  checkoutWithVnPay: checkoutWithVnPay,
  callbackVnPay: callbackVnPay,
  checkoutWithZaloPay: checkoutWithZaloPay,
  callbackZaloPay: callbackZaloPay,
  checkStatusTransactionZaloPay: checkStatusTransactionZaloPay,
};
