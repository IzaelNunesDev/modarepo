import IORedis from 'ioredis';
import { env } from '../config/env';

// Configuração de conexão Redis para BullMQ.
// Exportamos as OPTIONS (não a instância) para que Queue/Worker
// criem suas próprias conexões internamente — isso evita erros de tipo.

export const redisConnectionOptions = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null as null,    // Obrigatório para BullMQ
    enableReadyCheck: false,
};

// Conexão separada para uso geral (cache de idempotência, etc.)
export const redisClient = new IORedis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null as null,
    retryStrategy: (times: number) => {
        if (times > 10) return null;
        return Math.min(times * 200, 5000);
    },
});

redisClient.on('connect', () => {
    console.log('✅ [Redis] Conectado com sucesso');
});

redisClient.on('error', (err) => {
    console.error('❌ [Redis] Erro de conexão:', err.message);
});

redisClient.on('close', () => {
    console.warn('⚠️  [Redis] Conexão fechada');
});
