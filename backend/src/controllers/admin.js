import prisma from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

// GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true,
          isVerified: true, createdAt: true, avatarUrl: true,
          _count: { select: { pets: true, bookingsAsOwner: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(res, { users, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/verify
export const verifyUser = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isVerified: true },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });
    return sendSuccess(res, user, 'User verified');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return sendError(res, 'Cannot delete yourself', 400);
    await prisma.user.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'User deleted');
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [users, pets, bookings, services] = await prisma.$transaction([
      prisma.user.count(),
      prisma.pet.count(),
      prisma.booking.count(),
      prisma.service.count({ where: { isActive: true } }),
    ]);

    const recentBookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        owner: { select: { name: true } },
        service: { select: { title: true } },
        pet: { select: { name: true } },
      },
    });

    return sendSuccess(res, { stats: { users, pets, bookings, services }, recentBookings });
  } catch (err) {
    next(err);
  }
};
