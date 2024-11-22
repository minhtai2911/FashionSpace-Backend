import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import chatbot from "../controllers/chatbotController.js"

const router = Router();

router.post('/', chatbot);

export default router;