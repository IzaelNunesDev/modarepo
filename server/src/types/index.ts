// ============================================================
// Tipos do Gateway de Pagamento
// ============================================================

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export type OrderStatus =
    | 'PENDING'        // Pedido criado, aguardando pagamento
    | 'PROCESSING'     // Pagamento sendo processado
    | 'PAID'           // Pagamento confirmado
    | 'FAILED'         // Pagamento falhou
    | 'REFUNDED'       // Pagamento estornado
    | 'CANCELLED'      // Pedido cancelado
    | 'COMPLETED';     // Pedido concluído (entrega realizada)

export interface OrderItem {
    productId: string;
    name: string;
    price: number;       // em centavos
    quantity: number;
    size: string;
    color: string;
}

export interface ShippingAddress {
    cep: string;
    street: string;
    city: string;
    state: string;
    complement?: string;
}

export interface Order {
    id: string;
    stripePaymentIntentId?: string;
    stripeSessionId?: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    items: OrderItem[];
    shipping: ShippingAddress;
    subtotal: number;        // em centavos
    shippingCost: number;    // em centavos
    total: number;           // em centavos
    customerEmail?: string;
    customerName?: string;
    idempotencyKey: string;
    createdAt: Date;
    updatedAt: Date;
    paidAt?: Date;
    metadata?: Record<string, string>;
}

export interface CreateCheckoutRequest {
    items: {
        productId: string;
        name: string;
        price: number;          // em reais (será convertido para centavos)
        quantity: number;
        size: string;
        color: string;
        image?: string;
    }[];
    shipping: ShippingAddress;
    paymentMethod: PaymentMethod;
    customerEmail?: string;
    customerName?: string;
    idempotencyKey: string;   // chave de idempotência gerada pelo cliente
}

export interface CheckoutResponse {
    orderId: string;
    status: OrderStatus;
    paymentUrl?: string;        // URL para pagar (Stripe Checkout)
    pixQrCode?: string;         // QR Code para PIX
    pixCopyPaste?: string;      // Código copia e cola PIX
    boletoUrl?: string;         // URL do boleto
    boletoBarcode?: string;     // Código de barras do boleto
    expiresAt?: string;
}

export interface WebhookEvent {
    id: string;
    type: string;
    data: Record<string, unknown>;
    processedAt?: Date;
}

// Tipos para filas BullMQ
export interface PaymentJobData {
    eventId: string;
    eventType: string;
    paymentIntentId: string;
    orderId: string;
    amount: number;
    status: string;
    metadata: Record<string, string>;
    receivedAt: string;
}

export interface OrderUpdateJobData {
    orderId: string;
    newStatus: OrderStatus;
    paymentIntentId: string;
    paidAt?: string;
}
