import prisma from '../config/database.js';

export const addFavorite = async (userId, arenaId) => {
  // Check if already favorited
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_arenaId: {
        userId,
        arenaId,
      },
    },
  });

  if (existing) {
    throw new Error('Arena already in favorites');
  }

  const favorite = await prisma.favorite.create({
    data: {
      userId,
      arenaId,
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
    },
  });

  return favorite;
};

export const removeFavorite = async (userId, arenaId) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_arenaId: {
        userId,
        arenaId,
      },
    },
  });

  if (!favorite) {
    throw new Error('Favorite not found');
  }

  await prisma.favorite.delete({
    where: {
      userId_arenaId: {
        userId,
        arenaId,
      },
    },
  });

  return true;
};

export const getUserFavorites = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        arena: {
          include: {
            images: {
              take: 3,
              orderBy: {
                order: 'asc',
              },
            },
            _count: {
              select: {
                ratings: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.favorite.count({
      where: { userId },
    }),
  ]);

  // Calculate average ratings
  const favoritesWithRatings = await Promise.all(
    favorites.map(async (favorite) => {
      const avgRating = await prisma.rating.aggregate({
        where: { arenaId: favorite.arenaId },
        _avg: { stars: true },
      });

      return {
        ...favorite,
        arena: {
          ...favorite.arena,
          avgRating: avgRating._avg.stars || 0,
        },
      };
    })
  );

  return {
    favorites: favoritesWithRatings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const isFavorite = async (userId, arenaId) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_arenaId: {
        userId,
        arenaId,
      },
    },
  });

  return !!favorite;
};

