'use client';

import { useState } from 'react';

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = 'Pesquisar produtos', onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch?.(value);
    };

    return (
        <div className="px-2 py-2 w-full">
            <label className="relative flex items-center w-full">
                <div className="absolute left-4 text-[var(--accent-pink)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleChange}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/80 border border-white/40 focus:bg-white focus:border-[var(--accent-pink)] focus:ring-4 focus:ring-[var(--accent-pink)]/10 transition-all font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] shadow-sm outline-none"
                />
            </label>
        </div>
    );
}
