
import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct } from '../controllers/product.controller';


const router = Router();

// ============================================================
// Product Routes
// ============================================================

router.get('/', listProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.get('/:id', getProduct);

export default router;
