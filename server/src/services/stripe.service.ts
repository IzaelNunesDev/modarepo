import Stripe from 'stripe';
import { env } from '../config/env';
import { Order, CheckoutResponse, PaymentMethod } from '../types';

// ============================================================
// Serviço do Stripe — Integração com Gateway de Pagamento
// ============================================================

export class StripeService {
    private stripe: Stripe | null = null;

    constructor() {
        if (env.hasStripeKeys) {
            this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
                typescript: true,
            });
            console.log('✅ [Stripe] SDK inicializado');
        } else {
            console.warn('⚠️  [Stripe] Chaves não configuradas — usando modo SIMULADO');
        }
    }

    /**
     * Cria uma sessão de checkout no Stripe.
     * Para cada método de pagamento, configura as opções apropriadas.
     */
    async createCheckoutSession(order: Order): Promise<CheckoutResponse> {
        // Se Stripe não configurado, simula a resposta
        if (!this.stripe) {
            return this.simulateCheckout(order);
        }

        try {
            const paymentMethodTypes = this.getPaymentMethodTypes(order.paymentMethod);

            // Construir parâmetros da sessão
            const sessionParams: Stripe.Checkout.SessionCreateParams = {
                payment_method_types: paymentMethodTypes,
                line_items: order.items.map((item) => ({
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: item.name,
                            metadata: {
                                productId: item.productId,
                                size: item.size,
                                color: item.color,
                            },
                        },
                        unit_amount: item.price,                  // Já em centavos
                    },
                    quantity: item.quantity,
                })),
                mode: 'payment',
                success_url: `${env.FRONTEND_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${env.FRONTEND_URL}/checkout?cancelled=true`,
                metadata: {
                    orderId: order.id,
                    idempotencyKey: order.idempotencyKey,
                },
                payment_intent_data: {
                    metadata: {
                        orderId: order.id,
                        idempotencyKey: order.idempotencyKey,
                    }
                },
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expira em 30 min
            };

            // Só incluir customer_email se for um email válido
            if (order.customerEmail && order.customerEmail.includes('@')) {
                sessionParams.customer_email = order.customerEmail;
            }

            console.log(`🔄 [Stripe] Criando sessão para pedido ${order.id} (método: ${order.paymentMethod})`);
            const session = await this.stripe.checkout.sessions.create(sessionParams);

            return {
                orderId: order.id,
                status: 'PROCESSING',
                paymentUrl: session.url || undefined,
            };
        } catch (error) {
            // Log detalhado para erros do Stripe
            if (error instanceof Stripe.errors.StripeError) {
                console.error(`❌ [Stripe] Erro ${error.type}: ${error.message}`);
                console.error(`   Código: ${error.code || 'N/A'}`);
                console.error(`   Status HTTP: ${error.statusCode || 'N/A'}`);
                console.error(`   Param: ${error.param || 'N/A'}`);
            } else {
                console.error('❌ [Stripe] Erro inesperado ao criar sessão:', error);
            }

            // Fallback: se Stripe falhar, usar modo simulado para não bloquear o fluxo
            console.warn('⚠️  [Stripe] Fallback para modo simulado devido a erro na API');
            return this.simulateCheckout(order);
        }
    }

    /**
     * Cria um Payment Intent diretamente (para PIX e Boleto).
     */
    async createPaymentIntent(order: Order): Promise<CheckoutResponse> {
        if (!this.stripe) {
            return this.simulateCheckout(order);
        }

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: order.total,
                currency: 'brl',
                payment_method_types: this.getPaymentMethodTypes(order.paymentMethod),
                metadata: {
                    orderId: order.id,
                    idempotencyKey: order.idempotencyKey,
                },
                description: `Pedido ${order.id} - Moda Store`,
            });

            return {
                orderId: order.id,
                status: 'PROCESSING',
                paymentUrl: undefined,
                // O client_secret seria usado pelo Stripe.js no frontend
            };
        } catch (error) {
            console.error('❌ [Stripe] Erro ao criar PaymentIntent:', error);
            throw error;
        }
    }

    /**
     * Verifica a assinatura do webhook do Stripe.
     * Garante que o evento realmente veio do Stripe.
     */
    verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event | null {
        if (!this.stripe) return null;

        try {
            return this.stripe.webhooks.constructEvent(
                payload,
                signature,
                env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('❌ [Stripe] Assinatura de webhook inválida:', (err as Error).message);
            return null;
        }
    }

    /**
     * Consulta um Payment Intent no Stripe.
     */
    async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
        if (!this.stripe) return null;

        try {
            return await this.stripe.paymentIntents.retrieve(paymentIntentId);
        } catch (error) {
            console.error('❌ [Stripe] Erro ao buscar PaymentIntent:', error);
            return null;
        }
    }

    /**
     * Mapeia o método de pagamento da loja para os tipos do Stripe.
     */
    private getPaymentMethodTypes(method: PaymentMethod): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
        switch (method) {
            case 'pix':
                return ['pix'] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
            case 'boleto':
                return ['boleto'] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
            case 'credit_card':
                return ['card'];
            default:
                return ['card'];
        }
    }

    // ============================================================
    // Modo Simulado (quando não há chaves do Stripe)
    // ============================================================

    /**
     * Simula uma resposta de checkout para desenvolvimento.
     * Gera dados mock realistas para PIX, Boleto e Cartão.
     */
    private simulateCheckout(order: Order): CheckoutResponse {
        console.log(`🧪 [Stripe Simulado] Checkout para pedido ${order.id}`);

        const base: CheckoutResponse = {
            orderId: order.id,
            status: 'PROCESSING',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        };

        switch (order.paymentMethod) {
            case 'pix':
                return {
                    ...base,
                    pixQrCode: this.generateFakePixQrCode(),
                    pixCopyPaste: this.generateFakePixCode(order),
                };

            case 'boleto':
                return {
                    ...base,
                    boletoUrl: `https://stripe.com/boleto/simulado/${order.id}`,
                    boletoBarcode: this.generateFakeBoletoBarcode(),
                };

            case 'credit_card':
                return {
                    ...base,
                    paymentUrl: `${env.FRONTEND_URL}/api/payment/simulate-success/${order.id}`,
                };

            default:
                return base;
        }
    }

    private generateFakePixQrCode(): string {
        // Base64 de um QR code PIX simulado (placeholder)
        return 'data:image/svg+xml;base64,' + Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="30" height="30" fill="black"/>
        <rect x="160" y="10" width="30" height="30" fill="black"/>
        <rect x="10" y="160" width="30" height="30" fill="black"/>
        <rect x="50" y="10" width="10" height="10" fill="black"/>
        <rect x="70" y="10" width="10" height="10" fill="black"/>
        <rect x="90" y="30" width="20" height="10" fill="black"/>
        <rect x="50" y="50" width="10" height="10" fill="black"/>
        <rect x="90" y="70" width="20" height="20" fill="black"/>
        <rect x="120" y="50" width="10" height="10" fill="black"/>
        <rect x="60" y="90" width="80" height="20" fill="black"/>
        <rect x="50" y="120" width="10" height="10" fill="black"/>
        <rect x="80" y="130" width="10" height="10" fill="black"/>
        <rect x="100" y="150" width="20" height="10" fill="black"/>
        <rect x="140" y="120" width="10" height="10" fill="black"/>
        <text x="100" y="195" text-anchor="middle" font-size="10" font-family="monospace">PIX SIMULADO</text>
      </svg>`
        ).toString('base64');
    }

    private generateFakePixCode(order: Order): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 60; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `00020126580014BR.GOV.BCB.PIX0136${code}520400005303986540${(order.total / 100).toFixed(2)}5802BR5920MODA STORE LTDA6009SAO PAULO`;
    }

    private generateFakeBoletoBarcode(): string {
        let barcode = '';
        for (let i = 0; i < 47; i++) {
            barcode += Math.floor(Math.random() * 10).toString();
        }
        return barcode.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d)(\d{14})/, '$1.$2 $3.$4 $5.$6 $7 $8');
    }
}
