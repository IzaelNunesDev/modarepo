'use client';

import { useState } from 'react';

interface FilterBarProps {
    categories: string[];
    sizes?: string[];
    colors?: { name: string; hex: string }[];
    onFilterChange?: (filters: { category: string; size: string; color: string }) => void;
}

export function FilterBar({ categories, onFilterChange }: FilterBarProps) {
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const handleCategorySelect = (category: string) => {
        setActiveCategory(category);
        setShowCategoryDropdown(false);
        onFilterChange?.({ category, size: '', color: '' });
    };

    return (
        <div className="flex gap-3 px-2 py-2 overflow-x-auto hide-scrollbar">
            {/* Category Dropdown */}
            <div className="relative shrink-0">
                <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className={`flex h-10 items-center justify-center gap-x-2 rounded-xl border px-4 transition-all shadow-sm ${activeCategory !== 'Todos'
                            ? 'bg-[var(--accent-pink)] text-white border-[var(--accent-pink)]'
                            : 'bg-white/80 text-[var(--text-primary)] border-white/40 hover:bg-white'
                        }`}
                >
                    <span className="text-sm font-bold">
                        {activeCategory === 'Todos' ? 'Categorias' : activeCategory}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className={activeCategory !== 'Todos' ? 'text-white' : 'text-[var(--text-secondary)]'}>
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                </button>

                {showCategoryDropdown && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                        <div className="absolute top-full left-0 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 py-2 min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-l-4 ${activeCategory === cat
                                        ? 'border-[var(--accent-pink)] bg-[var(--bg-secondary)] text-[var(--accent-pink)]'
                                        : 'border-transparent text-[var(--text-primary)] hover:bg-gray-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Static Filters for Visuals */}
            {['Tamanho', 'Cor', 'Preço'].map((filter) => (
                <button key={filter} className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-white/80 border border-white/40 px-4 transition-all hover:bg-white shadow-sm">
                    <span className="text-[var(--text-primary)] text-sm font-bold">{filter}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--text-secondary)]">
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}
