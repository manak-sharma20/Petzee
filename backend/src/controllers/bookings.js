import prisma from '../utils/prisma.js';
import { sendSuccess, sendError, sendCreated } from '../utils/response.js';
import { sendBookingConfirmationEmail } from '../services/email.js';

// POST /api/bookings
export const createBooking = async (req, res, next) => {
  try {
    const { serviceId, petId, scheduledAt, notes } = req.body;

    // Verify pet belongs to owner
    const pet = await prisma.pet.findFirst({
      where: { id: petId, ownerId: req.user.id },
    });
    if (!pet) return sendError(res, 'Pet not found', 404);

    // Get service and validate it's active
    const service = await prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
      include: { provider: true },
    });
    if (!service) return sendError(res, 'Service not found or unavailable', 404);

    const booking = await prisma.booking.create({
      data: {
        ownerId: req.user.id,
        serviceId,
        petId,
        scheduledAt: new Date(scheduledAt),
        totalPrice: service.price,
        notes,
      },
      include: { service: { include: { provider: true } }, pet: true },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking created',
        message: `Your booking for ${service.title} on ${new Date(scheduledAt).toLocaleDateString()} is pending confirmation.`,
        metadata: { bookingId: booking.id },
      },
    });

    // Send confirmation email (non-blocking)
    sendBookingConfirmationEmail(req.user, booking).catch(console.error);

    return sendCreated(res, booking, 'Booking created successfully');
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings
export const getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { ownerId: req.user.id };
    if (status) where.status = status;

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: {
          service: { include: { provider: true } },
          pet: true,
          review: true,
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    return sendSuccess(res, {
      bookings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
      include: { service: { include: { provider: true } }, pet: true, review: true },
    });
    if (!booking) return sendError(res, 'Booking not found', 404);
    return sendSuccess(res, booking);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/status  (Provider / Admin only)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!allowed.includes(status)) return sendError(res, 'Invalid status', 400);

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { service: true, owner: true },
    });
    if (!booking) return sendError(res, 'Booking not found', 404);

    // Provider can only update their own service bookings
    if (req.user.role === 'PROVIDER' && booking.service.providerId !== req.user.id) {
      return sendError(res, 'Forbidden', 403);
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Notify owner
    await prisma.notification.create({
      data: {
        userId: booking.ownerId,
        type: status === 'CANCELLED' ? 'BOOKING_CANCELLED' : 'BOOKING_CONFIRMED',
        title: `Booking ${status.toLowerCase()}`,
        message: `Your booking for ${booking.service.title} has been ${status.toLowerCase()}.`,
        metadata: { bookingId: booking.id },
      },
    });

    // Emit real-time notification
    req.io?.to(`user:${booking.ownerId}`).emit('notification', {
      type: 'BOOKING_UPDATE',
      bookingId: booking.id,
      status,
    });

    return sendSuccess(res, updated, `Booking ${status.toLowerCase()}`);
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/review
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, ownerId: req.user.id, status: 'COMPLETED' },
    });
    if (!booking) return sendError(res, 'Booking not found or not completed', 404);

    const review = await prisma.review.create({
      data: { bookingId: req.params.id, userId: req.user.id, rating: parseInt(rating), comment },
    });

    // Update provider average rating
    const reviews = await prisma.review.findMany({
      where: { booking: { service: { providerId: booking.service?.providerId } } },
      select: { rating: true },
    });
    if (reviews.length > 0) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await prisma.provider.update({
        where: { userId: booking.service?.providerId },
        data: { rating: avg, reviewCount: reviews.length },
      });
    }

    return sendCreated(res, review, 'Review submitted');
  } catch (err) {
    next(err);
  }
};
