'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CarrinhoPage() {
    const { items, removeItem, updateQuantity, subtotal, shipping, total } = useCart();

    return (
        <div className="relative min-h-screen w-full bg-[#FAFAFA] text-slate-800 selection:bg-pink-100 selection:text-pink-600">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <Header title="Sua Sacola" showBackButton backHref="/" />
            </div>

            <main className="max-w-4xl mx-auto px-4 pb-48 lg:pb-12 pt-6">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-iner border border-slate-100 relative group">
                            <div className="absolute inset-0 rounded-full bg-pink-500/5 scale-0 group-hover:scale-100 transition-transform duration-500" />
                            <ShoppingBag className="w-12 h-12 text-slate-300 group-hover:text-pink-400 transition-colors duration-300" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                            Sua sacola está vazia
                        </h2>
                        <p className="text-slate-500 mb-10 max-w-xs mx-auto leading-relaxed">
                            Parece que você ainda não escolheu seus looks favoritos.
                        </p>
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95"
                        >
                            <span>Explorar Coleção</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item, index) => (
                                <div
                                    key={`${item.productId}-${item.size}-${item.color}`}
                                    className="group relative flex gap-5 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200"
                                >
                                    {/* Product Image */}
                                    <div className="relative w-28 aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                            style={{ backgroundImage: `url("${item.product.images[0]}")` }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">
                                                    {item.product.name}
                                                </h3>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-1 -mr-2"
                                                    aria-label="Remover item"
                                                >
                                                    <Trash2 size={18} strokeWidth={1.5} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{item.size}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    <span className="w-2 h-2 rounded-full ring-1 ring-slate-200" style={{ backgroundColor: item.color === 'Preto' ? '#000' : item.color === 'Branco' ? '#fff' : item.color }} />
                                                    {item.color}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between mt-4">
                                            {/* Quantity */}
                                            <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 border border-slate-100">
                                                <button
                                                    onClick={() => updateQuantity(index, -1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-slate-900 transition-colors disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={14} strokeWidth={2.5} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-slate-900 text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(index, 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-slate-900 transition-colors"
                                                >
                                                    <Plus size={14} strokeWidth={2.5} />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="text-xl font-black text-slate-900">
                                                    R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                        R$ {item.product.price.toFixed(2).replace('.', ',')} cada
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Summary Sidebar */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
                                <h2 className="text-lg font-bold text-slate-900 mb-6">Resumo do Pedido</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-slate-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Entrega</span>
                                        <span className={shipping === 0 ? 'text-green-600 font-bold' : 'font-medium text-slate-900'}>
                                            {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-dashed border-slate-200 mb-8">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-base font-bold text-slate-900">Total</span>
                                        <span className="text-3xl font-black text-slate-900">R$ {total.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 text-right mt-1">em até 3x sem juros</p>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 active:scale-95"
                                >
                                    <span>Ir para Pagamento</span>
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Sticky Footer - Glassmorphism */}
            {items.length > 0 && (
                <div className="fixed bottom-6 left-4 right-4 z-40 lg:hidden">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-5">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Estimado</p>
                                <p className="text-2xl font-black text-slate-900 leading-none">R$ {total.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <div className="text-right">
                                <span className={shipping === 0 ? 'inline-block px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wide' : 'text-xs text-slate-500'}>
                                    {shipping === 0 ? 'Frete Grátis' : `+ R$ ${shipping} frete`}
                                </span>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                        >
                            <span>Finalizar Compra</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
