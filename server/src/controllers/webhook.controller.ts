import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { OrderService } from '../services/order.service';
import { enqueuePaymentEvent } from '../queues/payment.queue';
import { redisClient } from '../queues/connection';

// ============================================================
// Controller de Webhooks do Stripe
// ============================================================
// Webhooks são a forma como o Stripe comunica eventos ao seu
// servidor. Quando um pagamento é confirmado, o Stripe envia
// um POST para este endpoint.
//
// CONCEITOS IMPORTANTES:
// 1. O body deve ser lido como RAW (Buffer) para validação
// 2. A assinatura (stripe-signature) previne spoofing
// 3. Eventos são enfileirados no BullMQ em vez de processados
//    na hora — isso garante resiliência

const stripeService = new StripeService();
const orderService = new OrderService();

// Set para rastrear eventos já processados (backup do Redis)
const PROCESSED_EVENTS_PREFIX = 'webhook_event:';
const EVENT_TTL = 60 * 60 * 24 * 7; // 7 dias

/**
 * POST /api/webhook/stripe
 * Recebe eventos do Stripe, valida e enfileira para processamento.
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
    try {
        const signature = req.headers['stripe-signature'] as string;
        const rawBody = req.body as Buffer;

        // ─── 1. Verificar assinatura ──────────────────────────────
        // Em modo simulado, pular verificação
        let event: { id: string; type: string; data: Record<string, any> };

        if (signature && rawBody instanceof Buffer) {
            const stripeEvent = stripeService.verifyWebhookSignature(rawBody, signature);
            if (!stripeEvent) {
                console.error('❌ [Webhook] Assinatura inválida');
                res.status(400).json({ error: 'INVALID_SIGNATURE' });
                return;
            }
            event = {
                id: stripeEvent.id,
                type: stripeEvent.type,
                data: stripeEvent.data.object as Record<string, any>,
            };
        } else {
            // Modo simulado: aceitar JSON direto
            event = req.body;
            if (!event.id || !event.type) {
                res.status(400).json({ error: 'INVALID_EVENT' });
                return;
            }
        }

        console.log(`\n📨 [Webhook] Evento recebido: ${event.type} (${event.id})`);

        // ─── 2. Verificar idempotência do evento ──────────────────
        // Se já processamos este evento, retornar sucesso sem reprocessar
        const eventKey = `${PROCESSED_EVENTS_PREFIX}${event.id}`;

        try {
            const alreadyProcessed = await redisClient.get(eventKey);
            if (alreadyProcessed) {
                console.log(`🔄 [Webhook] Evento ${event.id} já processado (idempotente)`);
                res.status(200).json({ received: true, duplicate: true });
                return;
            }
        } catch {
            // Se Redis falhar, continuar sem validação de idempotência
            console.warn('⚠️  [Webhook] Redis indisponível para check de idempotência');
        }

        // ─── 3. Extrair dados do Payment Intent ───────────────────
        const paymentIntentId = event.data.id || event.data.payment_intent;
        const orderId = event.data.metadata?.orderId || 'unknown';
        const amount = event.data.amount || event.data.amount_total || 0;
        const status = event.data.status || 'unknown';

        // ─── 4. Enfileirar para processamento assíncrono ──────────
        // Respondemos 200 imediatamente e processamos via BullMQ
        // Isso evita timeout e garante resiliência
        await enqueuePaymentEvent({
            eventId: event.id,
            eventType: event.type,
            paymentIntentId,
            orderId,
            amount,
            status,
            metadata: event.data.metadata || {},
            receivedAt: new Date().toISOString(),
        });

        // ─── 5. Marcar evento como "recebido" no Redis ────────────
        try {
            await redisClient.set(eventKey, new Date().toISOString(), 'EX', EVENT_TTL);
        } catch {
            console.warn('⚠️  [Webhook] Não foi possível marcar evento no Redis');
        }

        // ─── 6. Responder 200 imediatamente ───────────────────────
        // O Stripe espera um 200 dentro de ~5 segundos
        // Se não receber, vai tentar novamente (até 3x em 72h)
        res.status(200).json({
            received: true,
            eventId: event.id,
            eventType: event.type,
            queued: true,
        });
    } catch (error) {
        console.error('❌ [Webhook] Erro crítico:', error);
        // Retornar 500 faz o Stripe tentar novamente depois
        res.status(500).json({ error: 'WEBHOOK_PROCESSING_ERROR' });
    }
}
