import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../utils/cloudinary.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, upload.single('avatar'), updateProfile);

export default router;
