import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus, CreateCheckoutRequest, OrderItem } from '../types';

// ============================================================
// Serviço de Pedidos (In-Memory Store)
// ============================================================
// Em produção, substitua por um banco de dados (PostgreSQL, MongoDB, etc.)
// Este store in-memory é ideal para demonstração e desenvolvimento.

export class OrderService {
    // Store de pedidos em memória (compartilhado entre instâncias)
    private static orders: Map<string, Order> = new Map();

    // Índice: stripePaymentIntentId → orderId (para busca por webhook)
    private static paymentIntentIndex: Map<string, string> = new Map();

    // Índice: stripeSessionId → orderId
    private static sessionIndex: Map<string, string> = new Map();

    /**
     * Cria um novo pedido a partir do request de checkout.
     */
    createOrder(request: CreateCheckoutRequest): Order {
        const orderId = `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

        const items: OrderItem[] = request.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: Math.round(item.price * 100),   // Converte para centavos
            quantity: item.quantity,
            size: item.size,
            color: item.color,
        }));

        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shippingCost = subtotal > 20000 ? 0 : 1599;  // Frete grátis acima de R$ 200
        const total = subtotal + shippingCost;

        const order: Order = {
            id: orderId,
            status: 'pending',
            paymentMethod: request.paymentMethod,
            items,
            shipping: request.shipping,
            subtotal,
            shippingCost,
            total,
            customerEmail: request.customerEmail,
            customerName: request.customerName,
            idempotencyKey: request.idempotencyKey,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        OrderService.orders.set(orderId, order);
        console.log(`📦 [OrderService] Pedido criado: ${orderId} (Total: R$ ${(total / 100).toFixed(2)})`);

        return order;
    }

    /**
     * Busca um pedido pelo ID.
     */
    getOrder(orderId: string): Order | undefined {
        return OrderService.orders.get(orderId);
    }

    /**
     * Busca um pedido pelo PaymentIntent ID do Stripe.
     */
    getOrderByPaymentIntent(paymentIntentId: string): Order | undefined {
        const orderId = OrderService.paymentIntentIndex.get(paymentIntentId);
        if (!orderId) return undefined;
        return OrderService.orders.get(orderId);
    }

    /**
     * Busca um pedido pelo Session ID do Stripe.
     */
    getOrderBySession(sessionId: string): Order | undefined {
        const orderId = OrderService.sessionIndex.get(sessionId);
        if (!orderId) return undefined;
        return OrderService.orders.get(orderId);
    }

    /**
     * Vincula um Payment Intent do Stripe a um pedido.
     */
    linkPaymentIntent(orderId: string, paymentIntentId: string): void {
        const order = OrderService.orders.get(orderId);
        if (order) {
            order.stripePaymentIntentId = paymentIntentId;
            order.updatedAt = new Date();
            OrderService.paymentIntentIndex.set(paymentIntentId, orderId);
            console.log(`🔗 [OrderService] PaymentIntent ${paymentIntentId} → Pedido ${orderId}`);
        }
    }

    /**
     * Vincula uma Session do Stripe a um pedido.
     */
    linkSession(orderId: string, sessionId: string): void {
        const order = OrderService.orders.get(orderId);
        if (order) {
            order.stripeSessionId = sessionId;
            order.updatedAt = new Date();
            OrderService.sessionIndex.set(sessionId, orderId);
        }
    }

    /**
     * Atualiza o status de um pedido.
     */
    updateOrderStatus(
        orderId: string,
        newStatus: OrderStatus,
        extra?: { paymentIntentId?: string; paidAt?: Date }
    ): Order | undefined {
        const order = OrderService.orders.get(orderId);
        if (!order) {
            console.error(`❌ [OrderService] Pedido ${orderId} não encontrado`);
            return undefined;
        }

        const oldStatus = order.status;

        // Validar transição de status
        if (!this.isValidTransition(oldStatus, newStatus)) {
            console.warn(
                `⚠️  [OrderService] Transição inválida: ${oldStatus} → ${newStatus} (Pedido ${orderId})`
            );
            return order;
        }

        order.status = newStatus;
        order.updatedAt = new Date();

        if (extra?.paidAt) {
            order.paidAt = extra.paidAt;
        }

        if (extra?.paymentIntentId && !order.stripePaymentIntentId) {
            this.linkPaymentIntent(orderId, extra.paymentIntentId);
        }

        console.log(`📝 [OrderService] Pedido ${orderId}: ${oldStatus} → ${newStatus}`);
        return order;
    }

    /**
     * Lista todos os pedidos (para debug/admin).
     */
    listOrders(): Order[] {
        return Array.from(OrderService.orders.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    /**
     * Verifica se uma chave de idempotência já foi usada.
     * Retorna o orderId se já existir.
     */
    findByIdempotencyKey(key: string): Order | undefined {
        for (const order of OrderService.orders.values()) {
            if (order.idempotencyKey === key) {
                return order;
            }
        }
        return undefined;
    }

    /**
     * Valida se a transição de status é permitida.
     * Garante que o fluxo de status seja consistente.
     */
    private isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            pending: ['processing', 'paid', 'failed', 'cancelled'],
            processing: ['paid', 'failed', 'cancelled'],
            paid: ['refunded'],
            failed: ['pending', 'processing'],  // Permite retry
            refunded: [],                         // Estado final
            cancelled: [],                        // Estado final
        };

        return validTransitions[from]?.includes(to) ?? false;
    }
}
