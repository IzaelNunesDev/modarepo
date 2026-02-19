
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

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
        const product = await prisma.product.findUnique({
            where: { id },
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
            images: product.images.map(img => img.url),
        };

        res.json(formattedProduct);
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, category, images, stock } = req.body;

        // Basic validation
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description: description || '',
                price: parseFloat(price),
                category,
                images: {
                    create: images ? images.map((url: string) => ({ url })) : [],
                },
                stock: {
                    create: stock ? stock.map((item: any) => ({
                        size: item.size,
                        color: item.color,
                        quantity: parseInt(item.quantity) || 0,
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
        const { name, description, price, category, images, stock } = req.body;

        const data: any = {};
        if (name) data.name = name;
        if (description) data.description = description;
        if (price) data.price = parseFloat(price);
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
                    quantity: parseInt(item.quantity) || 0,
                })),
            };
        }

        const product = await prisma.product.update({
            where: { id },
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
