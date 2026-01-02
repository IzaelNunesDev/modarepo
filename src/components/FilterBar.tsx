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
        <div className="flex gap-3 p-3 overflow-x-auto hide-scrollbar">
            {/* Category Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[var(--bg-secondary)] pl-4 pr-2 transition-colors hover:bg-[var(--border-light)]"
                >
                    <span className="text-[var(--text-primary)] text-sm font-medium leading-normal">
                        {activeCategory === 'Todos' ? 'Categorias' : activeCategory}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--text-primary)]">
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                </button>

                {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[var(--border-light)] py-2 min-w-[150px] z-50">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategorySelect(cat)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${activeCategory === cat
                                        ? 'bg-[var(--bg-secondary)] text-[var(--accent-pink)] font-medium'
                                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Size Filter Button */}
            <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[var(--bg-secondary)] pl-4 pr-2 transition-colors hover:bg-[var(--border-light)]">
                <span className="text-[var(--text-primary)] text-sm font-medium leading-normal">Tamanho</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--text-primary)]">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                </svg>
            </button>

            {/* Color Filter Button */}
            <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[var(--bg-secondary)] pl-4 pr-2 transition-colors hover:bg-[var(--border-light)]">
                <span className="text-[var(--text-primary)] text-sm font-medium leading-normal">Cor</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--text-primary)]">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                </svg>
            </button>
        </div>
    );
}
