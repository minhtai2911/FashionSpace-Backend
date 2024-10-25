import {Router} from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware.verifyToken, userController.getAllUsers);
router.get('/:id', authMiddleware.verifyToken, userController.getUserById);
router.delete('/:id', authMiddleware.verifyToken, userController.deleteUserById);
router.put('/:id', authMiddleware.verifyToken, userController.updateUserById);

export default router;