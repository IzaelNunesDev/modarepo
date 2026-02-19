
import { Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const COLOR_MAP: Record<string, string> = {
    'Tropical': '#FF69B4',
    'Azul Mar': '#00BFFF',
    'Preto': '#000000',
    'Branco': '#FFFFFF',
    'Bege': '#F5DEB3',
    'Vermelho': '#FF0000',
    'Verde': '#008000',
    'Vinho': '#800000',
    'Estampado': '#FFD700',
};

interface BackendProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    rating: number;
    reviewCount: number;
    stock: {
        size: string;
        color: string;
        quantity: number;
    }[];
}

function transformProduct(backendProduct: BackendProduct): Product {
    const stock: Record<string, number> = {};
    const sizes = new Set<string>();
    const colorsMap = new Map<string, { name: string; hex: string }>();

    backendProduct.stock.forEach((item) => {
        const key = `${item.size}-${item.color}`;
        stock[key] = item.quantity;
        sizes.add(item.size);

        if (!colorsMap.has(item.color)) {
            colorsMap.set(item.color, {
                name: item.color,
                hex: COLOR_MAP[item.color] || '#CCCCCC',
            });
        }
    });

    return {
        id: backendProduct.id,
        name: backendProduct.name,
        description: backendProduct.description,
        price: backendProduct.price,
        images: backendProduct.images,
        category: backendProduct.category,
        rating: backendProduct.rating,
        reviewCount: backendProduct.reviewCount,
        stock,
        sizes: Array.from(sizes),
        colors: Array.from(colorsMap.values()),
    };
}

export async function getProducts(): Promise<Product[]> {
    try {
        const res = await fetch(`${API_URL}/products`, {
            cache: 'no-store', // Always fetch fresh data
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }

        const backendProducts: BackendProduct[] = await res.json();
        return backendProducts.map(transformProduct);
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch product');
        }

        const backendProduct: BackendProduct = await res.json();
        return transformProduct(backendProduct);
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
}

export interface CreateProductDTO {
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    stock: {
        size: string;
        color: string;
        quantity: number;
    }[];
}

export async function createProduct(data: CreateProductDTO): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error('Failed to create product');
        }

        const backendProduct: BackendProduct = await res.json();
        return transformProduct(backendProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        return null;
    }
}

export type UpdateProductDTO = Partial<CreateProductDTO>;

export async function updateProduct(id: string, data: UpdateProductDTO): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error('Failed to update product');
        }

        const backendProduct: BackendProduct = await res.json();
        return transformProduct(backendProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return null;
    }
}

export const categories = ['Todos', 'Biquínis', 'Maiôs', 'Saídas de Praia', 'Acessórios', 'Biquíni Tropical', 'Biquíni Azul', 'Saída de Praia', 'Chapéu de Praia'];
