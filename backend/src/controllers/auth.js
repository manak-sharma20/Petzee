import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { sendSuccess, sendError, sendCreated } from '../utils/response.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['OWNER', 'PROVIDER', 'VET']).optional().default('OWNER'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return sendError(res, 'Email already registered', 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        phone: data.phone,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // If provider, create Provider record
    if (data.role === 'PROVIDER') {
      await prisma.provider.create({
        data: { userId: user.id, businessName: data.name },
      });
    }

    const token = generateToken(user);
    return sendCreated(res, { user, token }, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return sendError(res, 'Invalid credentials', 401);

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) return sendError(res, 'Invalid credentials', 401);

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    return sendSuccess(res, { user: safeUser, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        avatarUrl: true, phone: true, bio: true, isVerified: true, createdAt: true,
      },
    });
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio } = req.body;
    const avatarUrl = req.file?.path;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
      },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, phone: true, bio: true },
    });
    return sendSuccess(res, user, 'Profile updated');
  } catch (err) {
    next(err);
  }
};
