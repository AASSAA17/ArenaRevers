import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.get('/:id', authorize('ADMIN', 'OWNER'), userController.getUserById);

export default router;

