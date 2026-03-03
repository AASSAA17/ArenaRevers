import express from 'express';
import * as ratingController from '../controllers/ratingController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRatingSchema, paginationSchema } from '../utils/validation.js';

const router = express.Router();

// Public route
router.get('/:id', optionalAuth, validate(paginationSchema), ratingController.getArenaRatings);

// Protected route
router.post('/:id',
  authenticate,
  validate(createRatingSchema),
  ratingController.createRating
);

export default router;

