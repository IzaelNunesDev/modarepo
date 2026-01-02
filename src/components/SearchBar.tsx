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
        <div className="px-4 py-3">
            <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-[var(--text-secondary)] flex bg-[var(--bg-secondary)] items-center justify-center pl-4 rounded-l-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={handleChange}
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)] border-none bg-[var(--bg-secondary)] h-full placeholder:text-[var(--text-secondary)] px-4 text-base font-normal leading-normal"
                    />
                </div>
            </label>
        </div>
    );
}
