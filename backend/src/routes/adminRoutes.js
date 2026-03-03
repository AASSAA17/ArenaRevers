import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as settingsController from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Analytics
router.get('/analytics/bookings', adminController.getBookingsAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/users', adminController.getUserActivityAnalytics);
router.get('/analytics/arenas', adminController.getArenaPopularityAnalytics);

// Users management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);

// Arenas management
router.get('/arenas', adminController.getArenas);
router.put('/arenas/:id', adminController.updateArena);
router.patch('/arenas/:id/status', adminController.updateArenaStatus);
router.post('/arenas/bulk-status', adminController.bulkUpdateArenaStatus);
router.post('/arenas/:id/verify', adminController.verifyArena);
router.get('/arenas/:id/stats', adminController.getArenaStats);
router.get('/arenas/:id/analytics', adminController.getArenaAnalytics);
router.delete('/arenas/:id', adminController.deleteArena);

// Bookings management
router.get('/bookings', adminController.getBookings);
router.post('/bookings/:id/mark-completed', adminController.markBookingCompleted);
router.get('/bookings/needing-attention', adminController.getBookingsNeedingAttention);

// Payments management
router.get('/payments', adminController.getPayments);
router.get('/payments/stats', adminController.getPaymentStats);
router.get('/payments/:id', adminController.getPaymentById);
router.post('/payments/:id/refund', adminController.createRefund);
router.get('/refunds', adminController.getRefunds);

// Ratings management
router.get('/ratings', adminController.getRatings);
router.get('/ratings/stats', adminController.getRatingStats);
router.get('/ratings/:id', adminController.getRatingById);
router.delete('/ratings/:id', adminController.deleteRating);

// Notifications management
router.post('/notifications/bulk', adminController.sendBulkNotification);
router.get('/notifications', adminController.getNotifications);
router.get('/notifications/stats', adminController.getNotificationStats);

// Audit and security
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/security/suspicious', adminController.getSuspiciousActivity);
router.post('/users/:id/block', adminController.blockUser);
router.post('/users/:id/unblock', adminController.unblockUser);

// Settings
router.get('/settings', settingsController.getSettings);
router.patch('/settings', settingsController.updateSettings);
router.get('/settings/history', settingsController.getSettingsHistory);

export default router;

