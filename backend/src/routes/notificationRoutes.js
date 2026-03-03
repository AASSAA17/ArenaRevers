import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paginationSchema } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/',
  validate(paginationSchema),
  notificationController.getNotifications
);

router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

export default router;

