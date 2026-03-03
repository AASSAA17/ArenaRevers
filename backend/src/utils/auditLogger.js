import prisma from '../config/database.js';

/**
 * Log admin action to audit log
 */
export const logAction = async (userId, action, resource, resourceId = null, details = null, ipAddress = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
        ipAddress,
      },
    });
  } catch (error) {
    // Don't throw error if audit logging fails
    console.error('Failed to log audit action:', error);
  }
};

/**
 * Get audit logs with pagination and filters
 */
export const getAuditLogs = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (filters.userId) {
    where.userId = filters.userId;
  }
  
  if (filters.action) {
    where.action = { contains: filters.action, mode: 'insensitive' };
  }
  
  if (filters.resource) {
    where.resource = filters.resource;
  }
  
  if (filters.resourceId) {
    where.resourceId = filters.resourceId;
  }
  
  if (filters.ipAddress) {
    where.ipAddress = filters.ipAddress;
  }
  
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get suspicious activity patterns
 */
export const getSuspiciousActivity = async () => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  // Find users with many failed login attempts
  const failedLogins = await prisma.auditLog.groupBy({
    by: ['userId', 'ipAddress'],
    where: {
      action: { contains: 'LOGIN_FAILED', mode: 'insensitive' },
      createdAt: { gte: oneDayAgo },
    },
    _count: true,
    having: {
      userId: {
        _count: {
          gt: 5, // More than 5 failed attempts
        },
      },
    },
  });

  // Find multiple actions from same IP
  const ipActivity = await prisma.auditLog.groupBy({
    by: ['ipAddress'],
    where: {
      createdAt: { gte: oneDayAgo },
      ipAddress: { not: null },
    },
    _count: true,
    having: {
      ipAddress: {
        _count: {
          gt: 50, // More than 50 actions from same IP
        },
      },
    },
  });

  // Find unusual admin actions
  const adminActions = await prisma.auditLog.findMany({
    where: {
      action: {
        in: ['DELETE_USER', 'DELETE_ARENA', 'CHANGE_ROLE', 'BLOCK_USER'],
      },
      createdAt: { gte: oneDayAgo },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return {
    failedLogins: failedLogins.map(f => ({
      userId: f.userId,
      ipAddress: f.ipAddress,
      attempts: f._count,
    })),
    suspiciousIPs: ipActivity.map(i => ({
      ipAddress: i.ipAddress,
      actions: i._count,
    })),
    recentAdminActions: adminActions,
  };
};

