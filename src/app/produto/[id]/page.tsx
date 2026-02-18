'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { mockProducts } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

function StarIcon({ filled }: { filled: boolean }) {
    if (filled) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--accent-pink)]">
                <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--accent-pink)]">
            <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z" />
        </svg>
    );
}

export default function ProductPage({ params }: ProductPageProps) {
    const { id } = use(params);
    const product = mockProducts.find((p) => p.id === id);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAddedFeedback, setShowAddedFeedback] = useState(false);
    const { addItem, totalItems } = useCart();
    const router = useRouter();

    if (!product) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <p className="text-[var(--text-secondary)]">Produto não encontrado</p>
            </div>
        );
    }

    const relatedProducts = mockProducts
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, 3);

    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) {
            alert('Por favor, selecione um tamanho e uma cor');
            return;
        }
        addItem(product.id, selectedSize, selectedColor);
        setShowAddedFeedback(true);
        setTimeout(() => setShowAddedFeedback(false), 2500);
    };

    const handleGoToCart = () => {
        router.push('/carrinho');
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[var(--bg-primary)]">
            <Header title="Detalhes do Produto" showBackButton backHref="/" />

            {/* Image Carousel */}
            <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory">
                <div className="flex items-stretch p-4 gap-3">
                    {product.images.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-60 aspect-square bg-center bg-no-repeat bg-cover rounded-lg cursor-pointer snap-center transition-all ${currentImageIndex === index ? 'ring-2 ring-[var(--accent-pink)]' : ''
                                }`}
                            style={{ backgroundImage: `url("${image}")` }}
                        />
                    ))}
                </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 px-4 pb-48">
                <h1 className="text-[var(--text-primary)] text-[22px] font-bold leading-tight tracking-tight pb-3 pt-2">
                    {product.name}
                </h1>

                <p className="text-[var(--text-primary)] text-base font-normal leading-normal pb-3">
                    {product.description}
                </p>

                {/* Size Selection */}
                <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight tracking-tight pb-2 pt-4">
                    Tamanho
                </h3>
                <div className="flex gap-3 flex-wrap">
                    {product.sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`flex h-10 shrink-0 items-center justify-center rounded-lg px-4 transition-all ${selectedSize === size
                                ? 'bg-[var(--accent-pink)] text-white font-bold'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>

                {/* Color Selection */}
                <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight tracking-tight pb-2 pt-4">
                    Cor
                </h3>
                <div className="flex flex-wrap gap-4">
                    {product.colors.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`size-10 rounded-full border-2 transition-all ${selectedColor === color.name
                                ? 'ring-2 ring-[var(--text-primary)] ring-offset-2'
                                : 'border-[var(--border-light)]'
                                }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        />
                    ))}
                </div>

                {/* Price */}
                <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight tracking-tight pb-2 pt-4">
                    Preço
                </h3>
                <p className="text-[var(--text-primary)] text-2xl font-bold">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                </p>

                {/* Reviews */}
                <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight tracking-tight pb-2 pt-4">
                    Avaliações
                </h3>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-[var(--text-primary)] text-4xl font-black leading-tight tracking-tight">
                            {product.rating.toFixed(1)}
                        </p>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon key={star} filled={star <= fullStars || (star === fullStars + 1 && hasHalfStar)} />
                            ))}
                        </div>
                        <p className="text-[var(--text-primary)] text-base font-normal">
                            {product.reviewCount} reviews
                        </p>
                    </div>

                    <div className="flex-1 min-w-[200px] max-w-[400px] space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const percentage = stars === 5 ? 40 : stars === 4 ? 30 : stars === 3 ? 15 : stars === 2 ? 10 : 5;
                            return (
                                <div key={stars} className="flex items-center gap-2">
                                    <span className="text-[var(--text-primary)] text-sm w-3">{stars}</span>
                                    <div className="flex-1 h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[var(--accent-pink)] rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-[var(--text-secondary)] text-sm w-8 text-right">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <>
                        <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight tracking-tight pb-2 pt-6">
                            Produtos Relacionados
                        </h3>
                        <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 gap-3">
                            {relatedProducts.map((relatedProduct) => (
                                <div key={relatedProduct.id} className="min-w-[160px] flex-shrink-0">
                                    <ProductCard product={relatedProduct} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Fixed Bottom Bar - Floating "Island" Style above Nav */}
            <div className="fixed bottom-24 left-4 right-4 z-[60] bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-4">
                <div className="flex items-center justify-between gap-4">
                    {showAddedFeedback ? (
                        <button
                            onClick={handleGoToCart}
                            className="w-full h-12 bg-green-500 text-white text-base font-bold rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                            </svg>
                            Adicionado! Ver Sacola
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="w-full h-12 bg-[var(--text-primary)] text-white text-sm font-bold tracking-widest uppercase rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-gray-200"
                        >
                            Adicionar à Sacola
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
