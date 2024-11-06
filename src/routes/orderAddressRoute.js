import {Router} from "express";
import OrderAddressController from "../controllers/orderAddressController.js";

const router = Router();

router.get('/', OrderAddressController.getAllOrderAddresses);
router.post('/', OrderAddressController.createOrderAddress);
router.put('/:id', OrderAddressController.updateOrderAddressById);
router.delete('/:id', OrderAddressController.deleteOrderAddressById);
router.get('/id', OrderAddressController.getOrderAddressById);


export default router;