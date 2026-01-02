'use client';

import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';

export default function ContaPage() {
    const menuItems = [
        { icon: '👤', label: 'Meus Dados', href: '#' },
        { icon: '📦', label: 'Meus Pedidos', href: '#' },
        { icon: '❤️', label: 'Favoritos', href: '#' },
        { icon: '📍', label: 'Endereços', href: '#' },
        { icon: '💳', label: 'Formas de Pagamento', href: '#' },
        { icon: '🔔', label: 'Notificações', href: '#' },
        { icon: '❓', label: 'Ajuda', href: '#' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Header title="Minha Conta" />

            <main className="px-4 pb-24">
                {/* User Profile Card */}
                <div className="bg-gradient-to-r from-[var(--accent-pink)] to-[#ff6bb3] rounded-2xl p-4 mb-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                            👩
                        </div>
                        <div>
                            <p className="font-bold text-lg">Maria Silva</p>
                            <p className="text-white/80 text-sm">maria@email.com</p>
                        </div>
                    </div>
                </div>

                {/* Admin Access */}
                <Link
                    href="/admin"
                    className="flex items-center gap-4 bg-gradient-to-r from-[#1c0d16] to-[#3d1a2f] text-white p-4 rounded-xl mb-6"
                >
                    <span className="text-2xl">⚙️</span>
                    <div className="flex-1">
                        <p className="font-bold">Área do Admin</p>
                        <p className="text-white/70 text-sm">Gerenciar produtos e estoque</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                    </svg>
                </Link>

                {/* Menu Items */}
                <div className="bg-white rounded-xl overflow-hidden">
                    {menuItems.map((item, index) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="flex-1 text-[var(--text-primary)] font-medium">
                                {item.label}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--text-secondary)]">
                                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                            </svg>
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                <button className="w-full mt-6 py-4 text-red-500 font-medium text-center">
                    Sair da Conta
                </button>
            </main>

            <BottomNav />
        </div>
    );
}
