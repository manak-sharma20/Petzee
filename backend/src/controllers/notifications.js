import prisma from '../utils/prisma.js';
import { sendSuccess } from '../utils/response.js';

// GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly = false } = req.query;
    const where = {
      userId: req.user.id,
      ...(unreadOnly === 'true' ? { isRead: false } : {}),
    };

    const [notifications, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);

    return sendSuccess(res, { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });
    return sendSuccess(res, null, 'Marked as read');
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};
