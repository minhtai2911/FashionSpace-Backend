import {Router} from "express";
import ShoppingCartController from "../controllers/shoppingCartController.js";

const router = Router();

router.get('/', ShoppingCartController.getAllShoppingCarts);
router.post('/', ShoppingCartController.createShoppingCart);
router.put('/:id', ShoppingCartController.updateShoppingCartQuantityById);
router.delete('/:id', ShoppingCartController.deleteShoppingCartById);
router.get('/:id', ShoppingCartController.getShoppingCartById);
router.get('/shoppingCartByUserId', ShoppingCartController.getShoppingCartByUserId);

export default router;