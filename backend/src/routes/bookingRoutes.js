import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createBookingSchema, updateBookingSchema, checkAvailabilitySchema, paginationSchema } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/',
  validate(createBookingSchema),
  bookingController.createBooking
);

router.get('/',
  validate(paginationSchema),
  bookingController.getUserBookings
);

router.get('/:id', bookingController.getBookingById);

router.put('/:id',
  validate(updateBookingSchema),
  bookingController.updateBooking
);

router.put('/:id/cancel', bookingController.cancelBooking);

router.post('/:id/confirm',
  authorize('OWNER', 'ADMIN'),
  bookingController.confirmBooking
);

router.get('/:id/receipt', bookingController.downloadReceipt);

export default router;

