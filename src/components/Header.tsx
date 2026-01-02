'use client';

import Link from 'next/link';

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
    backHref?: string;
}

export function Header({ title, showBackButton = false, backHref = '/' }: HeaderProps) {
    return (
        <header className="flex items-center bg-[var(--bg-primary)] p-4 pb-2 justify-between sticky top-0 z-40">
            {showBackButton ? (
                <Link
                    href={backHref}
                    className="text-[var(--text-primary)] flex size-12 shrink-0 items-center justify-center -ml-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
                    </svg>
                </Link>
            ) : (
                <div className="w-12" />
            )}
            <h1 className="text-[var(--text-primary)] text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                {title}
            </h1>
            <div className="w-12" />
        </header>
    );
}
