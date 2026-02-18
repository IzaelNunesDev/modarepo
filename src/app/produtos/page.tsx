'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { Header } from '@/components/Header';
import { mockProducts, categories } from '@/data/products';

export default function CatalogPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');

    const filteredProducts = useMemo(() => {
        return mockProducts.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[var(--bg-primary)] pb-safe">
            {/* Header - Glassy & Sticky */}
            <div className="sticky top-0 z-40 glass backdrop-blur-xl border-b border-white/20">
                <Header title="Catálogo" />
                <div className="px-2 pb-2">
                    <SearchBar onSearch={setSearchQuery} />
                    <FilterBar
                        categories={categories}
                        onFilterChange={(filters) => setActiveCategory(filters.category)}
                    />
                </div>
            </div>

            {/* Product Grid */}
            <main className="flex-1 px-4 py-6 pb-32">
                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {filteredProducts.length} produtos encontrados
                    </span>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-pulse-gentle">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl m-4 border border-white/40 shadow-sm">
                        <div className="bg-[var(--bg-secondary)] p-6 rounded-full mb-4 animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="var(--accent-pink)" viewBox="0 0 256 256">
                                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                            </svg>
                        </div>
                        <p className="text-[var(--text-primary)] text-xl font-bold mb-2">
                            Oops! Nada aqui.
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm px-8 max-w-xs">
                            Não encontramos o que você procura. Tente outra categoria ou termo.
                        </p>
                    </div>
                )}
            </main>

        </div>
    );
}
