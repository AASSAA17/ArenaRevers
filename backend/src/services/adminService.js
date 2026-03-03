import prisma from '../config/database.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * Get all users with pagination
 */
export const getUsers = async (page = 1, limit = 20, search = '') => {
  const skip = (page - 1) * limit;
  
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            ownedArenas: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          bookings: true,
          ownedArenas: true,
          payments: true,
          ratings: true,
        },
      },
    },
  });
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, newRole, adminId, ipAddress) => {
  // Check if target user is super admin
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true, role: true },
  });

  if (targetUser && targetUser.isSuperAdmin) {
    throw new Error('Cannot modify super admin account');
  }

  // Check if admin trying to change is super admin
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { isSuperAdmin: true },
  });

  // Only super admin can assign ADMIN role
  if (newRole === 'ADMIN' && (!admin || !admin.isSuperAdmin)) {
    throw new Error('Only super admin can assign ADMIN role');
  }

  const oldRole = targetUser?.role || 'unknown';

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isSuperAdmin: true,
    },
  });

  // Log action
  await logAction(
    adminId,
    'CHANGE_ROLE',
    'user',
    userId,
    { oldRole, newRole },
    ipAddress
  );

  return user;
};

/**
 * Get all arenas with pagination
 */
export const getArenas = async (page = 1, limit = 20, search = '', status = null) => {
  const skip = (page - 1) * limit;
  
  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { sportType: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
  };

  const [arenas, total] = await Promise.all([
    prisma.arena.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            ratings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.arena.count({ where }),
  ]);

  return {
    arenas,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update arena status
 */
export const updateArenaStatus = async (arenaId, status, adminId, ipAddress) => {
  const arena = await prisma.arena.update({
    where: { id: arenaId },
    data: { status },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  // Log action
  await logAction(
    adminId,
    'UPDATE_ARENA_STATUS',
    'arena',
    arenaId,
    { status },
    ipAddress
  );

  return arena;
};

/**
 * Delete arena
 */
export const deleteArena = async (arenaId, adminId, ipAddress) => {
  const arena = await prisma.arena.delete({
    where: { id: arenaId },
  });

  // Log action
  await logAction(
    adminId,
    'DELETE_ARENA',
    'arena',
    arenaId,
    { title: arena.title },
    ipAddress
  );

  return arena;
};

/**
 * Get all bookings with pagination
 */
export const getBookings = async (page = 1, limit = 20, search = '', status = null) => {
  const skip = (page - 1) * limit;
  
  const where = {
    ...(search && {
      OR: [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { arena: { title: { contains: search, mode: 'insensitive' } } },
      ],
    }),
    ...(status && { status }),
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        arena: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get dashboard alerts and critical metrics
 */
export const getDashboardAlerts = async () => {
  const [
    pendingBookings,
    failedPayments,
    unverifiedArenas,
    blockedUsers,
    recentErrors,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        status: 'pending',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
    prisma.payment.count({
      where: {
        status: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.arena.count({
      where: {
        // isVerified: false, // Uncomment after migration
        status: 'active',
      },
    }),
    prisma.user.count({
      where: {
        // isBlocked: true, // Uncomment after migration
      },
    }),
    prisma.auditLog.count({
      where: {
        action: { contains: 'ERROR', mode: 'insensitive' },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const alerts = [];
  
  if (pendingBookings > 10) {
    alerts.push({
      type: 'warning',
      message: `${pendingBookings} pending bookings in last 24 hours`,
      action: 'review_bookings',
    });
  }
  
  if (failedPayments > 5) {
    alerts.push({
      type: 'error',
      message: `${failedPayments} failed payments in last 24 hours`,
      action: 'review_payments',
    });
  }
  
  if (unverifiedArenas > 0) {
    alerts.push({
      type: 'info',
      message: `${unverifiedArenas} unverified active arenas`,
      action: 'verify_arenas',
    });
  }

  return {
    alerts,
    counts: {
      pendingBookings,
      failedPayments,
      unverifiedArenas,
      blockedUsers,
      recentErrors,
    },
  };
};

/**
 * Get quick statistics for dashboard
 */
export const getQuickStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(now.setDate(now.getDate() - 7));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayBookings,
    weekBookings,
    monthBookings,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    todayUsers,
    weekUsers,
    monthUsers,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.booking.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.booking.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.payment.aggregate({
      where: { status: 'succeeded', createdAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'succeeded', createdAt: { gte: weekStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'succeeded', createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  return {
    bookings: {
      today: todayBookings,
      week: weekBookings,
      month: monthBookings,
    },
    revenue: {
      today: Number(todayRevenue?._sum?.amount || 0),
      week: Number(weekRevenue?._sum?.amount || 0),
      month: Number(monthRevenue?._sum?.amount || 0),
    },
    users: {
      today: todayUsers,
      week: weekUsers,
      month: monthUsers,
    },
  };
};

/**
 * Get dashboard statistics with trends
 */
export const getDashboardStats = async (period = 'month') => {
  const now = new Date();
  let startDate, previousStartDate;
  
  // Calculate date ranges based on period
  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }

  const [
    totalUsers,
    activeArenas,
    totalArenas,
    totalBookings,
    currentPeriodBookings,
    previousPeriodBookings,
    // Статистика по статусам бронирований
    confirmedBookings,
    cancelledBookings,
    pendingBookings,
    completedBookings,
    adminMarkedCompleted,
    bookingsNeedingAttention,
    // Доходы (только для подтвержденных и завершенных бронирований, не отмененных)
    totalRevenue,
    currentPeriodRevenue,
    previousPeriodRevenue,
    // Доходы с учетом отмененных (для сравнения)
    totalRevenueWithCancelled,
    currentPeriodRevenueWithCancelled,
    recentBookings,
    recentUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    failedPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.arena.count({ where: { status: 'active' } }),
    prisma.arena.count(),
    prisma.booking.count(),
    prisma.booking.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.booking.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    }),
    // Статистика по статусам
    prisma.booking.count({
      where: { status: 'confirmed' },
    }),
    prisma.booking.count({
      where: { status: 'cancelled' },
    }),
    prisma.booking.count({
      where: { status: 'pending' },
    }),
    prisma.booking.count({
      where: { status: 'completed' },
    }),
    // Бронирования, отмеченные админом как завершенные
    prisma.booking.count({
      where: { adminMarkedCompleted: true },
    }),
    // Бронирования, требующие внимания (завершились, но не отмечены)
    prisma.booking.count({
      where: {
        endDatetime: { lte: now },
        status: { in: ['confirmed', 'pending'] },
        adminMarkedCompleted: false,
      },
    }),
    // Реальные доходы (только успешные платежи для подтвержденных/завершенных бронирований)
    prisma.payment.aggregate({
      where: {
        status: 'succeeded',
        booking: {
          status: { in: ['confirmed', 'completed'] },
        },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'succeeded',
        createdAt: { gte: startDate },
        booking: {
          status: { in: ['confirmed', 'completed'] },
        },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'succeeded',
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
        booking: {
          status: { in: ['confirmed', 'completed'] },
        },
      },
      _sum: { amount: true },
    }),
    // Доходы с учетом всех платежей (включая отмененные) для сравнения
    prisma.payment.aggregate({
      where: { status: 'succeeded' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'succeeded',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        arena: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.payment.count({
      where: { status: 'failed' },
    }),
  ]);

  // Calculate trends
  const bookingsTrend = previousPeriodBookings > 0
    ? ((currentPeriodBookings - previousPeriodBookings) / previousPeriodBookings * 100).toFixed(1)
    : currentPeriodBookings > 0 ? '100' : '0';

  const revenueTrend = (previousPeriodRevenue?._sum?.amount || 0) > 0
    ? ((Number(currentPeriodRevenue?._sum?.amount || 0) - Number(previousPeriodRevenue?._sum?.amount || 0)) / Number(previousPeriodRevenue?._sum?.amount || 0) * 100).toFixed(1)
    : Number(currentPeriodRevenue?._sum?.amount || 0) > 0 ? '100' : '0';

  // Расчет процента отмененных бронирований
  const cancellationRate = totalBookings > 0
    ? ((cancelledBookings / totalBookings) * 100).toFixed(2)
    : '0';

  // Разница между реальными доходами и доходами с учетом отмененных
  const lostRevenue = Number(totalRevenueWithCancelled?._sum?.amount || 0) - Number(totalRevenue?._sum?.amount || 0);

  return {
    stats: {
      totalUsers,
      activeArenas,
      totalArenas,
      totalBookings,
      currentPeriodBookings,
      bookingsTrend: parseFloat(bookingsTrend),
      // Статистика по статусам
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      completedBookings,
      adminMarkedCompleted,
      bookingsNeedingAttention,
      cancellationRate: parseFloat(cancellationRate),
      // Реальные доходы (без отмененных)
      totalRevenue: Number(totalRevenue?._sum?.amount || 0),
      currentPeriodRevenue: Number(currentPeriodRevenue?._sum?.amount || 0),
      revenueTrend: parseFloat(revenueTrend),
      // Для сравнения
      totalRevenueWithCancelled: Number(totalRevenueWithCancelled?._sum?.amount || 0),
      currentPeriodRevenueWithCancelled: Number(currentPeriodRevenueWithCancelled?._sum?.amount || 0),
      lostRevenue,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      failedPayments,
    },
    recentBookings,
    recentUsers,
  };
};

/**
 * Get bookings analytics by date range
 */
export const getBookingsAnalytics = async (startDate, endDate, groupBy = 'day') => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      totalAmount: true,
      paidAmount: true,
      paymentStatus: true,
      arena: {
        select: {
          id: true,
          sportType: true,
          title: true,
        },
      },
      payments: {
        where: {
          status: 'succeeded',
        },
        select: {
          amount: true,
        },
      },
    },
  });

  // Group by period
  const grouped = {};
  bookings.forEach(booking => {
    const date = new Date(booking.createdAt);
    let key;
    
    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        total: 0,
        confirmed: 0,
        cancelled: 0,
        pending: 0,
        completed: 0,
        hold: 0,
        // Реальные доходы (только для подтвержденных/завершенных)
        revenue: 0,
        // Потенциальные доходы (включая отмененные)
        potentialRevenue: 0,
        // Потерянные доходы (отмененные)
        lostRevenue: 0,
      };
    }

    grouped[key].total++;
    grouped[key][booking.status] = (grouped[key][booking.status] || 0) + 1;
    
    // Потенциальный доход (все бронирования)
    if (booking.totalAmount) {
      grouped[key].potentialRevenue += Number(booking.totalAmount);
    }
    
    // Реальный доход (только подтвержденные и завершенные)
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      const actualRevenue = booking.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      grouped[key].revenue += actualRevenue || Number(booking.paidAmount || 0);
    }
    
    // Потерянный доход (отмененные)
    if (booking.status === 'cancelled' && booking.totalAmount) {
      grouped[key].lostRevenue += Number(booking.totalAmount);
    }
  });

  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const hold = bookings.filter(b => b.status === 'hold').length;
  
  // Реальные доходы (только подтвержденные/завершенные)
  const actualRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => {
      const paymentAmount = b.payments.reduce((pSum, p) => pSum + Number(p.amount), 0);
      return sum + (paymentAmount || Number(b.paidAmount || 0));
    }, 0);
  
  // Потерянные доходы (отмененные)
  const lostRevenue = bookings
    .filter(b => b.status === 'cancelled')
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  return {
    period: { startDate: start, endDate: end },
    groupBy,
    data: Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)),
    summary: {
      total: bookings.length,
      confirmed,
      cancelled,
      pending,
      completed,
      hold,
      actualRevenue,
      lostRevenue,
      cancellationRate: bookings.length > 0 ? ((cancelled / bookings.length) * 100).toFixed(2) : '0',
    },
  };
};

/**
 * Get revenue analytics by date range
 */
export const getRevenueAnalytics = async (startDate, endDate, groupBy = 'day') => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const payments = await prisma.payment.findMany({
    where: {
      status: 'succeeded',
      createdAt: {
        gte: start,
        lte: end,
      },
      // Исключаем платежи для отмененных бронирований
      booking: {
        status: { in: ['confirmed', 'completed'] },
      },
    },
    select: {
      id: true,
      amount: true,
      provider: true,
      createdAt: true,
      booking: {
        select: {
          id: true,
          status: true,
          arena: {
            select: {
              id: true,
              sportType: true,
              title: true,
            },
          },
        },
      },
    },
  });

  // Group by period
  const grouped = {};
  payments.forEach(payment => {
    const date = new Date(payment.createdAt);
    let key;
    
    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        total: 0,
        stripe: 0,
        kaspi: 0,
        cash: 0,
      };
    }

    const amount = Number(payment.amount);
    grouped[key].total += amount;
    grouped[key][payment.provider] = (grouped[key][payment.provider] || 0) + amount;
  });

  // Group by provider
  const byProvider = {
    stripe: 0,
    kaspi: 0,
    cash: 0,
  };
  payments.forEach(p => {
    byProvider[p.provider] += Number(p.amount);
  });

  return {
    period: { startDate: start, endDate: end },
    groupBy,
    data: Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)),
    byProvider,
    total: payments.reduce((sum, p) => sum + Number(p.amount), 0),
  };
};

/**
 * Get user activity analytics
 */
export const getUserActivityAnalytics = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      id: true,
      createdAt: true,
      role: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  // Group by day
  const grouped = {};
  users.forEach(user => {
    const date = new Date(user.createdAt);
    const key = date.toISOString().split('T')[0];

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        total: 0,
        users: 0,
        owners: 0,
        admins: 0,
        activeUsers: 0, // users with bookings
      };
    }

    grouped[key].total++;
    grouped[key][user.role.toLowerCase() + 's'] = (grouped[key][user.role.toLowerCase() + 's'] || 0) + 1;
    if (user._count.bookings > 0) {
      grouped[key].activeUsers++;
    }
  });

  return {
    period: { startDate: start, endDate: end },
    data: Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)),
    summary: {
      total: users.length,
      users: users.filter(u => u.role === 'USER').length,
      owners: users.filter(u => u.role === 'OWNER').length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      activeUsers: users.filter(u => u._count.bookings > 0).length,
    },
  };
};

/**
 * Get arena popularity analytics
 */
export const getArenaPopularityAnalytics = async (limit = 10) => {
  const arenas = await prisma.arena.findMany({
    include: {
      owner: {
        select: {
          fullName: true,
          email: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          ratings: true,
        },
      },
    },
    orderBy: {
      bookings: {
        _count: 'desc',
      },
    },
    take: limit,
  });

  // Calculate detailed stats for each arena
  const arenasWithRevenue = await Promise.all(
    arenas.map(async (arena) => {
      const [
        revenue,
        cancelledBookings,
        confirmedBookings,
        lostRevenue,
        avgRating,
      ] = await Promise.all([
        // Реальные доходы (только подтвержденные/завершенные)
        prisma.payment.aggregate({
          where: {
            status: 'succeeded',
            booking: {
              arenaId: arena.id,
              status: { in: ['confirmed', 'completed'] },
            },
          },
          _sum: { amount: true },
        }),
        // Отмененные бронирования
        prisma.booking.count({
          where: {
            arenaId: arena.id,
            status: 'cancelled',
          },
        }),
        // Подтвержденные бронирования
        prisma.booking.count({
          where: {
            arenaId: arena.id,
            status: 'confirmed',
          },
        }),
        // Потерянные доходы (отмененные)
        prisma.booking.aggregate({
          where: {
            arenaId: arena.id,
            status: 'cancelled',
          },
          _sum: { totalAmount: true },
        }),
        prisma.rating.aggregate({
          where: { arenaId: arena.id },
          _avg: { stars: true },
        }),
      ]);

      const actualRevenue = Number(revenue?._sum?.amount || 0);
      const lostRev = Number(lostRevenue?._sum?.totalAmount || 0);
      const cancellationRate = arena._count.bookings > 0
        ? ((cancelledBookings / arena._count.bookings) * 100).toFixed(2)
        : '0';

      return {
        id: arena.id,
        title: arena.title,
        sportType: arena.sportType,
        address: arena.address,
        owner: arena.owner,
        bookingsCount: arena._count.bookings,
        confirmedBookings,
        cancelledBookings,
        cancellationRate: parseFloat(cancellationRate),
        ratingsCount: arena._count.ratings,
        avgRating: avgRating._avg.stars || 0,
        revenue: actualRevenue,
        lostRevenue: lostRev,
      };
    })
  );

  return {
    arenas: arenasWithRevenue.sort((a, b) => b.revenue - a.revenue),
  };
};

/**
 * Get all payments with pagination and filters
 */
export const getPayments = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.provider) {
    where.provider = filters.provider;
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
  
  if (filters.arenaId) {
    where.booking = {
      arenaId: filters.arenaId,
    };
  }
  
  if (filters.userId) {
    where.userId = filters.userId;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        booking: {
          include: {
            arena: {
              select: {
                id: true,
                title: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId) => {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      booking: {
        include: {
          arena: {
            select: {
              id: true,
              title: true,
              address: true,
              owner: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

/**
 * Get payment statistics
 */
export const getPaymentStats = async () => {
  const [
    total,
    succeeded,
    pending,
    failed,
    refunded,
    totalRevenue,
    byProvider,
    recentPayments,
  ] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.count({ where: { status: 'succeeded' } }),
    prisma.payment.count({ where: { status: 'pending' } }),
    prisma.payment.count({ where: { status: 'failed' } }),
    prisma.payment.count({ where: { status: 'refunded' } }),
    prisma.payment.aggregate({
      where: { status: 'succeeded' },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['provider'],
      where: { status: 'succeeded' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        booking: {
          select: {
            arena: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    total,
    succeeded,
    pending,
    failed,
    refunded,
    totalRevenue: Number(totalRevenue?._sum?.amount || 0),
    byProvider: byProvider.map(p => ({
      provider: p.provider,
      count: p._count,
      revenue: Number(p?._sum?.amount || 0),
    })),
    recentPayments,
  };
};

/**
 * Get all refunds with pagination
 */
export const getRefunds = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (filters.status) {
    where.status = filters.status;
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

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      skip,
      take: limit,
      include: {
        payment: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            booking: {
              select: {
                arena: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.refund.count({ where }),
  ]);

  return {
    refunds,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Create refund
 */
export const createRefund = async (paymentId, amount, reason, adminId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: true,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'succeeded') {
    throw new Error('Can only refund succeeded payments');
  }

  const refundAmount = amount || Number(payment.amount);

  // Create refund record
  const refund = await prisma.refund.create({
    data: {
      paymentId,
      amount: refundAmount,
      reason,
      status: 'pending',
    },
    include: {
      payment: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // TODO: Process refund through payment provider (Stripe/Kaspi)
  // For now, mark as processed
  // In production, this should be done asynchronously via webhook

  return refund;
};

/**
 * Get all ratings with pagination and filters
 */
export const getRatings = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (filters.arenaId) {
    where.arenaId = filters.arenaId;
  }
  
  if (filters.userId) {
    where.userId = filters.userId;
  }
  
  if (filters.stars) {
    where.stars = parseInt(filters.stars);
  }
  
  if (filters.hasComment !== undefined) {
    if (filters.hasComment === 'true') {
      where.comment = { not: null };
    } else {
      where.comment = null;
    }
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

  const [ratings, total] = await Promise.all([
    prisma.rating.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        arena: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rating.count({ where }),
  ]);

  return {
    ratings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get rating by ID
 */
export const getRatingById = async (ratingId) => {
  return prisma.rating.findUnique({
    where: { id: ratingId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      arena: {
        select: {
          id: true,
          title: true,
          address: true,
        },
      },
    },
  });
};

/**
 * Delete rating
 */
export const deleteRating = async (ratingId, adminId, ipAddress) => {
  const rating = await prisma.rating.delete({
    where: { id: ratingId },
  });

  // Log action
  await logAction(
    adminId,
    'DELETE_RATING',
    'rating',
    ratingId,
    { arenaId: rating.arenaId, userId: rating.userId },
    ipAddress
  );

  return rating;
};

/**
 * Get rating statistics
 */
export const getRatingStats = async () => {
  const [
    total,
    withComments,
    avgRating,
    byStars,
    recentRatings,
  ] = await Promise.all([
    prisma.rating.count(),
    prisma.rating.count({ where: { comment: { not: null } } }),
    prisma.rating.aggregate({
      _avg: { stars: true },
    }),
    prisma.rating.groupBy({
      by: ['stars'],
      _count: true,
    }),
    prisma.rating.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        arena: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    withComments,
    avgRating: Number(avgRating._avg.stars || 0).toFixed(2),
    byStars: byStars.map(s => ({
      stars: s.stars,
      count: s._count,
    })),
    recentRatings,
  };
};

/**
 * Send bulk notification to multiple users
 */
export const sendBulkNotification = async (userIds, type, payload, channel = 'email') => {
  const notifications = userIds.map(userId => ({
    userId,
    type,
    payload,
    channel,
    isRead: false,
  }));

  const created = await prisma.notification.createMany({
    data: notifications,
  });

  // TODO: Queue actual email/push notifications via workers

  return {
    sent: created.count,
    total: userIds.length,
  };
};

/**
 * Get all notifications with pagination and filters
 */
export const getNotifications = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (filters.type) {
    where.type = filters.type;
  }
  
  if (filters.channel) {
    where.channel = filters.channel;
  }
  
  if (filters.isRead !== undefined) {
    where.isRead = filters.isRead === 'true';
  }
  
  if (filters.userId) {
    where.userId = filters.userId;
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

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
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
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async () => {
  const [
    total,
    read,
    unread,
    byType,
    byChannel,
  ] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: true } }),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.groupBy({
      by: ['type'],
      _count: true,
    }),
    prisma.notification.groupBy({
      by: ['channel'],
      _count: true,
    }),
  ]);

  return {
    total,
    read,
    unread,
    byType: byType.map(t => ({
      type: t.type,
      count: t._count,
    })),
    byChannel: byChannel.map(c => ({
      channel: c.channel,
      count: c._count,
    })),
  };
};

/**
 * Update arena (admin can edit any arena)
 */
export const updateArena = async (arenaId, data, adminId, ipAddress) => {
  const arena = await prisma.arena.update({
    where: { id: arenaId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.sportType && { sportType: data.sportType }),
      ...(data.address && { address: data.address }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.pricePerHour !== undefined && { pricePerHour: data.pricePerHour }),
      ...(data.status && { status: data.status }),
      ...(data.technicalInfo && { technicalInfo: data.technicalInfo }),
    },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  // Log action
  await logAction(
    adminId,
    'UPDATE_ARENA',
    'arena',
    arenaId,
    { changes: data },
    ipAddress
  );

  return arena;
};

/**
 * Bulk update arena status
 */
export const bulkUpdateArenaStatus = async (arenaIds, status, adminId, ipAddress) => {
  const result = await prisma.arena.updateMany({
    where: {
      id: { in: arenaIds },
    },
    data: { status },
  });

  // Log action
  await logAction(
    adminId,
    'BULK_UPDATE_ARENA_STATUS',
    'arena',
    null,
    { arenaIds, status, count: result.count },
    ipAddress
  );

  return result;
};

/**
 * Verify arena
 */
export const verifyArena = async (arenaId, adminId, ipAddress) => {
  // Note: This requires adding isVerified field to Arena model
  const arena = await prisma.arena.update({
    where: { id: arenaId },
    data: {
      // isVerified: true, // Uncomment after migration
    },
  });

  // Log action
  await logAction(
    adminId,
    'VERIFY_ARENA',
    'arena',
    arenaId,
    null,
    ipAddress
  );

  return arena;
};

/**
 * Get arena statistics
 */
export const getArenaStats = async (arenaId) => {
  const [
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    pendingBookings,
    completedBookings,
    holdBookings,
    // Реальные доходы (только подтвержденные/завершенные)
    revenue,
    // Потенциальные доходы (все бронирования)
    potentialRevenue,
    // Потерянные доходы (отмененные)
    lostRevenue,
    ratings,
    avgRating,
    upcomingBookings,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count({ where: { arenaId } }),
    prisma.booking.count({ where: { arenaId, status: 'confirmed' } }),
    prisma.booking.count({ where: { arenaId, status: 'cancelled' } }),
    prisma.booking.count({ where: { arenaId, status: 'pending' } }),
    prisma.booking.count({ where: { arenaId, status: 'completed' } }),
    prisma.booking.count({ where: { arenaId, status: 'hold' } }),
    // Реальные доходы (только успешные платежи для подтвержденных/завершенных)
    prisma.payment.aggregate({
      where: {
        status: 'succeeded',
        booking: {
          arenaId,
          status: { in: ['confirmed', 'completed'] },
        },
      },
      _sum: { amount: true },
    }),
    // Потенциальные доходы (все бронирования)
    prisma.booking.aggregate({
      where: { arenaId },
      _sum: { totalAmount: true },
    }),
    // Потерянные доходы (отмененные)
    prisma.booking.aggregate({
      where: {
        arenaId,
        status: 'cancelled',
      },
      _sum: { totalAmount: true },
    }),
    prisma.rating.count({ where: { arenaId } }),
    prisma.rating.aggregate({
      where: { arenaId },
      _avg: { stars: true },
    }),
    prisma.booking.count({
      where: {
        arenaId,
        status: { in: ['pending', 'confirmed'] },
        startDatetime: { gte: new Date() },
      },
    }),
    prisma.booking.findMany({
      where: { arenaId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const actualRevenue = Number(revenue._sum.amount || 0);
  const potentialRev = Number(potentialRevenue?._sum?.totalAmount || 0);
  const lostRev = Number(lostRevenue._sum.totalAmount || 0);
  const cancellationRate = totalBookings > 0
    ? ((cancelledBookings / totalBookings) * 100).toFixed(2)
    : '0';

  return {
    // Общая статистика
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    pendingBookings,
    completedBookings,
    holdBookings,
    cancellationRate: parseFloat(cancellationRate),
    // Доходы
    revenue: actualRevenue,
    potentialRevenue: potentialRev,
    lostRevenue: lostRev,
    // Рейтинги
    ratings,
    avgRating: Number(avgRating._avg.stars || 0).toFixed(2),
    // Будущие бронирования
    upcomingBookings,
    // Недавние бронирования
    recentBookings,
  };
};

/**
 * Mark booking as completed by admin (when session ended without cancellation)
 */
export const markBookingCompleted = async (bookingId, adminId, ipAddress, notes = null) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      arena: true,
      user: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Check if booking has already ended
  const now = new Date();
  if (new Date(booking.endDatetime) > now) {
    throw new Error('Booking has not ended yet');
  }

  // Update booking status and mark as admin completed
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'completed',
      adminMarkedCompleted: true,
      adminNotes: notes || null,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      arena: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  // Log action
  await logAction(
    adminId,
    'MARK_BOOKING_COMPLETED',
    'booking',
    bookingId,
    { 
      previousStatus: booking.status,
      notes: notes || 'Сеанс завершен без отмены',
    },
    ipAddress
  );

  return updatedBooking;
};

/**
 * Get bookings that need admin attention (ended but not marked as completed)
 */
export const getBookingsNeedingAttention = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = {
    endDatetime: {
      lte: now, // Booking has ended
    },
    status: {
      in: ['confirmed', 'pending'], // Not cancelled or already completed
    },
    adminMarkedCompleted: false, // Not yet marked by admin
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        arena: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
      orderBy: {
        endDatetime: 'desc',
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get detailed analytics for a specific arena
 */
export const getArenaAnalytics = async (arenaId, startDate, endDate, groupBy = 'day') => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      arenaId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      totalAmount: true,
      paidAmount: true,
      paymentStatus: true,
      startDatetime: true,
      endDatetime: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      payments: {
        where: {
          status: 'succeeded',
        },
        select: {
          amount: true,
          provider: true,
          createdAt: true,
        },
      },
    },
  });

  // Group by period
  const grouped = {};
  bookings.forEach(booking => {
    const date = new Date(booking.createdAt);
    let key;
    
    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        total: 0,
        confirmed: 0,
        cancelled: 0,
        pending: 0,
        completed: 0,
        hold: 0,
        revenue: 0,
        potentialRevenue: 0,
        lostRevenue: 0,
        byProvider: {
          stripe: 0,
          kaspi: 0,
          cash: 0,
        },
      };
    }

    grouped[key].total++;
    grouped[key][booking.status] = (grouped[key][booking.status] || 0) + 1;
    
    // Потенциальный доход
    if (booking.totalAmount) {
      grouped[key].potentialRevenue += Number(booking.totalAmount);
    }
    
    // Реальный доход (только подтвержденные/завершенные)
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      const actualRevenue = booking.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      grouped[key].revenue += actualRevenue || Number(booking.paidAmount || 0);
      
      // По провайдерам
      booking.payments.forEach(payment => {
        if (payment.provider in grouped[key].byProvider) {
          grouped[key].byProvider[payment.provider] += Number(payment.amount);
        }
      });
    }
    
    // Потерянный доход (отмененные)
    if (booking.status === 'cancelled' && booking.totalAmount) {
      grouped[key].lostRevenue += Number(booking.totalAmount);
    }
  });

  // Общая статистика
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const hold = bookings.filter(b => b.status === 'hold').length;
  
  const actualRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => {
      const paymentAmount = b.payments.reduce((pSum, p) => pSum + Number(p.amount), 0);
      return sum + (paymentAmount || Number(b.paidAmount || 0));
    }, 0);
  
  const lostRevenue = bookings
    .filter(b => b.status === 'cancelled')
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  // По провайдерам
  const byProvider = {
    stripe: 0,
    kaspi: 0,
    cash: 0,
  };
  bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .forEach(b => {
      b.payments.forEach(p => {
        if (p.provider in byProvider) {
          byProvider[p.provider] += Number(p.amount);
        }
      });
    });

  return {
    arenaId,
    period: { startDate: start, endDate: end },
    groupBy,
    data: Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)),
    summary: {
      total: bookings.length,
      confirmed,
      cancelled,
      pending,
      completed,
      hold,
      actualRevenue,
      lostRevenue,
      cancellationRate: bookings.length > 0 ? ((cancelled / bookings.length) * 100).toFixed(2) : '0',
      byProvider,
    },
  };
};

