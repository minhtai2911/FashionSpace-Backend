import asyncHandler from "../middleware/asyncHandler.js";
import dialogflow, { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";

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

    return res.status(200).json({ data: result.fulfillmentText });
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

export default chatbot;
