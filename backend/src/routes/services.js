import { Router } from 'express';
import {
  createService, getServices, getServiceById,
  updateService, deleteService, getMyServices,
} from '../controllers/services.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../utils/cloudinary.js';

const router = Router();

// Public
router.get('/', getServices);
router.get('/:id', getServiceById);

// Provider only
router.get('/provider/me', authenticate, authorize('PROVIDER'), getMyServices);
router.post('/', authenticate, authorize('PROVIDER'), upload.single('image'), createService);
router.patch('/:id', authenticate, authorize('PROVIDER'), upload.single('image'), updateService);
router.delete('/:id', authenticate, authorize('PROVIDER', 'ADMIN'), deleteService);

export default router;
