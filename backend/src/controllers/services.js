import prisma from '../utils/prisma.js';
import { sendSuccess, sendError, sendCreated } from '../utils/response.js';

// POST /api/services  (Provider only)
export const createService = async (req, res, next) => {
  try {
    const { title, description, category, price, duration } = req.body;
    const imageUrl = req.file?.path;

    const service = await prisma.service.create({
      data: {
        providerId: req.user.id,
        title,
        description,
        category,
        price: parseFloat(price),
        duration: duration ? parseInt(duration) : null,
        imageUrl,
      },
    });
    return sendCreated(res, service, 'Service created');
  } catch (err) {
    next(err);
  }
};

// GET /api/services  (Public)
export const getServices = async (req, res, next) => {
  try {
    const { category, city, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { isActive: true };
    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [services, total] = await prisma.$transaction([
      prisma.service.findMany({
        where,
        include: {
          provider: {
            include: {
              // join to User for name + avatar
            },
          },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.service.count({ where }),
    ]);

    return sendSuccess(res, {
      services,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/services/:id  (Public)
export const getServiceById = async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        provider: true,
        bookings: {
          where: { status: 'COMPLETED' },
          include: { review: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!service) return sendError(res, 'Service not found', 404);
    return sendSuccess(res, service);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/services/:id  (Provider owner only)
export const updateService = async (req, res, next) => {
  try {
    const service = await prisma.service.findFirst({
      where: { id: req.params.id, providerId: req.user.id },
    });
    if (!service) return sendError(res, 'Service not found', 404);

    const { title, description, category, price, duration, isActive } = req.body;
    const imageUrl = req.file?.path;

    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
        ...(imageUrl && { imageUrl }),
      },
    });
    return sendSuccess(res, updated, 'Service updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/services/:id  (Provider owner)
export const deleteService = async (req, res, next) => {
  try {
    const service = await prisma.service.findFirst({
      where: { id: req.params.id, providerId: req.user.id },
    });
    if (!service) return sendError(res, 'Service not found', 404);

    await prisma.service.update({ where: { id: req.params.id }, data: { isActive: false } });
    return sendSuccess(res, null, 'Service deactivated');
  } catch (err) {
    next(err);
  }
};

// GET /api/services/provider/me  — Provider's own listings
export const getMyServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { providerId: req.user.id },
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, services);
  } catch (err) {
    next(err);
  }
};
