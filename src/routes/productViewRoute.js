import { Router } from "express";
import productViewController from "../controllers/productViewController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
 
router.post("/", authMiddleware.verifyToken, productViewController.createProductView);


export default router;