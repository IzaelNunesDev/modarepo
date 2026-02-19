'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Header } from '@/components/Header';
import { getProducts, categories } from '@/services/product.service';
import { Product } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !activeCategory || activeCategory === 'Todos' || product.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, activeCategory]);

    const handleCategoryClick = (cat: string) => {
        if (activeCategory === cat) {
            setActiveCategory(null); // Toggle off
        } else {
            setActiveCategory(cat);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#FAFAFA] text-slate-800 selection:bg-pink-100 selection:text-pink-600">
            {/* Header - Glassy & Sticky */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <Header title="Coleção" showBackButton backHref="/" />

                {/* Search & Filter Bar */}
                <div className="px-4 pb-4">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar peças..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400 outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all ${isFilterOpen
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                }`}
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>

                    {/* Horizontal Categories Scroll */}
                    <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`flex h-9 shrink-0 items-center px-4 rounded-full text-sm font-bold transition-all border ${!activeCategory
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.filter(c => c !== 'Todos').map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`flex h-9 shrink-0 items-center px-4 rounded-full text-sm font-bold transition-all border ${activeCategory === cat
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="px-4 py-6 pb-32 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-slate-500">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
                    </span>

                    {/* Optional: Sort toggle could go here */}
                    {/* <button className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        Relevância <ChevronDown size={14} />
                    </button> */}
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                            <Search className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Nenhum produto encontrado
                        </h2>
                        <p className="text-slate-500 max-w-xs mx-auto mb-8">
                            Tente buscar por outros termos ou limpe os filtros para ver mais opções.
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
