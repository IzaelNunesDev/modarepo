
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/produto/${product.id}`} className="group relative block transition-all duration-300 hover:scale-[1.02]">
            <div className="glass p-3 rounded-2xl h-full flex flex-col hover:bg-white/60 transition-colors shadow-sm hover:shadow-lg backdrop-blur-sm border border-white/60">
                <div
                    className="w-full aspect-[3/4] bg-center bg-no-repeat bg-cover rounded-xl shadow-inner mb-3"
                    style={{ backgroundImage: `url("${product.images[0]}")` }}
                />
                <div className="flex flex-col gap-1 mt-auto">
                    <p className="text-[var(--text-primary)] text-sm font-bold leading-tight line-clamp-2 min-h-[2.5em]">
                        {product.name}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-[var(--accent-pink)] text-base font-extrabold">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                        <div className="bg-[var(--accent-pink)]/10 text-[var(--accent-pink)] p-1.5 rounded-full transition-colors group-hover:bg-[var(--accent-pink)] group-hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
