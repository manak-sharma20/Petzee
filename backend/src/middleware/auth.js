// ─── Auth Middleware ────────────────────────────────────────────────
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';
import prisma from '../utils/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, isVerified: true },
    });

    if (!user) return sendError(res, 'User not found', 401);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return sendError(res, 'Token expired', 401);
    return sendError(res, 'Invalid token', 401);
  }
};

// ─── RBAC Middleware ────────────────────────────────────────────────
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return sendError(res, 'Forbidden: insufficient permissions', 403);
  }
  next();
};
