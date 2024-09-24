import {Router} from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', authMiddleware.verifyToken, userController.getUserById);
router.delete('/:id', userController.deleteUserById);
router.put('/:id', userController.updateUserById);

export default router;