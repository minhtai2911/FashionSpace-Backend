import {Router} from "express";
import ShoppingCartController from "../controllers/shoppingCartController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get('/', authMiddleware.verifyToken, ShoppingCartController.getAllShoppingCarts);
router.post('/', authMiddleware.verifyToken, ShoppingCartController.createShoppingCart);
router.put('/:id', authMiddleware.verifyToken, ShoppingCartController.updateShoppingCartQuantityById);
router.delete('/:id', authMiddleware.verifyToken, ShoppingCartController.deleteShoppingCartById);
router.get('/:id', authMiddleware.verifyToken, ShoppingCartController.getShoppingCartById);
router.get('/get/userId', authMiddleware.verifyToken, ShoppingCartController.getShoppingCartByUserId);

export default router;