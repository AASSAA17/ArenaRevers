import prisma from '../config/database.js';

// Default settings
const DEFAULT_SETTINGS = {
  platformCommission: 10, // 10%
  minCommission: 0,
  systemWorkingHours: {
    start: '00:00',
    end: '23:59',
  },
  promoCodeSettings: {
    enabled: true,
    maxDiscount: 50, // 50%
  },
  emailSettings: {
    fromEmail: 'noreply@arenareserve.kz',
    fromName: 'ArenaReserve',
  },
  bookingSettings: {
    minBookingDuration: 1, // hours
    maxBookingDuration: 6, // hours
    advanceBookingDays: 30, // days
    cancellationHours: 24, // hours before booking
  },
  paymentSettings: {
    allowedProviders: ['stripe', 'kaspi', 'cash'],
    defaultProvider: 'cash',
  },
};

/**
 * Get system settings
 */
export const getSettings = async () => {
  // For now, return default settings
  // In production, store in database or config file
  return DEFAULT_SETTINGS;
};

/**
 * Update system settings
 */
export const updateSettings = async (settings, adminId, ipAddress) => {
  // Validate settings
  if (settings.platformCommission !== undefined) {
    if (settings.platformCommission < 0 || settings.platformCommission > 100) {
      throw new Error('Platform commission must be between 0 and 100');
    }
  }

  // Merge with defaults
  const updatedSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  // TODO: Store in database or config file
  // For now, just return updated settings

  // Log action
  await logAction(
    adminId,
    'UPDATE_SETTINGS',
    'settings',
    null,
    { settings: updatedSettings },
    ipAddress
  );

  return updatedSettings;
};

/**
 * Get settings history (if stored in database)
 */
export const getSettingsHistory = async (page = 1, limit = 20) => {
  // TODO: Implement if storing history in database
  return {
    history: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  };
};

