'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, CartItem } from '@/types';
import { mockProducts } from '@/data/products';

// ============================================================
// Contexto Global do Carrinho
// ============================================================
// Persiste no localStorage para manter estado entre navegações.
// Usado por: ProductPage, CartPage, CheckoutPage, BottomNav

interface CartContextType {
    items: CartItem[];
    addItem: (productId: string, size: string, color: string, quantity?: number) => void;
    removeItem: (index: number) => void;
    updateQuantity: (index: number, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
    shipping: number;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Chave do localStorage
const CART_STORAGE_KEY = 'moda-store-cart';

// Tipo para armazenar no localStorage (sem o objeto Product completo)
interface StoredCartItem {
    productId: string;
    size: string;
    color: string;
    quantity: number;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // ─── Carregar do localStorage na montagem ──────────────────
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                const storedItems: StoredCartItem[] = JSON.parse(stored);
                // Reconstruir os items com os produtos completos
                const reconstructed: CartItem[] = storedItems
                    .map((si) => {
                        const product = mockProducts.find((p) => p.id === si.productId);
                        if (!product) return null;
                        return {
                            productId: si.productId,
                            product,
                            size: si.size,
                            color: si.color,
                            quantity: si.quantity,
                        };
                    })
                    .filter((item): item is CartItem => item !== null);

                setItems(reconstructed);
            }
        } catch {
            // localStorage indisponível ou dados corrompidos
        }
        setIsLoaded(true);
    }, []);

    // ─── Salvar no localStorage quando mudar ───────────────────
    useEffect(() => {
        if (!isLoaded) return;
        try {
            const toStore: StoredCartItem[] = items.map((item) => ({
                productId: item.productId,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
            }));
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toStore));
        } catch {
            // localStorage indisponível
        }
    }, [items, isLoaded]);

    // ─── Adicionar item ────────────────────────────────────────
    const addItem = useCallback((productId: string, size: string, color: string, quantity: number = 1) => {
        const product = mockProducts.find((p) => p.id === productId);
        if (!product) return;

        setItems((prev) => {
            // Verificar se já existe o mesmo produto+tamanho+cor
            const existingIndex = prev.findIndex(
                (item) => item.productId === productId && item.size === size && item.color === color
            );

            if (existingIndex >= 0) {
                // Incrementar quantidade
                return prev.map((item, i) =>
                    i === existingIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            // Novo item
            return [...prev, {
                productId,
                product,
                size,
                color,
                quantity,
            }];
        });
    }, []);

    // ─── Remover item ──────────────────────────────────────────
    const removeItem = useCallback((index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // ─── Atualizar quantidade ──────────────────────────────────
    const updateQuantity = useCallback((index: number, delta: number) => {
        setItems((prev) =>
            prev.map((item, i) => {
                if (i === index) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    }, []);

    // ─── Limpar carrinho ───────────────────────────────────────
    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    // ─── Cálculos ──────────────────────────────────────────────
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal > 200 ? 0 : subtotal > 0 ? 15.99 : 0;
    const total = subtotal + shipping;

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                subtotal,
                shipping,
                total,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
}
