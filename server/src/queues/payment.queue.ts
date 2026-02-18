import { Queue } from 'bullmq';
import { redisConnectionOptions } from './connection';
import { PaymentJobData, OrderUpdateJobData } from '../types';

// ============================================================
// Fila de Processamento de Webhooks de Pagamento
// ============================================================

export const PAYMENT_QUEUE_NAME = 'payment-webhooks';
export const ORDER_UPDATE_QUEUE_NAME = 'order-updates';

/**
 * Fila principal: recebe eventos do Stripe via webhook
 * e os enfileira para processamento assíncrono.
 */
export const paymentQueue = new Queue<PaymentJobData>(PAYMENT_QUEUE_NAME, {
    connection: redisConnectionOptions,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 3000,
        },
        removeOnComplete: {
            count: 1000,
            age: 60 * 60 * 24 * 7,
        },
        removeOnFail: {
            count: 5000,
        },
    },
});

/**
 * Fila secundária: atualiza o status dos pedidos.
 */
export const orderUpdateQueue = new Queue<OrderUpdateJobData>(ORDER_UPDATE_QUEUE_NAME, {
    connection: redisConnectionOptions,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 1000 },
    },
});

/**
 * Adiciona um evento de webhook à fila de processamento.
 * O jobId é o ID do evento do Stripe para garantir idempotência
 * a nível de fila — o mesmo evento nunca será enfileirado duas vezes.
 */
export async function enqueuePaymentEvent(data: PaymentJobData): Promise<string> {
    const job = await paymentQueue.add(
        `webhook:${data.eventType}`,
        data,
        {
            jobId: data.eventId,
        }
    );

    console.log(`📥 [Fila] Job enfileirado: ${job.id} (${data.eventType})`);
    return job.id!;
}

/**
 * Adiciona uma atualização de pedido à fila.
 */
export async function enqueueOrderUpdate(data: OrderUpdateJobData): Promise<string> {
    const job = await orderUpdateQueue.add(
        `order:${data.newStatus}`,
        data,
        {
            jobId: `order-update:${data.orderId}:${data.newStatus}:${Date.now()}`,
        }
    );

    console.log(`📥 [Fila] Atualização de pedido enfileirada: ${job.id}`);
    return job.id!;
}

// Métricas da fila
export async function getQueueMetrics() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
        paymentQueue.getWaitingCount(),
        paymentQueue.getActiveCount(),
        paymentQueue.getCompletedCount(),
        paymentQueue.getFailedCount(),
        paymentQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
}
