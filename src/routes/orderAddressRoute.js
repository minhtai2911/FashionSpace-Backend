import {Router} from "express";
import OrderAddressController from "../controllers/orderAddressController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get('/', authMiddleware.verifyToken, OrderAddressController.getAllOrderAddresses);
router.post('/', authMiddleware.verifyToken, OrderAddressController.createOrderAddress);
router.put('/:id', authMiddleware.verifyToken, OrderAddressController.updateOrderAddressById);
router.delete('/:id', authMiddleware.verifyToken, OrderAddressController.deleteOrderAddressById);
router.get('/id', authMiddleware.verifyToken, OrderAddressController.getOrderAddressById);


export default router;