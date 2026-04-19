import prisma from '../utils/prisma.js';
import { sendSuccess, sendError, sendCreated } from '../utils/response.js';

// POST /api/consultations
export const createConsultation = async (req, res, next) => {
  try {
    const { vetId, petId, topic } = req.body;

    const [vet, pet] = await Promise.all([
      prisma.user.findFirst({ where: { id: vetId, role: 'VET' } }),
      prisma.pet.findFirst({ where: { id: petId, ownerId: req.user.id } }),
    ]);

    if (!vet) return sendError(res, 'Veterinarian not found', 404);
    if (!pet) return sendError(res, 'Pet not found', 404);

    const consultation = await prisma.consultation.create({
      data: {
        ownerId: req.user.id,
        vetId,
        petId,
        topic,
      },
      include: { vet: { select: { id: true, name: true, avatarUrl: true } }, pet: true },
    });

    // Notify vet
    await prisma.notification.create({
      data: {
        userId: vetId,
        type: 'CONSULTATION_STARTED',
        title: 'New consultation request',
        message: `${req.user.name} wants to consult about ${pet.name}`,
        metadata: { consultationId: consultation.id },
      },
    });

    req.io?.to(`user:${vetId}`).emit('new-consultation', consultation);
    return sendCreated(res, consultation, 'Consultation started');
  } catch (err) {
    next(err);
  }
};

// GET /api/consultations
export const getConsultations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const isVet = req.user.role === 'VET';

    const where = {
      ...(isVet ? { vetId: req.user.id } : { ownerId: req.user.id }),
      ...(status ? { status } : {}),
    };

    const consultations = await prisma.consultation.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        vet: { select: { id: true, name: true, avatarUrl: true } },
        pet: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { startedAt: 'desc' },
    });
    return sendSuccess(res, consultations);
  } catch (err) {
    next(err);
  }
};

// GET /api/consultations/:id/messages
export const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const consultation = await prisma.consultation.findFirst({
      where: {
        id: req.params.id,
        OR: [{ ownerId: req.user.id }, { vetId: req.user.id }],
      },
    });
    if (!consultation) return sendError(res, 'Consultation not found', 404);

    const [messages, total] = await prisma.$transaction([
      prisma.message.findMany({
        where: { consultationId: req.params.id },
        include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
        orderBy: { createdAt: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.message.count({ where: { consultationId: req.params.id } }),
    ]);

    return sendSuccess(res, { messages, total });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/consultations/:id/close
export const closeConsultation = async (req, res, next) => {
  try {
    const consultation = await prisma.consultation.findFirst({
      where: { id: req.params.id, OR: [{ ownerId: req.user.id }, { vetId: req.user.id }] },
    });
    if (!consultation) return sendError(res, 'Not found', 404);

    const updated = await prisma.consultation.update({
      where: { id: req.params.id },
      data: { status: 'CLOSED', endedAt: new Date() },
    });
    req.io?.to(`consultation:${req.params.id}`).emit('consultation-closed', { id: req.params.id });
    return sendSuccess(res, updated, 'Consultation closed');
  } catch (err) {
    next(err);
  }
};

// GET /api/consultations/vets – list all vets (for owner to pick)
export const listVets = async (req, res, next) => {
  try {
    const vets = await prisma.user.findMany({
      where: { role: 'VET', isVerified: true },
      select: { id: true, name: true, avatarUrl: true, bio: true, phone: true },
    });
    return sendSuccess(res, vets);
  } catch (err) {
    next(err);
  }
};
