'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { mockProducts } from '@/data/products';
import { CartItem } from '@/types';

// Mock cart items for demonstration
const initialCartItems: CartItem[] = [
    {
        productId: '1',
        product: mockProducts[0],
        size: 'M',
        color: 'Amarelo',
        quantity: 1,
    },
    {
        productId: '3',
        product: mockProducts[2],
        size: 'G',
        color: 'Branco',
        quantity: 2,
    },
];

export default function CarrinhoPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

    const updateQuantity = (index: number, delta: number) => {
        setCartItems((prev) =>
            prev.map((item, i) => {
                if (i === index) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const removeItem = (index: number) => {
        setCartItems((prev) => prev.filter((_, i) => i !== index));
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );
    const shipping = subtotal > 200 ? 0 : 15.99;
    const total = subtotal + shipping;

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[var(--bg-primary)]">
            <Header title="Carrinho" />

            <main className="flex-1 px-4 pb-48">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="text-[var(--text-secondary)] mb-4">
                            <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z" />
                        </svg>
                        <p className="text-[var(--text-secondary)] text-lg font-medium">
                            Seu carrinho está vazio
                        </p>
                        <Link
                            href="/"
                            className="mt-4 px-6 py-3 bg-[var(--accent-pink)] text-white font-bold rounded-lg"
                        >
                            Continuar Comprando
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4 mt-4">
                        {cartItems.map((item, index) => (
                            <div
                                key={`${item.productId}-${item.size}-${item.color}`}
                                className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-[var(--border-light)]"
                            >
                                <div
                                    className="w-20 h-20 bg-center bg-cover rounded-lg flex-shrink-0"
                                    style={{ backgroundImage: `url("${item.product.images[0]}")` }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[var(--text-primary)] font-medium text-sm line-clamp-1">
                                        {item.product.name}
                                    </h3>
                                    <p className="text-[var(--text-secondary)] text-xs mt-1">
                                        {item.size} • {item.color}
                                    </p>
                                    <p className="text-[var(--text-primary)] font-bold text-sm mt-2">
                                        R$ {item.product.price.toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="text-[var(--text-secondary)] p-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                                        </svg>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(index, -1)}
                                            className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z" />
                                            </svg>
                                        </button>
                                        <span className="text-[var(--text-primary)] font-medium w-6 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(index, 1)}
                                            className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Fixed Bottom Summary */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] shadow-lg">
                    <div className="px-4 py-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">Subtotal</span>
                            <span className="text-[var(--text-primary)]">
                                R$ {subtotal.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">Frete</span>
                            <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-[var(--text-primary)]'}>
                                {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--border-light)]">
                            <span className="text-[var(--text-primary)]">Total</span>
                            <span className="text-[var(--accent-pink)]">
                                R$ {total.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        <Link
                            href="/checkout"
                            className="block w-full py-3 bg-[var(--accent-pink)] text-white text-center font-bold rounded-lg mt-3 transition-all hover:opacity-90"
                        >
                            Finalizar Compra
                        </Link>
                    </div>
                    <div className="h-[env(safe-area-inset-bottom)]" />
                </div>
            )}

            <BottomNav cartCount={cartItems.length} />
        </div>
    );
}
