import { Router } from 'express';
import {
    createCheckout,
    getOrderStatus,
    listOrders,
    getQueueStatus,
    simulatePaymentSuccess,
    simulateWebhook,
} from '../controllers/payment.controller';
import { idempotencyMiddleware } from '../middleware/idempotency';
import { verifyAdmin } from '../middleware/auth';

const router = Router();

// ============================================================
// Rotas de Pagamento
// ============================================================

// Criar checkout — com middleware de idempotência
router.post('/checkout', idempotencyMiddleware(), createCheckout);

// Consultar pedido
router.get('/order/:orderId', getOrderStatus);

// Listar todos os pedidos (admin)
router.get('/orders', verifyAdmin(), listOrders);

// Status das filas (admin)
router.get('/queue-status', verifyAdmin(), getQueueStatus);

// Simulações (apenas desenvolvimento)
router.post('/simulate-success/:orderId', simulatePaymentSuccess);
router.post('/simulate-webhook', simulateWebhook);

export default router;
