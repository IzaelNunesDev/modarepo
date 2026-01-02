'use client';

import { useState, useMemo } from 'react';
import { BottomNav } from '@/components/BottomNav';
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
            <Header title="Catálogo" />

            <SearchBar onSearch={setSearchQuery} />

            <FilterBar
                categories={categories}
                onFilterChange={(filters) => setActiveCategory(filters.category)}
            />

            {/* Product Grid */}
            <main className="flex-1 px-4 pb-20">
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--text-secondary)] mb-4">
                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                        </svg>
                        <p className="text-[var(--text-secondary)] text-lg font-medium">
                            Nenhum produto encontrado
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">
                            Tente ajustar seus filtros
                        </p>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
