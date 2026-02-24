import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validação crítica: JWT_SECRET DEVE existir em produção
const jwtSecret = process.env.JWT_SECRET || 'chave-secreta-padrao-apenas-para-desenvolvimento';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('🚨 FATAL: JWT_SECRET não configurado em produção! O servidor NÃO vai iniciar.');
    process.exit(1);
}

export const env = {
    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

    // Redis
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,

    // Server
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Autenticação
    JWT_SECRET: jwtSecret,

    // Validações
    get isProduction() {
        return this.NODE_ENV === 'production';
    },

    get hasStripeKeys() {
        return this.STRIPE_SECRET_KEY.startsWith('sk_');
    },
};
