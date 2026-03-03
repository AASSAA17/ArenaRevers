import prisma from '../config/database.js';

export const getArenas = async (filters = {}) => {
  const {
    sport,
    search,
    lat,
    lng,
    radius = 10, // km
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
  } = filters;

  const skip = (page - 1) * limit;

  const where = {};
  const andConditions = [];

  // Search functionality - поиск по названию, адресу, описанию и типу спорта
  if (search && search.trim()) {
    const searchTerm = search.trim();
    const searchConditions = [
      {
        title: {
          contains: searchTerm,
          mode: 'insensitive', // Case-insensitive search
        },
      },
      {
        address: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        sportType: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ];

    // Добавляем условие поиска
    andConditions.push({
      OR: searchConditions,
    });
  }

  // Фильтр по типу спорта
  if (sport) {
    andConditions.push({
      sportType: sport,
    });
  }

  // Фильтр по цене
  if (minPrice || maxPrice) {
    const priceCondition = {};
    if (minPrice) priceCondition.gte = minPrice;
    if (maxPrice) priceCondition.lte = maxPrice;
    andConditions.push({
      pricePerHour: priceCondition,
    });
  }

  // Фильтр по местоположению
  if (lat && lng) {
    // Simple distance calculation (for production, use PostGIS)
    // This is a simplified version - for accurate results, use PostGIS extension
    andConditions.push({
      latitude: {
        gte: lat - (radius / 111), // approximate km to degrees
        lte: lat + (radius / 111),
      },
      longitude: {
        gte: lng - (radius / (111 * Math.cos(lat * Math.PI / 180))),
        lte: lng + (radius / (111 * Math.cos(lat * Math.PI / 180))),
      },
    });
  }

  // Статус арены (показываем активные и на обслуживании, но не закрытые)
  // Это позволяет пользователям видеть арены с техническими проблемами
  andConditions.push({
    status: {
      in: ['active', 'maintenance'],
    },
  });

  // Комбинируем все условия через AND
  if (andConditions.length > 0) {
    where.AND = andConditions;
  } else {
    where.status = {
      in: ['active', 'maintenance'],
    };
  }

  const [arenas, total] = await Promise.all([
    prisma.arena.findMany({
      where,
      skip,
      take: limit,
      include: {
        images: {
          take: 3,
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
        _count: {
          select: {
            ratings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.arena.count({ where }),
  ]);

  // Calculate average ratings
  const arenasWithRatings = await Promise.all(
    arenas.map(async (arena) => {
      const avgRating = await prisma.rating.aggregate({
        where: { arenaId: arena.id },
        _avg: { stars: true },
      });

      return {
        ...arena,
        avgRating: avgRating._avg.stars || 0,
      };
    })
  );

  return {
    arenas: arenasWithRatings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getArenaById = async (id) => {
  const arena = await prisma.arena.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: {
          order: 'asc',
        },
      },
      schedules: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          ratings: true,
          bookings: true,
        },
      },
    },
  });

  if (!arena) {
    throw new Error('Arena not found');
  }

  const avgRating = await prisma.rating.aggregate({
    where: { arenaId: id },
    _avg: { stars: true },
  });

  return {
    ...arena,
    avgRating: avgRating._avg.stars || 0,
  };
};

export const createArena = async (data, ownerId) => {
  const arena = await prisma.arena.create({
    data: {
      ...data,
      ownerId,
    },
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
  });

  return arena;
};

export const updateArena = async (id, data, userId, userRole) => {
  const arena = await prisma.arena.findUnique({
    where: { id },
  });

  if (!arena) {
    throw new Error('Arena not found');
  }

  // Check ownership or admin
  if (arena.ownerId !== userId && userRole !== 'ADMIN') {
    throw new Error('Not authorized to update this arena');
  }

  const updatedArena = await prisma.arena.update({
    where: { id },
    data,
    include: {
      images: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  return updatedArena;
};

export const deleteArena = async (id, userId, userRole) => {
  const arena = await prisma.arena.findUnique({
    where: { id },
  });

  if (!arena) {
    throw new Error('Arena not found');
  }

  if (arena.ownerId !== userId && userRole !== 'ADMIN') {
    throw new Error('Not authorized to delete this arena');
  }

  await prisma.arena.delete({
    where: { id },
  });

  return { message: 'Arena deleted successfully' };
};

