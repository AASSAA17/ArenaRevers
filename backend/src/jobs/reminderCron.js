import cron from 'node-cron';
import prisma from '../config/database.js';
import { reminderQueue } from '../workers/queue.js';
import logger from '../utils/logger.js';

/**
 * Cron job to send booking reminders 1 hour before booking time
 * Runs every 15 minutes
 */
export const startReminderCron = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      // Find bookings that start in 1 hour and haven't been reminded
      const bookings = await prisma.booking.findMany({
        where: {
          status: 'confirmed',
          startDatetime: {
            gte: now,
            lte: oneHourLater,
          },
        },
        include: {
          user: true,
        },
      });

      for (const booking of bookings) {
        // Check if reminder already sent (you can add a field to track this)
        // For now, we'll send reminder for all bookings
        
        await reminderQueue.add('booking-reminder', {
          bookingId: booking.id,
          userId: booking.userId,
          startDatetime: booking.startDatetime,
        }, {
          jobId: `reminder-${booking.id}`, // Prevent duplicates
        });

        logger.info(`Scheduled reminder for booking ${booking.id}`);
      }
    } catch (error) {
      logger.error('Error in reminder cron job:', error);
    }
  });

  logger.info('Reminder cron job started');
};

/**
 * Cron job to mark completed bookings
 * Runs every hour
 */
export const startCompletionCron = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();

      // Mark bookings as completed if end time has passed
      const result = await prisma.booking.updateMany({
        where: {
          status: {
            in: ['confirmed', 'pending'],
          },
          endDatetime: {
            lte: now,
          },
        },
        data: {
          status: 'completed',
        },
      });

      logger.info(`Marked ${result.count} bookings as completed`);
    } catch (error) {
      logger.error('Error in completion cron job:', error);
    }
  });

  logger.info('Completion cron job started');
};

