import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// ============================================================
// Controller de Autenticação ADMIN
// ============================================================

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email e senha são obrigatórios' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Só permite logar se for ADMIN
        if (!user || user.role !== 'ADMIN') {
            res.status(401).json({ error: 'Credenciais inválidas ou acesso não autorizado' });
            return;
        }

        // Verifica a senha
        if (!user.password) {
            res.status(401).json({ error: 'Conta de admin inválida' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Credenciais inválidas ou acesso não autorizado' });
            return;
        }

        // Gera token JWT válido por 24h
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Autenticado com sucesso',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ error: 'Erro interno ao processar login' });
    }
};

/**
 * Cadastra o PRIMEIRO admin do sistema. (Uso único)
 * Caso já exista algum admin no banco, esta rota bloqueia a criação.
 */
export const registerFirstAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        // Verifica se há pelo menos 1 admin cadastrado
        const adminCount = await prisma.user.count({
            where: { role: 'ADMIN' },
        });

        if (adminCount > 0) {
            res.status(403).json({ error: 'FORBIDDEN', message: 'Já existe um administrador cadastrado no sistema.' });
            return;
        }

        const { email, password, name } = req.body;

        if (!email || !password || password.length < 6) {
            res.status(400).json({ error: 'Email e uma senha forte (mínimo 6 caracteres) são obrigatórios.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.user.create({
            data: {
                email,
                name: name || 'Admin Principal',
                password: hashedPassword,
                role: 'ADMIN',
            }
        });

        res.status(201).json({
            message: 'Primeiro administrador criado com sucesso. Você já pode fazer login.',
            admin: { id: newAdmin.id, email: newAdmin.email }
        });
    } catch (error) {
        console.error('❌ Erro ao criar primeiro admin:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
};
