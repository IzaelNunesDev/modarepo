'use client';

import { useState, use, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { getProduct, getProducts } from '@/services/product.service';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';

interface ProductPageClientProps {
    initialProduct: Product;
    relatedProducts: Product[];
}

function StarIcon({ filled }: { filled: boolean }) {
    if (filled) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-yellow-400 drop-shadow-sm">
                <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-gray-300">
            <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z" />
        </svg>
    );
}

export default function ProductPageClient({ initialProduct, relatedProducts }: ProductPageClientProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAddedFeedback, setShowAddedFeedback] = useState(false);
    const { addItem } = useCart();
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll image carousel on index change
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const target = container.children[0]?.children[currentImageIndex] as HTMLElement;
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentImageIndex]);

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) {
            const sizeEl = document.getElementById('size-selector');
            const colorEl = document.getElementById('color-selector');

            if (!selectedSize && sizeEl) {
                sizeEl.classList.add('animate-shake');
                setTimeout(() => sizeEl.classList.remove('animate-shake'), 500);
            }
            if (!selectedColor && colorEl) {
                colorEl.classList.add('animate-shake');
                setTimeout(() => colorEl.classList.remove('animate-shake'), 500);
            }
            return;
        }
        addItem(initialProduct, selectedSize, selectedColor);
        setShowAddedFeedback(true);
        setTimeout(() => setShowAddedFeedback(false), 3000);
    };

    const handleGoToCart = () => {
        router.push('/carrinho');
    };

    return (
        <div className="relative min-h-screen w-full bg-[#FAFAFA] text-slate-800 selection:bg-pink-100 selection:text-pink-600">
            <div className="absolute top-0 left-0 right-0 z-50">
                <Header title="" showBackButton backHref="/" transparent />
            </div>

            <main className="pb-32 lg:pb-12 lg:pt-24 max-w-7xl mx-auto px-0 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-start">
                    {/* Gallery */}
                    <div className="relative w-full bg-white lg:rounded-3xl lg:overflow-hidden lg:shadow-xl lg:shadow-slate-100/50 group">
                        <div className="relative aspect-[3/4] lg:aspect-square w-full overflow-hidden bg-gray-100">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out hover:scale-105"
                                style={{ backgroundImage: `url("${initialProduct.images[currentImageIndex]}")` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden opacity-60"></div>
                        </div>

                        {/* Thumbnails */}
                        <div
                            ref={scrollContainerRef}
                            className="absolute bottom-6 left-0 right-0 px-4 flex justify-center gap-3 overflow-x-auto hide-scrollbar z-20 snap-x"
                        >
                            <div className="flex gap-3 p-1 bg-white/30 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                                {initialProduct.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`relative w-12 h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 flex-shrink-0 snap-center ${currentImageIndex === index
                                            ? 'border-white scale-110 shadow-md ring-2 ring-pink-500/50'
                                            : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`${initialProduct.name} view ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Title */}
                        <div className="absolute bottom-24 left-4 right-4 lg:hidden text-white z-10">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-2">
                                {initialProduct.category}
                            </span>
                            <h1 className="text-3xl font-black leading-none drop-shadow-md">{initialProduct.name}</h1>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="px-5 pt-6 lg:pt-0 flex flex-col h-full justify-center">
                        <div className="hidden lg:block mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-pink-500 uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full">
                                    {initialProduct.category}
                                </span>
                                <div className="flex items-center gap-1 text-slate-400 text-sm">
                                    <StarIcon filled={true} />
                                    <span className="font-semibold text-slate-700 ml-1">{initialProduct.rating.toFixed(1)}</span>
                                    <span>({initialProduct.reviewCount} reviews)</span>
                                </div>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 leading-tight mb-4">{initialProduct.name}</h1>
                            <p className="text-lg text-slate-500 leading-relaxed font-light">{initialProduct.description}</p>
                        </div>

                        {/* Mobile Info */}
                        <div className="lg:hidden mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                                    <StarIcon filled={true} />
                                    <span className="font-bold text-slate-800 text-xs">{initialProduct.rating.toFixed(1)}</span>
                                    <span className="text-slate-400 text-[10px]">({initialProduct.reviewCount})</span>
                                </div>
                                <span className="text-2xl font-bold text-slate-900">
                                    R$ {initialProduct.price.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">{initialProduct.description}</p>
                        </div>

                        {/* Selectors */}
                        <div className="bg-white lg:bg-slate-50 rounded-2xl p-5 lg:p-8 border border-slate-100 lg:border-slate-200 shadow-sm mb-6">
                            <div id="color-selector" className="mb-6">
                                <div className="flex items-baseline justify-between mb-3">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Cor</h3>
                                    <span className="text-xs text-slate-500 font-medium">{selectedColor || 'Selecione'}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {initialProduct.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`group relative w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center ${selectedColor === color.name
                                                ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-lg'
                                                : 'hover:scale-105 hover:shadow-md ring-1 ring-slate-200'
                                                }`}
                                            title={color.name}
                                        >
                                            <span
                                                className="w-full h-full rounded-full border-2 border-white"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            {selectedColor === color.name && (
                                                <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div id="size-selector">
                                <div className="flex items-baseline justify-between mb-3">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Tamanho</h3>
                                    <button className="text-xs text-pink-500 font-bold hover:underline">Guia de Medidas</button>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {initialProduct.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-10 rounded-lg text-sm font-bold transition-all duration-200 ${selectedSize === size
                                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 -translate-y-0.5'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="hidden lg:flex items-center gap-6 mt-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-400 font-medium">Preço Total</span>
                                <span className="text-4xl font-black text-slate-900 tracking-tight">
                                    R$ {initialProduct.price.toFixed(2).replace('.', ',')}
                                </span>
                            </div>

                            <div className="flex-1">
                                {showAddedFeedback ? (
                                    <button
                                        onClick={handleGoToCart}
                                        className="w-full h-14 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 animate-bounce-short"
                                    >
                                        <span>Ver Sacola</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" /></svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold rounded-xl transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
                                    >
                                        <span>Adicionar à Sacola</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="transform transition-transform group-hover/btn:translate-x-1">
                                            <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96-12a12,12,0,1,1-12-12A12,12,0,0,1,192,192Zm4-56H72.13L57.59,72H206.84Z"></path>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-16 lg:mt-24 px-5 lg:px-0">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Combina com</h2>
                        <button className="text-sm font-bold text-pink-500 hover:text-pink-600 transition">Ver todos</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            </main>

            {/* Mobile Bar */}
            <div className="fixed bottom-6 left-4 right-4 z-[40] lg:hidden">
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
                        <span className="text-xl font-black text-slate-900">R$ {initialProduct.price.toFixed(2).replace('.', ',')}</span>
                    </div>

                    <div className="flex-1">
                        {showAddedFeedback ? (
                            <button
                                onClick={handleGoToCart}
                                className="w-full h-12 bg-green-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 animate-pulse"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" /></svg>
                                <span>Ver Sacola</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                className="w-full h-12 bg-slate-900 text-white text-sm font-bold uppercase tracking-wide rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.96] transition-transform"
                            >
                                Comprar Agora
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
