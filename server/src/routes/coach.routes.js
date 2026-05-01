import { Router } from 'express';
import { createSession, getCoachSessions, updateSession, deleteSession } from '../controllers/coach.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { Role } from '../models/User.js';

const router = Router();

// Protect all coach router endpoints with JWT authentication and Role Authorization.
router.use(authenticate);
router.use(authorizeRole(Role.COACH));

router.post('/sessions', createSession);
router.get('/sessions', getCoachSessions);
router.put('/sessions/:id', updateSession);
router.delete('/sessions/:id', deleteSession);

export default router;