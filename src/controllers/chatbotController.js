import asyncHandler from "../middleware/asyncHandler.js";
import dialogflow, { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";
import Product from "../models/product.js";
import Category from "../models/category.js";

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const PROJECTID = CREDENTIALS.project_id;

const CONFIGURATION = {
  credentials: {
    private_key: CREDENTIALS["private_key"],
    client_email: CREDENTIALS["client_email"],
  },
};

const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

const chatbot = asyncHandler(async (req, res, next) => {
  try {
    const message = req.body.message;
    const sessionId = uuidv4();

    let sessionPath = sessionClient.projectAgentSessionPath(
      PROJECTID,
      sessionId
    );

    let request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "vi",
        },
      },
    };
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    if (result.fulfillmentText === "Best Seller") {
      const product = await Product.find({ soldQuantity: { $gt: 0 } })
        .sort({
          soldQuantity: -1,
        })
        .limit(10);

      return res.status(200).json({
        message:
          "Cảm ơn bạn đã ghé thăm FashionSpace. Dưới đây là một số sản phẩm bán chạy nhất của chúng tôi hiện nay:",
        data: product,
        messageEnd:
          "Nếu bạn cần thêm thông tin chi tiết về từng sản phẩm hoặc muốn biết thêm về các mẫu khác, hãy cho tôi biết nhé! FashionSpace luôn sẵn sàng hỗ trợ bạn!",
      });
    }

    if (result.fulfillmentText === "New Arrival") {
      const product = await Product.find({}).sort({ createdAt: -1 }).limit(10);
      return res.status(200).json({
        message:
          "Cảm ơn bạn đã quan tâm đến các sản phẩm mới tại FashionSpace. Dưới đây là một số sản phẩm mới nhất mà chúng tôi vừa ra mắt:",
        data: product,
        messageEnd:
          "Nếu bạn cần thêm thông tin chi tiết về từng sản phẩm hoặc muốn biết thêm về các mẫu khác, hãy cho tôi biết nhé! FashionSpace luôn sẵn sàng hỗ trợ bạn!",
      });
    }

    if (result.fulfillmentText.substring(0, 8) === "Category") {
      const categoryName = result.fulfillmentText.substring(
        10,
        result.fulfillmentText.indexOf(";")
      );
      const gender = result.fulfillmentText.substring(
        result.fulfillmentText.indexOf("Gender") + 8
      );

      if (gender === "null") {
        const category = await Category.findOne({ name: categoryName });

        if (!category)
          return res.status(200).json({
            message:
              "Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi. Hiện tại, sản phẩm mà bạn đang tìm kiếm không có sẵn trong kho. Chúng tôi rất tiếc vì sự bất tiện này.",
            data: null,
            messageEnd: null,
          });

        const product = await Product.find({ categoryId: category._id })
          .sort({
            soldQuantity: -1,
          })
          .limit(10);

        return res.status(200).json({
          message: `Dưới đây là một số mẫu ${categoryName} đang có sẵn tại FashionSpace, phù hợp với nhiều phong cách và nhu cầu khác nhau:`,
          data: product,
          messageEnd:
            "Nếu bạn cần thêm thông tin chi tiết về từng sản phẩm hoặc muốn biết thêm về các mẫu khác, hãy cho tôi biết nhé! FashionSpace luôn sẵn sàng hỗ trợ bạn!",
        });
      } else {
        const category = await Category.findOne({
          name: categoryName,
          gender: gender,
        });

        if (!category)
          return res.status(200).json({
            message:
              "Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi. Hiện tại, sản phẩm mà bạn đang tìm kiếm không có sẵn trong kho. Chúng tôi rất tiếc vì sự bất tiện này.",
            data: null,
            messageEnd: null,
          });

        const product = await Product.find({ categoryId: category._id })
          .sort({
            soldQuantity: -1,
          })
          .limit(10);

        return res.status(200).json({
          message: `Dưới đây là một số mẫu ${categoryName} ${gender} đang có sẵn tại FashionSpace, phù hợp với nhiều phong cách và nhu cầu khác nhau:`,
          data: product,
          messageEnd:
            "Nếu bạn cần thêm thông tin chi tiết về từng sản phẩm hoặc muốn biết thêm về các mẫu khác, hãy cho tôi biết nhé! FashionSpace luôn sẵn sàng hỗ trợ bạn!",
        });
      }
    }

    return res
      .status(200)
      .json({ message: result.fulfillmentText, data: null, messageEnd: null });
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

export default chatbot;
