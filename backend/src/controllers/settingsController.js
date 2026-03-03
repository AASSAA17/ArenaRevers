import * as settingsService from '../services/settingsService.js';

/**
 * Get system settings
 */
export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

/**
 * Update system settings
 */
export const updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    const updatedSettings = await settingsService.updateSettings(
      settings,
      req.user.id,
      ipAddress
    );
    res.json({ settings: updatedSettings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get settings history
 */
export const getSettingsHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await settingsService.getSettingsHistory(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

