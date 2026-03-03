import prisma from '../config/database.js';

/**
 * Middleware to check if user is super admin
 */
export const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isSuperAdmin: true },
    });

    if (!user || !user.isSuperAdmin) {
      return res.status(403).json({ 
        error: 'Super admin access required. Only the primary admin can perform this action.' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization error' });
  }
};

/**
 * Helper function to check if user is super admin
 */
export const isSuperAdmin = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true, role: true },
  });

  return user && user.role === 'ADMIN' && user.isSuperAdmin === true;
};

