import { Router } from 'express';
import {
  createPet, getPets, getPetById, updatePet, deletePet,
  addVaccination, getVaccinations,
} from '../controllers/pets.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../utils/cloudinary.js';

const router = Router();

router.use(authenticate);
router.use(authorize('OWNER', 'ADMIN'));

router.get('/', getPets);
router.post('/', upload.single('photo'), createPet);
router.get('/:id', getPetById);
router.put('/:id', upload.single('photo'), updatePet);
router.delete('/:id', deletePet);

router.post('/:id/vaccinations', upload.single('document'), addVaccination);
router.get('/:id/vaccinations', getVaccinations);

export default router;
