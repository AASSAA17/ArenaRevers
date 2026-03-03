import express from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paginationSchema, addFavoriteSchema } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(addFavoriteSchema), favoriteController.addFavorite);
router.get('/', validate(paginationSchema), favoriteController.getUserFavorites);
router.get('/:arenaId/check', favoriteController.checkFavorite);
router.delete('/:arenaId', favoriteController.removeFavorite);

export default router;

