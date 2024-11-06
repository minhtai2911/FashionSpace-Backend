import {Router} from "express";
import OrderAddressController from "../controllers/orderAddressController.js";

const router = Router();

router.get('/', OrderAddressController.getAllOrderAddresses);
router.post('/', OrderAddressController.createOrderAddress);
router.put('/', OrderAddressController.updateOrderAddressById);
router.delete('/', OrderAddressController.deleteOrderAddressById);
router.get('/', OrderAddressController.getOrderAddressById);


export default router;