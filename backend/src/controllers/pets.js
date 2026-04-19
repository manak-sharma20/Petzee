import prisma from '../utils/prisma.js';
import { sendSuccess, sendError, sendCreated } from '../utils/response.js';

// POST /api/pets
export const createPet = async (req, res, next) => {
  try {
    const { name, species, breed, dob, gender, weight, allergies, notes } = req.body;
    const photoUrl = req.file?.path;

    const pet = await prisma.pet.create({
      data: {
        ownerId: req.user.id,
        name,
        species,
        breed,
        dob: dob ? new Date(dob) : null,
        gender,
        photoUrl,
        weight: weight ? parseFloat(weight) : null,
        allergies,
        notes,
      },
    });
    return sendCreated(res, pet, 'Pet added successfully');
  } catch (err) {
    next(err);
  }
};

// GET /api/pets
export const getPets = async (req, res, next) => {
  try {
    const pets = await prisma.pet.findMany({
      where: { ownerId: req.user.id },
      include: {
        vaccinationRecords: {
          orderBy: { givenAt: 'desc' },
          take: 1,
        },
        _count: { select: { bookings: true, consultations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, pets);
  } catch (err) {
    next(err);
  }
};

// GET /api/pets/:id
export const getPetById = async (req, res, next) => {
  try {
    const pet = await prisma.pet.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
      include: {
        vaccinationRecords: { orderBy: { givenAt: 'desc' } },
        bookings: {
          include: { service: true },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!pet) return sendError(res, 'Pet not found', 404);
    return sendSuccess(res, pet);
  } catch (err) {
    next(err);
  }
};

// PUT /api/pets/:id
export const updatePet = async (req, res, next) => {
  try {
    const { name, species, breed, dob, gender, weight, allergies, notes } = req.body;
    const photoUrl = req.file?.path;

    const pet = await prisma.pet.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!pet) return sendError(res, 'Pet not found', 404);

    const updated = await prisma.pet.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(species && { species }),
        ...(breed !== undefined && { breed }),
        ...(dob && { dob: new Date(dob) }),
        ...(gender && { gender }),
        ...(photoUrl && { photoUrl }),
        ...(weight !== undefined && { weight: parseFloat(weight) }),
        ...(allergies !== undefined && { allergies }),
        ...(notes !== undefined && { notes }),
      },
    });
    return sendSuccess(res, updated, 'Pet updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/pets/:id
export const deletePet = async (req, res, next) => {
  try {
    const pet = await prisma.pet.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!pet) return sendError(res, 'Pet not found', 404);

    await prisma.pet.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Pet removed');
  } catch (err) {
    next(err);
  }
};

// POST /api/pets/:id/vaccinations
export const addVaccination = async (req, res, next) => {
  try {
    const { vaccineName, givenAt, nextDueAt, notes } = req.body;
    const documentUrl = req.file?.path;

    const pet = await prisma.pet.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!pet) return sendError(res, 'Pet not found', 404);

    const record = await prisma.vaccinationRecord.create({
      data: {
        petId: req.params.id,
        vaccineName,
        givenAt: new Date(givenAt),
        nextDueAt: nextDueAt ? new Date(nextDueAt) : null,
        documentUrl,
        notes,
      },
    });

    // Create notification for upcoming due date
    if (nextDueAt) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: 'VACCINATION_REMINDER',
          title: `Vaccination reminder for ${pet.name}`,
          message: `${vaccineName} booster due on ${new Date(nextDueAt).toLocaleDateString()}`,
          metadata: { petId: pet.id, vaccinationId: record.id },
        },
      });
    }

    return sendCreated(res, record, 'Vaccination record added');
  } catch (err) {
    next(err);
  }
};

// GET /api/pets/:id/vaccinations
export const getVaccinations = async (req, res, next) => {
  try {
    const pet = await prisma.pet.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!pet) return sendError(res, 'Pet not found', 404);

    const records = await prisma.vaccinationRecord.findMany({
      where: { petId: req.params.id },
      orderBy: { givenAt: 'desc' },
    });
    return sendSuccess(res, records);
  } catch (err) {
    next(err);
  }
};
