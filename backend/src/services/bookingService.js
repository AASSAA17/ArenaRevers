import prisma from '../config/database.js';
import { calculateBookingAmount } from '../utils/booking.js';

export const checkAvailability = async (arenaId, startDatetime, endDatetime) => {
  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  const now = new Date();

  // Check for conflicting bookings (pending, confirmed, and non-expired holds)
  const conflicts = await prisma.booking.findMany({
    where: {
      arenaId,
      AND: [
        {
          OR: [
            // Active bookings (pending, confirmed)
            {
              status: {
                in: ['pending', 'confirmed'],
              },
            },
            // Non-expired holds
            {
              status: 'hold',
              holdExpireAt: {
                gt: now, // Only consider holds that haven't expired
              },
            },
          ],
        },
        {
          OR: [
            {
              AND: [
                { startDatetime: { lte: start } },
                { endDatetime: { gt: start } },
              ],
            },
            {
              AND: [
                { startDatetime: { lt: end } },
                { endDatetime: { gte: end } },
              ],
            },
            {
              AND: [
                { startDatetime: { gte: start } },
                { endDatetime: { lte: end } },
              ],
            },
          ],
        },
      ],
    },
  });

  return {
    available: conflicts.length === 0,
    conflicts: conflicts.map(c => ({
      id: c.id,
      startDatetime: c.startDatetime,
      endDatetime: c.endDatetime,
      status: c.status,
    })),
  };
};

export const createBooking = async (data, userId) => {
  const { arenaId, startDatetime, endDatetime, paymentType, promoCode, paymentProvider } = data;

  const start = new Date(startDatetime);
  const end = new Date(endDatetime);

  // Check availability
  const availability = await checkAvailability(arenaId, startDatetime, endDatetime);
  if (!availability.available) {
    throw new Error('Arena is not available for the selected time slot');
  }

  // Get arena details
  const arena = await prisma.arena.findUnique({
    where: { id: arenaId },
  });

  if (!arena) {
    throw new Error('Arena not found');
  }

  // Check arena status
  if (arena.status === 'maintenance') {
    throw new Error('Аренада техникалық проблемалар бар. Брондау мүмкін емес.');
  }
  if (arena.status === 'closed') {
    throw new Error('Арена қолжетімсіз. Брондау мүмкін емес.');
  }

  // Calculate total amount
  const totalAmount = await calculateBookingAmount(arena, start, end, promoCode);

  // Calculate amount to pay based on payment type
  const amountToPay = paymentType === 'deposit' 
    ? totalAmount * 0.5 
    : totalAmount;

  // Determine booking status and hold expiration
  // If payment provider is specified (not cash), create as HOLD
  // Otherwise, create as pending
  let bookingStatus = 'pending';
  let holdExpireAt = null;

  if (paymentProvider && paymentProvider !== 'cash') {
    bookingStatus = 'hold';
    // Default hold duration: 10 minutes (configurable via env)
    const holdDurationMinutes = parseInt(process.env.BOOKING_HOLD_DURATION_MINUTES || '10', 10);
    holdExpireAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);
  }

  // Create booking with try-catch to handle exclusion constraint violations
  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        arenaId,
        startDatetime: start,
        endDatetime: end,
        totalAmount,
        paidAmount: 0,
        paymentStatus: 'unpaid',
        status: bookingStatus,
        promoCode,
        holdExpireAt,
      },
      include: {
        arena: {
          include: {
            images: {
              take: 1,
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      booking,
      amountToPay: Number(amountToPay),
      totalAmount: Number(totalAmount),
      holdExpiresAt: holdExpireAt,
    };
  } catch (error) {
    // Handle PostgreSQL exclusion constraint violation (double booking)
    if (error.code && (error.code.startsWith('23') || error.code === '23514' || error.code === '23505')) {
      if (error.message && (error.message.includes('prevent_overlapping_bookings') || 
          error.message.includes('exclude') || 
          error.message.includes('overlapping'))) {
        const customError = new Error('TIME_SLOT_ALREADY_BOOKED');
        customError.code = 'TIME_SLOT_ALREADY_BOOKED';
        customError.statusCode = 409;
        throw customError;
      }
    }
    // Re-throw other errors
    throw error;
  }
};

export const getBookingById = async (id, userId, userRole) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      arena: {
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          owner: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      payments: {
        where: {
          status: 'succeeded',
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Check authorization
  if (booking.userId !== userId && booking.arena.ownerId !== userId && userRole !== 'ADMIN') {
    throw new Error('Not authorized to view this booking');
  }

  return booking;
};

export const getUserBookings = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        arena: {
          include: {
            images: {
              take: 1,
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        payments: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.booking.count({
      where: { userId },
    }),
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

export const cancelBooking = async (id, userId, userRole) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Check authorization
  if (booking.userId !== userId && userRole !== 'ADMIN') {
    throw new Error('Not authorized to cancel this booking');
  }

  // Check if booking can be cancelled
  if (['cancelled', 'completed'].includes(booking.status)) {
    throw new Error('Booking cannot be cancelled');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      status: 'cancelled',
    },
  });

  // TODO: Handle refunds if payment was made

  return updatedBooking;
};

export const confirmBooking = async (id, userId, userRole) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      arena: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Check authorization (owner or admin)
  if (booking.arena.ownerId !== userId && userRole !== 'ADMIN') {
    throw new Error('Not authorized to confirm this booking');
  }

  if (booking.status !== 'pending') {
    throw new Error('Booking cannot be confirmed');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      status: 'confirmed',
    },
  });

  return updatedBooking;
};

export const updateBooking = async (id, userId, userRole, data) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      arena: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Check authorization
  if (booking.userId !== userId && userRole !== 'ADMIN') {
    throw new Error('Not authorized to update this booking');
  }

  // Check if booking can be updated
  if (['cancelled', 'completed'].includes(booking.status)) {
    throw new Error('Booking cannot be updated');
  }

  const updateData = {};
  
  // If startDatetime or endDatetime is being updated, check availability
  if (data.startDatetime || data.endDatetime) {
    const newStart = data.startDatetime ? new Date(data.startDatetime) : booking.startDatetime;
    const newEnd = data.endDatetime ? new Date(data.endDatetime) : booking.endDatetime;

    // Check availability (excluding current booking)
    const conflicts = await prisma.booking.findMany({
      where: {
        arenaId: booking.arenaId,
        id: { not: id }, // Exclude current booking
        AND: [
          {
            OR: [
              { status: { in: ['pending', 'confirmed'] } },
              {
                status: 'hold',
                holdExpireAt: { gt: new Date() },
              },
            ],
          },
          {
            OR: [
              {
                AND: [
                  { startDatetime: { lte: newStart } },
                  { endDatetime: { gt: newStart } },
                ],
              },
              {
                AND: [
                  { startDatetime: { lt: newEnd } },
                  { endDatetime: { gte: newEnd } },
                ],
              },
              {
                AND: [
                  { startDatetime: { gte: newStart } },
                  { endDatetime: { lte: newEnd } },
                ],
              },
            ],
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      throw new Error('Arena is not available for the selected time slot');
    }

    updateData.startDatetime = newStart;
    updateData.endDatetime = newEnd;

    // Recalculate total amount if time changed
    const totalAmount = await calculateBookingAmount(booking.arena, newStart, newEnd, data.promoCode || booking.promoCode);
    updateData.totalAmount = totalAmount;
  }

  if (data.promoCode !== undefined) {
    updateData.promoCode = data.promoCode;
    // Recalculate total amount if promo code changed
    const start = updateData.startDatetime || booking.startDatetime;
    const end = updateData.endDatetime || booking.endDatetime;
    const totalAmount = await calculateBookingAmount(booking.arena, start, end, data.promoCode);
    updateData.totalAmount = totalAmount;
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      arena: {
        include: {
          images: {
            take: 1,
          },
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return updatedBooking;
};

export const getArenaCalendar = async (arenaId, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      arenaId,
      startDatetime: {
        gte: start,
      },
      endDatetime: {
        lte: end,
      },
      OR: [
        {
          status: {
            in: ['pending', 'confirmed'],
          },
        },
        {
          status: 'hold',
          holdExpireAt: {
            gt: now, // Только не истекшие holds
          },
        },
      ],
    },
    select: {
      id: true,
      startDatetime: true,
      endDatetime: true,
      status: true,
      user: {
        select: {
          fullName: true,
        },
      },
    },
  });

  return bookings.map(booking => ({
    id: booking.id,
    title: booking.user.fullName,
    start: booking.startDatetime,
    end: booking.endDatetime,
    status: booking.status,
  }));
};

