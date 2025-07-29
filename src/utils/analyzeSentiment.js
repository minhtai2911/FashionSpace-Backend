import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const analyzeSentiment = async (text) => {
  try {
    const response = await axios.post(
      `${process.env.SENTIMENT_SERVER_URL}/api/v1/predict-sentiment`,
      { text }
    );

    return response.data.label;
  } catch (err) {
    console.log(err.message);
    throw new Error("Error occurred:", err.message);
  }
};

export default analyzeSentiment;
