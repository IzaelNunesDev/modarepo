'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, updateProduct, UpdateProductDTO } from '@/services/product.service';
import { Product } from '@/types';
import { ImageUpload } from '@/components/ImageUpload';

export default function AdminProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<UpdateProductDTO>({
        name: '',
        description: '',
        price: 0,
        category: '',
        images: [],
    });

    const [stockItems, setStockItems] = useState<{ size: string, color: string, quantity: number }[]>([]);

    useEffect(() => {
        const loadProduct = async () => {
            const data = await getProduct(id);
            if (data) {
                setProduct(data);
                setFormData({
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    category: data.category,
                    images: data.images,
                });
                // Flatten stock for editing
                const items: { size: string, color: string, quantity: number }[] = [];
                Object.entries(data.stock).forEach(([key, qty]) => {
                    // key is "SIZE-COLOR"
                    const [size, ...colorParts] = key.split('-');
                    const color = colorParts.join('-'); // In case color has dashes
                    items.push({ size, color, quantity: qty });
                });
                setStockItems(items);
            }
            setLoading(false);
        };
        loadProduct();
    }, [id]);

    const handleSave = async () => {
        if (!product) return;
        setIsSaving(true);

        const updateData: UpdateProductDTO = {
            ...formData,
            stock: stockItems
        };

        const result = await updateProduct(id, updateData);
        setIsSaving(false);

        if (result) {
            alert('Produto atualizado com sucesso!');
            router.refresh();
        } else {
            alert('Erro ao atualizar produto.');
        }
    };

    const handleImageUploaded = (url: string) => {
        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), url]
        }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
                <Link href="/admin" className="text-blue-500 hover:underline">
                    Voltar para o Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
                    <p className="text-sm text-gray-500">ID: {id}</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin/produtos"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {/* Imagens */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Imagens</h2>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {(formData.images || []).map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img}
                                    alt={`Produto ${idx + 1}`}
                                    className="object-cover w-full h-full"
                                />
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <ImageUpload onUpload={handleImageUploaded} label="Adicionar Nova Foto" />
                </div>

                {/* Detalhes */}
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2 border"
                        >
                            {['Vestidos', 'Blusas', 'Calças', 'Saias', 'Acessórios', 'Biquínis', 'Maiôs', 'Saídas de Praia'].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2 border"
                        />
                    </div>

                    {/* Simple Stock View (Read-only for now or simple edit?) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estoque (Simples)</label>
                        <div className="max-h-40 overflow-y-auto border rounded p-2 text-sm">
                            {stockItems.map((item, i) => (
                                <div key={i} className="flex justify-between py-1 border-b last:border-0">
                                    <span>{item.size} - {item.color}</span>
                                    <span>{item.quantity} un.</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">* Edição de estoque detalhada em desenvolvimento</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
