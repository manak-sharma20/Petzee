import { Router } from 'express';
import {
  createConsultation, getConsultations, getMessages,
  closeConsultation, listVets,
} from '../controllers/consultations.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/vets', listVets);
router.get('/', getConsultations);
router.post('/', authorize('OWNER'), createConsultation);
router.get('/:id/messages', getMessages);
router.patch('/:id/close', closeConsultation);

export default router;
