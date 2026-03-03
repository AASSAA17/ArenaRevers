import './queue.js';
import { startReminderCron, startCompletionCron } from '../jobs/reminderCron.js';
import { startHoldExpirationCron } from '../jobs/holdExpirationCron.js';
import logger from '../utils/logger.js';

logger.info('Starting background workers...');

// Start cron jobs
startReminderCron();
startCompletionCron();
startHoldExpirationCron();

logger.info('All workers started successfully');

// Keep process alive
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down workers...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down workers...');
  process.exit(0);
});

