import cron from 'node-cron';
import prisma from '../config/database.js';
import { notificationQueue } from '../workers/queue.js';
import logger from '../utils/logger.js';

/**
 * Cron job to expire hold bookings
 * Runs every minute to check for expired holds
 */
export const startHoldExpirationCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find bookings with status 'hold' that have expired
      const expiredHolds = await prisma.booking.findMany({
        where: {
          status: 'hold',
          holdExpireAt: {
            lte: now,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
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

      if (expiredHolds.length > 0) {
        logger.info(`Found ${expiredHolds.length} expired hold(s)`);

        for (const booking of expiredHolds) {
          // Update booking status to cancelled
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: 'cancelled',
              holdExpireAt: null,
            },
          });

          // Send notification to user
          await notificationQueue.add('hold-expired', {
            userId: booking.userId,
            type: 'booking_cancelled',
            payload: {
              bookingId: booking.id,
              arenaTitle: booking.arena.title,
              reason: 'Payment timeout - hold expired',
            },
            channel: 'email',
          });

          logger.info(`Cancelled expired hold booking ${booking.id} for user ${booking.userId}`);
        }

        logger.info(`Processed ${expiredHolds.length} expired hold(s)`);
      }
    } catch (error) {
      logger.error('Error in hold expiration cron job:', error);
    }
  });

  logger.info('Hold expiration cron job started (runs every minute)');
};

