import { Router, raw } from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';

const router = Router();

// ============================================================
// Rotas de Webhook
// ============================================================
// IMPORTANTE: O Stripe envia o body como RAW para que possamos
// verificar a assinatura. Por isso usamos express.raw() aqui,
// enquanto as outras rotas usam express.json().

router.post(
    '/stripe',
    raw({ type: 'application/json' }),   // Body como Buffer
    handleStripeWebhook
);

export default router;
