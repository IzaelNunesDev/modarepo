'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CarrinhoPage() {
    const { items, removeItem, updateQuantity, subtotal, shipping, total } = useCart();

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[var(--bg-primary)]">
            <Header title="Shopping Bag" />

            <main className="flex-1 px-5 pb-96 pt-2">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
                        <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-10 h-10 text-[var(--text-secondary)] opacity-50" />
                        </div>
                        <h2 className="text-[var(--text-primary)] text-2xl font-light mb-2">
                            Sua sacola está vazia
                        </h2>
                        <p className="text-[var(--text-secondary)] text-sm mb-8 max-w-[250px]">
                            Descubra peças exclusivas para renovar seu guarda-roupa.
                        </p>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-[var(--text-primary)] text-white text-sm font-medium tracking-wide rounded-full hover:opacity-90 transition-all shadow-lg shadow-gray-200"
                        >
                            COMEÇAR A COMPRAR
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8 mt-4">
                        {items.map((item, index) => (
                            <div
                                key={`${item.productId}-${item.size}-${item.color}`}
                                className="group flex gap-5 py-2 animate-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Product Image - Portrait Mode */}
                                <div
                                    className="w-28 h-36 bg-center bg-cover rounded-md shadow-sm shrink-0 relative overflow-hidden"
                                    style={{ backgroundImage: `url("${item.product.images[0]}")` }}
                                >
                                    <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="text-[var(--text-primary)] font-medium text-base leading-tight line-clamp-2">
                                                {item.product.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)] font-medium tracking-wide uppercase">
                                            <span>{item.size}</span>
                                            <span className="w-1 h-1 bg-current rounded-full opacity-30" />
                                            <span>{item.color}</span>
                                        </div>
                                        <p className="text-[var(--text-primary)] font-semibold text-lg mt-2">
                                            R$ {item.product.price.toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-2">
                                        {/* Minimal Quantity Selector */}
                                        <div className="flex items-center gap-4 bg-white border border-[var(--border-light)] rounded-full px-1 py-1 shadow-sm">
                                            <button
                                                onClick={() => updateQuantity(index, -1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-50 text-[var(--text-secondary)] transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-4 text-center font-medium text-sm text-[var(--text-primary)]">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(index, 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-50 text-[var(--text-primary)] transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(index)}
                                            className="text-[var(--text-secondary)] p-2 hover:text-red-500 transition-colors opacity-70 hover:opacity-100"
                                            aria-label="Remover item"
                                        >
                                            <Trash2 size={18} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Glassmorphism Bottom Summary - Floating "Island" Style above Nav */}
            {items.length > 0 && (
                <div className="fixed bottom-24 left-4 right-4 z-[60]">
                    {/* Glass Effect Panel */}
                    <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-6">

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Subtotal</span>
                                <span className="font-medium text-[var(--text-primary)]">
                                    R$ {subtotal.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Entrega estimada</span>
                                <span className={shipping === 0 ? 'text-[var(--accent-pink)] font-medium' : 'font-medium text-[var(--text-primary)]'}>
                                    {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline pt-4 border-t border-dashed border-[var(--border-light)]">
                                <span className="text-base font-semibold text-[var(--text-primary)]">Total</span>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                                        R$ {total.toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">
                                        em até 3x sem juros
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--text-primary)] py-4 text-white shadow-xl transition-all active:scale-[0.98]"
                        >
                            <span className="relative z-10 text-sm font-bold tracking-widest uppercase">
                                Finalizar Pedido
                            </span>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
