import asyncHandler from "../middleware/asyncHandler.js";
import PaymentDetail from "../models/paymentDetail.js";
import Order from "../models/order.js";
import crypto from "crypto";
import axios from "axios";

const getAllPaymentDetails = asyncHandler(async (req, res, next) => {
  try {
    const paymentDetail = await PaymentDetail.find({});

    if (!paymentDetail)
      return res
        .status(404)
        .json({ error: "Chi tiết thanh toán không tồn tại." });

    res.status(200).json({ data: paymentDetail });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const getPaymentDetailById = asyncHandler(async (req, res, next) => {
  try {
    const paymentDetail = await PaymentDetail.findById(req.params.id);

    if (!paymentDetail)
      return res
        .status(404)
        .json({ error: "Chi tiết thanh toán không tồn tại." });

    res.status(200).json({ data: paymentDetail });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const createPaymentDetail = asyncHandler(async (req, res, next) => {
  try {
    const { paymentMethod, status } = req.body;

    if (!paymentMethod)
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");

    const newPaymentDetail = new PaymentDetail({
      paymentMethod,
      status,
    });

    await newPaymentDetail.save();
    res
      .status(201)
      .json({
        message: "Thanh toán của bạn đã được xử lý thành công!",
        data: newPaymentDetail,
      });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const updatePaymentDetailById = asyncHandler(async (req, res, next) => {
  try {
    const updatePaymentDetail = await PaymentDetail.findById(req.params.id);

    if (!updatePaymentDetail)
      return res
        .status(404)
        .json({ error: "Chi tiết thanh toán không tồn tại." });

    const { status } = req.body;

    updatePaymentDetail.status = status || updatePaymentDetail.status;
    updatePaymentDetail.updatedDate = Date.now();

    await updatePaymentDetail.save();
    res
      .status(200)
      .json({
        message: "Thanh toán của bạn đã được xử lý thành công!",
        data: updatePaymentDetail,
      });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const deletePaymentDetailById = asyncHandler(async (req, res, next) => {
  try {
    const deletePaymentDetail = await PaymentDetail.findByIdAndDelete(
      req.params.id
    );

    if (!deletePaymentDetail)
      return res.status(404).json({ error: "Chi tiết thanh toán không tồn tại." });

    res.status(200).json({ message: "Xóa thành công!" });
  } catch (err) {
    return res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const checkoutWithMoMo = asyncHandler(async (req, res, next) => {
  try {
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const orderInfo = "Checkout with MoMo";
    const partnerCode = "MOMO";
    const redirectUrl = `${process.env.URL_CLIENT}/orderCompleted`;
    const ipnUrl = `${process.env.LINK_NGROK}/api/v1/paymentDetail/callback`;
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
    res.status(200).json(response.data);
  } catch (err) {
    return res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const callbackPaymentDetail = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.resultCode === 0) {
      const order = await Order.findById({ _id: req.body.orderId });

      if (!order) throw new Error("Order not found");
      const paymentDetail = await PaymentDetail.findById({
        _id: order.paymentDetailId,
      });
      paymentDetail.status = "Paid";
      paymentDetail.save();
    }
  } catch (err) {
    throw new Error({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const checkStatusTransaction = asyncHandler(async (req, res, next) => {
  try {
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
      return res.status(200).json({ message: "Paid" });
    } else {
      res.status(400).json("Unpaid");
    }
  } catch (err) {
    return res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

export default {
  getAllPaymentDetails: getAllPaymentDetails,
  getPaymentDetailById: getPaymentDetailById,
  createPaymentDetail: createPaymentDetail,
  updatePaymentDetailById: updatePaymentDetailById,
  deletePaymentDetailById: deletePaymentDetailById,
  checkoutWithMoMo: checkoutWithMoMo,
  callbackPaymentDetail: callbackPaymentDetail,
  checkStatusTransaction: checkStatusTransaction,
};
