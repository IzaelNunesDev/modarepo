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
        const products = await prisma.product.findMany({
            include: {
                stock: true,
                images: true,
            },
        });

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
        if (name) data.name = name;
        if (description) data.description = description;
        if (price) data.price = price;
        if (category) data.category = category;

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
            include: { images: true }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // 1. Apagar imagens do storage
        if (product.images) {
            for (const img of product.images) {
                await deleteFile(img.url);
            }
        }

        // 2. Apagar do banco
        await prisma.product.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

