import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../queues/connection';

// ============================================================
// Middleware de Idempotência
// ============================================================
// Garante que a mesma operação não seja processada duas vezes.
// O cliente envia uma chave única (Idempotency-Key) no header
// ou no body. Se a mesma chave já foi usada, retorna o resultado
// anterior em vez de processar novamente.
//
// Isso é ESSENCIAL para pagamentos — imagine o cenário:
// 1. Cliente clica em "Pagar" → request 1 é enviado
// 2. Internet cai → cliente não recebe a resposta
// 3. Cliente clica novamente → request 2 é enviado
// Sem idempotência, o cliente seria cobrado duas vezes!

const IDEMPOTENCY_TTL = 60 * 60 * 24; // 24 horas em segundos
const IDEMPOTENCY_PREFIX = 'idempotency:';
const LOCK_PREFIX = 'idempotency_lock:';
const LOCK_TTL = 30; // 30 segundos (tempo máximo de processamento)

interface IdempotencyRecord {
    status: 'processing' | 'completed';
    statusCode?: number;
    body?: string;
    completedAt?: string;
}

export function idempotencyMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Extrair a chave de idempotência
        const idempotencyKey =
            (req.headers['idempotency-key'] as string) ||
            (req.body?.idempotencyKey as string);

        // Se não tem chave, prosseguir normalmente
        if (!idempotencyKey) {
            return next();
        }

        const redisKey = `${IDEMPOTENCY_PREFIX}${idempotencyKey}`;
        const lockKey = `${LOCK_PREFIX}${idempotencyKey}`;

        try {
            // 1. Verificar se já existe um resultado para esta chave
            const existing = await redisClient.get(redisKey);

            if (existing) {
                const record: IdempotencyRecord = JSON.parse(existing);

                if (record.status === 'completed' && record.body) {
                    // Resultado já existe — retornar sem processar
                    console.log(`🔄 [Idempotência] Retornando resultado em cache para: ${idempotencyKey}`);
                    res.status(record.statusCode || 200).json(JSON.parse(record.body));
                    return;
                }

                if (record.status === 'processing') {
                    // Já está sendo processado por outro request
                    console.log(`⏳ [Idempotência] Request em andamento para: ${idempotencyKey}`);
                    res.status(409).json({
                        error: 'PROCESSING_IN_PROGRESS',
                        message: 'Esta operação já está sendo processada. Aguarde.',
                    });
                    return;
                }
            }

            // 2. Tentar adquirir o lock (SET NX = só se não existir)
            const lockAcquired = await redisClient.set(lockKey, '1', 'EX', LOCK_TTL, 'NX');

            if (!lockAcquired) {
                // Outro request pegou o lock primeiro
                res.status(409).json({
                    error: 'CONCURRENT_REQUEST',
                    message: 'Operação duplicada detectada. Aguarde o processamento.',
                });
                return;
            }

            // 3. Marcar como "em processamento" no Redis
            const processingRecord: IdempotencyRecord = { status: 'processing' };
            await redisClient.set(redisKey, JSON.stringify(processingRecord), 'EX', IDEMPOTENCY_TTL);

            // 4. Interceptar a resposta para salvar o resultado
            const originalJson = res.json.bind(res);
            res.json = function (body: unknown) {
                // Salvar o resultado no Redis para futuras requisições idênticas
                const completedRecord: IdempotencyRecord = {
                    status: 'completed',
                    statusCode: res.statusCode,
                    body: JSON.stringify(body),
                    completedAt: new Date().toISOString(),
                };

                // Salvar de forma assíncrona (não bloqueia a resposta)
                redisClient.set(redisKey, JSON.stringify(completedRecord), 'EX', IDEMPOTENCY_TTL)
                    .then(() => redisClient.del(lockKey))
                    .catch((err) => console.error('[Idempotência] Erro ao salvar resultado:', err));

                return originalJson(body);
            };

            next();
        } catch (error) {
            // Se Redis falhar, prosseguir sem idempotência (fail-open)
            console.error('⚠️  [Idempotência] Redis indisponível, prosseguindo sem cache:', error);
            next();
        }
    };
}
