import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { deleteFile } from '../services/storage.service';

// ============================================================
// Esquemas de Validação (Zod)
// ============================================================

const productSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    price: z.number().positive('Preço deve ser maior que zero'),
    category: z.string().min(2, 'Categoria é obrigatória'),
    images: z.array(z.string().url('URL de imagem inválida')).optional(),
    stock: z.array(z.object({
        size: z.string(),
        color: z.string(),
        quantity: z.number().int().nonnegative(),
    })).optional(),
});

const updateProductSchema = productSchema.partial();

// ============================================================
// Product Controller
// ============================================================

export const listProducts = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
        const category = req.query.category as string | undefined;
        const search = req.query.search as string | undefined;

        const where: any = {};
        if (category && category !== 'Todos') {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    stock: true,
                    images: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);

        const formattedProducts = products.map(product => ({
            ...product,
            images: product.images.map(img => img.url),
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error('Error listing products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const product = await prisma.product.findUnique({
            where: { id: String(id) },
            include: {
                stock: true,
                images: true,
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const formattedProduct = {
            ...product,
            images: (product.images || []).map((img: any) => img.url),
        };

        res.json(formattedProduct);
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        // Validação Zod
        const result = productSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                details: result.error.format()
            });
        }

        const { name, description, price, category, images, stock } = result.data;

        const product = await prisma.product.create({
            data: {
                name,
                description: description || '',
                price,
                category,
                images: {
                    create: images ? images.map((url: string) => ({ url })) : [],
                },
                stock: {
                    create: stock ? stock.map((item: any) => ({
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity,
                    })) : [],
                },
            },
            include: {
                images: true,
                stock: true,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        // Validação Zod
        const result = updateProductSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                details: result.error.format()
            });
        }

        const { name, description, price, category, images, stock } = result.data;

        // Se novas imagens foram enviadas, apagar as antigas do storage
        if (images) {
            const oldImages = await prisma.productImage.findMany({
                where: { productId: id }
            });
            for (const img of oldImages) {
                // Se a imagem antiga não estiver na nova lista, apagar do storage
                if (!images.includes(img.url)) {
                    await deleteFile(img.url);
                }
            }
        }

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (description !== undefined) data.description = description;
        if (price !== undefined) data.price = price;
        if (category !== undefined) data.category = category;

        if (images) {
            data.images = {
                deleteMany: {},
                create: images.map((url: string) => ({ url })),
            };
        }

        if (stock) {
            data.stock = {
                deleteMany: {},
                create: stock.map((item: any) => ({
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                })),
            };
        }

        const product = await prisma.product.update({
            where: { id: String(id) },
            data,
            include: {
                images: true,
                stock: true,
            },
        });

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);

        const product = await prisma.product.findUnique({
            where: { id },
            include: { images: true, orderItems: true }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Verificar se o produto tem pedidos vinculados
        if (product.orderItems.length > 0) {
            return res.status(409).json({
                error: 'PRODUCT_HAS_ORDERS',
                message: `Não é possível excluir este produto pois ele está vinculado a ${product.orderItems.length} pedido(s). Considere desativá-lo.`
            });
        }

        // 1. Apagar imagens do storage
        if (product.images) {
            for (const img of product.images) {
                await deleteFile(img.url);
            }
        }

        // 2. Apagar registros dependentes primeiro (cascade manual)
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productStock.deleteMany({ where: { productId: id } });

        // 3. Apagar o produto do banco
        await prisma.product.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

