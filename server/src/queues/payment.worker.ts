import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from './connection';
import { PaymentJobData, OrderUpdateJobData } from '../types';
import { PAYMENT_QUEUE_NAME, ORDER_UPDATE_QUEUE_NAME, enqueueOrderUpdate } from './payment.queue';
import { OrderService } from '../services/order.service';

// ============================================================
// Workers de Processamento Assíncrono
// ============================================================

const orderService = new OrderService();

/**
 * Worker que processa eventos de webhook do Stripe.
 */
export const paymentWorker = new Worker<PaymentJobData>(
    PAYMENT_QUEUE_NAME,
    async (job: Job<PaymentJobData>) => {
        const { eventId, eventType, paymentIntentId, orderId, amount, status } = job.data;

        console.log(`\n🔄 [Worker] Processando evento: ${eventType}`);
        console.log(`   📋 Event ID: ${eventId}`);
        console.log(`   💳 Payment Intent: ${paymentIntentId}`);
        console.log(`   📦 Order ID: ${orderId}`);
        console.log(`   💰 Amount: R$ ${(amount / 100).toFixed(2)}`);
        console.log(`   📊 Status: ${status}`);
        console.log(`   🔁 Tentativa: ${job.attemptsMade + 1}/${job.opts.attempts}\n`);

        await job.updateProgress(10);

        switch (eventType) {
            case 'payment_intent.succeeded': {
                await enqueueOrderUpdate({
                    orderId,
                    newStatus: 'PAID',
                    paymentIntentId,
                    paidAt: new Date().toISOString(),
                });
                await job.updateProgress(100);
                console.log(`✅ [Worker] Pagamento confirmado para pedido ${orderId}`);
                break;
            }

            case 'payment_intent.payment_failed': {
                await enqueueOrderUpdate({
                    orderId,
                    newStatus: 'FAILED',
                    paymentIntentId,
                });
                await job.updateProgress(100);
                console.log(`❌ [Worker] Pagamento falhou para pedido ${orderId}`);
                break;
            }

            case 'payment_intent.canceled': {
                await enqueueOrderUpdate({
                    orderId,
                    newStatus: 'CANCELLED',
                    paymentIntentId,
                });
                await job.updateProgress(100);
                console.log(`🚫 [Worker] Pagamento cancelado para pedido ${orderId}`);
                break;
            }

            case 'charge.refunded': {
                await enqueueOrderUpdate({
                    orderId,
                    newStatus: 'REFUNDED',
                    paymentIntentId,
                });
                await job.updateProgress(100);
                console.log(`💸 [Worker] Estorno processado para pedido ${orderId}`);
                break;
            }

            case 'checkout.session.completed': {
                await enqueueOrderUpdate({
                    orderId,
                    newStatus: 'PROCESSING',
                    paymentIntentId,
                });
                await job.updateProgress(100);
                console.log(`🛒 [Worker] Checkout completado para pedido ${orderId}`);
                break;
            }

            default:
                console.log(`⚠️  [Worker] Evento não tratado: ${eventType}`);
                await job.updateProgress(100);
        }

        return { processed: true, eventType, orderId };
    },
    {
        connection: redisConnectionOptions,
        concurrency: 5,
        limiter: {
            max: 10,
            duration: 1000,
        },
    }
);

/**
 * Worker que atualiza o status dos pedidos.
 */
export const orderUpdateWorker = new Worker<OrderUpdateJobData>(
    ORDER_UPDATE_QUEUE_NAME,
    async (job: Job<OrderUpdateJobData>) => {
        const { orderId, newStatus, paymentIntentId, paidAt } = job.data;

        console.log(`\n📝 [OrderWorker] Atualizando pedido ${orderId} → ${newStatus}`);

        const order = await orderService.getOrder(orderId);
        if (!order) {
            throw new Error(`Pedido ${orderId} não encontrado. Será reprocessado.`);
        }

        await orderService.updateOrderStatus(orderId, newStatus, {
            paymentIntentId,
            paidAt: paidAt ? new Date(paidAt) : undefined,
        });

        console.log(`✅ [OrderWorker] Pedido ${orderId} atualizado para: ${newStatus}`);

        return { orderId, newStatus, updated: true };
    },
    {
        connection: redisConnectionOptions,
        concurrency: 3,
    }
);

// ============================================================
// Event Listeners dos Workers (Monitoramento)
// ============================================================

paymentWorker.on('completed', (job) => {
    console.log(`✅ [Worker] Job ${job.id} completado com sucesso`);
});

paymentWorker.on('failed', (job, err) => {
    console.error(`❌ [Worker] Job ${job?.id} falhou: ${err.message}`);
    if (job && job.attemptsMade >= (job.opts.attempts || 5)) {
        console.error(`🚨 [Worker] Job ${job.id} esgotou todas as tentativas!`);
    }
});

paymentWorker.on('error', (err) => {
    console.error('❌ [Worker] Erro no worker de pagamento:', err.message);
});

orderUpdateWorker.on('completed', (job) => {
    console.log(`✅ [OrderWorker] Job ${job.id} completado`);
});

orderUpdateWorker.on('failed', (job, err) => {
    console.error(`❌ [OrderWorker] Job ${job?.id} falhou: ${err.message}`);
});

// Graceful shutdown
export async function shutdownWorkers() {
    console.log('🛑 Encerrando workers...');
    await Promise.all([
        paymentWorker.close(),
        orderUpdateWorker.close(),
    ]);
    console.log('✅ Workers encerrados');
}
