import {Router} from "express";
import userAddressController from "../controllers/userAddressController.js";

const router = Router();

router.get('/', userAddressController.getAllUserAddresses);
router.post('/', userAddressController.createUserAddress);
router.put('/', userAddressController.updateUserAddressById);
router.delete('/', userAddressController.deleteUserAddressById);
router.get('/', userAddressController.getUserAddressById);


export default router;