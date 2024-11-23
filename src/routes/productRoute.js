import {Router} from "express";
import productController from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get('/', productController.getAllProducts);
router.post('/', authMiddleware.verifyToken, productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', authMiddleware.verifyToken, productController.updateProductById);
router.delete('/:id', authMiddleware.verifyToken, productController.deleteProductById);
router.get('/get/bestSellerProduct', productController.getBestSellerProduct);
router.get('/get/newArrivalProduct', productController.getNewArrivalProduct);

export default router;