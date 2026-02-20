import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import paymentRoutes from './routes/payment.routes';
import webhookRoutes from './routes/webhook.routes';
import uploadRoutes from './routes/upload.routes';
import { shutdownWorkers } from './queues/payment.worker';
import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes';

// ============================================================
// Moda Store — Backend Express
// Gateway de Pagamento com Webhooks e Filas BullMQ
// ============================================================

const app = express();

// ─── CORS ─────────────────────────────────────────────────────
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
}));

// ─── Body Parsers ─────────────────────────────────────────────
// IMPORTANTE: O webhook do Stripe precisa do body RAW (Buffer),
// então NÃO usamos express.json() globalmente nas rotas de webhook.
// As rotas de webhook já configuram express.raw() individualmente.
app.use('/api/webhook', webhookRoutes);

// JSON parser para todas as outras rotas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rotas ────────────────────────────────────────────────────
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'moda-store-backend',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        stripe: env.hasStripeKeys ? 'configured' : 'simulated',
        uptime: process.uptime(),
    });
});

// ─── Rota de info (documentação da API) ─────────────────────
app.get('/api', (req, res) => {
    res.json({
        name: 'Moda Store Payment API',
        version: '1.0.0',
        description: 'Gateway de Pagamento com Webhooks e Filas BullMQ',
        endpoints: {
            health: 'GET /api/health',
            checkout: 'POST /api/payment/checkout',
            orderStatus: 'GET /api/payment/order/:orderId',
            listOrders: 'GET /api/payment/orders',
            queueStatus: 'GET /api/payment/queue-status',
            stripeWebhook: 'POST /api/webhook/stripe',
            simulateSuccess: 'POST /api/payment/simulate-success/:orderId',
            simulateWebhook: 'POST /api/payment/simulate-webhook',
        },
        concepts: {
            queues: 'BullMQ com Redis para processamento assíncrono de webhooks',
            idempotency: 'Chaves únicas garantem que pagamentos não sejam duplicados',
            resilience: 'Se o servidor cair, a fila preserva os eventos pendentes',
            webhooks: 'Stripe notifica eventos de pagamento via HTTP POST',
        },
    });
});

// ─── Error Handler Global ─────────────────────────────────────
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('💥 Erro não tratado:', err);
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: env.isProduction ? 'Erro interno' : err.message,
    });
});

// ─── Start Server ─────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🛍️  Moda Store — Payment Gateway                          ║
║                                                              ║
║   🚀 Servidor rodando em http://localhost:${env.PORT}             ║
║   📋 API docs em http://localhost:${env.PORT}/api                 ║
║   🏥 Health check em http://localhost:${env.PORT}/api/health      ║
║                                                              ║
║   💳 Stripe: ${env.hasStripeKeys ? '✅ Configurado' : '🧪 Modo Simulado'}                           ║
║   📦 Filas: BullMQ + Redis                                  ║
║   🔒 Idempotência: Ativa                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// ─── Graceful Shutdown ────────────────────────────────────────
// Ao encerrar o servidor, garantimos que:
// 1. Novas conexões são recusadas
// 2. Workers terminam os jobs em andamento
// 3. Conexões são fechadas limpamente

async function gracefulShutdown(signal: string) {
    console.log(`\n🛑 ${signal} recebido. Encerrando gracefully...`);

    server.close(async () => {
        console.log('✅ Servidor HTTP encerrado');

        await shutdownWorkers();

        console.log('👋 Tudo encerrado. Até a próxima!');
        process.exit(0);
    });

    // Forçar encerramento após 10 segundos
    setTimeout(() => {
        console.error('⚠️  Timeout no shutdown. Forçando saída.');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
