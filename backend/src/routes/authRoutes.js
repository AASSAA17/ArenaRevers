import express from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation.js';
import { authLimiter, checkLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', 
  authLimiter,
  validate(registerSchema),
  authController.register
);

router.post('/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

router.post('/refresh',
  validate(refreshTokenSchema),
  authController.refresh
);

router.post('/logout', authController.logout);

router.get('/check-email', checkLimiter, authController.checkEmail);
router.get('/check-phone', checkLimiter, authController.checkPhone);

export default router;

