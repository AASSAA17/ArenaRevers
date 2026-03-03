import * as favoriteService from '../services/favoriteService.js';

export const addFavorite = async (req, res, next) => {
  try {
    const { arenaId } = req.body;
    const favorite = await favoriteService.addFavorite(req.user.id, arenaId);
    res.status(201).json({ favorite });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { arenaId } = req.params;
    await favoriteService.removeFavorite(req.user.id, arenaId);
    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserFavorites = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await favoriteService.getUserFavorites(
      req.user.id,
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const checkFavorite = async (req, res, next) => {
  try {
    const { arenaId } = req.params;
    const isFav = await favoriteService.isFavorite(req.user.id, arenaId);
    res.json({ isFavorite: isFav });
  } catch (error) {
    next(error);
  }
};

