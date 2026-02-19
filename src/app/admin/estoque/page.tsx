'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { getProducts, updateProduct } from '@/services/product.service';
import { Product } from '@/types';
import { toast, Toaster } from 'react-hot-toast';

export default function EstoquePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            toast.error('Erro ao carregar estoque');
        } finally {
            setLoading(false);
        }
    };

    const updateLocalStock = (productId: string, sizeColor: string, newQuantity: number) => {
        setProducts((prev) =>
            prev.map((product) => {
                if (product.id === productId) {
                    return {
                        ...product,
                        stock: {
                            ...product.stock,
                            [sizeColor]: Math.max(0, newQuantity),
                        },
                    };
                }
                return product;
            })
        );
    };

    const handleSaveStock = async (product: Product) => {
        try {
            setIsSaving(product.id);

            // Transformar o record de estoque de volta para o formato esperado pelo backend
            const stockData = Object.entries(product.stock).map(([key, quantity]) => {
                const [size, ...colorParts] = key.split('-');
                return {
                    size,
                    color: colorParts.join('-'),
                    quantity
                };
            });

            const result = await updateProduct(product.id, { stock: stockData });

            if (result) {
                toast.success(`Estoque de "${product.name}" atualizado!`);
            } else {
                throw new Error('Falha na resposta da API');
            }
        } catch (error) {
            console.error('Erro ao salvar estoque:', error);
            toast.error('Erro ao salvar alterações no servidor');
        } finally {
            setIsSaving(null);
        }
    };

    const getTotalStock = (stock: Record<string, number>) => {
        return Object.values(stock).reduce((sum, q) => sum + q, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Toaster position="top-center" />
            <Header title="Controle de Estoque" showBackButton backHref="/admin" />

            <main className="px-4 pb-8 pt-2">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <p className="text-2xl font-black text-slate-900">
                            {products.reduce((sum, p) => sum + getTotalStock(p.stock), 0)}
                        </p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total em Estoque</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <p className="text-2xl font-black text-orange-600">
                            {products.filter((p) => getTotalStock(p.stock) < 10).length}
                        </p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estoque Baixo</p>
                    </div>
                </div>

                {/* Products List */}
                <div className="space-y-3">
                    {products.map((product) => {
                        const totalStock = getTotalStock(product.stock);
                        const isExpanded = expandedProduct === product.id;
                        const isLowStock = totalStock < 10;
                        const stockEntries = Object.entries(product.stock);

                        return (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 transition-all hover:shadow-md">
                                {/* Product Header */}
                                <button
                                    onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                                    className="w-full p-4 flex items-center gap-3"
                                >
                                    <div
                                        className="w-14 h-14 bg-cover bg-center rounded-lg flex-shrink-0 shadow-inner"
                                        style={{ backgroundImage: `url("${product.images[0]}")` }}
                                    />
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-bold text-slate-900 text-sm truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-slate-500 text-xs font-medium uppercase tracking-tighter">
                                            {product.category}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${isLowStock ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {totalStock} un.
                                        </span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="currentColor"
                                            viewBox="0 0 256 256"
                                            className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-pink-500' : ''
                                                }`}
                                        >
                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Expanded Stock Details */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                                        <p className="text-[10px] text-slate-400 mb-3 font-black uppercase tracking-widest">
                                            VARIAÇÕES DE ESTOQUE
                                        </p>
                                        <div className="space-y-3">
                                            {stockEntries.map(([key, quantity]) => (
                                                <div key={key} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100">
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {key.replace('-', ' • ')}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateLocalStock(product.id, key, quantity - 1)}
                                                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z" />
                                                            </svg>
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={quantity}
                                                            onChange={(e) =>
                                                                updateLocalStock(product.id, key, parseInt(e.target.value) || 0)
                                                            }
                                                            className={`w-16 h-8 text-center rounded-lg border text-sm font-bold ${quantity < 5
                                                                ? 'border-orange-300 bg-orange-50 text-orange-700'
                                                                : 'border-slate-200 bg-white text-slate-900'
                                                                } outline-none focus:ring-1 focus:ring-pink-500`}
                                                        />
                                                        <button
                                                            onClick={() => updateLocalStock(product.id, key, quantity + 1)}
                                                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handleSaveStock(product)}
                                            disabled={isSaving === product.id}
                                            className="mt-4 w-full h-12 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg shadow-slate-900/10 disabled:opacity-50"
                                        >
                                            {isSaving === product.id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            ) : 'Salvar Alterações'}
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

