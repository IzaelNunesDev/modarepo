import { Order, OrderStatus, CreateCheckoutRequest, OrderItem } from '../types';
import { prisma } from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// ============================================================
// Serviço de Pedidos (Prisma / PostgreSQL)
// ============================================================

export class OrderService {
    /**
     * Cria um novo pedido a partir do request de checkout.
     */
    async createOrder(request: CreateCheckoutRequest): Promise<any> {
        const orderId = `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

        const subtotalInCents = request.items.reduce(
            (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
            0
        );
        const shippingCostInCents = subtotalInCents > 20000 ? 0 : 1599; // Frete grátis acima de R$ 200
        const totalInCents = subtotalInCents + shippingCostInCents;

        const order = await prisma.order.create({
            data: {
                id: orderId,
                status: 'PENDING',
                paymentMethod: request.paymentMethod,
                customerName: request.customerName || 'Cliente Moda Store',
                customerEmail: request.customerEmail || 'contato@modastore.com',
                idempotencyKey: request.idempotencyKey,
                subtotal: subtotalInCents,
                shippingCost: shippingCostInCents,
                total: totalInCents,
                items: {
                    create: request.items.map((item) => ({
                        productId: item.productId,
                        name: item.name,
                        price: Math.round(item.price * 100),
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        console.log(`📦 [OrderService] Pedido criado no banco: ${order.id} (Total: R$ ${(totalInCents / 100).toFixed(2)})`);
        return order;
    }

    /**
     * Busca um pedido pelo ID.
     */
    async getOrder(orderId: string): Promise<any | null> {
        return prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
    }

    /**
     * Busca um pedido pelo PaymentIntent ID do Stripe.
     */
    async getOrderByPaymentIntent(paymentIntentId: string): Promise<any | null> {
        return prisma.order.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
            include: { items: true },
        });
    }

    /**
     * Busca um pedido pelo Session ID do Stripe.
     */
    async getOrderBySession(sessionId: string): Promise<any | null> {
        return prisma.order.findUnique({
            where: { stripeSessionId: sessionId },
            include: { items: true },
        });
    }

    /**
     * Vincula um Payment Intent do Stripe a um pedido.
     */
    async linkPaymentIntent(orderId: string, paymentIntentId: string): Promise<void> {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                stripePaymentIntentId: paymentIntentId,
                status: 'PROCESSING'
            },
        });
        console.log(`🔗 [OrderService] PaymentIntent ${paymentIntentId} → Pedido ${orderId}`);
    }

    /**
     * Vincula uma Session do Stripe a um pedido.
     */
    async linkSession(orderId: string, sessionId: string): Promise<void> {
        await prisma.order.update({
            where: { id: orderId },
            data: { stripeSessionId: sessionId },
        });
    }

    /**
     * Atualiza o status de um pedido e gerencia o estoque se necessário.
     */
    async updateOrderStatus(
        orderId: string,
        newStatus: string,
        extra?: { paymentIntentId?: string; paidAt?: Date }
    ): Promise<any | null> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            console.error(`❌ [OrderService] Pedido ${orderId} não encontrado`);
            return null;
        }

        const oldStatus = order.status;
        const prismaStatus = newStatus.toUpperCase() as OrderStatus;

        // Validar transição de status
        if (!this.isValidTransition(oldStatus as OrderStatus, prismaStatus)) {
            console.warn(`⚠️ [OrderService] Transição inválida: ${oldStatus} → ${prismaStatus} para o pedido ${orderId}`);
            // Opcional: retornar erro ou manter o status. Por agora vamos permitir mas avisar, 
            // ou bloquear transições críticas.
            if (oldStatus === 'PAID') return order; // Não permite mudar se já estiver pago
        }

        // Se o status mudou para PAID, abater o estoque
        if (prismaStatus === 'PAID' && oldStatus !== 'PAID') {
            await this.deductStock(order);
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: prismaStatus,
                paidAt: extra?.paidAt || (prismaStatus === 'PAID' ? new Date() : undefined),
                stripePaymentIntentId: extra?.paymentIntentId || undefined,
            },
        });

        console.log(`📝 [OrderService] Pedido ${orderId}: ${oldStatus} → ${prismaStatus}`);
        return updatedOrder;
    }

    /**
     * Define as transições permitidas para cada status.
     */
    private isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
        const allowed: Record<OrderStatus, OrderStatus[]> = {
            'PENDING': ['PROCESSING', 'PAID', 'CANCELLED'],
            'PROCESSING': ['PAID', 'CANCELLED', 'REFUNDED'],
            'PAID': ['REFUNDED', 'COMPLETED'], // Uma vez pago, não volta para pendente ou cancelado
            'CANCELLED': [], // Status final
            'REFUNDED': [], // Status final
            'COMPLETED': [], // Status final
            'FAILED': ['PENDING', 'PROCESSING', 'CANCELLED']
        };

        return allowed[from]?.includes(to) ?? false;
    }

    /**
     * Abate a quantidade dos itens do pedido no estoque.
     */
    private async deductStock(order: any): Promise<void> {
        console.log(`📉 [OrderService] Abatendo estoque para o pedido ${order.id}`);

        for (const item of order.items) {
            try {
                const stockEntry = await prisma.productStock.findFirst({
                    where: {
                        productId: item.productId,
                        size: item.size,
                        color: item.color,
                    },
                });

                if (stockEntry) {
                    await prisma.productStock.update({
                        where: { id: stockEntry.id },
                        data: {
                            quantity: {
                                decrement: item.quantity,
                            },
                        },
                    });
                    console.log(`   ✅ Estoque atualizado: ${item.name} (${item.size}/${item.color}) -${item.quantity}`);
                } else {
                    console.warn(`   ⚠️ Registro de estoque não encontrado para: ${item.name} (${item.size}/${item.color})`);
                }
            } catch (error) {
                console.error(`   ❌ Erro ao atualizar estoque do item ${item.productId}:`, error);
            }
        }
    }

    /**
     * Lista todos os pedidos (para debug/admin).
     */
    async listOrders(): Promise<any[]> {
        return prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { items: true },
        });
    }

    /**
     * Verifica se uma chave de idempotência já foi usada.
     */
    async findByIdempotencyKey(key: string): Promise<any | null> {
        return prisma.order.findUnique({
            where: { idempotencyKey: key },
        });
    }
}

