'use client';

import Link from 'next/link';
import { mockProducts } from '@/data/products';

export default function AdminDashboard() {
    // Calculate stats
    const totalProducts = mockProducts.length;
    const totalStock = mockProducts.reduce((sum, product) => {
        return sum + Object.values(product.stock).reduce((a, b) => a + b, 0);
    }, 0);
    const lowStockProducts = mockProducts.filter((product) => {
        const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);
        return totalStock < 10;
    });

    const stats = [
        { label: 'Produtos', value: totalProducts, icon: '📦' },
        { label: 'Itens em Estoque', value: totalStock, icon: '🏷️' },
        { label: 'Estoque Baixo', value: lowStockProducts.length, icon: '⚠️', alert: lowStockProducts.length > 0 },
    ];

    const quickActions = [
        { label: 'Adicionar Produto', href: '/admin/produtos/novo', icon: '➕' },
        { label: 'Ver Estoque', href: '/admin/estoque', icon: '📊' },
        { label: 'Ver Produtos', href: '/admin/produtos', icon: '👗' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#1c0d16] to-[#3d1a2f] text-white p-6 pb-12">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    <Link href="/" className="text-sm opacity-80 hover:opacity-100">
                        ← Voltar à Loja
                    </Link>
                </div>
                <p className="text-white/70 text-sm">
                    Gerencie seus produtos e estoque
                </p>
            </header>

            {/* Stats Cards */}
            <div className="px-4 -mt-8">
                <div className="grid grid-cols-3 gap-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className={`bg-white rounded-xl p-4 shadow-sm ${stat.alert ? 'ring-2 ring-orange-400' : ''
                                }`}
                        >
                            <span className="text-2xl">{stat.icon}</span>
                            <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                                {stat.value}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 mt-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                    Ações Rápidas
                </h2>
                <div className="grid grid-cols-1 gap-3">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <span className="text-2xl">{action.icon}</span>
                            <span className="font-medium text-[var(--text-primary)]">
                                {action.label}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="ml-auto text-[var(--text-secondary)]">
                                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                            </svg>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Products */}
            <div className="px-4 mt-6 pb-8">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                    Produtos Recentes
                </h2>
                <div className="space-y-3">
                    {mockProducts.slice(0, 5).map((product) => {
                        const stock = Object.values(product.stock).reduce((a, b) => a + b, 0);
                        return (
                            <Link
                                key={product.id}
                                href={`/admin/produtos/${product.id}`}
                                className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm"
                            >
                                <div
                                    className="w-14 h-14 bg-cover bg-center rounded-lg flex-shrink-0"
                                    style={{ backgroundImage: `url("${product.images[0]}")` }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-[var(--text-secondary)] text-xs">
                                        R$ {product.price.toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${stock < 10 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {stock} un.
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
