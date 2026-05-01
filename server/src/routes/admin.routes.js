import { Router } from 'express';
import { getUsers, updateUserStatus, exportUsers } from '../controllers/admin.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { Role } from '../models/User.js';

const router = Router();

// Protect all admin routes with JWT Auth + Role Check
router.use(authenticate);
router.use(authorizeRole(Role.ADMIN));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/export', exportUsers);

export default router;