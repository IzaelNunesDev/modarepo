
import { Metadata } from 'next';
import { getProduct, getProducts } from '@/services/product.service';
import ProductPageClient from './ProductPageClient';
import { notFound } from 'next/navigation';

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: 'Produto não encontrado | Moda Store',
        };
    }

    return {
        title: `${product.name} | Moda Store`,
        description: product.description,
        openGraph: {
            title: `${product.name} | Moda Store`,
            description: product.description,
            images: [
                {
                    url: product.images[0],
                    width: 800,
                    height: 600,
                    alt: product.name,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Moda Store`,
            description: product.description,
            images: [product.images[0]],
        },
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;

    // Fetch data in parallel on the server
    const [product, allProducts] = await Promise.all([
        getProduct(id),
        getProducts()
    ]);

    if (!product) {
        notFound();
    }

    const relatedProducts = allProducts
        .filter(p => p.id !== product.id && p.category === product.category)
        .slice(0, 4);

    return (
        <ProductPageClient
            initialProduct={product}
            relatedProducts={relatedProducts}
        />
    );
}
