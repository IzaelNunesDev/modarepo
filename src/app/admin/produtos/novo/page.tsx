'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

export default function NovoProductPage() {
    const [images, setImages] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        sizes: [] as string[],
    });
    const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
    const [newColor, setNewColor] = useState({ name: '', hex: '#FF69B4' });
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const availableSizes = ['PP', 'P', 'M', 'G', 'GG', 'XG', '36', '38', '40', '42', '44', '46'];
    const categories = ['Vestidos', 'Blusas', 'Calças', 'Saias', 'Acessórios'];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImages((prev) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleSize = (size: string) => {
        setFormData((prev) => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter((s) => s !== size)
                : [...prev.sizes, size],
        }));
    };

    const addColor = () => {
        if (newColor.name && !colors.find((c) => c.name === newColor.name)) {
            setColors((prev) => [...prev, { ...newColor }]);
            setNewColor({ name: '', hex: '#FF69B4' });
        }
    };

    const removeColor = (name: string) => {
        setColors((prev) => prev.filter((c) => c.name !== name));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSaving(false);
        setSaved(true);
    };

    if (saved) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" className="text-green-600">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Produto Cadastrado!
                </h1>
                <p className="text-[var(--text-secondary)] mb-6">
                    O produto foi adicionado com sucesso.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setSaved(false);
                            setFormData({ name: '', description: '', price: '', category: '', sizes: [] });
                            setImages([]);
                            setColors([]);
                        }}
                        className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold rounded-lg"
                    >
                        Adicionar Outro
                    </button>
                    <Link
                        href="/admin"
                        className="px-6 py-3 bg-[var(--accent-pink)] text-white font-bold rounded-lg"
                    >
                        Voltar ao Admin
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Header title="Novo Produto" showBackButton backHref="/admin" />

            <form onSubmit={handleSubmit} className="px-4 pb-32 pt-2">
                {/* Image Upload */}
                <section className="mb-6">
                    <h2 className="text-[var(--text-primary)] font-bold text-lg mb-3">
                        Fotos do Produto
                    </h2>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                        {images.map((img, index) => (
                            <div key={index} className="relative flex-shrink-0">
                                <div
                                    className="w-24 h-24 bg-cover bg-center rounded-lg"
                                    style={{ backgroundImage: `url("${img}")` }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <label className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-[var(--border-light)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--accent-pink)] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--text-secondary)]">
                                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                            </svg>
                            <span className="text-xs text-[var(--text-secondary)] mt-1">Adicionar</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </section>

                {/* Basic Info */}
                <section className="mb-6">
                    <h2 className="text-[var(--text-primary)] font-bold text-lg mb-3">
                        Informações Básicas
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                                Nome do Produto *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Vestido Floral de Verão"
                                className="w-full h-12 px-4 rounded-lg bg-white border border-[var(--border-light)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                                Descrição
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva o produto..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg bg-white border border-[var(--border-light)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)] resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                                    Preço (R$) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0,00"
                                    className="w-full h-12 px-4 rounded-lg bg-white border border-[var(--border-light)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                                    Categoria *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg bg-white border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                                >
                                    <option value="">Selecione</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sizes */}
                <section className="mb-6">
                    <h2 className="text-[var(--text-primary)] font-bold text-lg mb-3">
                        Tamanhos Disponíveis
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => toggleSize(size)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${formData.sizes.includes(size)
                                        ? 'bg-[var(--accent-pink)] text-white'
                                        : 'bg-white border border-[var(--border-light)] text-[var(--text-primary)]'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Colors */}
                <section className="mb-6">
                    <h2 className="text-[var(--text-primary)] font-bold text-lg mb-3">
                        Cores Disponíveis
                    </h2>
                    <div className="flex flex-wrap gap-3 mb-3">
                        {colors.map((color) => (
                            <div
                                key={color.name}
                                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[var(--border-light)]"
                            >
                                <div
                                    className="w-6 h-6 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color.hex }}
                                />
                                <span className="text-sm text-[var(--text-primary)]">{color.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeColor(color.name)}
                                    className="text-[var(--text-secondary)] hover:text-red-500"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newColor.name}
                            onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                            placeholder="Nome da cor"
                            className="flex-1 h-10 px-3 rounded-lg bg-white border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
                        />
                        <input
                            type="color"
                            value={newColor.hex}
                            onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-[var(--border-light)] cursor-pointer"
                        />
                        <button
                            type="button"
                            onClick={addColor}
                            className="px-4 h-10 bg-[var(--bg-secondary)] rounded-lg font-medium text-[var(--text-primary)] text-sm"
                        >
                            Adicionar
                        </button>
                    </div>
                </section>
            </form>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] p-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSaving || !formData.name || !formData.price || !formData.category}
                    className="w-full h-14 bg-[var(--accent-pink)] text-white font-bold rounded-lg text-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Salvando...
                        </>
                    ) : (
                        'Salvar Produto'
                    )}
                </button>
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
        </div>
    );
}
