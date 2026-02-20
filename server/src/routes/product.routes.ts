
import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { verifyAdmin } from '../middleware/auth';


const router = Router();

// ============================================================
// Product Routes
// ============================================================
// TODO(Segurança): Adicionar middleware de autenticação (JWT) para verificar
// se o usuário é ADMIN. Atualmente rotas de mutação estão públicas.

router.get('/', listProducts);
router.post('/', verifyAdmin(), createProduct);
router.put('/:id', verifyAdmin(), updateProduct);
router.delete('/:id', verifyAdmin(), deleteProduct);
router.get('/:id', getProduct);

export default router;
