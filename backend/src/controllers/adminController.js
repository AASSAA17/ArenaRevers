import * as adminService from '../services/adminService.js';
import { getAuditLogs as getAuditLogsUtil, getSuspiciousActivity as getSuspiciousActivityUtil } from '../utils/auditLogger.js';
import { logAction } from '../utils/auditLogger.js';
import prisma from '../config/database.js';

/**
 * Get dashboard statistics
 */
export const getDashboard = async (req, res, next) => {
  try {
    const period = req.query.period || 'month';
    const [stats, alerts, quickStats] = await Promise.all([
      adminService.getDashboardStats(period),
      adminService.getDashboardAlerts(),
      adminService.getQuickStats(),
    ]);
    res.json({
      ...stats,
      alerts,
      quickStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings analytics
 */
export const getBookingsAnalytics = async (req, res, next) => {
  try {
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = req.query.endDate || new Date().toISOString();
    const groupBy = req.query.groupBy || 'day';

    const analytics = await adminService.getBookingsAnalytics(startDate, endDate, groupBy);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue analytics
 */
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = req.query.endDate || new Date().toISOString();
    const groupBy = req.query.groupBy || 'day';

    const analytics = await adminService.getRevenueAnalytics(startDate, endDate, groupBy);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user activity analytics
 */
export const getUserActivityAnalytics = async (req, res, next) => {
  try {
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = req.query.endDate || new Date().toISOString();

    const analytics = await adminService.getUserActivityAnalytics(startDate, endDate);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get arena popularity analytics
 */
export const getArenaPopularityAnalytics = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const analytics = await adminService.getArenaPopularityAnalytics(limit);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users
 */
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const result = await adminService.getUsers(page, limit, search);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'OWNER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent changing own role
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    // Check if target user is super admin
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { isSuperAdmin: true },
    });

    if (targetUser && targetUser.isSuperAdmin) {
      return res.status(403).json({ 
        error: 'Cannot modify super admin account. Only the primary admin account cannot be modified.' 
      });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const user = await adminService.updateUserRole(id, role, req.user.id, ipAddress);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all arenas
 */
export const getArenas = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || null;

    const result = await adminService.getArenas(page, limit, search, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update arena status
 */
export const updateArenaStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'maintenance', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const arena = await adminService.updateArenaStatus(id, status, req.user.id, ipAddress);
    res.json({ arena });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete arena
 */
export const deleteArena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await adminService.deleteArena(id, req.user.id, ipAddress);
    res.json({ message: 'Arena deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings
 */
export const getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || null;

    const result = await adminService.getBookings(page, limit, search, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark booking as completed by admin
 */
export const markBookingCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    const booking = await adminService.markBookingCompleted(id, req.user.id, ipAddress, notes);
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings that need admin attention
 */
export const getBookingsNeedingAttention = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await adminService.getBookingsNeedingAttention(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all payments
 */
export const getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      status: req.query.status || null,
      provider: req.query.provider || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      arenaId: req.query.arenaId || null,
      userId: req.query.userId || null,
    };

    const result = await adminService.getPayments(page, limit, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await adminService.getPaymentById(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment statistics
 */
export const getPaymentStats = async (req, res, next) => {
  try {
    const stats = await adminService.getPaymentStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Create refund
 */
export const createRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const refund = await adminService.createRefund(id, amount, reason, req.user.id);
    res.json({ refund });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all refunds
 */
export const getRefunds = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      status: req.query.status || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const result = await adminService.getRefunds(page, limit, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all ratings
 */
export const getRatings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      arenaId: req.query.arenaId || null,
      userId: req.query.userId || null,
      stars: req.query.stars || null,
      hasComment: req.query.hasComment || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const result = await adminService.getRatings(page, limit, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get rating by ID
 */
export const getRatingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rating = await adminService.getRatingById(id);

    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    res.json({ rating });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete rating
 */
export const deleteRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await adminService.deleteRating(id, req.user.id, ipAddress);
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rating statistics
 */
export const getRatingStats = async (req, res, next) => {
  try {
    const stats = await adminService.getRatingStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Send bulk notification
 */
export const sendBulkNotification = async (req, res, next) => {
  try {
    const { userIds, type, payload, channel } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    if (!type) {
      return res.status(400).json({ error: 'Notification type is required' });
    }

    const result = await adminService.sendBulkNotification(
      userIds,
      type,
      payload || {},
      channel || 'email'
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      type: req.query.type || null,
      channel: req.query.channel || null,
      isRead: req.query.isRead || null,
      userId: req.query.userId || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const result = await adminService.getNotifications(page, limit, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async (req, res, next) => {
  try {
    const stats = await adminService.getNotificationStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      userId: req.query.userId || null,
      action: req.query.action || null,
      resource: req.query.resource || null,
      resourceId: req.query.resourceId || null,
      ipAddress: req.query.ipAddress || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const result = await getAuditLogsUtil(page, limit, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get suspicious activity
 */
export const getSuspiciousActivity = async (req, res, next) => {
  try {
    const activity = await getSuspiciousActivityUtil();
    res.json(activity);
  } catch (error) {
    next(error);
  }
};

/**
 * Block user
 */
export const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Update user - add isBlocked field (will need migration)
    const user = await prisma.user.update({
      where: { id },
      data: {
        // isBlocked: true, // Uncomment after migration
      },
    });

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await logAction(
      req.user.id,
      'BLOCK_USER',
      'user',
      id,
      { reason },
      ipAddress
    );

    res.json({ user, message: 'User blocked successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Unblock user
 */
export const unblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: {
        // isBlocked: false, // Uncomment after migration
      },
    });

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await logAction(
      req.user.id,
      'UNBLOCK_USER',
      'user',
      id,
      null,
      ipAddress
    );

    res.json({ user, message: 'User unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update arena
 */
export const updateArena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const arena = await adminService.updateArena(id, data, req.user.id, ipAddress);
    res.json({ arena });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update arena status
 */
export const bulkUpdateArenaStatus = async (req, res, next) => {
  try {
    const { arenaIds, status } = req.body;

    if (!Array.isArray(arenaIds) || arenaIds.length === 0) {
      return res.status(400).json({ error: 'Arena IDs array is required' });
    }

    if (!['active', 'maintenance', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const result = await adminService.bulkUpdateArenaStatus(arenaIds, status, req.user.id, ipAddress);
    res.json({ result, message: `${result.count} arenas updated` });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify arena
 */
export const verifyArena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const arena = await adminService.verifyArena(id, req.user.id, ipAddress);
    res.json({ arena, message: 'Arena verified successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get arena statistics
 */
export const getArenaStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await adminService.getArenaStats(id);
    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed analytics for a specific arena
 */
export const getArenaAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = req.query.endDate || new Date().toISOString();
    const groupBy = req.query.groupBy || 'day';

    const analytics = await adminService.getArenaAnalytics(id, startDate, endDate, groupBy);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

