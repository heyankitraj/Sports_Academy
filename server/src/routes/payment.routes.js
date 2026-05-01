import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { Role } from '../models/User.js';

const router = Router();

// Protect endpoints with JWT Auth
router.use(authenticate);

// Only Students can invoke payments
router.use(authorizeRole(Role.STUDENT));

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

export default router;