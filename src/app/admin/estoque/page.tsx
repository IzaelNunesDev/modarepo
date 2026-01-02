'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { mockProducts } from '@/data/products';

export default function EstoquePage() {
    const [products, setProducts] = useState(
        mockProducts.map((p) => ({
            ...p,
            stockEntries: Object.entries(p.stock).map(([key, quantity]) => ({
                sizeColor: key,
                quantity,
            })),
        }))
    );
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

    const updateStock = (productId: string, sizeColor: string, newQuantity: number) => {
        setProducts((prev) =>
            prev.map((product) => {
                if (product.id === productId) {
                    return {
                        ...product,
                        stockEntries: product.stockEntries.map((entry) =>
                            entry.sizeColor === sizeColor
                                ? { ...entry, quantity: Math.max(0, newQuantity) }
                                : entry
                        ),
                    };
                }
                return product;
            })
        );
    };

    const getTotalStock = (productId: string) => {
        const product = products.find((p) => p.id === productId);
        return product?.stockEntries.reduce((sum, entry) => sum + entry.quantity, 0) || 0;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Controle de Estoque" showBackButton backHref="/admin" />

            <main className="px-4 pb-8 pt-2">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-2xl font-bold text-[var(--text-primary)]">
                            {products.reduce((sum, p) => sum + getTotalStock(p.id), 0)}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">Total em Estoque</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-2xl font-bold text-orange-600">
                            {products.filter((p) => getTotalStock(p.id) < 10).length}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">Estoque Baixo</p>
                    </div>
                </div>

                {/* Products List */}
                <div className="space-y-3">
                    {products.map((product) => {
                        const totalStock = getTotalStock(product.id);
                        const isExpanded = expandedProduct === product.id;
                        const isLowStock = totalStock < 10;

                        return (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                {/* Product Header */}
                                <button
                                    onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                                    className="w-full p-4 flex items-center gap-3"
                                >
                                    <div
                                        className="w-14 h-14 bg-cover bg-center rounded-lg flex-shrink-0"
                                        style={{ backgroundImage: `url("${product.images[0]}")` }}
                                    />
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-[var(--text-secondary)] text-xs">
                                            {product.category}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isLowStock ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {totalStock} un.
                                        </span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="currentColor"
                                            viewBox="0 0 256 256"
                                            className={`text-[var(--text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''
                                                }`}
                                        >
                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Expanded Stock Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                                        <p className="text-xs text-[var(--text-secondary)] mb-3 font-medium">
                                            ESTOQUE POR VARIAÇÃO
                                        </p>
                                        <div className="space-y-3">
                                            {product.stockEntries.map((entry) => (
                                                <div key={entry.sizeColor} className="flex items-center justify-between">
                                                    <span className="text-sm text-[var(--text-primary)]">
                                                        {entry.sizeColor.replace('-', ' • ')}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateStock(product.id, entry.sizeColor, entry.quantity - 1)}
                                                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[var(--text-secondary)]"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z" />
                                                            </svg>
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={entry.quantity}
                                                            onChange={(e) =>
                                                                updateStock(product.id, entry.sizeColor, parseInt(e.target.value) || 0)
                                                            }
                                                            className={`w-16 h-8 text-center rounded-lg border text-sm font-medium ${entry.quantity < 5
                                                                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                                                                    : 'border-gray-200 bg-white text-[var(--text-primary)]'
                                                                }`}
                                                        />
                                                        <button
                                                            onClick={() => updateStock(product.id, entry.sizeColor, entry.quantity + 1)}
                                                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[var(--text-secondary)]"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="mt-4 w-full py-2 bg-[var(--accent-pink)] text-white rounded-lg text-sm font-medium">
                                            Salvar Alterações
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
