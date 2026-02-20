import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { StripeService } from '../services/stripe.service';
import { CreateCheckoutRequest } from '../types';
import { getQueueMetrics } from '../queues/payment.queue';

// ============================================================
// Controller de Pagamento
// ============================================================

const orderService = new OrderService();
const stripeService = new StripeService();

/**
 * POST /api/payment/checkout
 * Cria uma nova sessão de checkout/pagamento.
 */
export async function createCheckout(req: Request, res: Response): Promise<void> {
    try {
        const body: CreateCheckoutRequest = req.body;
        console.log('📥 [Checkout] Nova requisição recebida:', JSON.stringify(body, null, 2));

        // Validações
        if (!body.items || body.items.length === 0) {
            console.warn('⚠️ [Checkout] Carrinho vazio');
            res.status(400).json({ error: 'EMPTY_CART', message: 'O carrinho está vazio.' });
            return;
        }

        if (!body.shipping?.cep || !body.shipping?.street || !body.shipping?.city || !body.shipping?.state) {
            console.warn('⚠️ [Checkout] Endereço incompleto:', body.shipping);
            res.status(400).json({ error: 'INVALID_ADDRESS', message: 'Endereço de entrega incompleto.' });
            return;
        }

        if (!body.paymentMethod) {
            console.warn('⚠️ [Checkout] Sem forma de pagamento');
            res.status(400).json({ error: 'NO_PAYMENT_METHOD', message: 'Selecione uma forma de pagamento.' });
            return;
        }

        if (!body.idempotencyKey) {
            console.warn('⚠️ [Checkout] Sem chave de idempotência');
            res.status(400).json({ error: 'NO_IDEMPOTENCY_KEY', message: 'Chave de idempotência é obrigatória.' });
            return;
        }

        // Verificar idempotência a nível de negócio
        console.log(`🔍 [Checkout] Verificando idempotência para chave: ${body.idempotencyKey}`);
        const existingOrder = await orderService.findByIdempotencyKey(body.idempotencyKey);
        if (existingOrder) {
            console.log(`🔄 [Checkout] Pedido duplicado detectado: ${existingOrder.id}`);
            res.status(200).json({
                orderId: existingOrder.id,
                status: existingOrder.status,
                message: 'Pedido já existe (idempotência).',
                duplicate: true,
            });
            return;
        }

        // Criar o pedido
        console.log('📦 [Checkout] Criando pedido no OrderService...');
        const order = await orderService.createOrder(body);

        // Criar checkout no Stripe (ou simulação)
        console.log('💳 [Checkout] Iniciando sessão Stripe para pedido:', order.id);
        const checkoutResponse = await stripeService.createCheckoutSession(order);

        // Atualizar status do pedido
        console.log('📝 [Checkout] Atualizando status para processing:', order.id);
        await orderService.updateOrderStatus(order.id, 'processing');

        console.log('✅ [Checkout] Sucesso:', order.id);
        res.status(201).json(checkoutResponse);

    } catch (error) {
        console.error('💥 [Checkout] Erro FATAL:', error);
        res.status(500).json({
            error: 'CHECKOUT_FAILED',
            message: 'Erro ao processar checkout. Tente novamente.',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

/**
 * GET /api/payment/order/:orderId
 * Consulta o status de um pedido.
 */
export async function getOrderStatus(req: Request, res: Response): Promise<void> {
    try {
        const orderId = req.params.orderId as string;
        const order = await orderService.getOrder(orderId);

        if (!order) {
            res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Pedido não encontrado.' });
            return;
        }

        res.json({
            orderId: order.id,
            status: order.status,
            paymentMethod: order.paymentMethod,
            total: order.total,
            totalFormatted: `R$ ${(order.total / 100).toFixed(2).replace('.', ',')}`,
            items: order.items.length,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            paidAt: order.paidAt,
        });
    } catch (error) {
        console.error('❌ [GetOrder] Erro:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
}

/**
 * GET /api/payment/orders
 * Lista todos os pedidos (admin/debug).
 */
export async function listOrders(req: Request, res: Response): Promise<void> {
    try {
        const orders = await orderService.listOrders();

        res.json({
            total: orders.length,
            orders: orders.map((o: any) => ({
                id: o.id,
                status: o.status,
                paymentMethod: o.paymentMethod,
                total: o.total,
                totalFormatted: `R$ ${(o.total / 100).toFixed(2).replace('.', ',')}`,
                items: o.items.length,
                createdAt: o.createdAt,
                paidAt: o.paidAt,
                customerName: o.customerName,
                customerEmail: o.customerEmail,
            })),
        });
    } catch (error) {
        console.error('❌ [ListOrders] Erro:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
}

/**
 * GET /api/payment/queue-status
 * Retorna as métricas das filas (admin/debug).
 */
export async function getQueueStatus(req: Request, res: Response): Promise<void> {
    try {
        const metrics = await getQueueMetrics();

        res.json({
            queue: 'payment-webhooks',
            ...metrics,
            healthy: metrics.failed === 0,
        });
    } catch (error) {
        console.error('❌ [QueueStatus] Erro:', error);
        res.status(500).json({ error: 'QUEUE_ERROR', message: 'Erro ao consultar filas.' });
    }
}

/**
 * POST /api/payment/simulate-success/:orderId
 * Simula um pagamento bem-sucedido (apenas em desenvolvimento).
 * Útil para testar o fluxo completo sem Stripe real.
 */
export async function simulatePaymentSuccess(req: Request, res: Response): Promise<void> {
    try {
        if (process.env.NODE_ENV === 'production') {
            res.status(403).json({ error: 'FORBIDDEN', message: 'Simulação não permitida em ambiente de produção' });
            return;
        }

        const orderId = req.params.orderId as string;
        const order = await orderService.getOrder(orderId);

        if (!order) {
            res.status(404).json({ error: 'ORDER_NOT_FOUND' });
            return;
        }

        // Simular confirmação de pagamento
        await orderService.updateOrderStatus(orderId as string, 'paid', {
            paymentIntentId: `pi_simulated_${Date.now()}`,
            paidAt: new Date(),
        });

        console.log(`🧪 [Simulação] Pagamento aprovado para pedido ${orderId}`);

        res.json({
            orderId,
            status: 'paid',
            message: 'Pagamento simulado com sucesso!',
            simulatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ [SimulatePayment] Erro:', error);
        res.status(500).json({ error: 'SIMULATION_FAILED' });
    }
}

/**
 * POST /api/payment/simulate-webhook
 * Simula um webhook do Stripe (apenas em desenvolvimento).
 * Enfileira um evento fake no BullMQ para testar resiliência.
 */
export async function simulateWebhook(req: Request, res: Response): Promise<void> {
    try {
        if (process.env.NODE_ENV === 'production') {
            res.status(403).json({ error: 'FORBIDDEN', message: 'Simulação não permitida em ambiente de produção' });
            return;
        }

        const { orderId, eventType = 'payment_intent.succeeded' } = req.body;

        const order = await orderService.getOrder(orderId);
        if (!order) {
            res.status(404).json({ error: 'ORDER_NOT_FOUND' });
            return;
        }

        const { enqueuePaymentEvent } = await import('../queues/payment.queue');

        const jobId = await enqueuePaymentEvent({
            eventId: `evt_sim_${Date.now()}`,
            eventType,
            paymentIntentId: order.stripePaymentIntentId || `pi_sim_${Date.now()}`,
            orderId: order.id,
            amount: order.total,
            status: eventType.includes('succeeded') ? 'succeeded' : 'failed',
            metadata: { orderId: order.id },
            receivedAt: new Date().toISOString(),
        });

        res.json({
            message: 'Webhook simulado enfileirado com sucesso',
            jobId,
            eventType,
            orderId,
        });
    } catch (error) {
        console.error('❌ [SimulateWebhook] Erro:', error);
        res.status(500).json({ error: 'SIMULATION_FAILED' });
    }
}
