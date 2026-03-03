import express from 'express';
import multer from 'multer';
import * as arenaController from '../controllers/arenaController.js';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createArenaSchema, updateArenaSchema, arenaSearchSchema, checkAvailabilitySchema } from '../utils/validation.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Public routes
router.get('/', optionalAuth, validate(arenaSearchSchema), arenaController.getArenas);
router.get('/:id', optionalAuth, arenaController.getArenaById);
router.get('/:id/calendar', optionalAuth, bookingController.getArenaCalendar);
router.post('/:id/check-availability', optionalAuth, validate(checkAvailabilitySchema), bookingController.checkAvailability);

// Protected routes
router.use(authenticate);

router.post('/', 
  authorize('OWNER', 'ADMIN'),
  validate(createArenaSchema),
  arenaController.createArena
);

router.post('/:id/upload-image',
  authorize('OWNER', 'ADMIN'),
  upload.single('image'),
  arenaController.uploadImage
);

router.delete('/:id/images/:imageId',
  authorize('OWNER', 'ADMIN'),
  arenaController.deleteImage
);

router.put('/:id/images/reorder',
  authorize('OWNER', 'ADMIN'),
  arenaController.reorderImages
);

router.put('/:id',
  authorize('OWNER', 'ADMIN'),
  validate(updateArenaSchema),
  arenaController.updateArena
);

router.delete('/:id',
  authorize('OWNER', 'ADMIN'),
  arenaController.deleteArena
);

export default router;

