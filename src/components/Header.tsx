'use client';

import Link from 'next/link';

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
    backHref?: string;
}

export function Header({ title, showBackButton = false, backHref = '/' }: HeaderProps) {
    return (
        <header className="flex items-center p-4 justify-between w-full">
            {showBackButton ? (
                <Link
                    href={backHref}
                    className="text-[var(--text-primary)] flex size-10 shrink-0 items-center justify-center -ml-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
                    </svg>
                </Link>
            ) : (
                <div className="w-10" />
            )}
            <h1 className="text-[var(--text-primary)] text-xl font-bold leading-tight tracking-tight flex-1 text-center drop-shadow-sm">
                {title}
            </h1>
            <div className="w-10" />
        </header>
    );
}
