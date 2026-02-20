import { Router } from 'express';
import { loginAdmin, registerFirstAdmin } from '../controllers/auth.controller';

const router = Router();

// ============================================================
// Rotas de Autenticação / Admin
// ============================================================

// POST /api/auth/login
router.post('/login', loginAdmin);

// POST /api/auth/setup
// Usado apenas 1x para configurar o primeiro admin do e-commerce.
router.post('/setup', registerFirstAdmin);

export default router;
