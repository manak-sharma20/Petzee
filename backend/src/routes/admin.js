import { Router } from 'express';
import { getUsers, verifyUser, deleteUser, getDashboardStats } from '../controllers/admin.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/verify', verifyUser);
router.delete('/users/:id', deleteUser);

export default router;
