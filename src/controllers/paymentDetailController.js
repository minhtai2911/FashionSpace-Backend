import PaymentDetail from "../models/paymentDetail.js";
import Order from "../models/order.js";
import crypto from "crypto";
import axios from "axios";
import OrderAddress from "../models/orderAddress.js";
import OrderDetail from "../models/orderDetail.js";
import { messages } from "../config/messageHelper.js";
import { paymentStatus } from "../config/paymentStatus.js";

const getAllPaymentDetails = async (req, res, next) => {
  try {
    const paymentDetail = await PaymentDetail.find({});

    if (!paymentDetail) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: paymentDetail });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getPaymentDetailById = async (req, res, next) => {
  try {
    const paymentDetail = await PaymentDetail.findById(req.params.id);

    if (!paymentDetail) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: paymentDetail });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createPaymentDetail = async (req, res, next) => {
  try {
    const { paymentMethod, status } = req.body;

    if (!paymentMethod) throw new Error(messages.MSG1);

    const newPaymentDetail = new PaymentDetail({
      paymentMethod,
      status,
    });

    await newPaymentDetail.save();
    res.status(201).json({
      data: newPaymentDetail,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updatePaymentDetailById = async (req, res, next) => {
  try {
    const updatePaymentDetail = await PaymentDetail.findById(req.params.id);

    if (!updatePaymentDetail)
      return res.status(404).json({ error: "Not found" });

    const { status } = req.body;

    updatePaymentDetail.status = status || updatePaymentDetail.status;
    updatePaymentDetail.updatedDate = Date.now();

    await updatePaymentDetail.save();
    res.status(200).json({
      data: updatePaymentDetail,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

// const deletePaymentDetailById = async (req, res, next) => {
//   try {
//     const deletePaymentDetail = await PaymentDetail.findByIdAndDelete(
//       req.params.id
//     );

//     if (!deletePaymentDetail)
//       return res.status(404).json({ error: "Not found" });

//     res.status(200).json({ message: "Xóa thành công!" });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({
//         error: err.message,
//         message: messages.MSG5,
//       });
//   }
// };

const checkoutWithMoMo = async (req, res, next) => {
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
    return res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const callbackPaymentDetail = async (req, res, next) => {
  try {
    if (req.body.resultCode === 0) {
      const order = await Order.findById({ _id: req.body.orderId });

      if (!order) throw new Error("Not found");
      const paymentDetail = await PaymentDetail.findById({
        _id: order.paymentDetailId,
      });
      paymentDetail.status = paymentStatus.PAID;
      paymentDetail.save();
    } else {
      const order = await Order.findByIdAndDelete(req.body.orderId);
      await PaymentDetail.findByIdAndDelete(order.paymentDetailId);
      await OrderAddress.findByIdAndDelete(order.orderAddressId);
      await OrderDetail.deleteMany({ orderId: order._id });
    }
  } catch (err) {
    throw new Error({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const checkStatusTransaction = async (req, res, next) => {
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
      return res.status(200).json();
    } else {
      const order = await Order.findByIdAndDelete(req.body.orderId);
      if (!order) res.status(200).json();
      await PaymentDetail.findByIdAndDelete(order.paymentDetailId);
      await OrderAddress.findByIdAndDelete(order.orderAddressId);
      await OrderDetail.deleteMany({ orderId: order._id });
      return res.status(200).json();
    }
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  getAllPaymentDetails: getAllPaymentDetails,
  getPaymentDetailById: getPaymentDetailById,
  createPaymentDetail: createPaymentDetail,
  updatePaymentDetailById: updatePaymentDetailById,
  // deletePaymentDetailById: deletePaymentDetailById,
  checkoutWithMoMo: checkoutWithMoMo,
  callbackPaymentDetail: callbackPaymentDetail,
  checkStatusTransaction: checkStatusTransaction,
};
