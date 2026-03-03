import * as arenaService from '../services/arenaService.js';
import { uploadFile } from '../utils/s3.js';
import prisma from '../config/database.js';

export const getArenas = async (req, res, next) => {
  try {
    const result = await arenaService.getArenas(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getArenaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const arena = await arenaService.getArenaById(id);
    res.json({ arena });
  } catch (error) {
    next(error);
  }
};

export const createArena = async (req, res, next) => {
  try {
    const arena = await arenaService.createArena(req.body, req.user.id);
    res.status(201).json({ arena });
  } catch (error) {
    next(error);
  }
};

export const updateArena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const arena = await arenaService.updateArena(
      id,
      req.body,
      req.user.id,
      req.user.role
    );
    res.json({ arena });
  } catch (error) {
    next(error);
  }
};

export const deleteArena = async (req, res, next) => {
  try {
    const { id } = req.params;
    await arenaService.deleteArena(id, req.user.id, req.user.role);
    res.json({ message: 'Arena deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check authorization
    const arena = await prisma.arena.findUnique({
      where: { id },
    });

    if (!arena) {
      return res.status(404).json({ error: 'Arena not found' });
    }

    if (arena.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Upload to S3 or local storage
    const key = `arenas/${id}/${Date.now()}-${file.originalname}`;
    let url = await uploadFile(file.buffer, key, file.mimetype);
    
    // If local storage, make it a full URL (use backend URL, not frontend)
    if (url.startsWith('/uploads/')) {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      url = `${protocol}://${host}${url}`;
    }

    // Get current max order for this arena
    const maxOrder = await prisma.arenaImage.aggregate({
      where: { arenaId: id },
      _max: { order: true },
    });

    // Save to database
    const image = await prisma.arenaImage.create({
      data: {
        arenaId: id,
        url,
        altText: file.originalname,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    res.status(201).json({ image });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    // Check authorization
    const arena = await prisma.arena.findUnique({
      where: { id },
    });

    if (!arena) {
      return res.status(404).json({ error: 'Arena not found' });
    }

    if (arena.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get image to delete
    const image = await prisma.arenaImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (image.arenaId !== id) {
      return res.status(400).json({ error: 'Image does not belong to this arena' });
    }

    // Delete from S3 or local storage
    const { deleteFile } = await import('../utils/s3.js');
    try {
      // Extract key from URL
      let key = image.url;
      
      // Handle different URL formats
      if (key.includes('/uploads/')) {
        // Extract path after /uploads/
        const parts = key.split('/uploads/');
        key = parts[parts.length - 1];
      } else if (key.includes('amazonaws.com/')) {
        // Extract key after amazonaws.com/
        const parts = key.split('amazonaws.com/');
        key = parts[parts.length - 1];
      } else if (key.startsWith('http://') || key.startsWith('https://')) {
        // Full URL - try to extract the path
        try {
          const url = new URL(key);
          const pathParts = url.pathname.split('/');
          // Find 'uploads' in path and get everything after it
          const uploadsIndex = pathParts.indexOf('uploads');
          if (uploadsIndex !== -1 && uploadsIndex < pathParts.length - 1) {
            key = pathParts.slice(uploadsIndex + 1).join('/');
          }
        } catch (e) {
          // If URL parsing fails, try to extract manually
          if (key.includes('/uploads/')) {
            key = key.split('/uploads/')[1].split('?')[0]; // Remove query params
          }
        }
      }
      
      if (key) {
        await deleteFile(key);
      }
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.arenaImage.delete({
      where: { id: imageId },
    });

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageIds } = req.body; // Array of image IDs in new order

    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ error: 'imageIds must be an array' });
    }

    // Check authorization
    const arena = await prisma.arena.findUnique({
      where: { id },
    });

    if (!arena) {
      return res.status(404).json({ error: 'Arena not found' });
    }

    if (arena.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Verify all images belong to this arena
    const images = await prisma.arenaImage.findMany({
      where: {
        id: { in: imageIds },
        arenaId: id,
      },
    });

    if (images.length !== imageIds.length) {
      return res.status(400).json({ error: 'Some images do not belong to this arena' });
    }

    // Update order for each image
    await Promise.all(
      imageIds.map((imageId, index) =>
        prisma.arenaImage.update({
          where: { id: imageId },
          data: { order: index },
        })
      )
    );

    res.json({ message: 'Images reordered successfully' });
  } catch (error) {
    next(error);
  }
};
