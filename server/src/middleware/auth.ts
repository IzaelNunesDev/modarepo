import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// ============================================================
// Middleware: verifyAdmin
// Verifica se o usuário autenticado na requisição é um Admin
// através de Headers Authorization: Bearer <TOKEN>
// ============================================================

interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

export function verifyAdmin() {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ error: 'Auth token (Bearer) is missing ou invalid' });
                return;
            }

            // 'Bearer <TOKEN>'
            const token = authHeader.split(' ')[1];

            const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

            // Restrição de nível ADMIN
            if (decoded.role !== 'ADMIN') {
                res.status(403).json({ error: 'Acesso negado. Requer nível ADMINISTRADOR.' });
                return;
            }

            // Opcionalmente podemos injetar o 'req.user = decoded'
            // @ts-ignore
            req.user = decoded;

            next();
        } catch (error) {
            console.error('❌ Falha na validação do token:', error);
            res.status(401).json({ error: 'Token JWT expirado ou inválido' });
            return;
        }
    };
}
