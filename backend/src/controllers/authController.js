import * as authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // Optionally, you can maintain a blacklist of tokens in Redis
  res.json({ message: 'Logged out successfully' });
};

export const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await authService.checkEmailExists(email);
    res.json({ exists: user !== null });
  } catch (error) {
    next(error);
  }
};

export const checkPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone is required' });
    }

    const user = await authService.checkPhoneExists(phone);
    res.json({ exists: user !== null });
  } catch (error) {
    next(error);
  }
};

