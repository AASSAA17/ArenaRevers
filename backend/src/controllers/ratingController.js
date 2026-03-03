import prisma from '../config/database.js';

export const createRating = async (req, res, next) => {
  try {
    const { id } = req.params; // arena id
    const { stars, comment } = req.body;

    // Check if user already rated this arena
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_arenaId: {
          userId: req.user.id,
          arenaId: id,
        },
      },
    });

    let rating;
    if (existingRating) {
      // Update existing rating
      rating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { stars, comment },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });
    } else {
      // Create new rating
      rating = await prisma.rating.create({
        data: {
          userId: req.user.id,
          arenaId: id,
          stars,
          comment,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });
    }

    res.status(201).json({ rating });
  } catch (error) {
    next(error);
  }
};

export const getArenaRatings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { arenaId: id },
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.rating.count({
        where: { arenaId: id },
      }),
    ]);

    res.json({
      ratings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

