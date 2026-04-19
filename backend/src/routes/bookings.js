import { Router } from 'express';
import {
  createBooking, getBookings, getBookingById, updateBookingStatus, addReview,
} from '../controllers/bookings.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getBookings);
router.post('/', authorize('OWNER'), createBooking);
router.get('/:id', getBookingById);
router.patch('/:id/status', authorize('PROVIDER', 'ADMIN'), updateBookingStatus);
router.post('/:id/review', authorize('OWNER'), addReview);

export default router;
