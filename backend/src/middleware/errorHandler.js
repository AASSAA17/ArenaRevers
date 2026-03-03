import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const errorMessages = err.errors.map(e => {
      const field = e.path[e.path.length - 1];
      return `${field}: ${e.message}`;
    });
    return res.status(400).json({
      error: 'Validation error',
      message: errorMessages.join(', '),
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this value already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not found',
      message: 'The requested record was not found',
    });
  }

  // PostgreSQL exclusion constraint violation (double booking prevention)
  // Error codes: 23XXX for constraint violations
  // Specific code for EXCLUDE constraint: usually 23514 or generic 23505
  if (err.code && (err.code.startsWith('23') || err.code === '23514' || err.code === '23505')) {
    // Check if it's related to booking overlap
    if (err.message && (err.message.includes('prevent_overlapping_bookings') || 
        err.message.includes('exclude') || 
        err.message.includes('overlapping'))) {
      return res.status(409).json({
        error: 'TIME_SLOT_ALREADY_BOOKED',
        message: 'The selected time slot is already booked. Please choose another time.',
        code: 'TIME_SLOT_ALREADY_BOOKED',
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Default error
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

