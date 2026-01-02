import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/produto/${product.id}`} className="flex flex-col gap-3 pb-3 group">
            <div
                className="w-full aspect-[3/4] bg-center bg-no-repeat bg-cover rounded-lg transition-transform group-hover:scale-[1.02]"
                style={{ backgroundImage: `url("${product.images[0]}")` }}
            />
            <div className="flex flex-col gap-1">
                <p className="text-[var(--text-primary)] text-base font-medium leading-normal line-clamp-1">
                    {product.name}
                </p>
                <p className="text-[var(--text-secondary)] text-sm font-normal">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
            </div>
        </Link>
    );
}
