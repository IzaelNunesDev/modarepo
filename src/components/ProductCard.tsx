import Link from 'next/link';
import { Product } from '@/types';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/produto/${product.id}`} className="group relative block h-full">
            <div className="relative h-full flex flex-col gap-3">
                {/* Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100">
                    {/* Badge (Optional - can be added based on props) */}
                    {/* <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm z-10">Novo</div> */}

                    <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                        style={{ backgroundImage: `url("${product.images[0]}")` }}
                    />

                    {/* Overlay with Quick Action (Optional) */}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />

                    {/* Floating Action Button (Visible on Hover) */}
                    <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg hover:bg-slate-900 hover:text-white transition-colors">
                            <ShoppingBag size={18} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold text-slate-700 leading-tight group-hover:text-pink-600 transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-slate-900">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {/* Fake "Installments" text for perceived value */}
                        <span className="text-[10px] text-slate-400 font-medium">
                            3x R$ {(product.price / 3).toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
