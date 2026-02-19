'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts } from '@/services/product.service';
import { Product } from '@/types';
import { Header } from '@/components/Header';
import { Plus } from 'lucide-react';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await getProducts();
            setProducts(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Gerenciar Produtos" showBackButton backHref="/admin" />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Todos os Produtos ({products.length})</h1>
                    <Link
                        href="/admin/produtos/novo"
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Novo Produto
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => {
                        const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);
                        return (
                            <Link
                                key={product.id}
                                href={`/admin/produtos/${product.id}`} // Takes to edit page (mock for now)
                                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
                            >
                                <div
                                    className="w-20 h-20 bg-cover bg-center rounded-lg flex-shrink-0 bg-gray-100"
                                    style={{ backgroundImage: `url("${product.images[0] || '/placeholder.png'}")` }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                                    <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900">
                                            R$ {product.price.toFixed(2).replace('.', ',')}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${totalStock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {totalStock} un.
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
