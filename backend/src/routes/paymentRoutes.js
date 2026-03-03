import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPaymentSchema, processCardPaymentSchema } from '../utils/validation.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Webhook routes (no auth, but signature verification)
// Note: For Stripe webhooks, use express.raw() middleware in production
router.post('/webhook/:provider',
  express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }),
  paymentController.handleWebhook
);

// Protected routes
router.use(authenticate);

router.post('/create',
  paymentLimiter,
  validate(createPaymentSchema),
  paymentController.createPayment
);

router.get('/:id/status', paymentController.getPaymentStatus);

router.post('/process-card',
  paymentLimiter,
  validate(processCardPaymentSchema),
  paymentController.processCardPayment
);

export default router;

