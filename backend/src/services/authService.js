import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

export const register = async (data) => {
  const { fullName, email, phone, password } = data;
  
  // Normalize phone - remove formatting and ensure +7 prefix
  let normalizedPhone = null;
  if (phone && phone.trim() !== '') {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      // If starts with 7, use as is; otherwise add 7
      normalizedPhone = digitsOnly.startsWith('7') 
        ? digitsOnly.slice(0, 11) // Limit to 11 digits (7 + 10)
        : '7' + digitsOnly.slice(0, 10); // Add 7 prefix and limit to 10 digits
    }
  }

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new Error('User with this email or phone already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone: normalizedPhone,
      passwordHash,
      role: 'USER',
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      isSuperAdmin: user.isSuperAdmin || false,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken) => {
  const { verifyRefreshToken } = await import('../utils/jwt.js');
  const decoded = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isVerified: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newAccessToken = generateAccessToken(user.id);

  return {
    accessToken: newAccessToken,
    user,
  };
};

export const checkEmailExists = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
};

export const checkPhoneExists = async (phone) => {
  if (!phone || phone.trim() === '') {
    return null;
  }
  
  // Normalize phone - remove all non-digit characters
  const normalizedPhone = phone.replace(/\D/g, '');
  
  if (normalizedPhone.length < 10) {
    return null; // Invalid phone number
  }
  
  // Normalize to 11 digits format (7 + 10 digits)
  let searchPhone = normalizedPhone;
  if (normalizedPhone.length === 10) {
    searchPhone = '7' + normalizedPhone;
  } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('7')) {
    searchPhone = normalizedPhone;
  } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('8')) {
    // Handle Russian format (8 instead of 7)
    searchPhone = '7' + normalizedPhone.slice(1);
  } else {
    // Take last 11 digits if longer
    searchPhone = normalizedPhone.slice(-11);
    if (!searchPhone.startsWith('7')) {
      searchPhone = '7' + searchPhone.slice(1);
    }
  }
  
  // Exact match search (more efficient than contains)
  return await prisma.user.findFirst({
    where: { 
      phone: searchPhone
    },
    select: { id: true },
  });
};

